// src/shared/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'es',
  fallbackLng: 'es',
  resources: {
    es: { translation: es },
    en: { translation: en }
  },
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
