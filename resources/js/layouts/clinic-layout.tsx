import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useImport from '@/hooks/use-import'
import ClinicHeaderLayout from '@/components/shared/clinic/clinic-header-layout'
import ClinicSidebarContent from '@/components/shared/clinic/clinic-sidebar-content'
import ClinicBottomNav from '@/components/shared/clinic/clinic-bottom-nav'

interface Props {
    children: React.ReactNode
    title?: string
}

export default function ClinicLayout({ children, title }: Props) {
    const { isRtl } = useImport()

    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Ensure the browser window itself never creates an extra scrollbar
    useEffect(() => {
        document.documentElement.classList.add('overflow-hidden', 'h-full')
        document.body.classList.add('overflow-hidden', 'h-full')
        return () => {
            document.documentElement.classList.remove('overflow-hidden', 'h-full')
            document.body.classList.remove('overflow-hidden', 'h-full')
        }
    }, [])

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="flex h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-gray-50/50 dark:bg-gray-950"
        >
            {/* Desktop Sidebar (Flex child: naturally positions and resizes without margin hacks) */}
            <aside
                className={`
                    relative
                    shrink-0
                    h-full
                    z-30
                    hidden
                    flex-col
                    bg-primary
                    shadow-xl
                    transition-[width]
                    duration-300
                    ease-in-out
                    lg:flex
                    ${collapsed ? 'w-16' : 'w-60'}
                `}
            >
                <ClinicSidebarContent
                    collapsed={collapsed}
                    setMobileOpen={setMobileOpen}
                />

                {/* Collapse Button */}
                <button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    className={`
                        absolute
                        top-16
                        z-40
                        flex
                        h-6
                        w-6
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-gray-200
                        dark:border-gray-700
                        bg-white
                        dark:bg-gray-800
                        text-primary
                        shadow-md
                        transition-all
                        hover:scale-105
                        hover:bg-gray-50
                        dark:hover:bg-gray-700
                        ${isRtl ? '-left-3' : '-right-3'}
                    `}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {(collapsed && !isRtl) || (!collapsed && isRtl) ? (
                        <ChevronRight size={12} />
                    ) : (
                        <ChevronLeft size={12} />
                    )}
                </button>
            </aside>

            {/* Main Area */}
            <div className="flex flex-1 flex-col h-full min-w-0 min-h-0 overflow-hidden">
                {/* Header - Fixed & Sticky */}
                <div className="shrink-0 z-20">
                    <ClinicHeaderLayout
                        setMobileOpen={setMobileOpen}
                        title={title}
                    />
                </div>

                {/* ONLY THIS AREA SCROLLS */}
                <main
                    className="
                        flex-1
                        min-h-0
                        min-w-0
                        overflow-y-auto
                        overflow-x-hidden
                        p-3.5
                        sm:p-5
                        md:p-6
                        pb-24
                        lg:pb-8
                    "
                >
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation (< lg screens) */}
            <ClinicBottomNav />
        </div>
    )
}