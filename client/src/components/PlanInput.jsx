import { useState } from 'react';

const EXAMPLE = `Wake up at 7am, freshen up, gym for an hour, then breakfast.
Study DBMS from 10 to 12. Lunch break.
Work on OS assignment in the afternoon — it's due tomorrow so high priority.
Evening — watch one lecture video, dinner, then revise notes before sleeping by 11pm.`;

export default function PlanInput({ onGenerate, loading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed) {
      onGenerate(trimmed);
      setText('');
    }
  };

  return (
    <div className="tz-card tz-input-card animate-slide-up" style={{ animationDelay: '0.25s' }}>
      <h2 className="tz-input-title">What's your day looking like?</h2>
      <p className="tz-input-sub">Dump your tasks and rough timings — AI will structure it into a smart schedule.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative' }}>
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={EXAMPLE}
            maxLength={1000}
            disabled={loading}
            className="tz-textarea"
          />
        </div>

        <div className="tz-input-footer">
          <span className="tz-char-count">{text.length} / 1000</span>
          <button
            type="submit"
            disabled={loading || text.trim().length === 0}
            className="tz-btn-primary"
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                  className="animate-spin"
                />
                Generating…
              </>
            ) : (
              <>
                <SparkleIcon />
                Generate Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
      <path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z"/>
      <path d="M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3z"/>
    </svg>
  );
}
