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
    const store = (usePage().props as any)?.store;
   
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { appearance, updateAppearance } = useAppearance()

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const toggleLang = () => {
        const next = i18n.language === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(next);
        document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    };
    const NAV_ITEMS = [
        { key: t('vendor.sidebar.overview'), href: '/vendor/dashboard', icon: LayoutDashboard },
        { key: t('vendor.sidebar.products'), href: '/vendor/products/page', icon: Package },
        { key: t('vendor.sidebar.categories'), href: '/vendor/categories', icon: Tag },
        { key: t('vendor.sidebar.orders'), href: '/vendor/orders', icon: ShoppingBag },
        { key: t('vendor.sidebar.settings'), href: '/update/store/page', icon: Settings },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-orange-400/30 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Store size={18} className="text-white" />
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate leading-tight">
                            {store?.name ?? 'My Store'}
                        </p>
                        <p className="text-orange-200 text-xs truncate">{t('vendor.sidebar.vendor_panel')}</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
                    const active = currentPath === href
                        || (href !== '/vendor/dashboard' && currentPath.startsWith(href));
                    return (
                        <Link
                            key={key}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                ${active
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : 'text-orange-100 hover:bg-white/10 hover:text-white'
                                }
                                ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? t(`${key}`) : undefined}
                        >
                            <Icon size={18} className={`shrink-0 ${active ? 'text-orange-500' : ''}`} />
                            {!collapsed && (
                                <span className="truncate">{t(`${key}`)}</span>
                            )}
                            {!collapsed && active && (
                                <span className="ms-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-orange-400/30 p-3 space-y-1">
                <a
                    href="/"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-orange-100 hover:bg-white/10 text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? t('vendor_dashboard.nav.back_to_site') : undefined}
                >
                    <ExternalLink size={16} className="shrink-0" />
                    {!collapsed && <span>{t('vendor.sidebar.back_to_site')}</span>}
                </a>
                <button
                    onClick={toggleLang}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-orange-100 hover:bg-white/10 text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
                >
                    <Globe size={16} className="shrink-0" />
                    {!collapsed && <span>{i18n.language === 'ar' ? 'English' : 'عربي'}</span>}
                </button>

                <button
                    onClick={() => appearance === 'dark' ? updateAppearance('light') : updateAppearance('dark')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-orange-100 hover:bg-white/10 text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
                >
                    <Sun size={16} className="shrink-0" />
                    {!collapsed && <span>{appearance === 'dark' ? 'Light' : 'Dark'}</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex" dir={isRtl ? 'rtl' : 'ltr'}>

            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:flex flex-col fixed top-0 bottom-0 z-30 transition-all duration-300 ease-in-out
                    bg-linear-to-b from-orange-500 to-orange-600 shadow-xl
                    ${collapsed ? 'w-16' : 'w-60'}
                    ${isRtl ? 'right-0' : 'left-0'}`}
            >
                <ClinicSidebarContent collapsed={collapsed} setMobileOpen={setMobileOpen} />
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className={`absolute top-16 -translate-y-1/2 ${isRtl ? '-left-3' : '-right-3'}
                        w-6 h-6 rounded-full bg-white shadow-md border border-gray-100
                        flex items-center justify-center text-orange-500
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
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed top-0 bottom-0 z-50 w-64 lg:hidden transition-transform duration-300
                    bg-linear-to-b from-orange-500 to-orange-600 shadow-xl
                    ${isRtl ? 'right-0' : 'left-0'}
                    ${mobileOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className={`absolute top-4 ${isRtl ? 'left-3' : 'right-3'} text-white`}
                >
                    <X size={20} />
                </button>
                <SidebarContent />
            </aside>

            {/* Main area */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:ms-16' : 'lg:ms-60'}`}>
                {/* Top bar */}
               <ClinicHeaderLayout setMobileOpen={setMobileOpen} />

                <main className="flex-1 p-5 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
