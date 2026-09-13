import { Building2, ExternalLink, Globe, LayoutDashboard, Map, Settings, Stethoscope, Store, Sun } from 'lucide-react';
import { Link } from '@inertiajs/react';
import useImport from '@/hooks/use-import';
import useWebsiteSetting from '@/hooks/use-website-setting';

export default function AdminSidebarContent({ collapsed, setMobileOpen }: any) {
    const { t, toggleLanguage, toggleTheme, appearance, i18n, isRtl } = useImport()
    const { settings } = useWebsiteSetting()
    console.log("settings", settings)
    console.log(appearance)
    const NAV_ITEMS = [
        { key: t('admin.sidebar.overview'), href: '/admin/dashboard', icon: LayoutDashboard },
        { key: t('admin.sidebar.clinics'), href: '/admin/clinics', icon: LayoutDashboard },
        { key: t('admin.sidebar.clinic_types'), href: '/admin/clinic-types', icon: Building2 },
        { key: t('admin.sidebar.specialties'), href: '/admin/specialties/page', icon: Stethoscope },
        { key: t('admin.sidebar.roles'), href: '/admin/roles/page', icon: LayoutDashboard },
        { key: t('admin.sidebar.countries'), href: '/admin/countries/page', icon: Map },
        { key: t('admin.sidebar.governorates'), href: '/admin/governorates/page', icon: Map },
        { key: t('admin.sidebar.cities'), href: '/admin/cities/page', icon: Map },
        { key: t('admin.sidebar.settings'), href: '/admin/website-settings', icon: Settings },
    ];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-orange-400/30 ${collapsed ? 'justify-center' : ''}`}>
                <img className='w-9 h-9' 
                src={
                    appearance === "light"
                        ? settings?.logo ?? undefined
                        : settings?.dark_logo ?? undefined
                } alt={settings?.title_ar || undefined} />
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate leading-tight">
                            {isRtl ? settings?.title_ar : settings?.title_en}
                        </p>
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
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-white hover:bg-white/10 hover:text-white'
                                }
                                ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? t(`${key}`) : undefined}
                        >
                            <Icon size={18} className={`shrink-0 ${active ? 'text-primary' : ''}`} />
                            {!collapsed && (
                                <span className="truncate">{t(`${key}`)}</span>
                            )}
                            {!collapsed && active && (
                                <span className="ms-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-orange-400/30 p-3 space-y-1">

                <button
                    onClick={toggleLanguage}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
                >
                    <Globe size={16} className="shrink-0" />
                    {!collapsed && <span>{i18n.language === 'ar' ? 'English' : 'عربي'}</span>}
                </button>


                <button
                    onClick={() => toggleTheme()}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
                >
                    <Sun size={16} className="shrink-0" />
                    {!collapsed && <span>{appearance === 'dark' ? 'Light' : 'Dark'}</span>}
                </button>

            </div>
        </div>
    )
}
