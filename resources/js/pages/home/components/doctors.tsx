import React from 'react';
import useImport from '@/hooks/use-import';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Stethoscope, ArrowRight } from 'lucide-react';

export default function Doctors() {
    const { isRtl } = useImport();

    const doctors = [
        {
            name: isRtl ? 'د. دانيال أحمد' : 'Dr. James Carter',
            specialty_en: 'Cardiologist',
            specialty_ar: 'استشاري أمراض القلب',
            rating: '5.0',
            reviews: '120+',
            initials: 'JC',
        },
        {
            name: isRtl ? 'د. سارة محمود' : 'Dr. Sarah Jenkins',
            specialty_en: 'Pediatrician',
            specialty_ar: 'استشارية طب الأطفال',
            rating: '4.9',
            reviews: '98+',
            initials: 'SJ',
        },
        {
            name: isRtl ? 'د. مايكل علي' : 'Dr. Michael Chen',
            specialty_en: 'Dentist & Implantologist',
            specialty_ar: 'أخصائي جراحة الأسنان',
            rating: '5.0',
            reviews: '145+',
            initials: 'MC',
        },
    ];

    return (
        <section id="doctors" className="py-16 lg:py-24 bg-slate-50/70 dark:bg-gray-950/60 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="max-w-2xl space-y-3 text-start">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            {isRtl ? 'نخبة الأطباء' : 'MEET OUR DOCTORS'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                            {isRtl ? 'أطباء خبراء، رعاية مخصصة' : 'Expert Doctors, Personalized Care'}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                            {isRtl
                                ? 'يلتزم فريقنا من الأطباء والمتخصصين بتقديم أعلى مستويات الرعاية الصحية لك ولعائلتك.'
                                : 'Our team of experienced specialists is committed to providing the highest quality care for you and your family.'}
                        </p>
                    </div>

                    <a href="#booking" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline shrink-0">
                        <span>{isRtl ? 'عرض كل الأطباء' : 'Explore Doctors'}</span>
                        <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {doctors.map((doc, idx) => (
                        <Card
                            key={idx}
                            className="border-gray-200/80 dark:border-gray-800 hover:border-primary/40 transition-all rounded-2xl overflow-hidden hover:shadow-lg group"
                        >
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 bg-primary/10 text-primary border border-primary/20 font-bold text-lg">
                                        <AvatarFallback>{doc.initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-start">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                            {doc.name}
                                        </h3>
                                        <p className="text-xs text-primary font-medium">
                                            {isRtl ? doc.specialty_ar : doc.specialty_en}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-bold">
                                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                            <span>{doc.rating}</span>
                                            <span className="text-gray-400 font-normal text-[11px]">
                                                ({doc.reviews} {isRtl ? 'تقييم' : 'reviews'})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
