import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon, User as UserIcon, Globe, Palette,
  Bell, LogOut, Check, Moon
} from 'lucide-react';

const SectionHeader = ({ icon: Icon, color, bg, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
    <div style={{ padding: '0.55rem', borderRadius: 10, background: bg, flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>{title}</h2>
  </div>
);

const ToggleSwitch = ({ checked, onChange, label }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.85rem 1rem', borderRadius: 10,
      background: checked ? 'rgba(56, 189, 248, 0.12)' : '#0f172a',
      border: `1px solid ${checked ? 'rgba(56, 189, 248, 0.25)' : 'var(--border-color)'}`,
      transition: 'all 0.2s ease',
    }}
  >
    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>{label}</span>
    <button
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? 'linear-gradient(135deg, #0284c7, #0d9488)' : '#334155',
        position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: checked ? 23 : 3,
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  </div>
);

export const Settings = () => {
  const { t, lang, setLang } = useLanguage();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState({
    healthReminders: true,
    weeklyReports: true,
    goalUpdates: false,
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 800, color: '#f8fafc' }}>

      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <SettingsIcon size={28} color="#38bdf8" />
          {t('settings.title')}
        </h1>
      </div>

      {/* Profile Section */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <SectionHeader icon={UserIcon} color="#38bdf8" bg="rgba(56, 189, 248, 0.15)" title={t('settings.profile.title')} />
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
            }}>
              <UserIcon size={28} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{user.username}</div>
              {user.email && (
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>{user.email}</div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '1.5rem', borderRadius: 12, background: '#0f172a',
            border: '1px solid var(--border-color)', textAlign: 'center',
          }}>
            <UserIcon size={32} color="#64748b" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
              {t('settings.profile.signInPrompt') || 'Please sign in to view profile'}
            </div>
          </div>
        )}
      </div>

      {/* Language Section */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <SectionHeader icon={Globe} color="#2dd4bf" bg="rgba(45, 212, 191, 0.15)" title={t('settings.language.title')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {languages.map(({ code, label, native }) => {
            const isActive = lang === code;
            return (
              <button
                key={code}
                onClick={() => setLang(code)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem', borderRadius: 10, cursor: 'pointer',
                  background: isActive ? 'rgba(45, 212, 191, 0.15)' : '#0f172a',
                  border: `1.5px solid ${isActive ? '#2dd4bf' : 'var(--border-color)'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${isActive ? '#2dd4bf' : '#64748b'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.15s ease',
                  }}>
                    {isActive && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2dd4bf' }} />}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500, color: isActive ? '#2dd4bf' : '#e2e8f0' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{native}</div>
                  </div>
                </div>
                {isActive && <Check size={18} color="#2dd4bf" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Section */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <SectionHeader icon={Palette} color="#a855f7" bg="rgba(168, 85, 247, 0.15)" title={t('settings.theme.title')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.85rem 1rem', borderRadius: 10,
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1.5px solid #a855f7',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Moon size={20} color="#a855f7" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a855f7' }}>
                Dark Health-Tech AI Theme (Active)
              </span>
            </div>
            <Check size={18} color="#a855f7" />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <SectionHeader icon={Bell} color="#fbbf24" bg="rgba(251, 191, 36, 0.15)" title={t('settings.notifications.title')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <ToggleSwitch
            checked={notifications.healthReminders}
            onChange={() => toggleNotification('healthReminders')}
            label={t('settings.notifications.healthReminders') || 'Health Reminders'}
          />
          <ToggleSwitch
            checked={notifications.weeklyReports}
            onChange={() => toggleNotification('weeklyReports')}
            label={t('settings.notifications.weeklyReports') || 'Weekly Reports'}
          />
          <ToggleSwitch
            checked={notifications.goalUpdates}
            onChange={() => toggleNotification('goalUpdates')}
            label={t('settings.notifications.goalUpdates') || 'Goal Updates'}
          />
        </div>
      </div>

      {/* Account Actions Section */}
      {user && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <SectionHeader icon={LogOut} color="#fb7185" bg="rgba(251, 113, 133, 0.15)" title={t('settings.account.title') || 'Account Actions'} />
          <button
            onClick={logout}
            className="btn-secondary"
            style={{
              width: '100%', padding: '0.85rem 1rem', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(251, 113, 133, 0.12)',
              border: '1.5px solid rgba(251, 113, 133, 0.3)',
              color: '#fb7185', fontSize: '0.9rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={18} />
            {t('settings.account.logout') || 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
};
