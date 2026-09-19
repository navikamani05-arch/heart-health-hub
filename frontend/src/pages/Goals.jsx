import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Target, Plus, CheckCircle2, Lock, Sparkles, Circle } from 'lucide-react';

const SUGGESTED_GOALS = [
  { icon: '🚶', text: 'Walk briskly for 30 minutes daily' },
  { icon: '🥗', text: 'Eat 5 servings of fruits & vegetables daily' },
  { icon: '💧', text: 'Drink at least 8 glasses of water' },
  { icon: '😴', text: 'Get 7–8 hours of restful sleep every night' },
  { icon: '🧘', text: 'Practice 10 minutes of mindfulness or relaxation' },
  { icon: '🚭', text: 'Maintain a smoke-free day' },
  { icon: '🩺', text: 'Schedule a routine health check-up' },
];

export const Goals = ({ onOpenAuth }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [addingGoal, setAddingGoal] = useState(null);

  const fetchGoals = async () => {
    if (user) {
      try {
        const data = await api.getGoals(user.id);
        setGoals(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddGoal = async (e, goalText) => {
    if (e) e.preventDefault();
    const text = goalText || newGoalText;
    if (!text.trim()) return;
    setLoading(true);
    setAddingGoal(text);
    try {
      await api.addGoal(user.id, text.trim());
      setNewGoalText('');
      await fetchGoals();
      showFeedback(t('goals.saved'));
    } catch (err) {
      showFeedback('Failed to save goal.', 'error');
    } finally {
      setLoading(false);
      setAddingGoal(null);
    }
  };

  const handleAchieveGoal = async (goalId) => {
    try {
      await api.achieveGoal(goalId);
      await fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Lock size={26} color="#34d399" />
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>{t('goals.title')}</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Please sign in to manage your personal health goals.</p>
        <button onClick={onOpenAuth} className="btn-primary" style={{ margin: '0 auto' }}>{t('auth.btn.login')}</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900, color: '#f8fafc' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={24} color="#fb7185" />
          {t('goals.title')}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: 4 }}>{t('goals.subtitle')}</p>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div style={{
          padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500,
          background: feedback.type === 'success' ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)',
          color: feedback.type === 'success' ? '#34d399' : '#fb7185',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'}`,
        }}>
          {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.msg}
        </div>
      )}

      {/* Active Goals Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{goals.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>Active Goals</div>
        </div>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>0</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>Completed</div>
        </div>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7' }}>{SUGGESTED_GOALS.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>Suggested</div>
        </div>
      </div>

      {/* Suggested Wellness Goals */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Sparkles size={16} color="#a855f7" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>Suggested Wellness Goals</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem' }}>
          {SUGGESTED_GOALS.map((sg, idx) => (
            <button
              key={idx}
              onClick={() => handleAddGoal(null, sg.text)}
              disabled={addingGoal === sg.text}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.6rem 0.85rem', border: '1px solid var(--border-color)',
                borderRadius: 8, background: '#0f172a', cursor: 'pointer', textAlign: 'left',
                fontSize: '0.825rem', color: '#e2e8f0', fontWeight: 500,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = '#38bdf8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <span style={{ fontSize: '1.1rem' }}>{sg.icon}</span>
              <span style={{ flex: 1 }}>{sg.text}</span>
              <Plus size={14} color="#38bdf8" />
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Goal */}
      <form onSubmit={handleAddGoal} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input
          type="text"
          className="form-input"
          style={{ flex: 1, margin: 0 }}
          placeholder={t('goals.input')}
          value={newGoalText}
          onChange={e => setNewGoalText(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading} style={{ flexShrink: 0 }}>
          <Plus size={16} />
          {t('goals.btn.save')}
        </button>
      </form>

      {/* Active Goals List */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
          {t('goals.heading.active')} ({goals.length})
        </h3>
        {goals.length === 0 ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
            {t('goals.empty')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {goals.map(g => (
              <div key={g.id} className="glass-card" style={{ padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
                  <Circle size={16} color="#64748b" />
                  <span style={{ fontSize: '0.875rem', color: '#f8fafc', fontWeight: 500 }}>{g.goal}</span>
                </div>
                <button
                  onClick={() => handleAchieveGoal(g.id)}
                  style={{
                    background: 'rgba(52,211,153,0.12)', color: '#34d399',
                    border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8,
                    padding: '0.35rem 0.75rem', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={14} />
                  {t('goals.btn.achieve')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
