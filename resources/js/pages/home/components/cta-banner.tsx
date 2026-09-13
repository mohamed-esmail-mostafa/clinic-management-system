import React from 'react';
import { Link } from '@inertiajs/react';
import useImport from '@/hooks/use-import';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CtaBanner() {
    const { isRtl } = useImport();

    return (
        <section className="py-16 lg:py-20 bg-gradient-to-br from-primary via-emerald-800 to-teal-900 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>{isRtl ? 'ابدأ رحلة النجاح اليوم' : 'YOUR HEALTH MATTERS'}</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
                    {isRtl
                        ? 'خذ الخطوة الأولى نحو حياة أكثر صحة وإدارة متكاملة'
                        : 'Take the First Step Towards a Healthier Life'}
                </h2>

                <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
                    {isRtl
                        ? 'انضم إلى مئات الأطباء والعيادات الطبية التي تبسط عملياتها وتوفر أفضل رعاية صحية لمرضاها.'
                        : 'Join hundreds of healthcare leaders simplifying clinic operations and providing better care today.'}
                </p>

                <div className="pt-4 flex justify-center">
                    <Link href="/create/clinic/page">
                        <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-6 rounded-xl text-base gap-2 shadow-xl cursor-pointer transition-transform hover:scale-105 active:scale-95">
                            <span>{isRtl ? 'سجل عيادتك الآن' : 'Register Your Clinic'}</span>
                            <ArrowRight className={`h-4 w-4 text-primary ${isRtl ? 'rotate-180' : ''}`} />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
