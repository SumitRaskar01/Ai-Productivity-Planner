import { useState, useEffect } from 'react';
import { getAnalyticsSummary } from '../services/api';
import PageLayout from '../components/PageLayout';

function StatBlock({ label, value, sub, color = 'var(--primary)' }) {
  return (
    <div className="tz-card" style={{ padding: 22 }}>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-1px', color }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.tasks), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100, padding: '0 4px' }}>
      {data.map((d) => (
        <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
            {d.tasks > 0 ? d.tasks : ''}
          </div>
          <div style={{
            width: '100%',
            background: d.tasks > 0 ? 'var(--primary)' : '#E5E7EB',
            borderRadius: '4px 4px 0 0',
            height: `${Math.max((d.tasks / max) * 76, d.tasks > 0 ? 8 : 4)}px`,
            transition: 'height 0.4s ease',
          }} />
          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function PriorityBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: 'var(--text-dark)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} tasks ({pct}%)</span>
      </div>
      <div style={{ height: 7, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getAnalyticsSummary()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load analytics. Make sure the server is running.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout title="Analytics" subtitle="Insights from your planning history.">

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="tz-card" style={{ padding: 22, height: 96 }}>
              <div className="tz-skeleton" style={{ height: 28, width: '50%', marginBottom: 8 }} />
              <div className="tz-skeleton" style={{ height: 12, width: '70%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 12, padding: '14px 18px', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Data */}
      {data && !loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            <StatBlock label="Plans Generated"     value={data.totalPlans}               sub="All time" />
            <StatBlock label="Total Tasks"         value={data.totalTasks}               sub="Across all plans"   color="#2563EB" />
            <StatBlock label="Avg Tasks / Plan"    value={data.avgTasksPerPlan}          sub="Per session"        color="#D97706" />
            <StatBlock label="High Priority Tasks" value={data.priorityBreakdown.high}   sub="Tasks flagged urgent" color="#DC2626" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
            <div className="tz-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>Weekly Task Activity</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Tasks scheduled per day (last 7 days)</p>
                </div>
                <span style={{ fontSize: 11, background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 20, fontWeight: 500 }}>Last 7 days</span>
              </div>
              <BarChart data={data.dailyActivity} />
            </div>

            <div className="tz-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 18 }}>Priority Breakdown</h3>
              <PriorityBar label="High"   count={data.priorityBreakdown.high}   total={data.totalTasks} color="#EF4444" />
              <PriorityBar label="Medium" count={data.priorityBreakdown.medium} total={data.totalTasks} color="#F59E0B" />
              <PriorityBar label="Low"    count={data.priorityBreakdown.low}    total={data.totalTasks} color="#22C55E" />
            </div>
          </div>

          {data.recentPlans.length > 0 && (
            <div className="tz-card" style={{ padding: 24, marginTop: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 16 }}>Recent Plans</h3>
              {data.recentPlans.map((plan, i) => (
                <div key={plan._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < data.recentPlans.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-dark)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>
                      {plan.originalInput}
                    </p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 20, fontWeight: 500, marginLeft: 12, flexShrink: 0 }}>
                    {plan.taskCount} tasks
                  </span>
                </div>
              ))}
            </div>
          )}

          {data.totalPlans === 0 && (
            <div className="tz-empty" style={{ marginTop: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 5 }}>No data yet</p>
              <p style={{ fontSize: 12.5, color: '#9CA3AF' }}>Generate and save a plan on the Dashboard to see analytics here.</p>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
