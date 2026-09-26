import { Menu } from 'lucide-react'
import React from 'react'
import ThemeToggle from '../theme-toggle'
import LanguageToggle from '../language-toggle'
import AuthMenu from '../auth-menu'

export default function ClinicHeaderLayout({ setMobileOpen, title }: { setMobileOpen: (open: boolean) => void; title?: string }) {
    return (
        <header className="sticky top-0 z-20 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-xs flex items-center px-3.5 sm:px-4 gap-2 sm:gap-3 w-full min-w-0 max-w-full">
            {/* <button
                type="button"
                className="lg:hidden p-2 -ms-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
            >
                <Menu size={20} />
            </button> */}
            <div className="flex-1 min-w-0">
                {title && (
                    <h1 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white truncate">
                        {title}
                    </h1>
                )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <ThemeToggle />
                <LanguageToggle />
                <AuthMenu />
            </div>
        </header>
    );
}
