import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { useSettings } from '../hooks/useSettings';

function Section({ title, children }) {
  return (
    <div className="tz-card" style={{ padding: 24, marginBottom: 16 }}>
      <h3 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function SettingRow({ label, sub, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-dark)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 42, height: 24, borderRadius: 12,
        background: checked ? 'var(--primary)' : '#D1D5DB',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: checked ? 21 : 3,
        width: 18, height: 18,
        borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { settings, updateSetting, loading } = useSettings();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <PageLayout
      title="Settings"
      subtitle="Manage your account and preferences."
      maxWidth={640}
    >
      <div>
        {/* Profile */}
        <Section title="Profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4CAF80 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 20, fontWeight: 700,
            }}>
              {(user.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)' }}>{user.name || '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{user.email || '—'}</div>
            </div>
          </div>
          <SettingRow label="Full Name" sub={user.name || '—'}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>From account</span>
          </SettingRow>
          <SettingRow label="Email Address" sub={user.email || '—'}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>From account</span>
          </SettingRow>
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <SettingRow label="Sound Alerts" sub="Play a tone when focus session ends">
            <Toggle
              checked={settings.soundEnabled}
              onChange={(val) => updateSetting('soundEnabled', val)}
              disabled={loading}
            />
          </SettingRow>
          <SettingRow label="Dark Mode" sub="Switch to a darker interface">
            <Toggle
              checked={settings.darkMode}
              onChange={(val) => updateSetting('darkMode', val)}
              disabled={loading}
            />
          </SettingRow>
          {loading && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              Loading preferences…
            </p>
          )}
        </Section>

        {/* About */}
        <Section title="About Timezy">
          {[
            ['Version',   '1.0.0'],
            ['Model',     'Gemini 2.5 Flash'],
            ['Framework', 'React + Node.js'],
          ].map(([label, value]) => (
            <SettingRow key={label} label={label}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{value}</span>
            </SettingRow>
          ))}
        </Section>

        {/* Account */}
        <Section title="Account">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-dark)' }}>Sign out</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>You will be redirected to the login page.</div>
            </div>
            <button
              onClick={logout}
              style={{
                padding: '8px 16px', borderRadius: 10,
                border: '1.5px solid #FECACA', background: '#FEF2F2',
                color: '#DC2626', fontSize: 13, fontWeight: 500,
                fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
            >
              Sign Out
            </button>
          </div>
        </Section>
      </div>
    </PageLayout>
  );
}
