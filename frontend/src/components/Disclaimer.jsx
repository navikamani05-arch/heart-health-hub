import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert } from 'lucide-react';

export const Disclaimer = () => {
  const { t } = useLanguage();
  return (
    <div style={{
      background: 'rgba(251, 191, 36, 0.12)',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      borderRadius: 10,
      padding: '0.85rem 1.1rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.65rem',
      fontSize: '0.8rem',
      color: '#fbbf24',
      lineHeight: 1.55
    }}>
      <ShieldAlert size={17} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{t('disclaimer.text')}</span>
    </div>
  );
};
