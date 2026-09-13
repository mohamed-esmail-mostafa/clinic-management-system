import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import useImport from '@/hooks/use-import';
import useWebsiteSetting from '@/hooks/use-website-setting';
import AuthMenu from '@/components/shared/auth-menu';
import LanguageToggle from '@/components/shared/language-toggle';
import ThemeToggle from '@/components/shared/theme-toggle';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Stethoscope, Menu, Calendar, Phone, Search } from 'lucide-react';

export default function Navbar() {
    const { t, isRtl } = useImport();
    const { settings } = useWebsiteSetting();
    const [isOpen, setIsOpen] = useState(false);

    const logoSrc = settings?.logo;
    const title = isRtl
        ? (settings?.title_ar || 'نظام إدارة العيادات')
        : (settings?.title_en || 'ClinicCare Management');

    const navLinks = [
        { label: t('landing.nav.features', 'Features'), href: '#features' },
        { label: t('landing.nav.services', 'Services'), href: '#services' },
        { label: t('landing.nav.specialties', 'Specialties'), href: '#specialties' },
        { label: t('landing.nav.about', 'About Us'), href: '#about' },
        { label: t('landing.nav.testimonials', 'Testimonials'), href: '#testimonials' },
        { label: t('landing.nav.contact', 'Contact'), href: '#footer' },
    ];

    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-100 dark:border-gray-800 transition-all shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    {logoSrc ? (
                        <img
                            src={logoSrc}
                            alt={title}
                            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <Stethoscope size={22} className="stroke-[2.5]" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                            {title}
                        </span>
                        <span className="text-[11px] font-medium text-primary tracking-wide">
                            {isRtl ? 'المنصة الطبية المتكاملة' : 'Medical Intelligence'}
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-600 dark:text-gray-300">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="hover:text-primary transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Right Action Bar */}
                <div className="hidden sm:flex items-center gap-3">
                    <LanguageToggle />
                    <ThemeToggle />
                    <AuthMenu />
                </div>

                {/* Mobile Hamburger Menu (using Sheet from shadcn UI) */}
                <div className="flex items-center gap-2 lg:hidden">
                    <div className="sm:hidden flex items-center gap-1">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side={isRtl ? 'left' : 'right'} className="w-[300px] sm:w-[350px] p-6">
                            <SheetHeader className="text-start pb-4 border-b border-gray-100 dark:border-gray-800">
                                <SheetTitle className="flex items-center gap-2.5">
                                    {logoSrc ? (
                                        <img src={logoSrc} alt={title} className="h-8 w-auto" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                                            <Stethoscope size={18} />
                                        </div>
                                    )}
                                    <span className="font-bold text-base">{title}</span>
                                </SheetTitle>
                            </SheetHeader>

                            <div className="py-6 flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition-colors py-1.5 border-b border-gray-50 dark:border-gray-800/50"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                                <AuthMenu />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
