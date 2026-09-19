import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  ArrowRight, Target, FileText, HeartPulse, Sparkles, Plus, AlertCircle, Info
} from 'lucide-react';

const FEATURE_LABELS_MAP = {
  'HighBP': 'High Blood Pressure',
  'HighChol': 'High Cholesterol',
  'CholCheck': 'Cholesterol Check (5yrs)',
  'BMI': 'Body Mass Index (BMI)',
  'Smoker': 'Smoker',
  'Stroke': 'History of Stroke',
  'Diabetes': 'Diabetes Status',
  'PhysActivity': 'Physical Activity',
  'Fruits': 'Fruit Consumption',
  'Veggies': 'Vegetable Consumption',
  'HvyAlcoholConsump': 'Heavy Alcohol Use',
  'AnyHealthcare': 'Healthcare Coverage',
  'NoDocbcCost': 'Cost Barrier to Doctor',
  'GenHlth': 'General Health Rating',
  'MentHlth': 'Mental Health Days',
  'PhysHlth': 'Physical Health Days',
  'DiffWalk': 'Difficulty Walking',
  'Sex': 'Sex',
  'Age': 'Age Group',
  'Education': 'Education Level',
  'Income': 'Income Level',
};

// Tooltip style for Recharts
const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '0.85rem',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

const QuickLinkCard = ({ icon: Icon, title, desc, to, color }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{title}</div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>{desc}</div>
      </div>
      <ArrowRight size={18} color="#64748b" />
    </div>
  </Link>
);

export const Home = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const hist = await api.getHistory(user.id);
        setHistory(hist || []);
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const latestAssessment = history.length > 0 ? history[0] : null;

  // Format chart data
  const chartData = [...history].reverse().map(item => ({
    date: new Date(item.created_at).toLocaleDateString(),
    score: parseFloat(item.risk_score).toFixed(1),
  }));

  const handleCreateGoal = async (featureKey) => {
    const goalText = `Focus on improving my ${FEATURE_LABELS_MAP[featureKey] || featureKey}`;
    try {
      await api.addGoal(user.id, goalText);
      navigate('/goals');
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1000, margin: '0 auto', paddingBottom: '2rem', color: '#f8fafc' }}>
      
      {/* 1. Welcome Section */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
          {t('home.welcome', { username: user?.username || '' })}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.4rem' }}>
          {t('home.overview_subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          {t('home.loading')}
        </div>
      ) : (
        <>
          {/* 2. {t('home.latest_assessment')} */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '1.5rem 2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.4rem' }}>Latest Assessment</div>
                {latestAssessment ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>{latestAssessment.risk_score.toFixed(1)}<span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#94a3b8' }}>%</span></div>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: latestAssessment.risk_score < 30 ? '#34d399' : latestAssessment.risk_score < 70 ? '#fbbf24' : '#fb7185' }}>
                        {latestAssessment.risk_category}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {new Date(latestAssessment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#cbd5e1' }}>{t('home.no_assessment')}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/risk-predictor" className="btn-primary" style={{ textDecoration: 'none', background: '#0284c7', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                  {latestAssessment ? t('home.take_new') : t('home.start_assessment')}
                </Link>
                {latestAssessment && (
                  <>
                    <Link to="/reports" className="btn-secondary" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid var(--border-color)', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                      View Full Report
                    </Link>
                    <Link to="/risk-predictor" state={{ exploreWhatIf: true, previousAssessment: latestAssessment }} className="btn-secondary" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid var(--border-color)', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
                      Explore What-If
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div style={{ padding: '1rem 2rem', background: '#0f172a', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <Info size={16} color="#38bdf8" />
              <span>{t('home.disclaimer_banner')}</span>
            </div>
          </div>

          {latestAssessment && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              
              {/* 3. {t('home.influenced_title')} */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>What Influenced Your Result</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                  {t('home.influenced_subtitle')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(latestAssessment.top_shap_features).slice(0, 4).map(([feature, impactValue]) => (
                    <div key={feature} style={{ padding: '1rem', background: '#0f172a', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{FEATURE_LABELS_MAP[feature] || feature}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 999, background: impactValue > 0 ? 'rgba(251,113,133,0.15)' : 'rgba(56,189,248,0.15)', color: impactValue > 0 ? '#fb7185' : '#38bdf8' }}>
                          {impactValue > 0 ? t('home.increased_score') : t('home.lowered_score')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        {t('home.factor_impact_text')}
                      </div>
                      <button onClick={() => handleCreateGoal(feature)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                        <Plus size={14} /> {t('home.explore_goal')}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem', display: 'flex', alignItems: 'start', gap: '0.4rem' }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{t('home.goals_disclaimer')}</span>
                </div>
              </div>

              {/* 4. Health Journey */}
              <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>{t('home.journey_title')}</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                  {t('home.journey_subtitle')}
                </p>

                {history.length > 1 ? (
                  <div style={{ flex: 1, minHeight: 250, width: '100%' }}>
                    <ResponsiveContainer>
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value}%`, 'Score']} />
                        <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#38bdf8', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', borderRadius: 12, border: '1px dashed var(--border-color)' }}>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: 200, textAlign: 'center' }}>
                      {t('home.journey_empty')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Quick Links */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>{t('home.connect_care')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <QuickLinkCard icon={Sparkles} title={t('home.card_coach_title')} desc={t('home.card_coach_desc')} to="/wellness-coach" color="#a855f7" />
              <QuickLinkCard icon={Target} title={t('home.card_goals_title')} desc={t('home.card_goals_desc')} to="/goals" color="#2dd4bf" />
              <QuickLinkCard icon={HeartPulse} title={t('home.card_care_title')} desc={t('home.card_care_desc')} to="/care" color="#fb7185" />
              <QuickLinkCard icon={FileText} title={t('home.card_reports_title')} desc={t('home.card_reports_desc')} to="/reports" color="#fbbf24" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
