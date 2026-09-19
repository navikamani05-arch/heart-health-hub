import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Globe, LogOut, User as UserIcon, Lock } from 'lucide-react';

export const Navbar = ({ onOpenAuth }) => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();

  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Heart size={22} color="white" fill="white" />
        </div>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CardioRisk
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '-4px' }}>
            Explainable AI Risk Platform
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <Globe size={16} color="var(--text-muted)" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            <option value="en" style={{ background: '#1e293b' }}>English</option>
            <option value="ta" style={{ background: '#1e293b' }}>தமிழ்</option>
          </select>
        </div>

        {/* User Auth Status */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <UserIcon size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.username}</span>
            </div>
            <button onClick={logout} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}>
              <LogOut size={15} />
              {t('nav.btn.logout')}
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            <Lock size={15} />
            {t('auth.title')}
          </button>
        )}
      </div>
    </header>
  );
};
