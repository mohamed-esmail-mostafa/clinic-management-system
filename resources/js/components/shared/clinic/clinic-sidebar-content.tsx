import useImport from '@/hooks/use-import';
import { Calendar, Globe, LayoutDashboard, Pill, Settings2, Store, Sun, User2Icon, Users } from 'lucide-react';
import { Link } from '@inertiajs/react';
import useAuthClinics from '@/hooks/use-auth-clinics';


export default function ClinicSidebarContent({ collapsed, setMobileOpen }: any) {
    const { t, toggleLanguage, i18n, toggleTheme, appearance } = useImport()
    const { clinics } = useAuthClinics() as { clinics?: any };
    const clinicSlug = Array.isArray(clinics) && clinics.length > 0 ? clinics[0]?.slug : '';
    const NAV_ITEMS = [
        { key: t('clinics.sidebar.overview'), href: '/clinic/overview', icon: LayoutDashboard },
        { key: t('clinics.sidebar.patients'), href: `/clinic/${clinicSlug}/patients`, icon: Users },
        { key: t('clinics.sidebar.bookings'), href: `/clinic/${clinicSlug}/booking`, icon: Calendar },
        { key: t('clinics.sidebar.medicines'), href: `/clinic/${clinicSlug}/medications`, icon: Pill },
        { key: t('clinics.sidebar.employees'), href: '#', icon: User2Icon },
        { key: t('clinics.sidebar.settings'), href: '#', icon: Settings2 },
    ];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-orange-400/30 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Store size={18} className="text-white" />
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate leading-tight">
                            {'My Store'}
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

                <button
                    onClick={toggleLanguage}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-orange-100 hover:bg-white/10 text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
                >
                    <Globe size={16} className="shrink-0" />
                    {!collapsed && <span>{i18n.language === 'ar' ? 'English' : 'عربي'}</span>}
                </button>

                <button
                    onClick={() => toggleTheme()}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-orange-100 hover:bg-white/10 text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
                >
                    <Sun size={16} className="shrink-0" />
                    {!collapsed && <span>{appearance === 'dark' ? 'Light' : 'Dark'}</span>}
                </button>


            </div>
        </div>
    )
}
