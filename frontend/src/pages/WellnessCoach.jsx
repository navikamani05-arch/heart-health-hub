import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles, Send, Trash2, ShieldAlert, User as UserIcon,
  Bot, Loader2, Heart, AlertCircle, RefreshCw
} from 'lucide-react';

const QUICK_QUESTIONS = [
  { label: '📊 Explain my latest assessment', text: 'Can you explain my latest assessment in simple terms?' },
  { label: '🔍 What influenced my result?', text: 'What influenced my result the most and why?' },
  { label: '🎯 What should I focus on?', text: 'Based on my health profile, what should I focus on improving first?' },
  { label: '✅ Help me create a wellness goal', text: 'Help me choose a meaningful and achievable wellness goal based on my factors.' },
  { label: '🔄 Explain my What-If result', text: 'Can you help me understand what a What-If simulation result means for me?' },
  { label: '🗓️ Give me a healthy routine', text: 'Give me a realistic daily wellness routine suited to my heart health context.' },
];

const WELCOME = (username) =>
  username
    ? `👋 Hi ${username}! I'm your Heart Health Hub Wellness Coach.\n\nI can help you understand your CardioRisk results, explain your key risk factors, suggest practical wellness routines, and help you set health goals.\n\nWhat would you like to talk about? You can type a question or pick one below.`
    : `👋 Welcome to the Heart Health Hub Wellness Coach!\n\nI can provide personalized wellness guidance and help you understand heart health concepts.\n\nSign in to get personalized responses based on your CardioRisk prediction results. Or feel free to ask me a general wellness question right now!`;

const formatMessage = (text) =>
  text.split('\n').map((line, i) => <span key={i}>{line}{i < text.split('\n').length - 1 && <br />}</span>);

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const WellnessCoach = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: WELCOME(null), time: now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [patientContext, setPatientContext] = useState({});
  const [contextLoaded, setContextLoaded] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([{ id: 1, role: 'assistant', text: WELCOME(user?.username), time: now() }]);
  }, [user?.username]);

  useEffect(() => {
    const loadContext = async () => {
      if (!user?.id) {
        setPatientContext({});
        setContextLoaded(true);
        return;
      }
      try {
        const [historyData, goalsData] = await Promise.allSettled([
          api.getHistory(user.id),
          api.getGoals(user.id),
        ]);

        const context = {};

        if (historyData.status === 'fulfilled' && historyData.value?.length > 0) {
          const latest = historyData.value[0];
          context.risk_result = latest.risk_category || '';
          context.risk_score = latest.risk_score ?? null;
          if (latest.top_shap_features && typeof latest.top_shap_features === 'object') {
            const sorted = Object.entries(latest.top_shap_features)
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
              .slice(0, 5)
              .map(([k]) => k);
            context.risk_factors = sorted;
          }
        }

        if (goalsData.status === 'fulfilled' && goalsData.value?.length > 0) {
          context.health_goals = goalsData.value.slice(0, 5).map((g) => g.goal);
        }

        setPatientContext(context);
      } catch {
        // Non-fatal
      } finally {
        setContextLoaded(true);
      }
    };
    loadContext();
  }, [user?.id]);

  const sendMessage = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    setError(null);
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: messageText, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.coachChat(messageText, patientContext);
      const coachMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.reply || 'I hear you. How else can I help with your heart wellness journey today?',
        time: now(),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      setError(err.message || 'Failed to reach Wellness Coach. Please check your connection.');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ id: Date.now(), role: 'assistant', text: WELCOME(user?.username), time: now() }]);
    setError(null);
  };

  const hasContext = !!patientContext.risk_score;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 900, margin: '0 auto', color: '#f8fafc' }}>
      {/* ── Banner card ── */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(2,132,199,0.12) 0%, rgba(13,148,136,0.12) 100%)',
          borderLeft: '4px solid #38bdf8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
          }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              AI Wellness Coach
            </h1>
            <p style={{ fontSize: '0.83rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Personalized wellness guidance & answers based on your Heart Health Hub profile
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Context pill */}
          {user && contextLoaded && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.35rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
              background: hasContext ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
              color: hasContext ? '#34d399' : '#fbbf24',
              border: hasContext ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(251,191,36,0.3)',
            }}>
              <Heart size={12} />
              {hasContext ? 'Personalized with your assessment data' : 'Take an assessment to personalize'}
            </div>
          )}

          {/* Clear button */}
          <button
            onClick={clearChat}
            title="Clear chat"
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8,
              padding: '0.4rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '0.35rem', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      {/* ── Chat window ── */}
      <div
        className="glass-card"
        style={{
          flex: 1, minHeight: 420, maxHeight: 520,
          overflowY: 'auto', padding: '1.25rem 1.25rem 0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.85rem',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: '0.6rem',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                : 'linear-gradient(135deg, #0d9488, #0f766e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 2,
            }}>
              {msg.role === 'user'
                ? <UserIcon size={14} color="white" />
                : <Bot size={14} color="white" />}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '78%',
              padding: '0.65rem 0.95rem',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                : '#0f172a',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
              color: '#ffffff',
              fontSize: '0.875rem',
              lineHeight: 1.55,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              <div>{formatMessage(msg.text)}</div>
              <div style={{
                fontSize: '0.68rem', marginTop: '0.35rem', opacity: 0.6,
                textAlign: msg.role === 'user' ? 'right' : 'left',
              }}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #0d9488, #0f766e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Bot size={14} color="white" />
            </div>
            <div style={{
              padding: '0.65rem 0.95rem', borderRadius: '12px 12px 12px 2px',
              background: '#0f172a', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.82rem', color: '#94a3b8',
            }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Thinking…
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            padding: '0.65rem 0.95rem', borderRadius: 8,
            background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)',
            fontSize: '0.82rem', color: '#fb7185',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
            <button
              onClick={() => sendMessage(messages[messages.length - 1]?.role === 'user' ? messages[messages.length - 1].text : '')}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.78rem', flexShrink: 0 }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick question chips ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q.label}
            onClick={() => sendMessage(q.text)}
            disabled={loading}
            style={{
              padding: '0.4rem 0.85rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 500,
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              color: '#cbd5e1', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* ── Input bar ── */}
      <div className="glass-card" style={{ padding: '0.65rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
          placeholder="Ask about your results, wellness tips, or health goals… (Enter to send)"
          style={{
            flex: 1, resize: 'none', border: 'none', outline: 'none',
            background: 'transparent', fontSize: '0.9rem', color: '#f8fafc',
            fontFamily: 'inherit', lineHeight: 1.5,
            padding: '0.3rem 0.25rem', minHeight: 36, maxHeight: 100,
            overflowY: 'auto',
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: loading || !input.trim()
              ? '#334155'
              : 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: loading || !input.trim() ? 'none' : '0 2px 6px rgba(2,132,199,0.3)',
          }}
        >
          <Send size={17} color={loading || !input.trim() ? '#64748b' : 'white'} />
        </button>
      </div>

      {/* ── Disclaimer ── */}
      <div style={{
        background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
        padding: '0.6rem 0.9rem', borderRadius: 8,
        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
      }}>
        <ShieldAlert size={14} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '0.73rem', color: '#fbbf24', lineHeight: 1.45, margin: 0 }}>
          <strong>Wellness Disclaimer:</strong> AI-generated responses are for general wellness education only and do not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns.
        </p>
      </div>
    </div>
  );
};
