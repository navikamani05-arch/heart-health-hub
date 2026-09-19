import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard, Stethoscope, History, Target,
  Bot, FileText, BarChart2, Hospital, Settings, HelpCircle,
  Heart, Globe, LogOut, User as UserIcon, Lock, ChevronLeft, ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { t, lang, setLang } = useLanguage();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const mainNav = [
    { id: 'home', key: 'nav.dashboard', icon: LayoutDashboard },
    { id: 'predictor', key: 'nav.predictor', icon: Stethoscope },
    { id: 'coach', key: 'nav.coach', icon: Bot },
    { id: 'history', key: 'nav.history', icon: History },
    { id: 'goals', key: 'nav.goals', icon: Target },
    { id: 'cardiac-care', key: 'nav.cardiac_care', icon: Hospital },
    { id: 'reports', key: 'nav.reports', icon: FileText },
    { id: 'insights', key: 'nav.insights', icon: BarChart2 },
  ];

  const bottomNav = [
    { id: 'settings', key: 'nav.settings', icon: Settings },
    { id: 'help', key: 'nav.help', icon: HelpCircle },
  ];

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const label = t(item.key);
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        title={collapsed ? label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
          padding: '0.6rem 0.85rem',
          borderRadius: 8,
          border: 'none',
          background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
          color: isActive ? '#38bdf8' : '#94a3b8',
          fontWeight: isActive ? 600 : 400,
          fontSize: '0.875rem',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.15s ease',
          borderLeft: isActive ? '2px solid #38bdf8' : '2px solid transparent',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f8fafc'; } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
      >
        <Icon size={18} style={{ flexShrink: 0, color: isActive ? '#38bdf8' : undefined }} />
        {!collapsed && <span>{label}</span>}
      </button>
    );
  };

  return (
    <aside style={{
      width: collapsed ? '64px' : '240px',
      background: '#0f172a',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      transition: 'width 0.2s ease',
      overflow: 'hidden',
      zIndex: 50,
      boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
    }}>
      {/* Brand */}
      <div style={{ padding: '1.25rem 0.85rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.65rem', minHeight: 68 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Heart size={20} color="white" fill="white" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Heart Health Hub</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2, fontWeight: 500 }}>Intelligent Heart Health</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ marginLeft: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '0.25rem', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
        >
          {collapsed ? <ChevronRight size={14} color="#94a3b8" /> : <ChevronLeft size={14} color="#94a3b8" />}
        </button>
      </div>

      {/* User pill */}
      <div style={{ padding: '0.75rem 0.85rem', borderBottom: '1px solid var(--border-color)' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0284c7, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserIcon size={14} color="white" />
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t('nav.active_session') || 'Active Session'}</div>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onOpenAuth} style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Lock size={14} />
            {!collapsed && t('nav.login') || 'Sign In'}
          </button>
        )}
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', overflowY: 'auto' }}>
        {!collapsed && <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', padding: '0.35rem 0.4rem 0.5rem' }}>{t('nav.main_menu') || 'MAIN MENU'}</div>}
        {mainNav.map(item => <NavItem key={item.id} item={item} />)}
      </nav>

      {/* Bottom Nav */}
      <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {bottomNav.map(item => <NavItem key={item.id} item={item} />)}

        {/* Language toggle */}
        <div style={{ padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
          {!collapsed && (
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '0.8rem', outline: 'none', cursor: 'pointer', fontWeight: 500, flex: 1 }}
            >
              <option value="en" style={{ background: '#1e293b', color: '#fff' }}>English</option>
              <option value="ta" style={{ background: '#1e293b', color: '#fff' }}>தமிழ்</option>
            </select>
          )}
        </div>

        {/* Logout */}
        {user && (
          <button onClick={logout} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.5rem 0.85rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {!collapsed && t('nav.signout') || 'Sign Out'}
          </button>
        )}
      </div>
    </aside>
  );
};
