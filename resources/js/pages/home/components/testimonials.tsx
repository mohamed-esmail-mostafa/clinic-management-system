import React from 'react';
import useImport from '@/hooks/use-import';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
    const { isRtl } = useImport();

    const reviews = [
        {
            name: isRtl ? 'سارة علي' : 'Sarah Johnson',
            role_en: 'Patient',
            role_ar: 'مريضة مسجلة',
            comment_en: 'The doctors are very professional and caring. I always feel safe and well treated at this clinic.',
            comment_ar: 'الأطباء محترفون للغاية ومهتمون بالتفاصيل. أشعر دائماً بالأمان والرعاية الفائقة أثناء زيارتي للعيادة.',
            initials: 'SJ',
        },
        {
            name: isRtl ? 'داوود محمود' : 'David Miller',
            role_en: 'Patient',
            role_ar: 'مريض مسجل',
            comment_en: 'Excellent service, modern facilities and friendly staff. Highly recommended for everyone!',
            comment_ar: 'خدمة ممتازة، ومرافق حديثة، وطاقم عمل ودود للغاية. أوصي بشدة بهذه المنصة والعيادات التابعة لها.',
            initials: 'DM',
        },
        {
            name: isRtl ? 'أمل كريم' : 'Emily Carter',
            role_en: 'Patient',
            role_ar: 'مريضة مسجلة',
            comment_en: 'Booking was easy, the consultation was smooth, and the treatment worked perfectly for me.',
            comment_ar: 'كان الحجز سهلاً وسريعاً، وكانت الاستشارة سلسة جداً، والخطة العلاجية كانت نتيجتها ممتازة.',
            initials: 'EC',
        },
    ];

    return (
        <section id="testimonials" className="py-16 lg:py-24 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center space-y-3 max-w-xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                        {isRtl ? 'قصص النجاح والرعاية' : 'PATIENT STORIES'}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        {isRtl ? 'ماذا يقول مرضانا' : 'What Our Patients Say'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((rev, idx) => (
                        <Card
                            key={idx}
                            className="border-gray-200/80 dark:border-gray-800 hover:border-primary/40 transition-all rounded-2xl p-2 hover:shadow-md"
                        >
                            <CardContent className="p-6 space-y-4 text-start">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <Quote className="h-6 w-6 text-primary/20" />
                                </div>

                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                    "{isRtl ? rev.comment_ar : rev.comment_en}"
                                </p>

                                <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <Avatar className="h-10 w-10 bg-primary/10 text-primary font-bold text-xs">
                                        <AvatarFallback>{rev.initials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                            {rev.name}
                                        </h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                            {isRtl ? rev.role_ar : rev.role_en}
                                        </p>
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
