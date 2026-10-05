import React, { useState } from 'react';
import { ChevronLeft, ChevronRight,X} from 'lucide-react';
import useImport from '@/hooks/use-import';
import AdminHeaderLayout from '@/components/shared/admin/admin-header-layout';
import AdminSidebarContent from '@/components/shared/admin/admin-sidebar-content';
import AdminBottomNav from '@/components/shared/admin/admin-bottom-nav';


interface Props {
    children: React.ReactNode;
    title?: string;
}



export default function AdminLayout({ children, title }: Props) {
    const { t, isRtl, i18n } = useImport();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Ensure the browser window itself never creates an extra scrollbar
    React.useEffect(() => {
        document.documentElement.classList.add('overflow-hidden', 'h-full');
        document.body.classList.add('overflow-hidden', 'h-full');
        return () => {
            document.documentElement.classList.remove('overflow-hidden', 'h-full');
            document.body.classList.remove('overflow-hidden', 'h-full');
        };
    }, []);

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="flex h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-gray-50/50 dark:bg-gray-950"
        >
            {/* Desktop Sidebar */}
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
                <AdminSidebarContent
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
                {/* Header - Fixed */}
                <div className="shrink-0 z-20">
                    <AdminHeaderLayout
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

            {/* Mobile Bottom Navigation */}
            <AdminBottomNav />
        </div>
    );
}
