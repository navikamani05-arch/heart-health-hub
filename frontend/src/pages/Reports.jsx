import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { humaniseInputSummary } from '../utils/brfssLabels';
import { FileText, Download, Lock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const RiskBadge = ({ score, category }) => {
  const isLow = score < 30;
  const isHigh = score >= 70;
  const s = isLow
    ? { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.3)' }
    : isHigh
    ? { bg: 'rgba(251,113,133,0.15)', color: '#fb7185', border: 'rgba(251,113,133,0.3)' }
    : { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' };
  return (
    <span style={{ padding: '0.3rem 0.75rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {score.toFixed(1)}% — {category}
    </span>
  );
};

const ReportCard = ({ record, lang, t }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={20} color="#38bdf8" />
          </div>
          <div>
            <RiskBadge score={record.risk_score} category={record.risk_category} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 4, color: '#94a3b8', fontSize: '0.77rem' }}>
              <Calendar size={12} />
              {new Date(record.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a href={api.getPdfUrl(record.id, 'en')} target="_blank" rel="noreferrer"
            className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
            <Download size={13} /> English PDF
          </a>
          <a href={api.getPdfUrl(record.id, 'ta')} target="_blank" rel="noreferrer"
            className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
            <Download size={13} /> தமிழ் PDF
          </a>
          <button onClick={() => setExpanded(e => !e)} className="btn-secondary" style={{ padding: '0.4rem 0.65rem' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>{t('report.input_summary')}</div>
            <p style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.5 }}>{humaniseInputSummary(record.input_summary, t)}</p>
          </div>
          <div>
            <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>{t('report.factors.title')}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Object.entries(record.top_shap_features).map(([f, v]) => (
                <span key={f} style={{
                  padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.77rem', fontWeight: 600,
                  background: v > 0 ? 'rgba(251,113,133,0.15)' : 'rgba(56,189,248,0.15)',
                  color: v > 0 ? '#fb7185' : '#38bdf8',
                  border: `1px solid ${v > 0 ? 'rgba(251,113,133,0.3)' : 'rgba(56,189,248,0.3)'}`,
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

export const Reports = ({ onOpenAuth }) => {
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
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Lock size={26} color="#38bdf8" />
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>{t('report.title')}</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Please sign in to view and download your reports.</p>
        <button onClick={onOpenAuth} className="btn-primary" style={{ margin: '0 auto' }}>{t('auth.btn.login')}</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900, color: '#f8fafc' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={24} color="#38bdf8" />
          {t('report.title')}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: 4 }}>{t('report.subtitle')}</p>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>Loading reports...</div>
      ) : history.length === 0 ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
          {t('report.empty')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {history.map(record => <ReportCard key={record.id} record={record} lang={lang} t={t} />)}
        </div>
      )}

      <div style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#fbbf24' }}>
        ⚠️ Reports are generated for educational and research purposes. They are not medical diagnoses. Consult a qualified healthcare professional for personal medical guidance.
      </div>
    </div>
  );
};
