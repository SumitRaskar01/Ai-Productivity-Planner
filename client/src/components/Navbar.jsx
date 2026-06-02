import { NavLink, useNavigate } from 'react-router-dom';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
      { path: '/focus',     label: 'Focus Mode', Icon: FocusIcon },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/analytics', label: 'Analytics', Icon: AnalyticsIcon },
      { path: '/calendar',  label: 'Calendar',  Icon: CalendarIcon },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/settings', label: 'Settings', Icon: SettingsIcon },
    ],
  },
];

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initial = (user.name || 'U')[0].toUpperCase();

  return (
    <aside className="tz-sidebar">
      {/* Logo */}
      <div className="tz-sidebar-logo">
        <div className="tz-logo-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 3c2 3 3 6 3 9M12 3C10 6 9 9 9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M17 8l4-4M17 8h4M17 8v4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="tz-logo-name">Timezy</span>
        <span className="tz-logo-tag">AI</span>
      </div>

      {/* Nav */}
      <nav className="tz-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="tz-nav-label">{section.label}</div>
            {section.items.map(({ path, label, Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `tz-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="tz-sidebar-footer">
        <div className="tz-user-row">
          <div className="tz-avatar">{initial}</div>
          <span className="tz-user-name">{user.name || 'User'}</span>
          <button className="tz-logout-btn" onClick={logout} title="Log out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── SVG icon components (all use currentColor for CSS inheritance) ── */
function DashboardIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function FocusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="3" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="21"/>
      <line x1="3" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="21" y2="12"/>
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
