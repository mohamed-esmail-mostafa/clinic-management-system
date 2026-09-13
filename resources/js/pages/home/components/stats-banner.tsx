import React from 'react';
import useImport from '@/hooks/use-import';
import { Users, Stethoscope, Award, Smile } from 'lucide-react';

export default function StatsBanner() {
    const { isRtl } = useImport();

    const stats = [
        {
            number: '5000+',
            label_en: 'Happy Patients',
            label_ar: 'مريض سعيد',
            icon: Users,
        },
        {
            number: '50+',
            label_en: 'Expert Doctors',
            label_ar: 'طبيب خبير',
            icon: Stethoscope,
        },
        {
            number: '15+',
            label_en: 'Years of Care',
            label_ar: 'عام من الخبرة',
            icon: Award,
        },
        {
            number: '98%',
            label_en: 'Patient Satisfaction',
            label_ar: 'نسبة رضا المرضى',
            icon: Smile,
        },
    ];

    return (
        <section className="py-16 lg:py-20 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
                <div className="space-y-3 max-w-xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                        {isRtl ? 'إنجازاتنا بالأرقام' : 'OUR IMPACT'}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                        {isRtl ? 'رعاية صحية موثوقة بالأرقام' : 'Trusted Healthcare By The Numbers'}
                    </h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((st, idx) => {
                        const Icon = st.icon;
                        return (
                            <div
                                key={idx}
                                className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all hover:bg-white/10 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                    {st.number}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
                                    {isRtl ? st.label_ar : st.label_en}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
