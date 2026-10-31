import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Award,
  Layers,
  TrendingUp,
  Zap,
  Smartphone,
  Cloud,
  Radio,
  Clock,
  Battery
} from 'lucide-react';

export default function CostComparisonMatrix({ costEvaluation, latestDecision }) {
  if (!costEvaluation || !costEvaluation.tier_evaluations) {
    return (
      <div className="card" style={{ padding: '36px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Execute an offload decision to compute and compare multi-tier deterministic cost physics.
        </p>
      </div>
    );
  }

  const { tier_evaluations, alpha_latency_weight, beta_energy_weight, deadline_ms } = costEvaluation;
  const winnerTier = latestDecision?.selected_tier;

  const allTiers = Object.values(tier_evaluations);
  const maxEnergy = Math.max(...allTiers.map((t) => t.device_total_energy_j), 0.001);

  // Baseline Comparison Metrics Data (from decision record or computed from tier evaluations)
  const winnerMetric = tier_evaluations[winnerTier] || allTiers[0];

  const baselinesList = [
    {
      key: 'LOCAL_ONLY',
      name: 'Local-Only (On-Device)',
      tier: 'LOCAL',
      icon: Smartphone,
      metric: tier_evaluations.LOCAL,
    },
    {
      key: 'EDGE_ONLY',
      name: 'Edge-Only (MEC 5G)',
      tier: 'EDGE',
      icon: Radio,
      metric: tier_evaluations.EDGE,
    },
    {
      key: 'CLOUD_ONLY',
      name: 'Cloud-Only (Hyperscale Cloud)',
      tier: 'CLOUD',
      icon: Cloud,
      metric: tier_evaluations.CLOUD,
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Info Banner */}
      <div className="card" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
      }}>
        <div>
          <h2 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Cost Analysis & Multi-Tier Matrix
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Deterministic comparative evaluation of execution latency, communication delays, and device energy draw
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '5px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>QoS Deadline: </span>
            <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{deadline_ms} ms</span>
          </div>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '5px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Optimization Weights: </span>
            <span className="mono" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>&alpha;={alpha_latency_weight}</span>
            <span style={{ color: 'var(--border-hover)', margin: '0 4px' }}>|</span>
            <span className="mono" style={{ fontWeight: 600, color: 'var(--status-success)' }}>&beta;={beta_energy_weight}</span>
          </div>
        </div>
      </div>

      {/* Comparative Baseline Benchmark Section */}
      <div className="card" style={{ padding: '18px 20px', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Comparative Baseline Benchmark — Agent Savings vs. Static Policies
            </h3>
          </div>
          <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
            Optimal Decision: {winnerTier}
          </span>
        </div>

        {/* Advantage Callout Banner */}
        <div style={{
          backgroundColor: 'var(--accent-subtle)',
          border: '1px solid var(--accent-subtle-border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          marginBottom: '14px',
          fontSize: '0.8rem',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Zap size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Adaptive Advantage: </strong>
            {latestDecision?.baseline_benchmark?.overall_advantage || 
              (winnerTier === 'LOCAL' 
                ? 'Local execution avoids network transmission delay and backhaul bandwidth overhead.' 
                : 'Offloading relieves local SoC constraints, saving device battery and accelerating processing.')}
          </span>
        </div>

        {/* 3 Comparative Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px',
        }}>
          {baselinesList.map((b) => {
            if (!b.metric) return null;
            const Icon = b.icon;
            const latDiff = Number((b.metric.total_latency_ms - winnerMetric.total_latency_ms).toFixed(1));
            const engDiff = Number((b.metric.device_total_energy_j - winnerMetric.device_total_energy_j).toFixed(4));
            const isMatch = winnerTier === b.tier;

            return (
              <div
                key={b.key}
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: isMatch ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={14} color={isMatch ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {b.name}
                    </span>
                  </div>
                  <span className={`badge ${b.metric.is_feasible ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                    {b.metric.is_feasible ? 'QoS Met' : 'Deadline Violated'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Latency vs Agent:</span>
                  <span className="mono" style={{
                    fontWeight: 600,
                    color: isMatch ? 'var(--text-secondary)' : (latDiff > 0 ? 'var(--status-success)' : 'var(--status-error)'),
                  }}>
                    {isMatch ? '0.0 ms (Optimal)' : (latDiff > 0 ? `+${latDiff} ms faster` : `${latDiff} ms slower`)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Device Energy vs Agent:</span>
                  <span className="mono" style={{
                    fontWeight: 600,
                    color: isMatch ? 'var(--text-secondary)' : (engDiff > 0 ? 'var(--status-success)' : 'var(--status-error)'),
                  }}>
                    {isMatch ? '0.0000 J (Optimal)' : (engDiff > 0 ? `+${engDiff} J saved` : `${engDiff} J more`)}
                  </span>
                </div>

                <div style={{
                  paddingTop: '6px',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.7rem',
                  color: isMatch ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isMatch ? 600 : 400,
                }}>
                  {isMatch ? '✓ Agent policy matched this optimal tier.' : (
                    latDiff > 0 && engDiff > 0 
                      ? 'Agent outperformed on both latency and battery energy.' 
                      : (latDiff > 0 ? 'Agent achieved lower latency.' : 'Agent achieved lower battery consumption.')
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Structured Multi-Tier Comparison Table */}
      <div className="card" style={{ overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#F8FAFC' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Physics Telemetry Comparison Across Tiers
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Status</th>
                <th>Total Latency</th>
                <th>Upload Tx</th>
                <th>Queue Wait</th>
                <th>Execution</th>
                <th>Downlink Rx</th>
                <th>Device Energy</th>
                <th>Slack Margin</th>
                <th style={{ textAlign: 'right' }}>Composite Cost</th>
              </tr>
            </thead>
            <tbody>
              {['LOCAL', 'EDGE', 'FOG', 'CLOUD'].map((tierKey) => {
                const metrics = tier_evaluations[tierKey];
                if (!metrics) return null;
                const isWinner = winnerTier === tierKey;
                const slack = deadline_ms - metrics.total_latency_ms;

                return (
                  <tr
                    key={tierKey}
                    style={{
                      backgroundColor: isWinner ? 'var(--accent-subtle)' : undefined,
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge badge-${tierKey.toLowerCase()}`}>{tierKey}</span>
                        {isWinner && (
                          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                            [Selected]
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${metrics.is_feasible ? 'badge-success' : 'badge-danger'}`}>
                        {metrics.is_feasible ? 'Feasible' : 'Exceeded'}
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{
                        fontWeight: 600,
                        color: metrics.total_latency_ms <= deadline_ms ? 'var(--text-primary)' : 'var(--status-error)',
                      }}>
                        {metrics.total_latency_ms.toFixed(1)} ms
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ color: 'var(--text-secondary)' }}>
                        {metrics.upload_delay_ms.toFixed(1)} ms
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ color: 'var(--text-secondary)' }}>
                        {metrics.queue_delay_ms.toFixed(1)} ms
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ color: 'var(--text-secondary)' }}>
                        {metrics.compute_delay_ms.toFixed(1)} ms
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ color: 'var(--text-secondary)' }}>
                        {metrics.download_delay_ms.toFixed(1)} ms
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {metrics.device_total_energy_j.toFixed(4)} J
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{
                        fontWeight: 600,
                        color: slack >= 0 ? 'var(--status-success)' : 'var(--status-error)',
                      }}>
                        {slack >= 0 ? `+${slack.toFixed(1)}` : slack.toFixed(1)} ms
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono" style={{
                        fontWeight: 700,
                        color: isWinner ? 'var(--accent-primary)' : 'var(--text-primary)',
                      }}>
                        {metrics.composite_cost_score.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latency & Energy Breakdown Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {['LOCAL', 'EDGE', 'FOG', 'CLOUD'].map((tierKey) => {
          const metrics = tier_evaluations[tierKey];
          if (!metrics) return null;

          const isWinner = winnerTier === tierKey;
          const totalLat = metrics.total_latency_ms || 1;
          const upPct = (metrics.upload_delay_ms / totalLat) * 100;
          const qPct = (metrics.queue_delay_ms / totalLat) * 100;
          const compPct = (metrics.compute_delay_ms / totalLat) * 100;
          const downPct = (metrics.download_delay_ms / totalLat) * 100;
          const rttPct = (metrics.propagation_rtt_ms / totalLat) * 100;

          return (
            <div
              key={tierKey}
              className="card"
              style={{
                padding: '18px 20px',
                borderColor: isWinner ? 'var(--accent-primary)' : 'var(--border-color)',
                boxShadow: isWinner ? '0 0 0 1px var(--accent-primary), var(--shadow-xs)' : 'var(--shadow-xs)',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge badge-${tierKey.toLowerCase()}`}>{tierKey}</span>
                  {isWinner && (
                    <span className="badge badge-success" style={{ gap: '4px' }}>
                      <Award size={11} /> Optimal
                    </span>
                  )}
                </div>

                <span className={`badge ${metrics.is_feasible ? 'badge-success' : 'badge-danger'}`}>
                  {metrics.is_feasible ? 'Feasible' : 'Infeasible'}
                </span>
              </div>

              {/* Composite Score */}
              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Composite Score</span>
                <span className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {metrics.composite_cost_score.toFixed(3)}
                </span>
              </div>

              {/* Latency Breakdown Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Latency Distribution</span>
                  <span className="mono" style={{
                    fontWeight: 600,
                    color: metrics.total_latency_ms <= deadline_ms ? 'var(--text-primary)' : 'var(--status-error)',
                  }}>
                    {metrics.total_latency_ms.toFixed(1)} ms
                  </span>
                </div>

                <div style={{
                  height: '6px',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  display: 'flex',
                  backgroundColor: 'var(--border-color)',
                }}>
                  <div style={{ width: `${upPct}%`, backgroundColor: '#0284C7' }} title={`Upload: ${metrics.upload_delay_ms.toFixed(1)}ms`} />
                  <div style={{ width: `${qPct}%`, backgroundColor: '#D97706' }} title={`Queue: ${metrics.queue_delay_ms.toFixed(1)}ms`} />
                  <div style={{ width: `${compPct}%`, backgroundColor: '#7C3AED' }} title={`Compute: ${metrics.compute_delay_ms.toFixed(1)}ms`} />
                  <div style={{ width: `${downPct}%`, backgroundColor: '#0D9488' }} title={`Download: ${metrics.download_delay_ms.toFixed(1)}ms`} />
                  <div style={{ width: `${rttPct}%`, backgroundColor: '#4F46E5' }} title={`RTT: ${metrics.propagation_rtt_ms.toFixed(1)}ms`} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  <span>Tx: {metrics.upload_delay_ms.toFixed(1)}ms</span>
                  <span>Q: {metrics.queue_delay_ms.toFixed(1)}ms</span>
                  <span>Exec: {metrics.compute_delay_ms.toFixed(1)}ms</span>
                  <span>Rx: {metrics.download_delay_ms.toFixed(1)}ms</span>
                </div>
              </div>

              {/* Energy Dissipation */}
              <div style={{
                paddingTop: '10px',
                borderTop: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Device Energy Consumption</span>
                  <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {metrics.device_total_energy_j.toFixed(4)} J
                  </span>
                </div>
                <div style={{
                  height: '5px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--border-color)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(100, (metrics.device_total_energy_j / maxEnergy) * 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--status-success)',
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  <span>Tx: {metrics.device_tx_energy_j.toFixed(3)}J</span>
                  <span>Idle: {metrics.device_idle_energy_j.toFixed(3)}J</span>
                  <span>Compute: {metrics.device_compute_energy_j.toFixed(3)}J</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
