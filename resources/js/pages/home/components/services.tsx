import React from 'react';
import useImport from '@/hooks/use-import';
import {
    Building2,
    Activity,
    ShieldCheck,
    Calendar,
    Stethoscope,
    TrendingUp,
    ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Services() {
    const { t, isRtl } = useImport();

    const services = [
        {
            icon: Building2,
            title: t('landing.feat_1_title', 'Multi-Clinic & Branch Management'),
            description: t(
                'landing.feat_1_desc',
                'Easily manage multiple branches, locations, and medical centers under a single unified dashboard.'
            ),
        },
        {
            icon: Activity,
            title: t('landing.feat_2_title', 'Electronic Health Records (EHR)'),
            description: t(
                'landing.feat_2_desc',
                'Comprehensive digital records for patient medical history, prescriptions, diagnosis, and attachments.'
            ),
        },
        {
            icon: ShieldCheck,
            title: t('landing.feat_3_title', 'Role & Team Permissions'),
            description: t(
                'landing.feat_3_desc',
                'Granular role-based access for Owners, Doctors, Receptionists, and Staff.'
            ),
        },
        {
            icon: Calendar,
            title: t('landing.feat_4_title', 'Smart Appointment Scheduling'),
            description: t(
                'landing.feat_4_desc',
                'Prevent double bookings, automate slot allocations, and streamline patient queue management.'
            ),
        },
        {
            icon: Stethoscope,
            title: t('landing.feat_5_title', 'Medical Specialty Tailoring'),
            description: t(
                'landing.feat_5_desc',
                'Pre-configured workflows tailored for Dental, Cardiology, Pediatrics, Dermatology, and more.'
            ),
        },
        {
            icon: TrendingUp,
            title: t('landing.feat_6_title', 'Real-time Reports & Analytics'),
            description: t(
                'landing.feat_6_desc',
                'Track daily performance, patient visits, clinic revenue, and operational growth.'
            ),
        },
    ];

    return (
        <section id="services" className="py-16 lg:py-24 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="max-w-2xl space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            {isRtl ? 'خدماتنا المتميزة' : 'OUR SERVICES'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                            {isRtl
                                ? 'رعاية صحية شاملة تحت سقف واحد'
                                : 'Comprehensive Healthcare Under One Roof'}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                            {t('landing.features_subtitle', 'Powerful tools designed specifically for healthcare professionals and medical center administrators.')}
                        </p>
                    </div>

                    <a
                        href="#contact"
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline shrink-0"
                    >
                        <span>{isRtl ? 'عرض كل الخدمات' : 'View All Services'}</span>
                        <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </a>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((srv, idx) => {
                        const Icon = srv.icon;
                        return (
                            <Card
                                key={idx}
                                className="group relative border-gray-200/80 dark:border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-lg rounded-2xl overflow-hidden"
                            >
                                <CardContent className="p-6 space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                        {srv.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {srv.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
