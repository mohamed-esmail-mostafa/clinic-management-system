import React from 'react';
import { Link } from '@inertiajs/react';
import useImport from '@/hooks/use-import';
import useWebsiteSetting from '@/hooks/use-website-setting';
import { Phone, Mail, MapPin, Stethoscope } from 'lucide-react';

export default function Footer() {
    const { t, isRtl } = useImport();
    const { settings } = useWebsiteSetting();

    const logoSrc = settings?.logo;
    const title = isRtl
        ? (settings?.title_ar || 'نظام إدارة العيادات')
        : (settings?.title_en || 'ClinicCare Management');

    const description = isRtl
        ? (settings?.description_ar || 'نظام متكامل لإدارة العيادات والمرضى والحجوزات والزيارات والروشتات وإدارة العمليات الطبية.')
        : (settings?.description_en || 'A complete clinic management system for managing patients, appointments, visits, prescriptions, and clinic operations.');

    const phone = settings?.phone || '+971 50 123 4567';
    const email = settings?.email || 'support@cliniccare.com';
    const address = isRtl
        ? (settings?.address || 'الرياض، المملكة العربية السعودية')
        : (settings?.address || 'Dubai Healthcare City, UAE');

    return (
        <footer id="footer" className="bg-gray-950 text-gray-400 text-xs border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-start">
                    {/* Brand Info */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-3">
                            {logoSrc ? (
                                <img src={logoSrc} alt={title} className="h-9 w-auto object-contain" />
                            ) : (
                                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                    <Stethoscope size={20} />
                                </div>
                            )}
                            <span className="font-extrabold text-lg text-white tracking-tight">
                                {title}
                            </span>
                        </Link>

                        <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                            {description}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                            {isRtl ? 'روابط سريعة' : 'Quick Links'}
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li><a href="/" className="hover:text-primary transition-colors">{t('landing.nav.home', 'Home')}</a></li>
                            <li><a href="#services" className="hover:text-primary transition-colors">{t('landing.nav.services', 'Services')}</a></li>
                            <li><a href="#doctors" className="hover:text-primary transition-colors">{t('landing.nav.doctors', 'Doctors')}</a></li>
                            <li><a href="#about" className="hover:text-primary transition-colors">{t('landing.nav.about', 'About Us')}</a></li>
                            <li><a href="#testimonials" className="hover:text-primary transition-colors">{t('landing.nav.testimonials', 'Testimonials')}</a></li>
                        </ul>
                    </div>

                    {/* Our Services */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                            {isRtl ? 'خدماتنا الطبية' : 'Our Services'}
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li><span className="hover:text-primary cursor-pointer">{isRtl ? 'الطب العام' : 'General Medicine'}</span></li>
                            <li><span className="hover:text-primary cursor-pointer">{isRtl ? 'طب الأسنان' : 'Dental Care'}</span></li>
                            <li><span className="hover:text-primary cursor-pointer">{isRtl ? 'أمراض القلب' : 'Cardiology'}</span></li>
                            <li><span className="hover:text-primary cursor-pointer">{isRtl ? 'طب الأطفال' : 'Pediatrics'}</span></li>
                            <li><span className="hover:text-primary cursor-pointer">{isRtl ? 'صحة المرأة' : 'Women\'s Health'}</span></li>
                            <li><span className="hover:text-primary cursor-pointer">{isRtl ? 'الفحوصات الطبية' : 'Lab Tests'}</span></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                            {isRtl ? 'معلومات التواصل' : 'Contact Us'}
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-primary shrink-0" />
                                <span>{phone}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary shrink-0" />
                                <span>{email}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{address}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Row / Copyright */}
                <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
                    <p>
                        &copy; {new Date().getFullYear()} {title}. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-gray-400 transition-colors">{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>
                        <a href="#" className="hover:text-gray-400 transition-colors">{isRtl ? 'الشروط والأحكام' : 'Terms of Service'}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
