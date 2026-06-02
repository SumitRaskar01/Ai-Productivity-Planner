const PRIORITY_COLOR = {
  high:   '#EF4444',
  medium: '#F59E0B',
  low:    '#22C55E',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
          <div className="tz-skeleton" style={{ height: 10, width: '40%', marginBottom: 8 }} />
          <div className="tz-skeleton" style={{ height: 12, width: '100%', marginBottom: 5 }} />
          <div className="tz-skeleton" style={{ height: 12, width: '70%' }} />
        </div>
      ))}
    </div>
  );
}

export default function HistoryPanel({ history, loading, onSelect }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 className="tz-history-title" style={{ margin: 0 }}>Saved Plans</h2>
        {history.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', background: '#F3F4F6', padding: '2px 8px', borderRadius: 20 }}>
            {history.length} total
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton />
      ) : !history || history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="12" y2="17"/>
            </svg>
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>No saved plans yet</p>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>Generate and save a plan to see it here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {history.map((entry) => (
            <button
              key={entry._id}
              onClick={() => onSelect(entry.generatedPlan, entry._id)}
              className="tz-history-item"
            >
              <div className="tz-history-date">{formatDate(entry.createdAt)}</div>
              <div className="tz-history-preview">{entry.originalInput}</div>
              <div className="tz-history-footer">
                <div className="tz-history-dots">
                  {entry.generatedPlan.slice(0, 6).map((task, i) => (
                    <div
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: PRIORITY_COLOR[task.priority] || '#D1D5DB',
                      }}
                    />
                  ))}
                </div>
                <span className="tz-history-count">
                  {entry.generatedPlan.length} task{entry.generatedPlan.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
