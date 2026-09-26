import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import useClinicNavlinks from '@/hooks/use-clinic-navlinks'
import useImport from '@/hooks/use-import'
import { Link } from '@inertiajs/react'
import { Home, LayoutGrid, User } from 'lucide-react'


export default function ClinicBottomNav() {
    const { t } = useImport()
    const { NAV_ITEMS } = useClinicNavlinks()

    // Don't show Home and Profile inside the Sheet
    const sheetItems = NAV_ITEMS.filter(
        (item) =>
            item.href !== '/clinic/overview' &&
            item.href !== '/auth/profile'
    )

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
            <div className="relative h-20">
                {/* Bottom Navigation Bar */}
                <div
                    className="
                        absolute
                        inset-x-0
                        bottom-0
                        h-16
                        rounded-t-[30px]
                        bg-primary
                        shadow-[0_-4px_20px_rgba(0,0,0,0.12)]
                    "
                >
                    <div className="flex h-full items-center justify-between px-10">
                        {/* Home */}
                        <Link
                            href="/clinic/overview"
                            className="
                                flex
                                w-16
                                flex-col
                                items-center
                                justify-center
                                text-primary-foreground
                            "
                        >
                            <Home className="size-5" />

                            <span className="mt-1 text-[10px]">
                                {t('clinics.sidebar.overview')}
                            </span>
                        </Link>

                        {/* Center Button Space */}
                        <div className="w-16" />

                        {/* Profile */}
                        <Link
                            href="/auth/profile"
                            className="
                                flex
                                w-16
                                flex-col
                                items-center
                                justify-center
                                text-primary-foreground
                            "
                        >
                            <User className="size-5" />

                            <span className="mt-1 text-[10px]">
                                {t('clinics.sidebar.profile')}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Center Menu Button */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button
                            type="button"
                            aria-label={t('clinics.sidebar.options')}
                            className="
                                absolute
                                left-1/2
                                top-0
                                z-20
                                flex
                               size-15.5
                                -translate-x-1/2
                                items-center
                                justify-center
                                rounded-full
                                bg-primary
                                shadow-lg
                                transition-transform
                                active:scale-95
                            "
                        >
                            <span
                                className="
                                    flex
                                    size-11.5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-primary
                                    text-primary-foreground
                                    ring-4
                                    ring-background
                                    shadow-md
                                "
                            >
                                <LayoutGrid className="size-5" />
                            </span>
                        </button>
                    </SheetTrigger>

                    {/* Options Sheet */}
                    <SheetContent
                        side="bottom"
                        className="
                            max-h-[80vh]
                            overflow-y-auto
                            rounded-t-4xl
                            px-5
                            pb-8
                        "
                    >
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-center">
                                {t('clinics.sidebar.options')}
                            </SheetTitle>
                        </SheetHeader>

                        <div className="grid grid-cols-3 gap-3">
                            {sheetItems.map((item) => {
                                const Icon = item.icon

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="
                                            flex
                                            min-h-25
                                            flex-col
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-2xl
                                            border
                                            bg-muted/40
                                            p-3
                                            transition
                                            hover:bg-muted
                                            active:scale-95
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                size-11
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-primary/10
                                                text-primary
                                            "
                                        >
                                            <Icon className="size-5" />
                                        </div>

                                        <span
                                            className="
                                                text-center
                                                text-xs
                                                font-medium
                                            "
                                        >
                                            {t(item.key)}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}