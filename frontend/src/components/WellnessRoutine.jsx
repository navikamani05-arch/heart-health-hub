import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Activity, Utensils, Droplet, Smile, ShieldAlert,
  Sparkles, CheckSquare, Square, Plus, CheckCircle2, RefreshCw, Clock
} from 'lucide-react';

export const WellnessRoutine = ({ patientInputs, riskScore, topShapFeatures }) => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedGoals, setCheckedGoals] = useState({});
  const [savedGoals, setSavedGoals] = useState({});
  const [goalFeedback, setGoalFeedback] = useState(null);

  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const data = await api.generateRoutine(patientInputs, riskScore, topShapFeatures, lang);
      setRoutine(data);
      setCheckedGoals({});
    } catch (err) {
      console.error('Failed to generate routine:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoutine(); }, [lang]);

  const toggleGoal = (index) => setCheckedGoals(prev => ({ ...prev, [index]: !prev[index] }));

  const handleSaveGoal = async (goalText, index) => {
    if (!user) {
      setGoalFeedback('Please sign in to save goals.');
      setTimeout(() => setGoalFeedback(null), 3000);
      return;
    }
    try {
      await api.addGoal(user.id, goalText);
      setSavedGoals(prev => ({ ...prev, [index]: true }));
      setGoalFeedback('Goal saved to Health Goals!');
      setTimeout(() => setGoalFeedback(null), 3000);
    } catch (err) {
      setGoalFeedback('Failed to save goal.');
      setTimeout(() => setGoalFeedback(null), 3000);
    }
  };

  if (!routine && !loading) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <button onClick={fetchRoutine} className="btn-primary">
          <Sparkles size={18} /> {t('routine.btn.generate')}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: '#f8fafc' }}>
      {/* Section Header */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid #2dd4bf' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2dd4bf', fontWeight: 700 }}>
              AI-Generated Wellness Guidance
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <Sparkles size={18} color="#2dd4bf" /> AI Wellness Coach
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              {t('routine.subtitle')}
            </p>
          </div>
          <button onClick={fetchRoutine} className="btn-secondary" disabled={loading} style={{ fontSize: '0.82rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {t('routine.btn.regenerate')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          Generating your personalized wellness plan...
        </div>
      ) : (
        <>
          {/* 4-Section Daily Schedule */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <Clock size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>Your Personalized Daily Schedule</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              {[
                { label: '🌅 Morning', content: routine.morning_routine, borderColor: '#fbbf24', textColor: '#fbbf24' },
                { label: '☀️ Afternoon', content: routine.afternoon_routine, borderColor: '#38bdf8', textColor: '#38bdf8' },
                { label: '🌆 Evening', content: routine.evening_routine, borderColor: '#a855f7', textColor: '#a855f7' },
                { label: '🌙 Night', content: routine.night_routine, borderColor: '#2dd4bf', textColor: '#2dd4bf' },
              ].map(({ label, content, borderColor, textColor }) => (
                <div key={label} className="glass-card" style={{ padding: '1rem', borderTop: `3px solid ${borderColor}`, background: '#0f172a' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: textColor, marginBottom: '0.45rem' }}>{label}</div>
                  <p style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.45 }}>{content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Lifestyle Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
            {[
              { icon: Utensils, label: 'Healthy Eating', content: routine.healthy_eating, color: '#34d399' },
              { icon: Droplet, label: 'Hydration', content: routine.hydration_reminder, color: '#38bdf8' },
              { icon: Activity, label: 'Physical Activity', content: routine.physical_activity, color: '#fb7185' },
              { icon: Smile, label: 'Stress & Relaxation', content: routine.stress_relaxation, color: '#a855f7' },
            ].map(({ icon: Icon, label, content, color }) => (
              <div key={label} className="glass-card" style={{ padding: '1rem', background: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color, fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <Icon size={15} /> {label}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>{content}</p>
              </div>
            ))}
          </div>

          {/* Daily Goals */}
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              🎯 Actionable Daily Goals
            </div>

            {goalFeedback && (
              <div style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', padding: '0.45rem 0.75rem', borderRadius: 8, marginBottom: '0.65rem', fontSize: '0.8rem' }}>
                {goalFeedback}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {routine.daily_goals.map((goal, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.65rem 0.85rem', background: '#0f172a', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flex: 1 }} onClick={() => toggleGoal(idx)}>
                    {checkedGoals[idx] ? <CheckSquare size={16} color="#34d399" /> : <Square size={16} color="#64748b" />}
                    <span style={{ fontSize: '0.85rem', textDecoration: checkedGoals[idx] ? 'line-through' : 'none', color: checkedGoals[idx] ? '#64748b' : '#f8fafc', fontWeight: 500 }}>
                      {goal}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSaveGoal(goal, idx)}
                    disabled={savedGoals[idx]}
                    style={{
                      background: savedGoals[idx] ? 'rgba(52,211,153,0.15)' : '#1e293b',
                      color: savedGoals[idx] ? '#34d399' : '#38bdf8',
                      border: `1px solid ${savedGoals[idx] ? 'rgba(52,211,153,0.3)' : 'var(--border-color)'}`,
                      borderRadius: 6, padding: '0.3rem 0.6rem',
                      fontSize: '0.75rem', cursor: savedGoals[idx] ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, fontWeight: 600
                    }}
                  >
                    {savedGoals[idx] ? <CheckCircle2 size={13} /> : <Plus size={13} />}
                    {savedGoals[idx] ? 'Saved' : t('routine.btn.save_goal')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', padding: '0.75rem 1rem', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <ShieldAlert size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.77rem', color: '#fbbf24', lineHeight: 1.45, margin: 0 }}>
              {routine.disclaimer}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
