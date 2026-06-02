import { useState, useRef, useCallback } from 'react';
import { updatePlan } from '../services/api';

const PRIORITY = {
  high:   { card: 'priority-high',   dot: 'dot-high',   badge: 'badge-high',   label: 'High' },
  medium: { card: 'priority-medium', dot: 'dot-medium', badge: 'badge-medium', label: 'Med' },
  low:    { card: 'priority-low',    dot: 'dot-low',    badge: 'badge-low',    label: 'Low' },
};

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

function getDuration(start, end) {
  const diff = toMinutes(end) - toMinutes(start);
  if (diff <= 0) return '';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function Timeline({ plan, planId, onPlanChange, showToast }) {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState([]);
  const [saving, setSaving] = useState(false);
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);

  const enterEdit = useCallback(() => {
    setDraft(plan.map(t => ({ ...t })));
    setEditMode(true);
  }, [plan]);

  const cancelEdit = () => setEditMode(false);

  const updateField = (idx, field, value) => {
    setDraft(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  // Drag handlers
  const onDragStart = (i) => { dragIdx.current = i; };
  const onDragEnter = (i) => { dragOverIdx.current = i; };
  const onDragEnd = () => {
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from === null || to === null || from === to) return;
    setDraft(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    dragIdx.current = null;
    dragOverIdx.current = null;
  };

  const saveEdits = async () => {
    // Validate
    for (const t of draft) {
      if (!t.task?.trim()) { showToast?.('Task name cannot be empty', 'error'); return; }
      if (!TIME_RE.test(t.start) || !TIME_RE.test(t.end)) { showToast?.('Invalid time format (HH:MM)', 'error'); return; }
    }
    setSaving(true);
    try {
      if (planId) {
        await updatePlan(planId, draft);
      }
      onPlanChange?.(draft);
      setEditMode(false);
      showToast?.('Plan saved successfully', 'success');
    } catch {
      showToast?.('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!plan || plan.length === 0) return null;

  const highCount = plan.filter(t => t.priority === 'high').length;
  const totalTasks = plan.length;
  const items = editMode ? draft : plan;

  return (
    <div className="tz-card tz-timeline-card">
      <div className="tz-timeline-header">
        <div>
          <h2 className="tz-timeline-title">Today's Schedule</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {totalTasks} task{totalTasks !== 1 ? 's' : ''} planned
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {!editMode && highCount > 0 && (
            <span className="tz-badge badge-high">{highCount} urgent</span>
          )}
          {!editMode && (
            <span className="tz-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              AI-sorted
            </span>
          )}
          {!editMode ? (
            <button
              onClick={enterEdit}
              style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                border: 'none',
                borderRadius: '10px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
            >
              ✏️ Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={cancelEdit}
                style={{
                  background: '#F3F4F6',
                  color: '#6B7280',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdits}
                disabled={saving}
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving…' : '✓ Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        {items.map((item, i) => {
          const p = PRIORITY[item.priority] || PRIORITY.low;
          const duration = getDuration(item.start, item.end);

          return (
            <div
              key={i}
              className={`tz-timeline-item animate-slide-up ${editMode ? 'tz-task-row-dragging-target' : ''}`}
              style={{ animationDelay: `${i * 0.06}s`, cursor: editMode ? 'default' : 'default' }}
              draggable={editMode}
              onDragStart={editMode ? () => onDragStart(i) : undefined}
              onDragEnter={editMode ? () => onDragEnter(i) : undefined}
              onDragEnd={editMode ? onDragEnd : undefined}
              onDragOver={editMode ? (e) => e.preventDefault() : undefined}
            >
              {editMode && (
                <div
                  className="tz-drag-handle"
                  title="Drag to reorder"
                  style={{ marginRight: '2px', paddingTop: '2px' }}
                >
                  ⠿
                </div>
              )}

              <div className="tz-time-label">
                {editMode ? (
                  <input
                    type="time"
                    value={item.start}
                    onChange={e => updateField(i, 'start', e.target.value)}
                    className="tz-edit-input"
                    style={{ width: '72px', fontSize: '11px' }}
                  />
                ) : formatTime(item.start)}
              </div>

              <div className="tz-dot-wrap">
                <div className={`tz-dot ${p.dot}`} />
              </div>

              <div className={`tz-task-card ${p.card}`} style={{ flex: 1 }}>
                <div className="tz-task-top">
                  {editMode ? (
                    <input
                      type="text"
                      value={item.task}
                      onChange={e => updateField(i, 'task', e.target.value)}
                      className="tz-edit-input"
                      style={{ flex: 1, fontWeight: 500, fontSize: '14px' }}
                      placeholder="Task name"
                    />
                  ) : (
                    <span className="tz-task-name">{item.task}</span>
                  )}
                  {editMode ? (
                    <select
                      value={item.priority}
                      onChange={e => updateField(i, 'priority', e.target.value)}
                      className="tz-edit-input"
                      style={{ width: '80px', fontSize: '12px', flexShrink: 0 }}
                    >
                      <option value="high">High</option>
                      <option value="medium">Med</option>
                      <option value="low">Low</option>
                    </select>
                  ) : (
                    <span className={`tz-badge ${p.badge}`} style={{ flexShrink: 0 }}>{p.label}</span>
                  )}
                </div>
                {!editMode && (
                  <div className="tz-task-meta">
                    <span>{formatTime(item.start)} – {formatTime(item.end)}</span>
                    {duration && (
                      <>
                        <span className="tz-task-meta-sep">·</span>
                        <span>{duration}</span>
                      </>
                    )}
                  </div>
                )}
                {editMode && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>End:</span>
                    <input
                      type="time"
                      value={item.end}
                      onChange={e => updateField(i, 'end', e.target.value)}
                      className="tz-edit-input"
                      style={{ width: '72px', fontSize: '11px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
