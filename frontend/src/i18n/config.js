import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import kmTranslations from './locales/km.json';

// Helper function to safely get language from localStorage
const getStoredLanguage = () => {
  try {
    if (typeof Storage !== 'undefined' && localStorage) {
      return localStorage.getItem('i18nextLng');
    }
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
  return null;
};

// Helper function to safely set language in localStorage
const setStoredLanguage = (lang) => {
  try {
    if (typeof Storage !== 'undefined' && localStorage) {
      localStorage.setItem('i18nextLng', lang);
    }
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
};

// Get browser language with fallback
const getBrowserLanguage = () => {
  try {
    if (navigator && navigator.language) {
      const lang = navigator.language.split('-')[0]; // Get base language (e.g., 'en' from 'en-US')
      return ['en', 'km'].includes(lang) ? lang : 'en';
    }
  } catch (e) {
    console.warn('Could not detect browser language:', e);
  }
  return 'en';
};

// Determine initial language
const getInitialLanguage = () => {
  const stored = getStoredLanguage();
  if (stored && ['en', 'km'].includes(stored)) {
    return stored;
  }
  const browser = getBrowserLanguage();
  setStoredLanguage(browser);
  return browser;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      km: {
        translation: kmTranslations,
      },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'km'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Detection order: localStorage -> cookie -> navigator -> htmlTag -> querystring
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag', 'querystring'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
      lookupQuerystring: 'lng',
      // Cookie options
      cookieMinutes: 10080, // 7 days
      cookieOptions: {
        path: '/',
        sameSite: 'strict',
      },
      // HTML tag detection
      htmlTag: document.documentElement,
      // Convert detected language to supported language
      convertDetectedLanguage: (lng) => {
        const baseLang = lng.split('-')[0].toLowerCase();
        return ['en', 'km'].includes(baseLang) ? baseLang : 'en';
      },
    },
    react: {
      useSuspense: false,
    },
    // Ensure compatibility across browsers
    compatibilityJSON: 'v3',
    // Load path for async loading (if needed in future)
    load: 'languageOnly',
    // Clean code (e.g., 'en-US' -> 'en')
    cleanCode: true,
  });

// Listen for language changes and update localStorage
i18n.on('languageChanged', (lng) => {
  setStoredLanguage(lng);
  // Update HTML lang attribute for accessibility
  if (document && document.documentElement) {
    document.documentElement.lang = lng;
  }
});

// Set initial HTML lang attribute
if (document && document.documentElement) {
  document.documentElement.lang = i18n.language || 'en';
}

export default i18n;

