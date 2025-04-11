import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language resources
import enTranslation from '@/locales/en.json';
import arTranslation from '@/locales/ar.json';

// Define your resources
const resources = {
  en: {
    translation: enTranslation
  },
  ar: {
    translation: arTranslation
  }
};

// Get saved language from localStorage
const savedLanguage = localStorage.getItem('language');

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    // Use saved language if available, otherwise detect from browser
    lng: savedLanguage || undefined,
    
    // Handle keys that contain dots
    keySeparator: '.',
    
    interpolation: {
      // React escapes values by default
      escapeValue: false
    },
    
    // Enable RTL for Arabic
    supportedLngs: ['en', 'ar'],
    
    // Set document direction based on current language
    react: {
      useSuspense: true
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Set HTML dir attribute based on language direction
const isRTL = i18n.dir() === 'rtl';
document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
// Add appropriate class to the HTML element
if (isRTL) {
  document.documentElement.classList.add('rtl');
} else {
  document.documentElement.classList.remove('rtl');
}

export default i18n;