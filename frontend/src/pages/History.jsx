import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { humaniseInputSummary } from '../utils/brfssLabels';
import { History as HistoryIcon, Calendar, Download, Lock, ChevronDown, ChevronUp } from 'lucide-react';

const RiskBadge = ({ score, category }) => {
  const isLow = score < 30;
  const isHigh = score >= 70;
  const styles = isLow
    ? { bg: '#f0fdf4', color: '#166534', border: '#86efac' }
    : isHigh
    ? { bg: '#fff1f2', color: '#9f1239', border: '#fda4af' }
    : { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' };

  return (
    <span style={{ padding: '0.3rem 0.75rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, background: styles.bg, color: styles.color, border: `1px solid ${styles.border}` }}>
      {score.toFixed(1)}% — {category}
    </span>
  );
};

const HistoryCard = ({ record, lang, t }) => {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(record.created_at).toLocaleString();

  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #0284c7, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>{record.risk_score.toFixed(0)}</span>
          </div>
          <div>
            <RiskBadge score={record.risk_score} category={record.risk_category} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 4, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <Calendar size={13} />
              {date}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a
            href={api.getPdfUrl(record.id, lang)}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          >
            <Download size={14} />
            {t('report.btn.download')}
          </a>
          <button onClick={() => setExpanded(e => !e)} className="btn-secondary" style={{ padding: '0.4rem 0.65rem' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{t('history.input_summary')}</div>
            <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>{humaniseInputSummary(record.input_summary, t)}</p>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{t('history.drivers')}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Object.entries(record.top_shap_features).map(([f, v]) => (
                <span key={f} style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: v > 0 ? 'rgba(244,63,94,0.08)' : 'rgba(2,132,199,0.08)',
                  color: v > 0 ? '#be123c' : '#0369a1',
                  border: `1px solid ${v > 0 ? 'rgba(244,63,94,0.2)' : 'rgba(2,132,199,0.2)'}`,
                }}>
                  {f}: {v > 0 ? '+' : ''}{v.toFixed(3)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const History = ({ onOpenAuth }) => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      api.getHistory(user.id)
        .then(data => setHistory(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(2,132,199,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Lock size={26} color="var(--accent-blue)" />
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>{t('history.title')}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Please sign in to view your saved prediction history.</p>
        <button onClick={onOpenAuth} className="btn-primary" style={{ margin: '0 auto' }}>{t('auth.btn.login')}</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900 }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HistoryIcon size={24} color="var(--accent-blue)" />
          {t('history.title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>Saved records for <strong>{user.username}</strong> — {history.length} assessment{history.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</div>
      ) : history.length === 0 ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('history.empty')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {history.map(record => <HistoryCard key={record.id} record={record} lang={lang} t={t} />)}
        </div>
      )}

      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#92400e' }}>
        ⚠️ All scores are model-estimated statistical outputs. They are not medical diagnoses.
      </div>
    </div>
  );
};
