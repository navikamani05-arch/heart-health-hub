import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Heart, UserPlus, LogIn } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const [isRegisterTab, setIsRegisterTab] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isRegisterTab) {
        await register(username, email, password);
        setSuccess(t('auth.msg.register_success'));
        setIsRegisterTab(false);
      } else {
        await login(username, password);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(11, 15, 25, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{
        background: '#1e293b', borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        width: '100%', maxWidth: 420, padding: '2rem',
        position: 'relative', color: '#f8fafc'
      }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.3rem', cursor: 'pointer', display: 'flex' }}>
          <X size={18} color="#94a3b8" />
        </button>

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #0284c7, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={20} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>Heart Health Hub</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>Intelligent Heart Health</div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', background: '#0f172a', borderRadius: 8, padding: '3px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
          {[false, true].map(isReg => (
            <button
              key={String(isReg)}
              onClick={() => setIsRegisterTab(isReg)}
              style={{
                flex: 1, padding: '0.5rem', border: 'none', borderRadius: 6,
                background: isRegisterTab === isReg ? '#1e293b' : 'transparent',
                boxShadow: isRegisterTab === isReg ? '0 2px 6px rgba(0,0,0,0.3)' : 'none',
                color: isRegisterTab === isReg ? '#38bdf8' : '#94a3b8',
                fontWeight: isRegisterTab === isReg ? 700 : 500,
                fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {isReg ? t('auth.tab.register') : t('auth.tab.login')}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', padding: '0.65rem 0.85rem', borderRadius: 8, fontSize: '0.83rem', marginBottom: '1rem' }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '0.65rem 0.85rem', borderRadius: 8, fontSize: '0.83rem', marginBottom: '1rem' }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('auth.username')}</label>
            <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter username" />
          </div>

          {isRegisterTab && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('auth.email')}</label>
              <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter email" />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('auth.password')}</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter password" />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
            {isRegisterTab ? <UserPlus size={17} /> : <LogIn size={17} />}
            {loading ? 'Processing...' : (isRegisterTab ? t('auth.btn.register') : t('auth.btn.login'))}
          </button>
        </form>
      </div>
    </div>
  );
};
