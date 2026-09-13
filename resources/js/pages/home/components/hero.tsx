import React from 'react';
import { Link } from '@inertiajs/react';
import useImport from '@/hooks/use-import';
import useWebsiteSetting from '@/hooks/use-website-setting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    Stethoscope,
    Users,
    Award,
    Heart,
    Sparkles,
    ShieldCheck,
    FlaskConical,
    Activity,
    ChevronRight,
} from 'lucide-react';

export default function Hero() {
    const { t, isRtl } = useImport();
    const { settings } = useWebsiteSetting();

    const subtitle = isRtl
        ? (settings?.description_ar || 'نظام متكامل لإدارة العيادات والمرضى والحجوزات والزيارات والروشتات وإدارة العمليات الطبية بكفاءة عالية.')
        : (settings?.description_en || 'A complete clinic management system for managing patients, appointments, visits, prescriptions, and clinic operations efficiently.');

    const quickServices = [
        {
            icon: Stethoscope,
            title_en: 'General Medicine',
            title_ar: 'الطب العام',
            sub_en: 'Complete family care',
            sub_ar: 'رعاية صحية شاملة',
        },
        {
            icon: Sparkles,
            title_en: 'Dental Care',
            title_ar: 'طب الأسنان',
            sub_en: 'Healthy smiles',
            sub_ar: 'ابتسامة صحية',
        },
        {
            icon: Heart,
            title_en: 'Cardiology',
            title_ar: 'أمراض القلب',
            sub_en: 'Expert heart care',
            sub_ar: 'رعاية دقيقة للقلب',
        },
        {
            icon: Users,
            title_en: 'Pediatrics',
            title_ar: 'طب الأطفال',
            sub_en: 'Kids wellness',
            sub_ar: 'عناية فائقة بالأطفال',
        },
        {
            icon: ShieldCheck,
            title_en: "Women's Health",
            title_ar: 'صحة المرأة',
            sub_en: 'Specialized care',
            sub_ar: 'رعاية مخصصة',
        },
        {
            icon: FlaskConical,
            title_en: 'Lab Tests',
            title_ar: 'الفحوصات الطبية',
            sub_en: 'Accurate results',
            sub_ar: 'نتائج دقيقة وسريعة',
        },
    ];

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-slate-50/50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-8 pb-16 lg:pt-12 lg:pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Text Column */}
                    <div className="lg:col-span-7 space-y-6 text-start">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
                            <Activity className="h-3.5 w-3.5" />
                            <span>{t('landing.tagline', 'Your Health, Our Priority')}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                            {isRtl ? (
                                <>
                                    أفضل صحة، <br />
                                    <span className="text-primary">غد أكثر إشراقا</span>
                                </>
                            ) : (
                                <>
                                    Better Health <br />
                                    <span className="text-primary">Brighter Tomorrow</span>
                                </>
                            )}
                        </h1>

                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>

                        {/* CTA Action Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link href="/create/clinic/page">
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-6 rounded-xl shadow-lg shadow-primary/25 text-base gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
                                    <span>{t('landing.get_started', 'Register Your Clinic')}</span>
                                    <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                                </Button>
                            </Link>

                            <a href="#services">
                                <Button variant="outline" className="border-gray-300 dark:border-gray-700 font-semibold px-6 py-6 rounded-xl text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                    {t('landing.explore_services', 'Explore Services')}
                                </Button>
                            </a>
                        </div>

                        {/* Hero Stats Badges */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200/80 dark:border-gray-800 max-w-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">5000+</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {isRtl ? 'مريض سعيد' : 'Happy Patients'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                                    <Stethoscope className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">50+</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {isRtl ? 'طبيب خبير' : 'Expert Doctors'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">15+</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {isRtl ? 'عام من الخبرة' : 'Years of Care'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Hero Image Column */}
                    <div className="lg:col-span-5 relative flex justify-center">
                        <div className="relative w-full max-w-md lg:max-w-none">
                            {/* Decorative Backdrop shape */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-emerald-400/20 rounded-3xl blur-2xl transform scale-95 -z-10" />

                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-900">
                                <img
                                    src="/images/hero_doctor.jpg"
                                    alt="Doctor"
                                    className="w-full h-[400px] sm:h-[480px] object-cover object-top"
                                />

                                {/* Floating Tag overlay */}
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        {isRtl ? 'أشخاص أكثر صحة وسعادة' : 'Healthy People, Happier Lives'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Services Bar overlay */}
                <div className="mt-12 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickServices.map((srv, idx) => {
                        const Icon = srv.icon;
                        return (
                            <div
                                key={idx}
                                className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-primary/5 transition-all group cursor-pointer border border-transparent hover:border-primary/10"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                    {isRtl ? srv.title_ar : srv.title_en}
                                </h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {isRtl ? srv.sub_ar : srv.sub_en}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
