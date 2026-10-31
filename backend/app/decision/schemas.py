"""
Stage 5: Offloading Decision Schemas.
Data contracts for deterministic algorithmic tier selection and trade-off analysis.
"""
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.ingestion.schemas import TierType
from app.cost_model.schemas import TierCostMetrics, TaskCostEvaluation


class DecisionStrategy(str, Enum):
    WEIGHTED_COST_MINIMIZATION = "WEIGHTED_COST_MINIMIZATION"  # Balanced Pareto cost
    LATENCY_MINIMIZATION = "LATENCY_MINIMIZATION"              # Minimize time (real-time QoS)
    ENERGY_MINIMIZATION = "ENERGY_MINIMIZATION"                # Minimize device battery consumption


class TradeOffAnalysis(BaseModel):
    """Comparative analysis between the winning tier and the second-best runner-up."""
    winner_tier: TierType
    runner_up_tier: TierType
    latency_delta_ms: float = Field(description="Winner latency minus runner-up latency (negative means winner is faster)")
    energy_delta_j: float = Field(description="Winner energy minus runner-up energy (negative means winner is greener)")
    cost_score_delta: float = Field(description="Difference in composite score")
    summary: str = Field(description="Concise description of the trade-off")


class BaselineMetric(BaseModel):
    """Comparative performance of a static baseline vs the agent's optimal decision."""
    baseline_name: str = Field(description="Display label e.g., 'Local-Only', 'Cloud-Only'")
    tier: TierType
    latency_ms: float
    energy_j: float
    is_feasible: bool
    latency_savings_ms: float = Field(description="Baseline latency minus agent latency. Positive = agent is faster.")
    energy_savings_j: float = Field(description="Baseline energy minus agent energy. Positive = agent saves battery.")
    speedup_ratio: float = Field(description="Baseline latency / Agent latency")
    summary: str


class BaselineBenchmarkReport(BaseModel):
    """Evaluation of the agent's decision against traditional static offloading policies."""
    agent_tier: TierType
    baselines: Dict[str, BaselineMetric]
    overall_advantage: str


class OffloadingDecisionRecord(BaseModel):
    """
    Final algorithmic offloading decision output produced by Stage 5.
    Passed to Stage 6 for LLM-based natural language explanation.
    """
    decision_id: str
    task_id: str
    task_type: str
    selected_tier: TierType
    strategy: DecisionStrategy
    is_deadline_met: bool
    slack_time_ms: float = Field(description="Deadline minus actual latency. Positive = buffer margin.")
    alpha_latency_weight: float
    beta_energy_weight: float
    
    # Selected Tier Performance
    total_latency_ms: float
    device_energy_j: float
    composite_cost_score: float
    
    # Comparative Context
    candidate_evaluations: Dict[TierType, TierCostMetrics]
    trade_off: TradeOffAnalysis
    all_feasible_tiers: List[TierType]
    baseline_benchmark: Optional[BaselineBenchmarkReport] = None
    
    # Audit trail for explainability in Stage 6
    decision_reason_code: str = Field(description="Algorithmic rationale code, e.g., BEST_COMPOSITE_SCORE, DEADLINE_ENFORCED_FALLBACK")
