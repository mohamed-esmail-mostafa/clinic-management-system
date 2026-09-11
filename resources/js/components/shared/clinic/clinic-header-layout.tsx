import { Menu } from 'lucide-react'
import React from 'react'
import ThemeToggle from '../theme-toggle'
import LanguageToggle from '../language-toggle'
import AuthMenu from '../auth-menu'

export default function ClinicHeaderLayout({setMobileOpen}:any) {
    return (
        <header className="sticky top-0 z-20 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-xs flex items-center px-4 gap-3">
            <button
                className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileOpen(true)}
            >
                <Menu size={20} />
            </button>
            <div className="flex-1">
                <h1 className="text-sm font-semibold text-gray-800 dark:text-white">title</h1>
            </div>

            <ThemeToggle />
            <LanguageToggle />

            <AuthMenu />
        </header>
    )
}
