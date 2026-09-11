import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { useAppearance } from './use-appearance';

export default function useImport() {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';




    /* 
     toggle Language
    */
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

    /**
     * Theme toggle
     */

      const { appearance, resolvedAppearance, updateAppearance } = useAppearance()
    
    
        const isDark = resolvedAppearance === 'dark'
        const toggleTheme = () => {
            updateAppearance(isDark ? 'light' : 'dark')
        }
    return {
        t, i18n, isRtl, toggleLanguage,toggleTheme,appearance
    }
}
