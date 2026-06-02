import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = true,
  maxWidth = 900,
  showRightPanel = false,
  rightPanelContent = null
}) {
  const navigate = useNavigate();

  return (
    <div className="tz-app">
      <Navbar />
      <div className="tz-body">
        <main className="tz-main">
          <div className="tz-container" style={maxWidth ? { maxWidth } : {}}>
            {/* Header with Back Button */}
            <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  {showBackButton && (
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="tz-icon-btn" 
                      style={{ width: 32, height: 32, borderRadius: 8 }}
                      title="Back to Dashboard"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                    </button>
                  )}
                  <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.5px', color: 'var(--text-dark)', margin: 0 }}>
                    {title}
                  </h1>
                </div>
                {subtitle && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: showBackButton ? 44 : 0 }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>

        {showRightPanel && (
          <aside className="tz-right">
            {rightPanelContent}
          </aside>
        )}
      </div>
    </div>
  );
}
