import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from './translations.json'; // We will generate this

i18n
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: 'en', // default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
