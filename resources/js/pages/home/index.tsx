import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import useImport from '@/hooks/use-import';
import LanguageToggle from '@/components/shared/language-toggle';
import ThemeToggle from '@/components/shared/theme-toggle';

// Lucide Icons
import {
    Activity,
    Building2,
    Users,
    Calendar,
    ShieldCheck,
    Stethoscope,
    TrendingUp,
    CheckCircle2,
    ArrowRight,
    Star,
    Sparkles,
    Check,
    Phone,
    Mail,
    MapPin,
    Heart,
    Zap,
    ChevronRight,
    Menu,
    X,
    UserCheck,
    LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
}

export default function HomePage() {
    const { auth } = usePage().props as unknown as Props;
    const { t, isRtl } = useImport();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const currentUser = auth?.user;

    const features = [
        {
            icon: Building2,
            title: t('landing.feat_1_title', 'Multi-Clinic & Branch Management'),
            description: t(
                'landing.feat_1_desc',
                'Easily manage multiple branches, locations, and medical centers under a single unified dashboard.'
            ),
            color: 'from-orange-500 to-amber-500',
        },
        {
            icon: Activity,
            title: t('landing.feat_2_title', 'Electronic Health Records (EHR)'),
            description: t(
                'landing.feat_2_desc',
                'Comprehensive digital records for patient medical history, prescriptions, diagnosis, and attachments.'
            ),
            color: 'from-blue-500 to-indigo-500',
        },
        {
            icon: ShieldCheck,
            title: t('landing.feat_3_title', 'Role & Team Permissions'),
            description: t(
                'landing.feat_3_desc',
                'Granular role-based access for Owners, Doctors, Receptionists, and Staff.'
            ),
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: Calendar,
            title: t('landing.feat_4_title', 'Smart Appointment Scheduling'),
            description: t(
                'landing.feat_4_desc',
                'Prevent double bookings, automate slot allocations, and streamline patient queue management.'
            ),
            color: 'from-emerald-500 to-teal-500',
        },
        {
            icon: Stethoscope,
            title: t('landing.feat_5_title', 'Medical Specialty Tailoring'),
            description: t(
                'landing.feat_5_desc',
                'Pre-configured workflows tailored for Dental, Cardiology, Pediatrics, Dermatology, and more.'
            ),
            color: 'from-rose-500 to-orange-500',
        },
        {
            icon: TrendingUp,
            title: t('landing.feat_6_title', 'Real-time Reports & Analytics'),
            description: t(
                'landing.feat_6_desc',
                'Track daily performance, patient visits, clinic revenue, and operational growth.'
            ),
            color: 'from-cyan-500 to-blue-500',
        },
    ];

    const specialties = [
        { name_en: 'General Medicine', name_ar: 'الطب العام', icon: Stethoscope, count: '120+ Doctors' },
        { name_en: 'Dentistry', name_ar: 'طب الأسنان', icon: Sparkles, count: '95+ Doctors' },
        { name_en: 'Cardiology', name_ar: 'أمراض القلب', icon: Heart, count: '60+ Doctors' },
        { name_en: 'Pediatrics', name_ar: 'طب الأطفال', icon: Users, count: '80+ Doctors' },
        { name_en: 'Dermatology', name_ar: 'الجلدية', icon: Zap, count: '75+ Doctors' },
        { name_en: 'Orthopedics', name_ar: 'جراحة العظام', icon: Activity, count: '55+ Doctors' },
    ];

    const stats = [
        { label: t('landing.stats.clinics', '500+ Clinics'), subtitle: isRtl ? 'عيادة ومركز طبي' : 'Medical Centers' },
        { label: t('landing.stats.patients', '250k+ Patients'), subtitle: isRtl ? 'مريض مسجل' : 'Registered Patients' },
        { label: t('landing.stats.uptime', '99.9% Uptime'), subtitle: isRtl ? 'جاهزية واستقرار' : 'System Availability' },
        { label: t('landing.stats.rating', '4.9/5 Rating'), subtitle: isRtl ? 'تقييم الأطباء' : 'Provider Satisfaction' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                            <Activity size={22} className="stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-orange-900 to-orange-600 dark:from-white dark:via-orange-200 dark:to-orange-400 bg-clip-text text-transparent">
                                ClinicCare
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 -mt-1">
                                Medical Suite
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <a href="#features" className="hover:text-orange-500 transition-colors">
                            {t('landing.nav.features', 'Features')}
                        </a>
                        <a href="#specialties" className="hover:text-orange-500 transition-colors">
                            {t('landing.nav.specialties', 'Specialties')}
                        </a>
                        <a href="#pricing" className="hover:text-orange-500 transition-colors">
                            {t('landing.nav.pricing', 'Pricing')}
                        </a>
                        <a href="#testimonials" className="hover:text-orange-500 transition-colors">
                            {t('landing.nav.testimonials', 'Testimonials')}
                        </a>
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <LanguageToggle />
                        <ThemeToggle />

                        {currentUser ? (
                            <Link href="/admin/clinics">
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-md shadow-orange-500/20 gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95">
                                    <LayoutDashboard size={16} />
                                    <span>{t('landing.dashboard_btn', 'Go to Dashboard')}</span>
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                                        {t('landing.login', 'Sign In')}
                                    </Button>
                                </Link>

                                <Link href="/create/clinic/page">
                                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-md shadow-orange-500/25 gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95">
                                        <Building2 size={16} />
                                        <span>{t('landing.get_started', 'Register Your Clinic')}</span>
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <LanguageToggle />
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-3 pb-6 space-y-4">
                        <nav className="flex flex-col space-y-3 font-medium text-sm text-gray-700 dark:text-gray-200">
                            <a href="#features" onClick={() => setMobileMenuOpen(false)}>
                                {t('landing.nav.features', 'Features')}
                            </a>
                            <a href="#specialties" onClick={() => setMobileMenuOpen(false)}>
                                {t('landing.nav.specialties', 'Specialties')}
                            </a>
                            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                                {t('landing.nav.pricing', 'Pricing')}
                            </a>
                            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>
                                {t('landing.nav.testimonials', 'Testimonials')}
                            </a>
                        </nav>
                        <div className="pt-2 flex flex-col gap-2">
                            {currentUser ? (
                                <Link href="/admin/clinics">
                                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium gap-2">
                                        <LayoutDashboard size={16} />
                                        <span>{t('landing.dashboard_btn', 'Go to Dashboard')}</span>
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="outline" className="w-full rounded-xl">
                                            {t('landing.login', 'Sign In')}
                                        </Button>
                                    </Link>
                                    <Link href="/create/clinic/page">
                                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                                            {t('landing.get_started', 'Register Your Clinic')}
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
                {/* Dynamic Ambient Background Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-400/20 via-amber-300/10 to-rose-400/20 blur-[120px] rounded-full pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Badge Pill */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md shadow-xs animate-fade-in">
                        <Sparkles size={16} className="text-orange-500" />
                        <span>{t('landing.badge', '✨ Next-Generation Medical Management Platform')}</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] text-gray-900 dark:text-gray-100 max-w-5xl mx-auto">
                        {t('landing.hero_title', 'Elevate Your Clinic Operations with Smart Intelligence')}
                    </h1>

                    {/* Subheadline */}
                    <p className="mt-6 text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        {t(
                            'landing.hero_subtitle',
                            'An all-in-one cloud platform for clinics and medical centers. Effortlessly manage patient records, appointments, multi-location clinics, staff roles, and financial insights.'
                        )}
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/create/clinic/page" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl shadow-xl shadow-orange-500/25 gap-3 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer">
                                <Building2 size={20} />
                                <span>{t('landing.get_started', 'Register Your Clinic')}</span>
                                {isRtl ? (
                                    <ChevronRight size={18} className="rotate-180" />
                                ) : (
                                    <ArrowRight size={18} />
                                )}
                            </Button>
                        </Link>

                        <Link href="#features" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto h-13 px-8 text-base font-semibold border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl backdrop-blur-md cursor-pointer transition-all">
                                {t('landing.explore_demo', 'Explore Demo')}
                            </Button>
                        </Link>
                    </div>

                    {/* Dashboard Visual Mockup Preview */}
                    <div className="mt-16 sm:mt-20 relative max-w-5xl mx-auto">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                        <div className="relative rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-4 sm:p-6 text-start overflow-hidden">
                            {/* Fake App Bar */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                                    <span className="text-xs font-mono text-gray-400 ms-2">
                                        app.cliniccare.med/dashboard
                                    </span>
                                </div>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 font-semibold gap-1 text-[11px]">
                                    <CheckCircle2 size={12} />
                                    <span>System Online</span>
                                </Badge>
                            </div>

                            {/* Dashboard Mock Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                    <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
                                        <span className="text-xs font-bold uppercase">{isRtl ? 'حجوزات اليوم' : "Today's Appointments"}</span>
                                        <Calendar size={18} />
                                    </div>
                                    <h4 className="text-2xl font-black mt-2 text-gray-900 dark:text-gray-100">42</h4>
                                    <p className="text-[11px] text-gray-500 mt-1">↑ +18% {isRtl ? 'مقارنة بأمس' : 'from yesterday'}</p>
                                </div>

                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                                        <span className="text-xs font-bold uppercase">{isRtl ? 'المرضى النشطين' : 'Active Patients'}</span>
                                        <Users size={18} />
                                    </div>
                                    <h4 className="text-2xl font-black mt-2 text-gray-900 dark:text-gray-100">1,280</h4>
                                    <p className="text-[11px] text-gray-500 mt-1">✓ {isRtl ? 'سجلات محدثة' : 'EHR Records Updated'}</p>
                                </div>

                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                                        <span className="text-xs font-bold uppercase">{isRtl ? 'العيادات والفروع' : 'Active Clinics'}</span>
                                        <Building2 size={18} />
                                    </div>
                                    <h4 className="text-2xl font-black mt-2 text-gray-900 dark:text-gray-100">14</h4>
                                    <p className="text-[11px] text-gray-500 mt-1">🟢 {isRtl ? 'جميع الموقع نشطة' : 'All locations operational'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Banner */}
            <section className="py-12 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((st, idx) => (
                            <div key={idx} className="space-y-1">
                                <h3 className="text-3xl sm:text-4xl font-black text-orange-500">
                                    {st.label}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    {st.subtitle}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 font-semibold px-3 py-1 mb-4">
                            {t('landing.nav.features', 'Features')}
                        </Badge>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100">
                            {t('landing.features_title', 'Everything You Need to Run a Modern Medical Practice')}
                        </h2>
                        <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400">
                            {t(
                                'landing.features_subtitle',
                                'Powerful tools designed specifically for healthcare professionals and medical center administrators.'
                            )}
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feat, idx) => {
                            const IconComponent = feat.icon;
                            return (
                                <Card
                                    key={idx}
                                    className="border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group overflow-hidden"
                                >
                                    <CardContent className="p-8">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                            <IconComponent size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-6">
                                            {feat.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                                            {feat.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Medical Specialties Section */}
            <section id="specialties" className="py-20 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 font-semibold px-3 py-1 mb-4">
                            {t('landing.nav.specialties', 'Specialties')}
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                            {t('landing.specialties_title', 'Tailored for Every Medical Specialty')}
                        </h2>
                        <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                            {t('landing.specialties_subtitle', 'Customized digital workflows suited for diverse medical fields.')}
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {specialties.map((sp, idx) => {
                            const IconComp = sp.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-5 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center hover:border-orange-500/40 hover:bg-orange-500/5 transition-all group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <IconComp size={24} />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-3">
                                        {isRtl ? sp.name_ar : sp.name_en}
                                    </h4>
                                    <span className="text-[11px] text-gray-400 mt-1">{sp.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 font-semibold px-3 py-1 mb-4">
                            {t('landing.nav.pricing', 'Pricing')}
                        </Badge>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100">
                            {t('landing.pricing_title', 'Flexible Plans for Every Practice Size')}
                        </h2>
                        <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
                            {t('landing.pricing_subtitle', 'Transparent pricing designed to scale with your clinic.')}
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Plan 1 */}
                        <Card className="border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-shadow">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {t('landing.starter', 'Starter Clinic')}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('landing.starter_desc', 'Ideal for single-doctor personal clinics.')}
                                </p>
                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-gray-900 dark:text-gray-100">$29</span>
                                    <span className="text-xs text-gray-400">{t('landing.monthly', '/month')}</span>
                                </div>

                                <ul className="mt-8 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Check size={16} className="text-orange-500" />
                                        <span>1 Personal Clinic</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check size={16} className="text-orange-500" />
                                        <span>Up to 500 Patients</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check size={16} className="text-orange-500" />
                                        <span>Basic Appointment Scheduling</span>
                                    </li>
                                </ul>
                            </div>

                            <Link href="/create/clinic/page" className="mt-8">
                                <Button variant="outline" className="w-full rounded-xl font-semibold cursor-pointer">
                                    {t('landing.get_started', 'Register Your Clinic')}
                                </Button>
                            </Link>
                        </Card>

                        {/* Plan 2 - Pro Featured */}
                        <Card className="border-2 border-orange-500 bg-white dark:bg-gray-900 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                                Most Popular
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {t('landing.pro', 'Medical Center Pro')}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('landing.pro_desc', 'Designed for growing multi-specialty clinics.')}
                                </p>
                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-orange-500">$79</span>
                                    <span className="text-xs text-gray-400">{t('landing.monthly', '/month')}</span>
                                </div>

                                <ul className="mt-8 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Check size={16} className="text-orange-500" />
                                        <span>Up to 5 Branches / Clinics</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check size={16} className="text-orange-500" />
                                        <span>Unlimited Patient Records</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check size={16} className="text-orange-500" />
                                        <span>Multi-Role Staff Access</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check size={16} className="text-orange-500" />
                                        <span>Financial Reports & Analytics</span>
                                    </li>
                                </ul>
                            </div>

                            <Link href="/create/clinic/page" className="mt-8">
                                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-md cursor-pointer">
                                    {t('landing.get_started', 'Register Your Clinic')}
                                </Button>
                            </Link>
                        </Card>

                        {/* Plan 3 */}
                        <Card className="border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-shadow">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {t('landing.enterprise', 'Enterprise Network')}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('landing.enterprise_desc', 'Custom solutions for large healthcare centers.')}
                                </p>
                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-gray-900 dark:text-gray-100">$199</span>
                                    <span className="text-xs text-gray-400">{t('landing.monthly', '/month')}</span>
                                </div>

                                <ul className="mt-8 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Check size={16} className="text-orange-500" />
                                        <span>Unlimited Clinics & Locations</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check size={16} className="text-orange-500" />
                                        <span>Custom API & Integrations</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check size={16} className="text-orange-500" />
                                        <span>24/7 Priority Dedicated Support</span>
                                    </li>
                                </ul>
                            </div>

                            <Link href="/create/clinic/page" className="mt-8">
                                <Button variant="outline" className="w-full rounded-xl font-semibold cursor-pointer">
                                    {t('landing.get_started', 'Register Your Clinic')}
                                </Button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 font-semibold px-3 py-1 mb-4">
                            {t('landing.nav.testimonials', 'Testimonials')}
                        </Badge>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                            {isRtl ? 'ماذا يقول الأطباء والمدراء عن منصتنا؟' : 'Trusted by Leading Healthcare Professionals'}
                        </h2>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Dr. Sarah Ahmed',
                                role: isRtl ? 'مديرة مركز الأمل الطبي' : 'Medical Director at Al-Amal Center',
                                quote: isRtl
                                    ? 'النظام طور طريقة إدارتنا للعيادات والفروع بشكل كبير، تنظيم المواعيد وسجلات المرضى أصبح رائعاً وبسيطاً.'
                                    : 'ClinicCare transformed how we run our multi-specialty centers. Appointment scheduling and patient EHRs are flawless.',
                            },
                            {
                                name: 'Dr. Mohamed Hassan',
                                role: isRtl ? 'استشاري طب وجراحة الأسنان' : 'Dental Consultant & Clinic Owner',
                                quote: isRtl
                                    ? 'سهولة إضافة الموظفين وتحديد الصلاحيات للأطباء والاستقبال وفرت علينا الكثير من الوقت والجهد.'
                                    : 'Adding staff with custom role permissions has saved us dozens of operational hours every single week.',
                            },
                            {
                                name: 'Dr. Layla Mahmoud',
                                role: isRtl ? 'طبيبة أطفال ومديرة عيادة' : 'Pediatric Specialist & Founder',
                                quote: isRtl
                                    ? 'الواجهة وسلسة وسريعة والتقارير المالية الفورية تساعدنا في اتخاذ قرارات صحيحة لدعم نمو العيادة.'
                                    : 'The sleek UI and instant financial reports give us complete clarity to grow our medical practice confidently.',
                            },
                        ].map((tst, idx) => (
                            <Card key={idx} className="border-gray-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/40 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill="currentColor" />
                                        ))}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
                                        "{tst.quote}"
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-600 font-bold flex items-center justify-center text-xs">
                                        {tst.name.charAt(4) || 'D'}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{tst.name}</h4>
                                        <span className="text-[10px] text-gray-400">{tst.role}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA Banner */}
            <section className="py-16 sm:py-24 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {t('landing.cta_title', 'Ready to Modernize Your Medical Practice?')}
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-orange-100 max-w-2xl mx-auto">
                        {t(
                            'landing.cta_subtitle',
                            'Join hundreds of healthcare leaders simplifying clinic operations today.'
                        )}
                    </p>

                    <div className="mt-8 flex justify-center">
                        <Link href="/create/clinic/page">
                            <Button className="h-13 px-8 text-base font-extrabold bg-white text-orange-600 hover:bg-orange-50 rounded-2xl shadow-xl gap-2 cursor-pointer transition-transform hover:scale-[1.03]">
                                <Building2 size={20} />
                                <span>{t('landing.cta_button', 'Get Started Now')}</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-gray-800">
                        {/* Column 1: Brand */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                                    <Activity size={18} />
                                </div>
                                <span className="text-lg font-bold text-white">ClinicCare</span>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                {t('landing.footer_tagline', 'Empowering healthcare providers with modern clinic intelligence.')}
                            </p>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="space-y-2">
                            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                                {isRtl ? 'روابط سريعة' : 'Navigation'}
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#features" className="hover:text-orange-400 transition-colors">
                                        {t('landing.nav.features', 'Features')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#specialties" className="hover:text-orange-400 transition-colors">
                                        {t('landing.nav.specialties', 'Specialties')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#pricing" className="hover:text-orange-400 transition-colors">
                                        {t('landing.nav.pricing', 'Pricing')}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Portals */}
                        <div className="space-y-2">
                            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                                {isRtl ? 'البوابات' : 'Portals'}
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/create/clinic/page" className="hover:text-orange-400 transition-colors">
                                        {t('landing.get_started', 'Register Clinic')}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/admin/clinics" className="hover:text-orange-400 transition-colors">
                                        {t('landing.dashboard_btn', 'Go to Dashboard')}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/login" className="hover:text-orange-400 transition-colors">
                                        {t('landing.login', 'Sign In')}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Contact */}
                        <div className="space-y-2">
                            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                                {t('landing.nav.contact', 'Contact Us')}
                            </h4>
                            <div className="space-y-2 text-xs">
                                <p className="flex items-center gap-2">
                                    <Mail size={14} className="text-orange-400" />
                                    <span>support@cliniccare.med</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone size={14} className="text-orange-400" />
                                    <span>+1 (800) 555-CLINIC</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p>{t('landing.copyright', '© 2026 ClinicCare Management System. All rights reserved.')}</p>
                        <div className="flex items-center gap-3">
                            <LanguageToggle />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
