import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  ModelRecallChart,
  ModelMetricsGroupedChart,
  ClassDistributionChart,
  GlobalShapChart
} from '../components/AnalyticsCharts';
import { useLanguage } from '../context/LanguageContext';
import { BarChart2, Info, CheckCircle2, Database, Eye, Zap } from 'lucide-react';

export const ModelInsights = () => {
  const [metricsData, setMetricsData] = useState(null);
  const [shapData, setShapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const load = async () => {
      try {
        const [m, s] = await Promise.all([api.getModelMetrics(), api.getShapImportance()]);
        setMetricsData(m);
        setShapData(s);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 1100, margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <BarChart2 size={24} color="#38bdf8" />
          {t('insights.title')}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: 4 }}>
          {t('insights.subtitle')}
        </p>
      </div>

      {/* ── PHASE D: HOW Heart Health Hub WORKS ── */}
      <div className="glass-card" style={{ padding: '1.75rem', borderLeft: '4px solid #38bdf8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Zap size={18} color="#38bdf8" />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>{t('insights.how_works_title')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {[
            { num: '01', title: t('insights.step1_title'), desc: t('insights.step1_desc') },
            { num: '02', title: t('insights.step2_title'), desc: t('insights.step2_desc') },
            { num: '03', title: t('insights.step3_title'), desc: t('insights.step3_desc') },
            { num: '04', title: t('insights.step4_title'), desc: t('insights.step4_desc') },
            { num: '05', title: t('insights.step5_title'), desc: t('insights.step5_desc') },
            { num: '06', title: t('insights.step6_title'), desc: t('insights.step6_desc') },
            { num: '07', title: t('insights.step7_title'), desc: t('insights.step7_desc') },
          ].map(({ num, title, desc }) => (
            <div key={num} style={{ display: 'flex', gap: '0.75rem', padding: '0.9rem', background: '#0f172a', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#38bdf8', flexShrink: 0, minWidth: 28 }}>{num}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc', marginBottom: '0.25rem' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BRFSS DATASET INFO ── */}
      <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #2dd4bf' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Database size={18} color="#2dd4bf" />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>{t('insights.dataset_title')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          {[
            { label: t('insights.dataset_total'), value: '253,680', sub: 'Survey respondents' },
            { label: t('insights.dataset_indicators'), value: '21', sub: 'Input features' },
            { label: t('insights.dataset_target'), value: 'HeartDiseaseorAttack', sub: 'Binary classification' },
            { label: t('insights.dataset_imbalance'), value: '9.4% positive', sub: 'Required SMOTE resampling' },
            { label: t('insights.dataset_preprocessing'), value: 'StandardScaler', sub: 'Applied on training set only' },
            { label: t('insights.dataset_split'), value: '80/20 Stratified', sub: 'Train/Test split' },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ padding: '0.85rem 1rem', background: '#0f172a', borderRadius: 10, border: '1px solid rgba(45,212,191,0.25)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2dd4bf', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODEL SELECTION RATIONALE ── */}
      <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #38bdf8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Info size={18} color="#38bdf8" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{t('insights.why_lr_title')}</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          {t('insights.why_lr_desc')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
          {[
            [t('insights.lr_reason1_title'), t('insights.lr_reason1_desc')],
            [t('insights.lr_reason2_title'), t('insights.lr_reason2_desc')],
            [t('insights.lr_reason3_title'), t('insights.lr_reason3_desc')],
            [t('insights.lr_reason4_title'), t('insights.lr_reason4_desc')],
            [t('insights.lr_reason5_title'), t('insights.lr_reason5_desc')],
            [t('insights.lr_reason6_title'), t('insights.lr_reason6_desc')],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: '0.5rem', padding: '0.6rem 0.75rem', background: '#0f172a', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <CheckCircle2 size={16} color="#2dd4bf" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{title}</div>
                <div style={{ fontSize: '0.77rem', color: '#94a3b8', marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHARTS ── */}
      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          {t('insights.loading')}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
            <ModelRecallChart data={metricsData?.models} />
            <ClassDistributionChart stats={metricsData?.dataset} />
          </div>
          <ModelMetricsGroupedChart data={metricsData?.models} />
          <GlobalShapChart features={shapData?.features} />
        </>
      )}

      {/* ── SHAP METHODOLOGY ── */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid #38bdf8' }}>
        <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={16} color="#38bdf8" /> {t('insights.shap_title')}
        </div>
        <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
          {t('insights.shap_desc1')}
        </p>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.75rem', lineHeight: 1.6 }}>
          {t('insights.shap_desc2')}
        </p>
      </div>

      {/* Medical Disclaimer */}
      <div style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, padding: '0.85rem 1.1rem', fontSize: '0.8rem', color: '#fbbf24', lineHeight: 1.55 }}>
        {t('insights.research_warning')}
      </div>
    </div>
  );
};
