import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerUser(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({ name: res.data.name, email: res.data.email }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tz-auth-bg">
      {/* Left panel */}
      <div className="tz-auth-left">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 3c2 3 3 6 3 9M12 3C10 6 9 9 9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M17 8l4-4M17 8h4M17 8v4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>Timezy</span>
          </div>

          <h2 style={{ color: 'white', fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px', lineHeight: 1.3, marginBottom: 16 }}>
            Your day,<br />organized by AI.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6 }}>
            Join thousands of people using Timezy to plan better, focus deeper, and accomplish more every day.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {['Free to get started', 'No scheduling expertise needed', 'Instant AI-generated schedules'].map((feature) => (
            <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5 }}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="tz-auth-right">
        <div className="tz-auth-card animate-slide-up">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', color: 'var(--text-dark)', marginBottom: 6 }}>
              Create your account
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
              Start planning smarter with AI
            </p>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 13, borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="tz-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="tz-input-field"
              />
            </div>
            <div>
              <label className="tz-label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="tz-input-field"
              />
            </div>
            <div>
              <label className="tz-label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
                minLength={6}
                className="tz-input-field"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="tz-btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {loading ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" />
                  Creating account…
                </>
              ) : 'Get started — it\'s free'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 22 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
