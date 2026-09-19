import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TopNavbar } from '../components/TopNavbar';
import { useLanguage } from '../context/LanguageContext';
import {
  Heart, ArrowRight, Database, Activity, BarChart3,
  Cpu, Zap, ShieldCheck, Eye, Target,
  CheckCircle2, ChevronRight
} from 'lucide-react';

/* ── Stat card ── */
const Stat = ({ value, label }) => (
  <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.4rem' }}>{label}</div>
  </div>
);

/* ── Step card ── */
const Step = ({ num, title, desc, icon: Icon, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: '0.85rem',
    padding: '1.75rem', background: 'var(--bg-card)', borderRadius: 14,
    border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    flex: 1, transition: 'all 0.2s ease',
  }}
  className="glass-card"
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>0{num}</span>
    </div>
    <div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>{title}</div>
      <div style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.6 }}>{desc}</div>
    </div>
  </div>
);

/* ── Why card ── */
const WhyCard = ({ icon: Icon, color, title, desc }) => (
  <div style={{
    padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 14,
    border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
  }}
  className="glass-card"
  >
    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>{title}</div>
    <div style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6 }}>{desc}</div>
  </div>
);

export const Landing = () => {
  const location = useLocation();
  const { t } = useLanguage();

  // Handle anchor scrolling
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-main)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <TopNavbar variant="public" />

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(160deg, #0b0f19 0%, #0f172a 60%, #0d948815 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background glows */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '5rem 1.5rem 4.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          {/* Left: Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 580 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.9rem', borderRadius: 999, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', width: 'fit-content' }}>
              <Zap size={13} color="#38bdf8" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.03em' }}>{t('landing.hero.badge')}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#f8fafc', lineHeight: 1.15, letterSpacing: '-0.03em', margin: 0 }}>
              {t('landing.hero.title')}
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
              {t('landing.hero.subtitle')}
            </p>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.8rem 1.5rem', borderRadius: 10, textDecoration: 'none',
                fontSize: '0.95rem', fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 4px 14px rgba(56,189,248,0.3)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(56,189,248,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(56,189,248,0.3)'; }}
              >
                {t('landing.hero.cta_risk')} <ArrowRight size={17} />
              </Link>
              <a href="#how-it-works" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.8rem 1.5rem', borderRadius: 10, textDecoration: 'none',
                fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0',
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = '#e2e8f0'; }}>
                {t('landing.hero.cta_how')} <ChevronRight size={17} />
              </a>
            </div>

            {/* Trust signals */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {[{ icon: ShieldCheck, text: t('landing.trust.educational') }, { icon: Eye, text: t('landing.trust.shap') }, { icon: Database, text: t('landing.trust.brfss') }].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                  <Icon size={13} color="#2dd4bf" /> {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI visual */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 320, height: 320,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(2,132,199,0.35)',
              position: 'relative',
              flexShrink: 0,
            }}>
              {/* Concentric rings */}
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  position: 'absolute',
                  width: 320 - i * 50, height: 320 - i * 50,
                  borderRadius: '50%',
                  border: `1px solid rgba(255,255,255,${0.1 + i * 0.05})`,
                }} />
              ))}
              {/* Central icon */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
                <Heart size={56} color="white" fill="rgba(255,255,255,0.25)" strokeWidth={1.5} />
                <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1rem', fontWeight: 700 }}>Heart Health Hub</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{t('landing.visual.explainable')}</div>
              </div>
              {/* Floating metric badges */}
              {[
                { label: t('landing.stats.roc'), value: '0.8451', top: '10%', left: '-15%', color: '#fbbf24' },
                { label: t('landing.stats.recall'), value: '78.66%', bottom: '12%', right: '-15%', color: '#34d399' },
                { label: t('landing.stats.records'), value: '253K', top: '50%', left: '-20%', color: '#a855f7' },
              ].map(({ label, value, top, bottom, left, right, color }) => (
                <div key={label} style={{
                  position: 'absolute', top, bottom, left, right,
                  background: '#1e293b', borderRadius: 10, padding: '0.6rem 0.85rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80,
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: '#0f172a', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0' }}>
          {[
            { value: '253,680', label: t('landing.stats.records') },
            { value: '21', label: t('landing.stats.indicators') },
            { value: '78.66%', label: t('landing.stats.recall') },
            { value: '0.8451', label: t('landing.stats.roc') },
          ].map(({ value, label }, i) => (
            <div key={label} style={{ borderRight: i < 3 ? '1px solid var(--border-color)' : 'none', display: 'flex', justifyContent: 'center' }}>
              <Stat value={value} label={label} />
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '5rem 1.5rem', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>{t('landing.how.process')}</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{t('landing.how.title')}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.65rem', maxWidth: 520, margin: '0.65rem auto 0' }}>{t('landing.how.subtitle')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            <Step num={1} icon={Activity} color="#38bdf8" title={t('landing.step1.title')} desc={t('landing.step1.desc')} />
            <Step num={2} icon={Cpu} color="#a855f7" title={t('landing.step2.title')} desc={t('landing.step2.desc')} />
            <Step num={3} icon={BarChart3} color="#2dd4bf" title={t('landing.step3.title')} desc={t('landing.step3.desc')} />
            <Step num={4} icon={Target} color="#fbbf24" title={t('landing.step4.title')} desc={t('landing.step4.desc')} />
          </div>
        </div>
      </section>

      {/* ── EXPLAINABILITY ── */}
      <section id="explainability" style={{ background: '#0f172a', padding: '5rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          {/* Left: Text */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>{t('landing.explain.tag')}</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>{t('landing.explain.title')}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              {t('landing.explain.desc')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[t('landing.explain.item1'), t('landing.explain.item2'), t('landing.explain.item3'), t('landing.explain.item4')].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.87rem', color: '#e2e8f0' }}>
                  <CheckCircle2 size={16} color="#2dd4bf" style={{ flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Model metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '1.75rem', border: '1px solid var(--border-color)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>{t('landing.perf.title')}</div>
              {[
                { label: t('landing.perf.model'), value: 'Logistic Regression', color: '#a855f7' },
                { label: t('landing.perf.recall'), value: '78.66%', color: '#2dd4bf' },
                { label: t('landing.perf.roc'), value: '0.8451', color: '#38bdf8' },
                { label: t('landing.perf.features'), value: '21', color: '#fbbf24' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Mini pipeline */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              {[t('landing.pipeline.step1'), t('landing.pipeline.step2'), t('landing.pipeline.step3'), t('landing.pipeline.step4'), t('landing.pipeline.step5')].map((step, i, arr) => (
                <React.Fragment key={step}>
                  <div style={{ padding: '0.4rem 1.25rem', borderRadius: 8, background: i === 0 || i === arr.length - 1 ? 'linear-gradient(135deg,#0284c7,#0d9488)' : '#0f172a', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: 600, color: i === 0 || i === arr.length - 1 ? '#fff' : '#e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                    {step}
                  </div>
                  {i < arr.length - 1 && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>↓</div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY Heart Health Hub ── */}
      <section id="about" style={{ padding: '5rem 1.5rem', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>{t('landing.why.tag')}</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{t('landing.why.title')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            <WhyCard icon={Eye} color="#38bdf8" title={t('landing.why.card1.title')} desc={t('landing.why.card1.desc')} />
            <WhyCard icon={Target} color="#2dd4bf" title={t('landing.why.card2.title')} desc={t('landing.why.card2.desc')} />
            <WhyCard icon={Database} color="#a855f7" title={t('landing.why.card3.title')} desc={t('landing.why.card3.desc')} />
            <WhyCard icon={ShieldCheck} color="#fbbf24" title={t('landing.why.card4.title')} desc={t('landing.why.card4.desc')} />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', margin: '0 0 0.85rem', lineHeight: 1.2 }}>
            {t('landing.cta.title')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', lineHeight: 1.65, margin: '0 0 2rem' }}>
            {t('landing.cta.subtitle')}
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.9rem 2rem', borderRadius: 10, textDecoration: 'none',
            fontSize: '1rem', fontWeight: 700, color: '#0284c7',
            background: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)'; }}>
            {t('nav.get_started')} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#090d16', color: '#94a3b8', padding: '3rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#0284c7,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={14} color="white" fill="white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>Heart Health Hub</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Intelligent Heart Health</div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.65, maxWidth: 260 }}>
                {t('landing.footer.desc')}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>{t('landing.footer.platform')}</div>
              {[{ label: t('nav.home'), to: '/' }, { label: t('nav.how_it_works'), to: '/#how-it-works' }, { label: t('nav.about'), to: '/#about' }].map(({ label, to }) => (
                <div key={label} style={{ marginBottom: '0.5rem' }}>
                  <Link to={to} style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                    {label}
                  </Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>{t('landing.footer.account')}</div>
              {[{ label: t('nav.login'), to: '/login' }, { label: t('auth.tab.register'), to: '/register' }].map(({ label, to }) => (
                <div key={label} style={{ marginBottom: '0.5rem' }}>
                  <Link to={to} style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                    {label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.78rem', color: '#64748b' }}>
            <span>{t('landing.footer.copyright')}</span>
            <span>{t('landing.footer.disclaimer')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
