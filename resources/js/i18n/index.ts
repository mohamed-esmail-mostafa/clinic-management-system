import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import ar from './locales/ar.json'
// English translations
import enCommon from './locales/en/common.json'
import enClinics from './locales/en/clinics.json'

// Arabic translations
import arCommon from './locales/ar/common.json'
import arClinics from './locales/ar/clinics.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
        common: enCommon,
        clinics: enClinics

      },
      ar: {
        translation: ar,
        common: arCommon,
        clinics: arClinics
      },
    },
    fallbackLng: 'ar',
    defaultNS: 'translation',
    ns: [
      'translation',
      'common',
      'clinics'

      // 'auth',
      // 'navigation',
      // 'products',
      // 'cart',
      // 'checkout',
      // 'validation',
    ],
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
