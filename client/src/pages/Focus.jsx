import { useState, useEffect, useRef, useCallback } from 'react';
import PageLayout from '../components/PageLayout';
import { useSettings } from '../hooks/useSettings';
import { useSound } from '../hooks/useSound';

const MODES = [
  { id: 'focus',   label: 'Focus',       duration: 25 * 60, color: 'var(--primary)',  bg: 'var(--primary-light)' },
  { id: 'short',   label: 'Short Break', duration:  5 * 60, color: '#3B82F6',         bg: '#EFF6FF' },
  { id: 'long',    label: 'Long Break',  duration: 15 * 60, color: '#8B5CF6',         bg: '#F5F3FF' },
];

const TIPS = [
  'Silence notifications for deeper focus.',
  'Work on one task at a time — multitasking reduces quality.',
  'After 4 pomodoros, take a 15-minute break.',
  'Stay hydrated — even mild dehydration hurts concentration.',
  'Write down distractions instead of acting on them.',
];

function pad(n) { return String(n).padStart(2, '0'); }

export default function Focus() {
  const [modeIdx,    setModeIdx]    = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(MODES[0].duration);
  const [running,    setRunning]    = useState(false);
  const [sessions,   setSessions]   = useState(0);
  const [tipIdx,     setTipIdx]     = useState(0);
  const intervalRef = useRef(null);
  const { settings } = useSettings();
  const { play } = useSound(settings.soundEnabled);

  const mode = MODES[modeIdx];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / mode.duration;
  const circumference = 2 * Math.PI * 88;

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(mode.duration);
  }, [mode.duration]);

  const switchMode = (idx) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setModeIdx(idx);
    setTimeLeft(MODES[idx].duration);
  };

  useEffect(() => {
    setTimeLeft(mode.duration);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [mode.duration]);

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          if (modeIdx === 0) {
            setSessions(s => s + 1);
            play('focus_end');
          } else {
            play('task_start');
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, modeIdx]);

  useEffect(() => {
    const id = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <PageLayout 
      title="Focus Mode" 
      subtitle="Deep work sessions — stay in the zone."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Timer card */}
        <div className="tz-card" style={{ padding: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          {/* Mode switcher */}
          <div style={{ display: 'flex', gap: 6, background: '#F3F4F6', borderRadius: 10, padding: 4 }}>
            {MODES.map((m, i) => (
              <button
                key={m.id}
                onClick={() => switchMode(i)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: modeIdx === i ? 'white' : 'transparent',
                  color: modeIdx === i ? m.color : 'var(--text-muted)',
                  boxShadow: modeIdx === i ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Circle timer */}
          <div style={{ position: 'relative', width: 200, height: 200 }}>
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="88" fill="none" stroke="#F3F4F6" strokeWidth="8"/>
              <circle
                cx="100" cy="100" r="88"
                fill="none"
                stroke={mode.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 0.9s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-2px', color: 'var(--text-dark)', lineHeight: 1 }}>
                {pad(minutes)}:{pad(seconds)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
                {mode.label}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={reset}
              style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.15s' }}
              title="Reset"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
            </button>

            <button
              onClick={() => setRunning(r => !r)}
              style={{
                width: 60, height: 60, borderRadius: '50%',
                background: mode.color, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 16px ${mode.color}40`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {running ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
              )}
            </button>

            <div style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: 'none' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: mode.color, lineHeight: 1 }}>{sessions}</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 0.3 }}>done</span>
            </div>
          </div>

          {/* Tip */}
          <div style={{ background: mode.bg, borderRadius: 10, padding: '10px 16px', textAlign: 'center', maxWidth: 340 }}>
            <p style={{ fontSize: 12.5, color: mode.color, fontWeight: 500, lineHeight: 1.4 }}>
              💡 {TIPS[tipIdx]}
            </p>
          </div>
        </div>

        {/* Sessions summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="tz-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 16 }}>Session Summary</h3>
            {[
              { label: 'Focus sessions', value: sessions, icon: '🎯' },
              { label: 'Total focus time', value: `${sessions * 25}m`, icon: '⏱' },
              { label: 'Breaks taken', value: Math.max(0, sessions - 1), icon: '☕' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{icon} {label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)' }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="tz-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 12 }}>How it works</h3>
            {[
              ['1.', 'Work for 25 minutes without distractions'],
              ['2.', 'Take a 5-minute short break'],
              ['3.', 'After 4 sessions, take a 15-minute break'],
            ].map(([num, text]) => (
              <div key={num} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{num}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
