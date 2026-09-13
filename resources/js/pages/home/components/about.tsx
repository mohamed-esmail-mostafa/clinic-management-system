import React from 'react';
import useImport from '@/hooks/use-import';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Users, ArrowRight } from 'lucide-react';

export default function About() {
    const { t, isRtl } = useImport();

    const checklist = [
        isRtl ? 'أطباء خبراء وموثوقون' : 'Experienced & Trusted Doctors',
        isRtl ? 'إدارة رقمية متطورة وحديثة' : 'Modern Medical Technology',
        isRtl ? 'بيئة صحية ومريحة للمرضى' : 'Comfortable & Clean Environment',
        isRtl ? 'خطط إدارة مرنة واقتصادية' : 'Affordable Treatment Plans',
    ];

    return (
        <section id="about" className="py-16 lg:py-24 bg-slate-50/70 dark:bg-gray-950/60 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Text & Features */}
                    <div className="lg:col-span-6 space-y-6 text-start">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            {isRtl ? 'عن المنصة الطبية' : 'ABOUT CLINIC CARE'}
                        </span>

                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                            {isRtl ? 'رعاية حديثة لحياة أكثر صحة' : 'Modern Care For a Healthier You'}
                        </h2>

                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            {isRtl
                                ? 'نجمع بين التقنيات الطبية الحديثة والإدارة الذكية لمنح عيادتك الكفاءة الكاملة وتوفير أفضل تجربة علاجية للمرضى.'
                                : 'We combine advanced medical technology with intelligent management to give your clinic complete efficiency and provide the best patient care experience.'}
                        </p>

                        {/* Checklist */}
                        <div className="space-y-3 pt-2">
                            {checklist.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <a href="#booking">
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-5 rounded-xl shadow-md text-sm gap-2 cursor-pointer">
                                    <span>{isRtl ? 'معرفة المزيد' : 'Learn More'}</span>
                                    <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Reception Image + Floating Badge */}
                    <div className="lg:col-span-6 relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                            <img
                                src="/images/clinic_reception.jpg"
                                alt="Clinic Interior"
                                className="w-full h-[350px] sm:h-[420px] object-cover"
                            />

                            {/* Floating Badge */}
                            <div className="absolute bottom-6 left-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {isRtl ? 'موثوق من قِبل' : 'Trusted by'}
                                    </p>
                                    <p className="text-base font-extrabold text-gray-900 dark:text-white">
                                        {isRtl ? '5,000+ مريض وعيادة' : '5,000+ Patients'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
