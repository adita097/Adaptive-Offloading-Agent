"""
Algorithmic Offloading Decision Selector.
Implements Pareto-optimal cost minimization, latency-greedy, and energy-greedy strategies.
"""
import uuid
from typing import List, Tuple
from app.ingestion.schemas import TierType
from app.cost_model.schemas import TaskCostEvaluation, TierCostMetrics
from app.decision.schemas import (
    DecisionStrategy,
    TradeOffAnalysis,
    OffloadingDecisionRecord,
    BaselineMetric,
    BaselineBenchmarkReport,
)


class DecisionSelector:
    """Deterministic algorithmic decision engine for selecting optimal offloading tiers."""

    @classmethod
    def select_optimal_tier(
        cls,
        eval_report: TaskCostEvaluation,
        strategy: DecisionStrategy = DecisionStrategy.WEIGHTED_COST_MINIMIZATION,
    ) -> OffloadingDecisionRecord:
        """
        Executes tier selection based on mathematical cost evaluations and constraint satisfaction.
        """
        evals = eval_report.tier_evaluations
        all_tiers = list(evals.keys())

        # 1. Filter QoS-feasible tiers (tiers meeting deadline)
        feasible_tiers = [t for t in all_tiers if evals[t].is_feasible]

        # 2. Handle Case A: Feasible tiers exist
        if feasible_tiers:
            is_deadline_met = True

            if strategy == DecisionStrategy.LATENCY_MINIMIZATION:
                sorted_tiers = sorted(feasible_tiers, key=lambda t: evals[t].total_latency_ms)
                reason_code = "MIN_LATENCY_QOS_OPTIMAL"
            elif strategy == DecisionStrategy.ENERGY_MINIMIZATION:
                sorted_tiers = sorted(feasible_tiers, key=lambda t: evals[t].device_total_energy_j)
                reason_code = "MIN_DEVICE_ENERGY_OPTIMAL"
            else:  # WEIGHTED_COST_MINIMIZATION (Default)
                sorted_tiers = sorted(feasible_tiers, key=lambda t: evals[t].composite_cost_score)
                reason_code = "PARETO_WEIGHTED_COST_OPTIMAL"

            winner = sorted_tiers[0]
            runner_up = sorted_tiers[1] if len(sorted_tiers) > 1 else winner

        # 3. Handle Case B: Emergency Fallback - No tier meets the deadline
        else:
            is_deadline_met = False
            # Find tier with smallest deadline overrun
            sorted_tiers = sorted(all_tiers, key=lambda t: evals[t].total_latency_ms)
            winner = sorted_tiers[0]
            runner_up = sorted_tiers[1] if len(sorted_tiers) > 1 else winner
            reason_code = "EMERGENCY_MIN_DEADLINE_OVERRUN"

        winner_metric = evals[winner]
        runner_up_metric = evals[runner_up]

        # 4. Compute Trade-Off Analysis
        lat_delta = round(winner_metric.total_latency_ms - runner_up_metric.total_latency_ms, 2)
        eng_delta = round(winner_metric.device_total_energy_j - runner_up_metric.device_total_energy_j, 4)
        cost_delta = round(winner_metric.composite_cost_score - runner_up_metric.composite_cost_score, 4)

        if winner == runner_up:
            trade_summary = f"{winner.value} is the sole candidate evaluated."
        else:
            speed_note = f"{abs(lat_delta)}ms faster" if lat_delta < 0 else (f"{lat_delta}ms slower" if lat_delta > 0 else "equal latency")
            energy_note = f"{abs(eng_delta):.3f}J lower energy" if eng_delta < 0 else (f"{eng_delta:.3f}J higher energy" if eng_delta > 0 else "equal energy")
            trade_summary = f"{winner.value} selected over {runner_up.value} ({speed_note}, {energy_note})."

        trade_off = TradeOffAnalysis(
            winner_tier=winner,
            runner_up_tier=runner_up,
            latency_delta_ms=lat_delta,
            energy_delta_j=eng_delta,
            cost_score_delta=cost_delta,
            summary=trade_summary,
        )

        # 5. Compute Comparative Baseline Benchmark
        baseline_bench = cls.compute_baseline_benchmark(winner, evals)

        slack_time = round(eval_report.deadline_ms - winner_metric.total_latency_ms, 2)

        return OffloadingDecisionRecord(
            decision_id=f"DEC_{uuid.uuid4().hex[:8].upper()}",
            task_id=eval_report.task_id,
            task_type=eval_report.task_type,
            selected_tier=winner,
            strategy=strategy,
            is_deadline_met=is_deadline_met,
            slack_time_ms=slack_time,
            alpha_latency_weight=eval_report.alpha_latency_weight,
            beta_energy_weight=eval_report.beta_energy_weight,
            total_latency_ms=winner_metric.total_latency_ms,
            device_energy_j=winner_metric.device_total_energy_j,
            composite_cost_score=winner_metric.composite_cost_score,
            candidate_evaluations=evals,
            trade_off=trade_off,
            all_feasible_tiers=feasible_tiers,
            baseline_benchmark=baseline_bench,
            decision_reason_code=reason_code,
        )

    @classmethod
    def compute_baseline_benchmark(
        cls, winner_tier: TierType, evals: dict
    ) -> BaselineBenchmarkReport:
        """Evaluates how the agent's selection compares against static baseline approaches."""
        winner_metric = evals[winner_tier]
        baselines = {}

        baseline_configs = [
            ("LOCAL_ONLY", "Local-Only (On-Device)", TierType.LOCAL),
            ("EDGE_ONLY", "Edge-Only (MEC 5G)", TierType.EDGE),
            ("CLOUD_ONLY", "Cloud-Only (Hyperscale Cloud)", TierType.CLOUD),
        ]

        for key, name, tier in baseline_configs:
            m = evals[tier]
            lat_savings = round(m.total_latency_ms - winner_metric.total_latency_ms, 2)
            eng_savings = round(m.device_total_energy_j - winner_metric.device_total_energy_j, 4)
            speedup = round(m.total_latency_ms / max(0.01, winner_metric.total_latency_ms), 2)

            if winner_tier == tier:
                summary = f"Agent optimal routing matched {name}."
            else:
                lat_part = f"{abs(lat_savings):.1f}ms {'faster' if lat_savings > 0 else 'slower'}"
                eng_part = f"{abs(eng_savings):.4f}J {'battery saved' if eng_savings > 0 else 'more energy'}"
                summary = f"Agent is {lat_part} with {eng_part} vs {name}."

            baselines[key] = BaselineMetric(
                baseline_name=name,
                tier=tier,
                latency_ms=m.total_latency_ms,
                energy_j=m.device_total_energy_j,
                is_feasible=m.is_feasible,
                latency_savings_ms=lat_savings,
                energy_savings_j=eng_savings,
                speedup_ratio=speedup,
                summary=summary,
            )

        # Overall advantage synthesis
        adv_parts = []
        loc_b = baselines["LOCAL_ONLY"]
        if loc_b.latency_savings_ms > 0:
            adv_parts.append(f"{loc_b.latency_savings_ms:.0f}ms faster than Local-Only")
        if loc_b.energy_savings_j > 0:
            adv_parts.append(f"{loc_b.energy_savings_j:.3f}J lower battery drain than Local-Only")

        cld_b = baselines["CLOUD_ONLY"]
        if cld_b.latency_savings_ms > 0:
            adv_parts.append(f"avoids {cld_b.latency_savings_ms:.0f}ms WAN backhaul delay vs Cloud")

        overall = " | ".join(adv_parts) if adv_parts else f"Optimal trade-off achieved on {winner_tier.value}."

        return BaselineBenchmarkReport(
            agent_tier=winner_tier,
            baselines=baselines,
            overall_advantage=overall,
        )
