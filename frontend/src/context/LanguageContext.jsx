import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import enFallback from '../../../translations/en.json';
import taFallback from '../../../translations/ta.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('heart_health_hub_lang') || 'en';
    } catch (e) {
      return 'en';
    }
  });
  const [translations, setTranslations] = useState({
    en: enFallback,
    ta: taFallback,
  });
  const [loading, setLoading] = useState(false);

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('heart_health_hub_lang', newLang);
    } catch (e) {
      console.warn('Failed to save language to localStorage:', e);
    }
  };

  useEffect(() => {
    const loadDicts = async () => {
      try {
        const dicts = await api.getTranslations();
        if (dicts && (dicts.en || dicts.ta)) {
          setTranslations({
            en: { ...enFallback, ...(dicts.en || {}) },
            ta: { ...taFallback, ...(dicts.ta || {}) },
          });
        }
      } catch (err) {
        console.warn('Backend translation API unavailable, using bundled translations:', err);
      }
    };
    loadDicts();
  }, []);

  const t = (key, params = {}) => {
    if (!key) return '';
    const dict = translations[lang] || translations.en || enFallback || {};
    let text = dict[key] || (translations.en && translations.en[key]) || (enFallback && enFallback[key]) || key;

    if (typeof text !== 'string') {
      text = String(text);
    }

    // Substitute {paramName}
    Object.keys(params).forEach((p) => {
      text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });

    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

