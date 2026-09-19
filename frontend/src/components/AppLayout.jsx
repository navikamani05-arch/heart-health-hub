import React from 'react';
import { TopNavbar } from './TopNavbar';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

/**
 * Layout wrapper for all authenticated (protected) pages.
 * Provides: TopNavbar + scrollable main content + dark footer.
 */
export const AppLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
    <TopNavbar variant="app" />
    <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      {children}
    </main>
    <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.25rem 1.5rem', background: '#0f172a' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#0284c7,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={12} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>Heart Health Hub</span>
        </div>
        <p style={{ fontSize: '0.73rem', color: '#94a3b8', margin: 0, maxWidth: 600, textAlign: 'center' }}>
          Heart Health Hub is an educational and research platform. Model outputs are statistical estimates and do not replace professional medical advice.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Settings', to: '/settings' }, { label: 'Cardiac Care', to: '/care' }].map(({ label, to }) => (
            <Link key={to} to={to} style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  </div>
);
