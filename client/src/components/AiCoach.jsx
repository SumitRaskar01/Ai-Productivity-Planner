import { useState, useEffect, useCallback } from 'react';
import { getCoachInsights } from '../services/api';

const ICONS = ['💡', '🎯', '⚡', '🔥'];

export default function AiCoach({ plan }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    if (!plan || plan.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getCoachInsights(plan);
      setInsights(data.insights || []);
    } catch {
      setError('Could not load insights. Try again.');
    } finally {
      setLoading(false);
    }
  }, [plan]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (!plan || plan.length === 0) return null;

  return (
    <div className="tz-coach-card">
      <div className="tz-coach-header">
        <span style={{ fontSize: '18px' }}>🧠</span>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-dark)' }}>AI Coach Insights</span>
        {!loading && (
          <button
            onClick={fetchInsights}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: '8px',
            }}
          >
            ↻ Refresh
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="tz-skeleton"
              style={{ height: '16px', borderRadius: '8px', width: i === 3 ? '60%' : '100%' }}
            />
          ))}
        </div>
      )}

      {error && !loading && (
        <div style={{ color: 'var(--error)', fontSize: '13px', padding: '4px 0' }}>
          {error}{' '}
          <button
            onClick={fetchInsights}
            style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && insights.length > 0 && (
        <div className="tz-coach-list">
          {insights.map((text, i) => (
            <div key={i} className="tz-coach-insight">
              <span className="tz-coach-icon">{ICONS[i % ICONS.length]}</span>
              <span className="tz-coach-text">{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
