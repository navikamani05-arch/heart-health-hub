import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Disclaimer } from '../components/Disclaimer';
import { PatientShapContributionChart } from '../components/AnalyticsCharts';
import { WellnessRoutine } from '../components/WellnessRoutine';
import { api } from '../services/api';
import {
  getAgeLabel, getEducationLabel, getIncomeLabel,
  getGenHlthLabel, getDiabetesLabel,
  AGE_OPTIONS, EDU_OPTIONS, INC_OPTIONS, GEN_HLTH_OPTIONS
} from '../utils/brfssLabels';
import {
  Heart, ArrowUpRight, ArrowDownRight, RefreshCw, Play, Info, Hospital, Shuffle
} from 'lucide-react';

const INITIAL_FORM = {
  HighBP: 0, HighChol: 0, CholCheck: 1, BMI: 25, Smoker: 0,
  Stroke: 0, Diabetes: 0, PhysActivity: 1, Fruits: 1, Veggies: 1,
  HvyAlcoholConsump: 0, AnyHealthcare: 1, NoDocbcCost: 0, GenHlth: 2,
  MentHlth: 0, PhysHlth: 0, DiffWalk: 0, Sex: 0, Age: 6, Education: 5, Income: 6,
};

export const Predictor = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isWhatIfMode = location.state?.exploreWhatIf;
  const previousAssessment = location.state?.previousAssessment;

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isWhatIfMode && previousAssessment?.full_inputs) {
      setFormData(previousAssessment.full_inputs);
    }
  }, [isWhatIfMode, previousAssessment]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predict(formData, isWhatIfMode ? null : (user ? user.id : null));
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const RadioGroup = ({ field, labelYes, labelNo }) => (
    <div className="radio-group">
      <div
        className={`radio-btn ${formData[field] === 0 ? 'active' : ''}`}
        onClick={() => handleChange(field, 0)}
      >
        {labelNo || t('pred.no')}
      </div>
      <div
        className={`radio-btn ${formData[field] === 1 ? 'active' : ''}`}
        onClick={() => handleChange(field, 1)}
      >
        {labelYes || t('pred.yes')}
      </div>
    </div>
  );

  // Helper to format values for display
  const formatInput = (key, val) => {
    if (['HighBP','HighChol','CholCheck','Smoker','Stroke','PhysActivity','Fruits','Veggies','HvyAlcoholConsump','AnyHealthcare','NoDocbcCost','DiffWalk'].includes(key)) return val ? 'Yes' : 'No';
    if (key === 'Sex') return val ? 'Male' : 'Female';
    if (key === 'Age') return getAgeLabel(val, t);
    if (key === 'Education') return getEducationLabel(val, t);
    if (key === 'Income') return getIncomeLabel(val, t);
    if (key === 'GenHlth') return getGenHlthLabel(val, t);
    if (key === 'Diabetes') return getDiabetesLabel(val, t);
    return val;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1100, margin: '0 auto', color: '#f8fafc' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isWhatIfMode ? <Shuffle size={24} color="#a855f7" /> : <Heart size={24} color="#38bdf8" />}
          {isWhatIfMode ? 'What-If Health Simulation' : t('pred.title')}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          {isWhatIfMode 
            ? 'Modify hypothetical values to explore how the model-estimated score changes. This is a statistical simulation, not a medical guarantee.' 
            : t('pred.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.75rem', border: isWhatIfMode ? '2px solid #a855f7' : '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

          {/* Demographics */}
          <div>
            <h4 style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid rgba(56,189,248,0.2)', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              👤 {t('pred.sec.demographics')}
            </h4>

            {/* Age Group */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {t('pred.age')}
                <span title="Age range of the patient in 5-year brackets" style={{ cursor: 'help', color: '#64748b' }}><Info size={13} /></span>
              </label>
              <select className="form-select" value={formData.Age} onChange={(e) => handleChange('Age', e.target.value)}>
                {AGE_OPTIONS.map((code) => (<option key={code} value={code} style={{ background: '#1e293b', color: '#fff' }}>{getAgeLabel(code, t)}</option>))}
              </select>
            </div>

            {/* Sex */}
            <div className="form-group">
              <label className="form-label">{t('pred.sex')}</label>
              <RadioGroup field="Sex" labelNo={t('pred.sex.female')} labelYes={t('pred.sex.male')} />
            </div>

            {/* Education Level */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {t('pred.education')}
                <span title="Highest level of formal education completed" style={{ cursor: 'help', color: '#64748b' }}><Info size={13} /></span>
              </label>
              <select className="form-select" value={formData.Education} onChange={(e) => handleChange('Education', e.target.value)}>
                {EDU_OPTIONS.map((code) => (<option key={code} value={code} style={{ background: '#1e293b', color: '#fff' }}>{getEducationLabel(code, t)}</option>))}
              </select>
            </div>

            {/* Income Level */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {t('pred.income')}
                <span title="Total annual household income category" style={{ cursor: 'help', color: '#64748b' }}><Info size={13} /></span>
              </label>
              <select className="form-select" value={formData.Income} onChange={(e) => handleChange('Income', e.target.value)}>
                {INC_OPTIONS.map((code) => (<option key={code} value={code} style={{ background: '#1e293b', color: '#fff' }}>{getIncomeLabel(code, t)}</option>))}
              </select>
            </div>
          </div>

          {/* Vitals & Medical History */}
          <div>
            <h4 style={{ color: '#fb7185', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid rgba(251,113,133,0.2)', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🩺 {t('pred.sec.vitals')}
            </h4>

            {/* BMI */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {t('pred.bmi')}
                <span title="Body Mass Index = weight (kg) / height (m)². Normal: 18.5–24.9" style={{ cursor: 'help', color: '#64748b' }}><Info size={13} /></span>
              </label>
              <input type="number" className="form-input" min="10" max="98" value={formData.BMI} onChange={(e) => handleChange('BMI', e.target.value)} required />
              <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>Range: 10–98</span>
            </div>

            <div className="form-group"><label className="form-label">{t('pred.highbp')}</label><RadioGroup field="HighBP" /></div>
            <div className="form-group"><label className="form-label">{t('pred.highchol')}</label><RadioGroup field="HighChol" /></div>
            <div className="form-group"><label className="form-label">{t('pred.cholcheck')}</label><RadioGroup field="CholCheck" /></div>
            <div className="form-group"><label className="form-label">{t('pred.stroke')}</label><RadioGroup field="Stroke" /></div>
            <div className="form-group">
              <label className="form-label">{t('pred.diabetes')}</label>
              <select className="form-select" value={formData.Diabetes} onChange={(e) => handleChange('Diabetes', e.target.value)}>
                {[0, 1, 2].map((code) => (<option key={code} value={code} style={{ background: '#1e293b', color: '#fff' }}>{getDiabetesLabel(code, t)}</option>))}
              </select>
            </div>
          </div>

          {/* Lifestyle & Health */}
          <div>
            <h4 style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid rgba(52,211,153,0.2)', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🌿 {t('pred.sec.lifestyle')}
            </h4>

            {/* General Health */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {t('pred.genhlth')}
                <span title="Self-reported general health status on a 5-point scale" style={{ cursor: 'help', color: '#64748b' }}><Info size={13} /></span>
              </label>
              <select className="form-select" value={formData.GenHlth} onChange={(e) => handleChange('GenHlth', e.target.value)}>
                {GEN_HLTH_OPTIONS.map((code) => (<option key={code} value={code} style={{ background: '#1e293b', color: '#fff' }}>{getGenHlthLabel(code, t)}</option>))}
              </select>
            </div>

            <div className="form-group"><label className="form-label">{t('pred.smoker')}</label><RadioGroup field="Smoker" /></div>
            <div className="form-group"><label className="form-label">{t('pred.physactivity')}</label><RadioGroup field="PhysActivity" /></div>
            <div className="form-group"><label className="form-label">{t('pred.fruits')}</label><RadioGroup field="Fruits" /></div>
            <div className="form-group"><label className="form-label">{t('pred.veggies')}</label><RadioGroup field="Veggies" /></div>
            <div className="form-group"><label className="form-label">{t('pred.hvyalcohol')}</label><RadioGroup field="HvyAlcoholConsump" /></div>
            <div className="form-group"><label className="form-label">{t('pred.healthcare')}</label><RadioGroup field="AnyHealthcare" /></div>
            <div className="form-group"><label className="form-label">{t('pred.nodoccost')}</label><RadioGroup field="NoDocbcCost" /></div>
            <div className="form-group">
              <label className="form-label">{t('pred.menthlth')}</label>
              <input type="number" className="form-input" min="0" max="30" value={formData.MentHlth} onChange={(e) => handleChange('MentHlth', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('pred.physhlth')}</label>
              <input type="number" className="form-input" min="0" max="30" value={formData.PhysHlth} onChange={(e) => handleChange('PhysHlth', e.target.value)} />
            </div>
            <div className="form-group"><label className="form-label">{t('pred.diffwalk')}</label><RadioGroup field="DiffWalk" /></div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)', padding: '0.75rem 1rem', borderRadius: 8, marginTop: '1rem', fontSize: '0.85rem' }}>
            ❌ {error}
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.75rem 2rem', background: isWhatIfMode ? '#a855f7' : '#0284c7' }}>
            {loading ? <RefreshCw size={18} className="animate-spin" /> : (isWhatIfMode ? <Shuffle size={18} /> : <Play size={18} />)}
            {loading ? t('pred.spinner') : (isWhatIfMode ? 'Run Simulation' : t('pred.btn.submit'))}
          </button>
        </div>
      </form>

      {/* Prediction / Simulation Result View */}
      {result && (
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: isWhatIfMode ? '2px solid #a855f7' : '1px solid var(--border-color)' }}>
          
          {isWhatIfMode ? (
            // WHAT-IF SIMULATION RESULT UI
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shuffle size={20} color="#a855f7" /> Simulation Result
              </h3>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Current */}
                <div style={{ flex: 1, padding: '1.5rem', background: '#0f172a', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Current Assessment</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
                    {previousAssessment?.risk_score?.toFixed(1)}<span style={{ fontSize: '1.25rem', color: '#94a3b8' }}>%</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginTop: '0.25rem' }}>{previousAssessment?.risk_category}</div>
                </div>

                {/* Hypothetical */}
                <div style={{ flex: 1, padding: '1.5rem', background: 'rgba(168,85,247,0.12)', borderRadius: 12, border: '1px solid rgba(168,85,247,0.3)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Hypothetical Scenario</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
                    {result.risk_score.toFixed(1)}<span style={{ fontSize: '1.25rem', color: '#94a3b8' }}>%</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#a855f7', marginTop: '0.25rem' }}>{t(result.risk_category_key)}</div>
                </div>
              </div>

              {/* Difference analysis */}
              <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#0f172a', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                  Under this hypothetical input scenario, the model-estimated score changes from <strong>{previousAssessment?.risk_score?.toFixed(1)}%</strong> to <strong>{result.risk_score.toFixed(1)}%</strong> 
                  {result.risk_category_key !== previousAssessment?.risk_category_key ? ` (shifting category to ${t(result.risk_category_key)}).` : '.'}
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Changed Inputs:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {Object.keys(formData).map(key => {
                      if (previousAssessment?.full_inputs && formData[key] !== previousAssessment.full_inputs[key]) {
                        return (
                          <span key={key} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: '#1e293b', borderRadius: 6, color: '#e2e8f0', border: '1px solid var(--border-color)' }}>
                            {key}: {formatInput(key, previousAssessment.full_inputs[key])} → <strong style={{ color: '#38bdf8' }}>{formatInput(key, formData[key])}</strong>
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem', background: '#0f172a', borderRadius: 8, marginTop: '1rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', border: '1px solid var(--border-color)' }}>
                <Info size={16} color="#a855f7" style={{ flexShrink: 0 }} />
                <span>This is a statistical what-if simulation based on the existing Logistic Regression model. It is not a medical prediction or guarantee that these changes will yield specific health outcomes.</span>
              </div>
            </div>

          ) : (

            // STANDARD ASSESSMENT RESULT UI
            <>
              {/* Header & Risk Score Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{t('result.title')}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Calculated at {new Date().toLocaleTimeString()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.45rem' }}>
                  <div className={`badge-risk ${result.risk_score < 30 ? 'badge-risk-low' : result.risk_score < 70 ? 'badge-risk-mod' : 'badge-risk-high'}`} style={{ fontSize: '1rem', padding: '0.5rem 1.25rem' }}>
                    {t('result.score.label', { score: result.risk_score.toFixed(1), category: t(result.risk_category_key) })}
                  </div>
                  <div style={{ width: '220px', height: '7px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Math.max(0, result.risk_score))}%`, height: '100%', background: result.risk_score < 30 ? '#34d399' : result.risk_score < 70 ? '#fbbf24' : '#fb7185', transition: 'width 0.7s ease', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border-color)', margin: 0 }} />
              <PatientShapContributionChart topFeatures={result.top_shap_features} />

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>{t('result.top_factors')}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {Object.entries(result.top_shap_features).slice(0, 3).map(([feat, val], index) => (
                    <div key={feat} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: `3px solid ${val > 0 ? '#fb7185' : '#38bdf8'}` }}>
                      <div style={{ background: val > 0 ? 'rgba(251,113,133,0.15)' : 'rgba(56,189,248,0.15)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', color: val > 0 ? '#fb7185' : '#38bdf8', flexShrink: 0 }}>#{index + 1}</div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc', display: 'block' }}>{feat}</span>
                        <span style={{ fontSize: '0.75rem', color: val > 0 ? '#fb7185' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {val > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {val > 0 ? t('result.direction.increased') : t('result.direction.decreased')} ({val.toFixed(4)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* AI Personalized Wellness Routine */}
          {!isWhatIfMode && (
            <WellnessRoutine patientInputs={formData} riskScore={result.risk_score} topShapFeatures={result.top_shap_features} />
          )}

          {/* Find Cardiac Care Callout Box */}
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ background: 'var(--accent-blue)', color: '#ffffff', borderRadius: 10, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Hospital size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', margin: 0 }}>Need Professional Cardiac Evaluation?</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Discover verified cardiology hospitals, specialized cardiac centers, and 24/7 emergency facilities near you.</p>
              </div>
            </div>
            <button onClick={() => navigate('/care')} className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
              <Hospital size={18} /> {t('cardiac.btn_find_near_me')}
            </button>
          </div>

          <Disclaimer />
        </div>
      )}
    </div>
  );
};
