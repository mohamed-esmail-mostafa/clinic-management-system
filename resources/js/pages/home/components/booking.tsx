import React from 'react';
import useImport from '@/hooks/use-import';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Clock,
    PhoneCall,
    CheckCircle2,
    ArrowRight,
    Smartphone,
    UserCheck,
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Booking() {
    const { t, isRtl } = useImport();

    const features = [
        {
            icon: Calendar,
            title_en: 'Quick Booking',
            title_ar: 'حجز موعد سريع',
            desc_en: 'In just a few simple steps',
            desc_ar: 'في خطوات بسيطة وميسرة',
        },
        {
            icon: Smartphone,
            title_en: 'Online Consultation',
            title_ar: 'استشارات أونلاين',
            desc_en: 'Talk to a doctor from home',
            desc_ar: 'تواصل مع طبيبك من المنزل',
        },
        {
            icon: PhoneCall,
            title_en: '24/7 Support',
            title_ar: 'دعم متواصل 24/7',
            desc_en: "We're always here for you",
            desc_ar: 'فريقنا في خدمتك دائماً',
        },
    ];

    return (
        <section id="booking" className="py-16 lg:py-24 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-0" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                        {/* Left Column: Interactive App Preview */}
                        <div className="lg:col-span-5 flex justify-center">
                            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 w-full max-w-sm space-y-4">
                                <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm">
                                            {isRtl ? 'حجز موعد جديد' : 'Book Appointment'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                        {isRtl ? 'متاح الآن' : 'Available'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <span className="text-gray-500">{isRtl ? 'التخصص:' : 'Specialty:'}</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {isRtl ? 'الطب العام' : 'General Medicine'}
                                        </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <span className="text-gray-500">{isRtl ? 'الوقت المفضل:' : 'Preferred Time:'}</span>
                                        <span className="font-semibold text-primary">05:30 PM - Today</span>
                                    </div>
                                </div>

                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs py-2.5 rounded-xl">
                                    {isRtl ? 'تأكيد الحجز الفوري' : 'Confirm Appointment'}
                                </Button>
                            </div>
                        </div>

                        {/* Right Column: Features checklist */}
                        <div className="lg:col-span-7 space-y-6 text-start">
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                                {isRtl ? 'سهل وسريع' : 'EASY & FAST'}
                            </span>

                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                                {isRtl ? 'حجز مواعيدك الطبية بكل سهولة' : 'Book Your Appointment'}
                            </h2>

                            <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
                                {isRtl
                                    ? 'اختر طبيبك المفضل، وحدد الوقت المناسب، واحصل على رعاية طبية متكاملة بضغطة زر واحدة.'
                                    : 'Choose your doctor, select a convenient time, and get quality medical care — all in just a few clicks.'}
                            </p>

                            {/* Features list */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                {features.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2 hover:bg-white/15 transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h4 className="text-sm font-bold text-white">
                                                {isRtl ? item.title_ar : item.title_en}
                                            </h4>
                                            <p className="text-[11px] text-gray-300">
                                                {isRtl ? item.desc_ar : item.desc_en}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-2">
                                <Link href="/create/clinic/page">
                                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-5 rounded-xl text-sm gap-2 shadow-lg cursor-pointer">
                                        <span>{isRtl ? 'احجز الآن' : 'Book Now'}</span>
                                        <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
