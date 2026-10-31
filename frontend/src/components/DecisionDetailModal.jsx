import React from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle,
  FileText
} from 'lucide-react';

export default function DecisionDetailModal({ decision, explanation, onClose }) {
  if (!decision) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="card animate-fade-in" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        position: 'relative',
        backgroundColor: '#FFFFFF',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <X size={15} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
          }}>
            <FileText size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Decision Audit & Justification
              </h3>
              <span className={`badge badge-${decision.selected_tier?.toLowerCase()}`}>
                {decision.selected_tier}
              </span>
            </div>
            <p className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Decision ID: {decision.decision_id} | Task: {decision.task_id}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Routing Strategy</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {decision.strategy?.replace(/_/g, ' ')}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Total Latency</span>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {decision.total_latency_ms?.toFixed(1)} ms
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Device Energy</span>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {decision.device_energy_j?.toFixed(4)} J
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Deadline Slack</span>
            <div className="mono" style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: decision.slack_time_ms >= 0 ? 'var(--status-success)' : 'var(--status-error)',
              marginTop: '2px',
            }}>
              {decision.slack_time_ms >= 0 ? `+${decision.slack_time_ms?.toFixed(1)}` : decision.slack_time_ms?.toFixed(1)} ms
            </div>
          </div>
        </div>

        {/* Natural Language Explanation */}
        {explanation && (
          <div style={{
            backgroundColor: 'var(--accent-subtle)',
            border: '1px solid var(--accent-subtle-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                LLM Explanation Report
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>Confidence: {explanation.confidence_level}</span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0' }}>
              "{explanation.headline}"
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {explanation.executive_summary}
            </p>
          </div>
        )}

        {/* Trade-Off Analysis */}
        {decision.trade_off && (
          <div style={{
            backgroundColor: 'var(--status-warning-bg)',
            border: '1px solid var(--status-warning-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--status-warning)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Winner vs Runner-Up ({decision.trade_off.runner_up_tier}):
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {decision.trade_off.summary}
            </p>
          </div>
        )}

        {/* Comparative Baseline Benchmark */}
        {decision.baseline_benchmark && (
          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Baseline Comparison vs Static Policies
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                {decision.baseline_benchmark.overall_advantage}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
              {Object.entries(decision.baseline_benchmark.baselines || {}).map(([key, b]) => {
                const isSelected = decision.selected_tier === b.tier;
                return (
                  <div key={key} style={{
                    backgroundColor: '#FFFFFF',
                    border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
                      {b.baseline_name}
                    </div>
                    <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Latency: {b.latency_ms?.toFixed(1)} ms
                    </div>
                    <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Energy: {b.energy_j?.toFixed(4)} J
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: isSelected ? 'var(--accent-primary)' : (b.latency_savings_ms > 0 ? 'var(--status-success)' : 'var(--text-secondary)'), fontWeight: 500, marginTop: '3px' }}>
                      {isSelected ? '✓ Optimal Choice' : (b.latency_savings_ms > 0 ? `+${b.latency_savings_ms.toFixed(0)}ms faster` : `${Math.abs(b.latency_savings_ms).toFixed(0)}ms slower`)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Candidate Tier Evaluations & Rejection Reasons */}
        {decision.candidate_evaluations && (
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Candidate Tier Evaluations & Rejections
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(decision.candidate_evaluations).map(([tierKey, metrics]) => {
                const isSelected = decision.selected_tier === tierKey;
                const rejection = explanation?.rejection_reasons?.[tierKey];
                return (
                  <div
                    key={tierKey}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--status-success-bg)' : 'var(--bg-tertiary)',
                      border: isSelected ? '1px solid var(--status-success-border)' : '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge badge-${tierKey.toLowerCase()}`}>{tierKey}</span>
                        {isSelected && <span style={{ fontSize: '0.72rem', color: 'var(--status-success)', fontWeight: 600 }}>[Selected]</span>}
                      </div>
                      <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span>Lat: {metrics.total_latency_ms?.toFixed(1)}ms · </span>
                        <span>Energy: {metrics.device_total_energy_j?.toFixed(3)}J · </span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Score: {metrics.composite_cost_score?.toFixed(3)}</span>
                      </div>
                    </div>
                    {rejection && !isSelected && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                        Rejection: {rejection.reason} ({rejection.trade_off_vs_winner})
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
