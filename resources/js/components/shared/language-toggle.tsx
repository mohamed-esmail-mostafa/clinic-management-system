import useImport from '@/hooks/use-import'
import { Globe2 } from 'lucide-react'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  
    const { i18n } = useTranslation()

  const currentLanguage = i18n.resolvedLanguage || i18n.language
  const isAr = currentLanguage === 'ar'

  useEffect(() => {
    const updateDocumentLanguage = (lang: string) => {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    }

    // Update on first load
    updateDocumentLanguage(currentLanguage)

    // Update whenever i18n language changes
    i18n.on('languageChanged', updateDocumentLanguage)

    return () => {
      i18n.off('languageChanged', updateDocumentLanguage)
    }
  }, [i18n, currentLanguage])

  const toggleLanguage = () => {
    const nextLang = isAr ? 'en' : 'ar'
    i18n.changeLanguage(nextLang)
  }

  
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3.5 py-2 text-xs font-bold text-foreground shadow-xs transition hover:bg-accent hover:text-primary"
        title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
      >
        <Globe2 size={14} className="text-primary" />

        <span>
          {isAr ? 'EN' : 'العربية'}
        </span>
      </button>
  )
}
