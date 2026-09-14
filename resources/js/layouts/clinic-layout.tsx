import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Package, Tag, ShoppingBag,Settings, Store, ChevronLeft, ChevronRight, Globe, Menu, X, ExternalLink,Sun} from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import useImport from '@/hooks/use-import';
import AuthMenu from '@/components/shared/auth-menu';
import ThemeToggle from '@/components/shared/theme-toggle';
import LanguageToggle from '@/components/shared/language-toggle';
import ClinicHeaderLayout from '@/components/shared/clinic/clinic-header-layout';
import ClinicSidebarContent from '@/components/shared/clinic/clinic-sidebar-content';


interface Props {
    children: React.ReactNode;
    title?: string;
}



export default function ClinicLayout({ children, title }: Props) {
    const {t,isRtl,i18n}=useImport()

   
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row w-full max-w-full overflow-x-clip" dir={isRtl ? 'rtl' : 'ltr'}>

            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:flex flex-col fixed top-0 bottom-0 z-30 transition-all duration-300 ease-in-out
                    bg-primary shadow-xl
                    ${collapsed ? 'w-16' : 'w-60'}
                    ${isRtl ? 'right-0' : 'left-0'}`}
            >
                <ClinicSidebarContent collapsed={collapsed} setMobileOpen={setMobileOpen} />
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className={`absolute top-16 -translate-y-1/2 ${isRtl ? '-left-3' : '-right-3'}
                        w-6 h-6 rounded-full bg-white shadow-md border border-gray-100
                        flex items-center justify-center text-primary
                        hover:bg-orange-50 transition-colors z-10`}
                >
                    {(collapsed && !isRtl) || (!collapsed && isRtl)
                        ? <ChevronRight size={12} />
                        : <ChevronLeft size={12} />}
                </button>
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed top-0 bottom-0 z-50 w-64 lg:hidden transition-all duration-300 ease-in-out
                    bg-primary shadow-2xl
                    ${isRtl ? 'right-0' : 'left-0'}
                    ${mobileOpen 
                        ? 'translate-x-0 visible opacity-100 pointer-events-auto' 
                        : (isRtl ? 'translate-x-full invisible opacity-0 pointer-events-none' : '-translate-x-full invisible opacity-0 pointer-events-none')}`}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className={`absolute top-4 ${isRtl ? 'left-3' : 'right-3'} text-white p-1 rounded-md hover:bg-white/10`}
                >
                    <X size={20} />
                </button>
               <ClinicSidebarContent collapsed={false} setMobileOpen={setMobileOpen} />
            </aside>

            {/* Main area */}
            <div className={`flex-1 flex flex-col min-h-screen w-full min-w-0 max-w-full transition-all duration-300 ${collapsed ? 'lg:ms-16' : 'lg:ms-60'}`}>
                {/* Top bar */}
               <ClinicHeaderLayout setMobileOpen={setMobileOpen} title={title} />

                <main className="flex-1 p-3.5 sm:p-5 md:p-6 w-full min-w-0 max-w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
