import React from 'react';
import { Link } from '@inertiajs/react';
import useImport from '@/hooks/use-import';
import useWebsiteSetting from '@/hooks/use-website-setting';
import { home } from '@/routes';
import { Globe, Sun, Moon, Stethoscope } from 'lucide-react';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    const { i18n, isRtl, toggleLanguage, toggleTheme, appearance } = useImport();
    const { settings } = useWebsiteSetting();

    const logoSrc = appearance === 'dark' ? settings?.dark_logo || settings?.logo : settings?.logo;
    const siteTitle = isRtl ? (settings?.title_ar || 'عيادتي') : (settings?.title_en || 'ClinicCare');

    return (
        <div className="min-h-svh flex flex-col justify-between bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-8">
            {/* Top Navigation Bar */}
            <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 px-2 sm:px-4">
                <Link href={home()} className="flex items-center gap-2.5 group transition-transform hover:scale-[1.01]">
                    {logoSrc ? (
                        <img src={logoSrc} alt={siteTitle} className="h-9 w-auto object-contain" />
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                            <Stethoscope className="h-5 w-5" />
                        </div>
                    )}
                    <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                        {siteTitle}
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/70 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-xs"
                    >
                        <Globe className="h-3.5 w-3.5" />
                        <span>{i18n.language === 'ar' ? 'English' : 'عربي'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="inline-flex items-center justify-center p-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/70 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-xs"
                        title={appearance === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    >
                        {appearance === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-gray-600" />}
                    </button>
                </div>
            </header>

            {/* Main Auth Content Container */}
            <main className="w-full max-w-md mx-auto my-auto py-6">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xl p-6 sm:p-8 space-y-6">
                    {children}
                </div>
            </main>

            {/* Footer Copyright */}
            <footer className="w-full max-w-5xl mx-auto text-center py-4 text-xs text-gray-400 dark:text-gray-600">
                {isRtl ? (settings?.title_ar || 'نظام إدارة العيادات') : (settings?.title_en || 'ClinicCare Management System')} &copy; {new Date().getFullYear()}
            </footer>
        </div>
    );
}
