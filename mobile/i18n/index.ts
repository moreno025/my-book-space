import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './translations/en.json';
import es from './translations/es.json';

const resources = {
    en: { translation: en },
    es: { translation: es },
};

// Get device locale (e.g. "en-US" or "es-ES")
const locale = Localization.getLocales()[0]?.languageCode || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: locale, // default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        compatibilityJSON: 'v4', // Required for modern i18next
    });

export default i18n;
