import { useAppearance } from '@/hooks/use-appearance'
import { Moon, Sun } from 'lucide-react'
import React from 'react'

export default function ThemeToggle() {
    const { appearance, resolvedAppearance, updateAppearance } = useAppearance()


    const isDark = resolvedAppearance === 'dark'
    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark')
    }
    return (
        <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-xs transition hover:bg-accent hover:text-primary"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
        >
            {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-primary" />}
        </button>
    )
}
