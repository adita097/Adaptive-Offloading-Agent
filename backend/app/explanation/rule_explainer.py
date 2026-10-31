"""
Deterministic Rule-Based Explanation Synthesizer.
Generates comprehensive, professional explanations from numerical decision metrics.
"""
from typing import Dict
from app.ingestion.schemas import TierType
from app.decision.schemas import OffloadingDecisionRecord
from app.explanation.schemas import ExplanationReport, TierRejectionReason


class RuleBasedDecisionExplainer:
    """Synthesizes human-interpretable technical explanations from decision metrics."""

    @classmethod
    def explain(cls, decision: OffloadingDecisionRecord) -> ExplanationReport:
        winner = decision.selected_tier
        runner_up = decision.trade_off.runner_up_tier
        evals = decision.candidate_evaluations
        win_m = evals[winner]

        # 1. Headline
        if decision.is_deadline_met:
            headline = (
                f"Task {decision.task_id} successfully routed to {winner.value} "
                f"({win_m.total_latency_ms:.1f}ms latency, {decision.slack_time_ms:.1f}ms safety margin)."
            )
        else:
            headline = (
                f"Task {decision.task_id} emergency routed to {winner.value} "
                f"(Overran deadline by {abs(decision.slack_time_ms):.1f}ms under severe constraints)."
            )

        # 2. Executive Summary
        adv = ""
        if decision.baseline_benchmark and decision.baseline_benchmark.overall_advantage:
            adv = f" Benchmark Advantage: {decision.baseline_benchmark.overall_advantage}."

        exec_summary = (
            f"The optimization engine selected {winner.value} using the {decision.strategy.value} strategy. "
            f"Under current network conditions, {winner.value} achieved the optimal trade-off with a composite "
            f"cost score of {decision.composite_cost_score:.3f}, consuming {decision.device_energy_j:.3f}J of device energy.{adv}"
        )

        # 3. Why Winner Won
        deadline_val = decision.candidate_evaluations[winner].deadline_ms
        if decision.is_deadline_met:
            deadline_note = f"It satisfied the {deadline_val:.1f}ms deadline with a {decision.slack_time_ms:.1f}ms safety margin."
        else:
            deadline_note = f"Although all tiers exceeded the {deadline_val:.1f}ms deadline, {winner.value} minimized overrun to {abs(decision.slack_time_ms):.1f}ms."

        why_winner = (
            f"{winner.value} delivered an end-to-end latency of {win_m.total_latency_ms:.1f}ms "
            f"(Compute: {win_m.compute_delay_ms:.1f}ms, Upload: {win_m.upload_delay_ms:.1f}ms, "
            f"Queue: {win_m.queue_delay_ms:.1f}ms). {deadline_note} It kept device battery drain to {win_m.device_total_energy_j:.3f}J."
        )

        # 4. Why Runner-up Lost
        if winner == runner_up:
            why_runner_up = f"{winner.value} was the clear solitary viable tier."
        else:
            run_m = evals[runner_up]
            lat_diff = win_m.total_latency_ms - run_m.total_latency_ms
            eng_diff = win_m.device_total_energy_j - run_m.device_total_energy_j

            # lat_diff < 0 means winner is faster (runner-up is slower)
            speed_text = f"{abs(lat_diff):.1f}ms faster" if lat_diff < 0 else f"{abs(lat_diff):.1f}ms slower"
            energy_text = f"{abs(eng_diff):.3f}J lower energy" if eng_diff < 0 else f"{abs(eng_diff):.3f}J higher energy"

            why_runner_up = (
                f"{runner_up.value} was the closest competitor with a cost score of {run_m.composite_cost_score:.3f}. "
                f"However, {winner.value} prevailed because it was {speed_text} and required {energy_text} than {runner_up.value}."
            )

        # 5. Rejection Reasons for All Tiers
        rejections: Dict[TierType, TierRejectionReason] = {}
        for tier, metric in evals.items():
            if tier == winner:
                continue

            if not metric.is_feasible:
                reason = f"Violated deadline constraint ({metric.total_latency_ms:.1f}ms vs {metric.deadline_ms:.1f}ms deadline)."
                comp = f"Failed QoS, whereas {winner.value} completed in {win_m.total_latency_ms:.1f}ms."
            else:
                cost_excess = metric.composite_cost_score - win_m.composite_cost_score
                reason = f"Higher composite cost score (+{cost_excess:.3f} higher than {winner.value})."
                comp = (
                    f"Required {metric.total_latency_ms:.1f}ms latency and {metric.device_total_energy_j:.3f}J energy, "
                    f"yielding suboptimal Pareto efficiency."
                )

            rejections[tier] = TierRejectionReason(
                tier=tier,
                reason=reason,
                trade_off_vs_winner=comp,
            )

        # 6. Primary Bottleneck Identification
        if winner == TierType.LOCAL:
            bottleneck = "Local CPU Frequency and Mobile Thermal Constraints"
        elif win_m.queue_delay_ms > win_m.compute_delay_ms:
            bottleneck = f"{winner.value} Server Queuing Delay ({win_m.queue_delay_ms:.1f}ms)"
        elif win_m.upload_delay_ms > win_m.compute_delay_ms:
            bottleneck = f"Wireless Uplink Bandwidth ({win_m.upload_delay_ms:.1f}ms transfer time)"
        else:
            bottleneck = "Computational Execution Complexity"

        return ExplanationReport(
            decision_id=decision.decision_id,
            task_id=decision.task_id,
            selected_tier=winner,
            headline=headline,
            executive_summary=exec_summary,
            why_winner_won=why_winner,
            why_runner_up_lost=why_runner_up,
            rejection_reasons=rejections,
            primary_bottleneck=bottleneck,
            confidence_level="HIGH" if decision.is_deadline_met else "MARGINAL",
        )
