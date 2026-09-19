import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await register(username, email, password);
      setSuccess('Registration successful! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      {/* Left panel */}
      <div style={{
        background: 'linear-gradient(160deg, #0d9488 0%, #0284c7 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem 2.5rem', minHeight: 400,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative rings */}
        {[1,2,3].map(i => (
          <div key={i} style={{ position: 'absolute', top: -60 * i, left: -60 * i, width: 200 + i * 80, height: 200 + i * 80, borderRadius: '50%', border: `1px solid rgba(255,255,255,${0.06 + i * 0.03})`, pointerEvents: 'none' }} />
        ))}

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', marginBottom: '3rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={18} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Heart Health Hub</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>Intelligent Heart Health</div>
          </div>
        </Link>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.25, margin: '0 0 1rem' }}>
            Take control of your<br />cardiovascular future.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 380, margin: 0 }}>
            Join Heart Health Hub to explore personalized risk insights powered by explainable machine learning.
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {['Save & track prediction history over time', 'Set & track personalized health goals', 'Generate & download PDF medical reports', 'Access Cardiac Care hospital directory'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: '0.65rem' }}>✓</span>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', background: '#0b0f19' }}>
        <div style={{ width: '100%', maxWidth: 400, background: 'var(--bg-card)', padding: '2.5rem', borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.35rem' }}>Create Your Heart Health Hub Account</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 1.75rem' }}>Get started with your personalized dashboard.</p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
              <AlertCircle size={16} color="#fb7185" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: '0.85rem', color: '#fb7185', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 500 }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Choose a username"
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Enter your email"
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}
            >
              <UserPlus size={18} />
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              Sign In
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <Link to="/" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
              ← Back to Heart Health Hub
            </Link>
          </div>

          <p style={{ marginTop: '2rem', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.55, textAlign: 'center' }}>
            By creating an account, you acknowledge that Heart Health Hub is for educational and research purposes only. Model outputs are not medical diagnoses.
          </p>
        </div>
      </div>
    </div>
  );
};
