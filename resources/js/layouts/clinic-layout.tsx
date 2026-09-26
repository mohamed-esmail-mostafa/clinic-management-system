import React, { useState } from 'react'
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

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="
                flex
                h-screen
                w-full
                max-w-full
                overflow-hidden
                bg-gray-50
                dark:bg-gray-950
            "
        >
            {/* Desktop Sidebar */}
            <aside
                className={`
                    fixed
                    top-0
                    bottom-0
                    z-30
                    hidden
                    flex-col
                    bg-primary
                    shadow-xl
                    transition-all
                    duration-300
                    ease-in-out
                    lg:flex
                    ${collapsed ? 'w-16' : 'w-60'}
                    ${isRtl ? 'right-0' : 'left-0'}
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
                        z-10
                        flex
                        h-6
                        w-6
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-gray-100
                        bg-white
                        text-primary
                        shadow-md
                        transition-colors
                        hover:bg-orange-50
                        ${isRtl ? '-left-3' : '-right-3'}
                    `}
                >
                    {(collapsed && !isRtl) || (!collapsed && isRtl) ? (
                        <ChevronRight size={12} />
                    ) : (
                        <ChevronLeft size={12} />
                    )}
                </button>
            </aside>

            {/* Main Area */}
            <div
                className={`
                    flex
                    h-screen
                    min-h-0
                    min-w-0
                    flex-1
                    flex-col
                    overflow-hidden
                    transition-all
                    duration-300
                    ${collapsed ? 'lg:ms-16' : 'lg:ms-60'}
                `}
            >
                {/* Header - Fixed */}
                <div className="shrink-0">
                    <ClinicHeaderLayout
                        setMobileOpen={setMobileOpen}
                        title={title}
                    />
                </div>

                {/* ONLY THIS AREA SCROLLS */}
                <main
                    className="
                        min-h-0
                        min-w-0
                        flex-1
                        overflow-y-auto
                        overflow-x-hidden
                        p-3.5
                        sm:p-5
                        md:p-6
                    "
                >
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <ClinicBottomNav />
            </div>
        </div>
    )
}