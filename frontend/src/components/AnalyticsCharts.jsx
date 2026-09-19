import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, ReferenceLine
} from 'recharts';

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '0.83rem',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
};

const CardWrapper = ({ title, subtitle, children, note }) => (
  <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
    <div>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{title}</h4>
      {subtitle && <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>{subtitle}</p>}
    </div>
    {children}
    {note && (
      <p style={{ fontSize: '0.78rem', color: '#e2e8f0', background: '#0f172a', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-color)', lineHeight: 1.5 }}>
        💡 {note}
      </p>
    )}
  </div>
);

// 1. Model Recall Comparison
export const ModelRecallChart = ({ data }) => {
  const { t } = useLanguage();
  if (!data || data.length === 0) return null;
  const sortedData = [...data].sort((a, b) => b.recall - a.recall);

  return (
    <CardWrapper
      title={t("charts.recall_title")}
      subtitle={t("charts.recall_sub")}
      note={t("charts.recall_note")}
    >
      <div style={{ width: '100%', height: 290 }}>
        <ResponsiveContainer>
          <BarChart data={sortedData} margin={{ top: 5, right: 15, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="model" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val) => [`${val}%`, 'Recall']} />
            <Bar dataKey="recall" radius={[6, 6, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.selected ? '#2dd4bf' : '#38bdf8'} fillOpacity={entry.selected ? 1 : 0.65} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  );
};

// 2. Comprehensive Grouped Metrics
export const ModelMetricsGroupedChart = ({ data }) => {
  const { t } = useLanguage();
  if (!data || data.length === 0) return null;

  return (
    <CardWrapper
      title={t("charts.grouped_title")}
      subtitle={t("charts.grouped_sub")}
      note={t("charts.grouped_note")}
    >
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="model" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val) => [`${val}%`]} />
            <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '10px', color: '#e2e8f0' }} />
            <Bar dataKey="accuracy" name="Accuracy" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="precision" name="Precision" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recall" name="Recall" fill="#0284c7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="f1" name="F1-Score" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            <Bar dataKey="roc_auc" name="ROC-AUC" fill="#34d399" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  );
};

// 3. Dataset Class Distribution Donut
export const ClassDistributionChart = ({ stats }) => {
  const { t } = useLanguage();
  const chartData = [
    { name: t('charts.no_disease'), value: stats ? stats.negative : 229787, color: '#38bdf8' },
    { name: t('charts.disease'), value: stats ? stats.positive : 23893, color: '#2dd4bf' },
  ];

  return (
    <CardWrapper
      title={t("charts.dist_title")}
      subtitle="Distribution of 253,680 survey respondents in CDC BRFSS 2015 dataset."
      note="Severe class imbalance (9.4% positive cases) required SMOTE resampling applied strictly on the training set."
    >
      <div style={{ width: '100%', height: 240, display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val) => [val.toLocaleString() + ' records']} />
            <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#e2e8f0' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  );
};

// 4. Global SHAP Feature Importance Horizontal Bar
export const GlobalShapChart = ({ features }) => {
  const { t } = useLanguage();
  if (!features || features.length === 0) return null;
  const sortedFeatures = [...features].reverse();

  return (
    <CardWrapper
      title="Global SHAP Feature Importance (Top 10)"
      subtitle="Mean absolute SHAP values across the full dataset using human-readable factor labels."
      note="Higher mean |SHAP| = stronger statistical influence across all predictions. General Health rating, High Blood Pressure, Age, and History of Stroke rank highest."
    >
      <div style={{ width: '100%', height: 330 }}>
        <ResponsiveContainer>
          <BarChart layout="vertical" data={sortedFeatures} margin={{ top: 5, right: 30, left: 155, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#e2e8f0' }} width={150} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val) => [val.toFixed(5), 'Mean |SHAP|']} />
            <Bar dataKey="importance" fill="#38bdf8" radius={[0, 6, 6, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  );
};

// 5. Patient-Specific Local SHAP Contribution (Positive/Negative)
export const PatientShapContributionChart = ({ topFeatures }) => {
  if (!topFeatures) return null;

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

  const chartData = Object.entries(topFeatures).map(([feat, val]) => ({
    featureKey: feat,
    label: FEATURE_LABELS_MAP[feat] || feat,
    shapValue: Number(val),
  })).sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

  return (
    <CardWrapper
      title="Your Risk Factor Contribution Chart"
      subtitle="How each of your inputs mathematically shifted the model score above (red) or below (blue) the baseline."
      note="Red = factor pushed your score higher. Blue = factor pulled your score lower. These are statistical model contributions, not direct medical causation."
    >
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 155, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#e2e8f0' }} width={150} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val) => [val.toFixed(4), 'SHAP Value']} />
            <ReferenceLine x={0} stroke="#64748b" strokeDasharray="4 2" />
            <Bar dataKey="shapValue" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.shapValue > 0 ? '#fb7185' : '#38bdf8'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  );
};
