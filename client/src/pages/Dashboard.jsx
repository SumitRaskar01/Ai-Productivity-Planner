import { useState, useEffect, useCallback, useRef } from 'react';
import PageLayout from '../components/PageLayout';
import PlanInput from '../components/PlanInput';
import Timeline from '../components/Timeline';
import HistoryPanel from '../components/HistoryPanel';
import AiCoach from '../components/AiCoach';
import Toast from '../components/Toast';
import { generatePlan, savePlan, getPlanHistory, regeneratePlan, exportPlanPDF } from '../services/api';
import { useSettings } from '../hooks/useSettings';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function StatCard({ icon, value, label, iconBg, iconColor, trend, trendColor, delay }) {
  return (
    <div className="tz-stat-card" style={{ animationDelay: delay }}>
      <div className="tz-stat-icon" style={{ background: iconBg }}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div className="tz-stat-value">{value}</div>
      <div className="tz-stat-label">{label}</div>
      {trend && (
        <div className="tz-stat-trend" style={{ color: trendColor || 'var(--success)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
          {trend}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="tz-card animate-fade-in" style={{ padding: 24, marginBottom: 16 }}>
      <div className="tz-skeleton" style={{ height: 14, width: '35%', marginBottom: 20 }} />
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
          <div className="tz-skeleton" style={{ width: 54, height: 11 }} />
          <div className="tz-skeleton" style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0 }} />
          <div className="tz-skeleton" style={{ flex: 1, height: 54, borderRadius: 12 }} />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [plan, setPlan]                 = useState(null);
  const [savedPlanId, setSavedPlanId]   = useState(null);
  const [currentInput, setCurrentInput] = useState('');
  const [history, setHistory]           = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [exporting, setExporting]       = useState(false);
  const [refineOpen, setRefineOpen]     = useState(false);
  const [refineText, setRefineText]     = useState('');
  const [refining, setRefining]         = useState(false);
  const [toast, setToast]               = useState(null);
  const mainRef = useRef(null);
  const { settings } = useSettings();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = (user.name || 'there').split(' ')[0];

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const hideToast = () => setToast(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await getPlanHistory();
      setHistory(res.data);
    } catch { /* non-blocking */ }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleGenerate = async (inputText) => {
    setLoading(true);
    setPlan(null);
    setSaved(false);
    setSavedPlanId(null);
    setRefineOpen(false);
    setCurrentInput(inputText);
    try {
      const res = await generatePlan(inputText);
      setPlan(res.data.plan);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate plan. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!plan || saving) return;
    setSaving(true);
    try {
      const res = await savePlan({ originalInput: currentInput, generatedPlan: plan });
      setSaved(true);
      setSavedPlanId(res.data._id || res.data.plan?._id || null);
      showToast('Plan saved!', 'success');
      fetchHistory();
    } catch {
      showToast('Failed to save plan.', 'error');
    } finally { setSaving(false); }
  };

  const handleSelectHistory = (generatedPlan, planId) => {
    setPlan(generatedPlan);
    setSaved(true);
    setSavedPlanId(planId || null);
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Plan loaded from history', 'info');
  };

  const handlePlanChange = useCallback((updatedPlan) => {
    setPlan(updatedPlan);
  }, []);

  const handleExport = async () => {
    if (!savedPlanId || exporting) return;
    setExporting(true);
    try {
      const res = await exportPlanPDF(savedPlanId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `timezy-plan-${savedPlanId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('PDF downloaded!', 'success');
    } catch {
      showToast('Failed to export PDF.', 'error');
    } finally { setExporting(false); }
  };

  const handleRefine = async () => {
    if (!plan || !refineText.trim() || refining) return;
    setRefining(true);
    try {
      const res = await regeneratePlan({
        originalInput: currentInput,
        currentPlan: plan,
        modificationPrompt: refineText.trim(),
      });
      setPlan(res.data.plan);
      setSaved(false);
      setSavedPlanId(null);
      setRefineOpen(false);
      setRefineText('');
      showToast('Plan refined by AI!', 'success');
    } catch {
      showToast('Failed to refine plan.', 'error');
    } finally { setRefining(false); }
  };

  /* ── Computed stats ── */
  const today = new Date().toDateString();
  const todayPlans = history.filter(h => new Date(h.createdAt).toDateString() === today).length;
  const taskCount  = plan ? plan.length : (history[0]?.generatedPlan?.length ?? 0);
  const streak     = Math.min(history.length, 14);

  return (
    <PageLayout
      title={`${getGreeting()}, ${firstName} ✦`}
      subtitle={`${formatDate()} · Let's make today count`}
      showBackButton={false}
      showRightPanel={true}
      rightPanelContent={
        <HistoryPanel
          history={history}
          loading={historyLoading}
          onSelect={handleSelectHistory}
        />
      }
    >
      <div ref={mainRef}>
        {/* Stat cards */}
        <div className="tz-stats">
          <StatCard icon={<SparkIcon />} value={todayPlans} label="Plans Today" iconBg="var(--primary-light)" iconColor="var(--primary)" trend={todayPlans > 0 ? 'Active today' : null} delay="0.05s" />
          <StatCard icon={<TaskIcon />} value={taskCount || '—'} label="Tasks Scheduled" iconBg="#FEF3C7" iconColor="#D97706" delay="0.1s" />
          <StatCard icon={<FlameIcon />} value={streak > 0 ? `${streak}d` : '—'} label="Planning Streak" iconBg="#FEE2E2" iconColor="#DC2626" trend={streak > 1 ? 'Keep it up!' : null} trendColor="var(--warning)" delay="0.15s" />
          <StatCard icon={<SaveIcon />} value={history.length} label="Plans Saved" iconBg="#EFF6FF" iconColor="#2563EB" delay="0.2s" />
        </div>

        {/* AI insight banner */}
        <div className="tz-insight" style={{ animationDelay: '0.22s' }}>
          <div className="tz-insight-dot animate-pulse-glow" />
          <div className="tz-insight-text">
            <div className="tz-insight-title">AI Insight</div>
            <div className="tz-insight-body">
              Describe your day in plain English — Timezy will build a prioritized, time-blocked schedule instantly.
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        {/* Plan input */}
        <PlanInput onGenerate={handleGenerate} loading={loading} />

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Timeline + actions */}
        {plan && !loading && (
          <div style={{ marginBottom: 12 }}>
            <Timeline
              plan={plan}
              planId={savedPlanId}
              onPlanChange={handlePlanChange}
              showToast={showToast}
            />

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {!saved ? (
                <button onClick={handleSave} disabled={saving} className="tz-btn-outline" style={{ flex: 1, minWidth: 140 }}>
                  {saving ? (
                    <><SpinnerInline /> Saving…</>
                  ) : (
                    <><SaveIconSmall /> Save Plan</>
                  )}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: 'var(--primary-light)', borderRadius: 12, fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Saved
                </div>
              )}

              <button
                onClick={() => setRefineOpen(o => !o)}
                className="tz-btn-outline"
                style={{ minWidth: 120 }}
              >
              Refine Plan
              </button>

              {savedPlanId && (
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="tz-btn-outline"
                  style={{ minWidth: 120 }}
                >
                  {exporting ? <><SpinnerInline /> Exporting…</> : <>Export PDF</>}
                </button>
              )}
            </div>

            {/* Refine panel */}
            {refineOpen && (
              <div className="tz-refine-panel" style={{ marginTop: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 8 }}>
                  How should AI adjust this plan?
                </p>
                <textarea
                  value={refineText}
                  onChange={e => setRefineText(e.target.value)}
                  placeholder="e.g. Move gym to morning, add a 30-min lunch break, make meetings shorter…"
                  className="tz-refine-input"
                  rows={3}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={handleRefine}
                    disabled={refining || !refineText.trim()}
                    className="tz-btn-primary"
                    style={{ minWidth: 120 }}
                  >
                    {refining ? <><SpinnerInline /> Refining…</> : '✨ Regenerate'}
                  </button>
                  <button
                    onClick={() => { setRefineOpen(false); setRefineText(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* AI Coach */}
            <AiCoach plan={plan} />
          </div>
        )}

        {/* Empty state */}
        {!plan && !loading && (
          <div className="tz-empty animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 14px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
            </svg>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Your schedule will appear here</p>
            <p style={{ fontSize: 12.5, color: '#9CA3AF' }}>Describe your day above and hit Generate</p>
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </PageLayout>
  );
}

/* ── Inline helpers ─────────────────────────────────────────── */
function SpinnerInline() {
  return (
    <span style={{ width: 13, height: 13, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" />
  );
}
function SaveIconSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}

/* ── Stat icons ─────────────────────────────────────────────── */
function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z"/>
    </svg>
  );
}
function TaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}
function FlameIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}
