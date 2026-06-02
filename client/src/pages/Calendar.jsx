import { useState, useEffect } from 'react';
import { getPlanHistory } from '../services/api';
import PageLayout from '../components/PageLayout';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function buildCalendar(year, month) {
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function Calendar() {
  const now = new Date();
  const [year,    setYear]    = useState(now.getFullYear());
  const [month,   setMonth]   = useState(now.getMonth());
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getPlanHistory()
      .then(res => setHistory(res.data))
      .catch(() => {});
  }, []);

  const cells = buildCalendar(year, month);

  // Map date string → plans
  const plansByDate = {};
  history.forEach(plan => {
    const d = new Date(plan.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!plansByDate[key]) plansByDate[key] = [];
    plansByDate[key].push(plan);
  });

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const todayKey  = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const selKey    = selected ? `${year}-${month}-${selected}` : null;
  const selPlans  = selKey ? (plansByDate[selKey] || []) : [];

  return (
    <PageLayout 
      title="Calendar" 
      subtitle="View your plans by date."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Calendar grid */}
        <div className="tz-card" style={{ padding: 24 }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={prevMonth} style={{ width: 32, height: 32, border: '1.5px solid var(--border)', background: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.color='var(--primary)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', letterSpacing: '-0.3px' }}>
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} style={{ width: 32, height: 32, border: '1.5px solid var(--border)', background: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.color='var(--primary)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 8 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const key = `${year}-${month}-${day}`;
              const isToday = key === todayKey;
              const isSel   = key === selKey;
              const plans   = plansByDate[key] || [];
              const hasPlan = plans.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => setSelected(isSel ? null : day)}
                  style={{
                    aspectRatio: '1',
                    border: 'none',
                    borderRadius: 8,
                    background: isSel ? 'var(--primary)' : isToday ? 'var(--primary-light)' : 'transparent',
                    color: isSel ? 'white' : isToday ? 'var(--primary)' : 'var(--text-dark)',
                    fontSize: 13,
                    fontWeight: isToday || isSel ? 700 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    fontFamily: 'inherit',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!isSel && !isToday) e.currentTarget.style.background = '#F3F4F6'; }}
                  onMouseLeave={e => { if (!isSel && !isToday) e.currentTarget.style.background = 'transparent'; }}
                >
                  {day}
                  {hasPlan && (
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: isSel ? 'rgba(255,255,255,0.8)' : 'var(--primary)',
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 11.5, color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }} />
              Has saved plan
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--primary-light)', border: '1px solid var(--primary)' }} />
              Today
            </div>
          </div>
        </div>

        {/* Selected day plans */}
        <div className="tz-card" style={{ padding: 22, alignSelf: 'start' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 14 }}>
            {selected
              ? `${MONTHS[month]} ${selected}`
              : 'Select a day'}
          </h3>

          {!selected && (
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Click any day on the calendar to see plans saved for that date.
            </p>
          )}

          {selected && selPlans.length === 0 && (
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>No plans saved for this day.</p>
          )}

          {selPlans.map((plan, i) => (
            <div key={plan._id} style={{
              border: '1.5px solid var(--border)',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 10,
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                {new Date(plan.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--text-dark)', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {plan.originalInput}
              </p>
              <span style={{ fontSize: 11, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                {plan.generatedPlan.length} tasks
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
