import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Menu, X, Globe, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';

export const TopNavbar = ({ variant = 'public' }) => {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const NAV_LINKS_PUBLIC = [
    { label: t('nav.home') || 'Home', to: '/' },
    { label: t('nav.how_it_works') || 'How It Works', to: '/#how-it-works' },
    { label: t('nav.explainability') || 'AI & Explainability', to: '/#explainability' },
    { label: t('nav.about') || 'About', to: '/#about' },
  ];

  const NAV_LINKS_AUTH = [
    { label: t('nav.dashboard') || 'Dashboard', to: '/dashboard' },
    { label: t('nav.predictor') || 'Risk Predictor', to: '/risk-predictor' },
    { label: t('nav.coach') || 'AI Wellness Coach', to: '/wellness-coach' },
    { label: t('nav.insights') || 'Model Insights', to: '/insights' },
    { label: t('nav.goals') || 'Health Goals', to: '/goals' },
    { label: t('nav.reports') || 'Reports', to: '/reports' },
  ];

  const isAuth = variant === 'app' || !!user;
  const navLinks = isAuth ? NAV_LINKS_AUTH : NAV_LINKS_PUBLIC;

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (to) => location.pathname === to;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 1.5rem',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem',
      }}>
        {/* Brand */}
        <Link to={isAuth ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(2,132,199,0.3)',
          }}>
            <Heart size={17} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>Heart Health Hub</div>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Intelligent Heart Health</div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center' }}
             className="desktop-nav">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              style={{
                padding: '0.45rem 0.85rem', borderRadius: 7, textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: isActive(to) ? 600 : 500,
                color: isActive(to) ? '#38bdf8' : '#cbd5e1',
                background: isActive(to) ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f8fafc'; } }}
              onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; } }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }} className="desktop-nav">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            title={lang === 'en' ? 'தமிழ் மொழிக்கு மாற்றவும்' : 'Switch to English'}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.4rem 0.65rem', borderRadius: 7,
              border: '1px solid var(--border-color)', background: 'var(--bg-card)',
              cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <Globe size={13} color="#38bdf8" />
            {lang === 'en' ? 'EN' : 'தமிழ்'}
          </button>

          {isAuth ? (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.4rem 0.75rem', borderRadius: 8,
                  border: '1px solid var(--border-color)', background: 'var(--bg-card)',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc',
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#0284c7,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={13} color="white" />
                </div>
                {user?.username}
                <ChevronDown size={13} color="#94a3b8" />
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                  minWidth: 170, padding: '0.35rem',
                  zIndex: 200,
                }}>
                  <Link to="/settings" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', borderRadius: 7, textDecoration: 'none', fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <UserIcon size={14} color="#38bdf8" /> {t('nav.settings') || 'Settings'}
                  </Link>
                  <Link to="/care" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', borderRadius: 7, textDecoration: 'none', fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    ❤️ {t('nav.cardiac_care') || 'Find Cardiac Care'}
                  </Link>
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0.25rem 0' }} />
                  <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', color: '#fb7185', fontWeight: 600, textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,113,133,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={14} /> {t('nav.signout') || 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{
                padding: '0.45rem 1rem', borderRadius: 7, textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0',
                border: '1px solid var(--border-color)', background: 'var(--bg-card)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = '#e2e8f0'; }}>
                Login
              </Link>
              <Link to="/register" style={{
                padding: '0.45rem 1rem', borderRadius: 7, textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: 600, color: '#fff',
                background: 'linear-gradient(135deg,#0284c7,#0369a1)',
                boxShadow: '0 2px 8px rgba(2,132,199,0.3)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="mobile-only"
          onClick={() => setMobileOpen(o => !o)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 7, padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {mobileOpen ? <X size={20} color="#cbd5e1" /> : <Menu size={20} color="#cbd5e1" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: '#0f172a', borderTop: '1px solid var(--border-color)',
          padding: '1rem 1.5rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.35rem',
        }}>
          {navLinks.map(({ label, to }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{
              padding: '0.65rem 0.85rem', borderRadius: 8, textDecoration: 'none',
              fontSize: '0.9rem', fontWeight: 500,
              color: isActive(to) ? '#38bdf8' : '#e2e8f0',
              background: isActive(to) ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
            }}>{label}</Link>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />
          {isAuth ? (
            <>
              <Link to="/settings" onClick={() => setMobileOpen(false)} style={{ padding: '0.65rem 0.85rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserIcon size={16} color="#38bdf8" /> {t('nav.settings') || 'Settings'}
              </Link>
              <Link to="/care" onClick={() => setMobileOpen(false)} style={{ padding: '0.65rem 0.85rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ❤️ {t('nav.cardiac_care') || 'Find Cardiac Care'}
              </Link>
              <button onClick={handleLogout} style={{ padding: '0.65rem 0.85rem', borderRadius: 8, border: 'none', background: 'rgba(251,113,133,0.12)', color: '#fb7185', fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <Link to="/login" onClick={() => setMobileOpen(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', border: '1px solid var(--border-color)', background: 'var(--bg-card)', textAlign: 'center' }}>{t('nav.login')}</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#0284c7,#0369a1)', textAlign: 'center' }}>{t('nav.get_started')}</Link>
            </div>
          )}
          {/* Language toggle in mobile */}
          <button onClick={() => setLang(lang === 'en' ? 'ta' : 'en')} style={{ padding: '0.5rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Globe size={14} color="#38bdf8" /> {lang === 'en' ? 'தமிழ் மொழிக்கு மாற்றவும்' : 'Switch to English'}
          </button>
        </div>
      )}
    </nav>
  );
};

