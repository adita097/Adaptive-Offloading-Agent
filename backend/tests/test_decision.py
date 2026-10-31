"""
Unit tests for Stage 5: Algorithmic Offloading Decision.
"""
import pytest
from app.ingestion.schemas import TierType, TaskProfile
from app.scenario.environment import EnvironmentManager
from app.cost_model.cost_engine import CostEngine
from app.decision.schemas import DecisionStrategy
from app.decision.selector import DecisionSelector
from app.decision.service import DecisionService


def test_decision_selector_weighted_cost():
    env = EnvironmentManager("NOMINAL_5G")
    task = TaskProfile(
        task_id="DEC_TEST_01",
        workload_gigaflops=0.6,
        input_data_size_mb=1.5,
        deadline_ms=800.0
    )
    eval_report = CostEngine.evaluate_task(task, env.get_current_state(), alpha_latency=0.7, beta_energy=0.3)
    
    decision = DecisionSelector.select_optimal_tier(
        eval_report, strategy=DecisionStrategy.WEIGHTED_COST_MINIMIZATION
    )

    assert decision.task_id == "DEC_TEST_01"
    assert decision.selected_tier in [TierType.LOCAL, TierType.EDGE, TierType.FOG, TierType.CLOUD]
    assert decision.is_deadline_met is True
    assert decision.slack_time_ms >= 0.0
    assert decision.trade_off.winner_tier == decision.selected_tier
    assert decision.decision_reason_code == "PARETO_WEIGHTED_COST_OPTIMAL"


def test_decision_selector_latency_minimization():
    env = EnvironmentManager("NOMINAL_5G")
    task = TaskProfile(
        task_id="DEC_TEST_02",
        workload_gigaflops=0.5,
        input_data_size_mb=1.0,
        deadline_ms=1000.0
    )
    eval_report = CostEngine.evaluate_task(task, env.get_current_state())
    
    decision = DecisionSelector.select_optimal_tier(
        eval_report, strategy=DecisionStrategy.LATENCY_MINIMIZATION
    )

    assert decision.strategy == DecisionStrategy.LATENCY_MINIMIZATION
    assert decision.selected_tier == eval_report.fastest_tier
    assert decision.decision_reason_code == "MIN_LATENCY_QOS_OPTIMAL"


def test_decision_selector_energy_minimization():
    env = EnvironmentManager("NOMINAL_5G")
    task = TaskProfile(
        task_id="DEC_TEST_03",
        workload_gigaflops=0.5,
        input_data_size_mb=1.0,
        deadline_ms=1000.0
    )
    eval_report = CostEngine.evaluate_task(task, env.get_current_state())
    
    decision = DecisionSelector.select_optimal_tier(
        eval_report, strategy=DecisionStrategy.ENERGY_MINIMIZATION
    )

    assert decision.strategy == DecisionStrategy.ENERGY_MINIMIZATION
    assert decision.selected_tier == eval_report.most_energy_efficient_tier
    assert decision.decision_reason_code == "MIN_DEVICE_ENERGY_OPTIMAL"


def test_decision_selector_emergency_fallback_when_infeasible():
    env = EnvironmentManager("NOMINAL_5G")
    # Impossible 5ms deadline
    task = TaskProfile(
        task_id="DEC_TEST_IMPOSSIBLE",
        workload_gigaflops=3.0,
        input_data_size_mb=8.0,
        deadline_ms=5.0
    )
    eval_report = CostEngine.evaluate_task(task, env.get_current_state())
    
    decision = DecisionSelector.select_optimal_tier(eval_report)

    assert decision.is_deadline_met is False
    assert decision.slack_time_ms < 0.0  # Overrun
    assert decision.decision_reason_code == "EMERGENCY_MIN_DEADLINE_OVERRUN"


def test_decision_service_feedback_and_audit():
    env_manager = EnvironmentManager("NOMINAL_5G")
    initial_battery = env_manager.get_current_state().device.battery_remaining_pct
    service = DecisionService()

    task = TaskProfile(
        task_id="SERVICE_TASK_01",
        workload_gigaflops=0.8,
        input_data_size_mb=2.0,
        deadline_ms=1200.0
    )

    decision = service.decide_and_execute(task, env_manager)

    assert decision.task_id == "SERVICE_TASK_01"
    assert len(service.decision_history) == 1
    
    # Check battery was deducted
    current_battery = env_manager.get_current_state().device.battery_remaining_pct
    assert current_battery <= initial_battery

    # Check stats
    stats = service.get_tier_distribution_stats()
    assert stats["total_decisions"] == 1
    assert decision.selected_tier.value in stats["counts"]


def test_comparative_baseline_benchmark():
    env = EnvironmentManager("NOMINAL_5G")
    task = TaskProfile(
        task_id="BENCHMARK_TEST_01",
        workload_gigaflops=1.2,
        input_data_size_mb=2.5,
        deadline_ms=600.0
    )
    eval_report = CostEngine.evaluate_task(task, env.get_current_state())
    decision = DecisionSelector.select_optimal_tier(eval_report)

    bench = decision.baseline_benchmark
    assert bench is not None
    assert bench.agent_tier == decision.selected_tier
    assert "LOCAL_ONLY" in bench.baselines
    assert "EDGE_ONLY" in bench.baselines
    assert "CLOUD_ONLY" in bench.baselines

    loc_metric = bench.baselines["LOCAL_ONLY"]
    assert loc_metric.baseline_name == "Local-Only (On-Device)"
    assert loc_metric.tier == TierType.LOCAL
    assert loc_metric.speedup_ratio >= 0.0
    assert len(bench.overall_advantage) > 0

