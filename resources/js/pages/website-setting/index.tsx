import React, { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { WebsiteSetting, WebsiteSettingFormValues } from '@/types/website-setting';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import useImport from '@/hooks/use-import';
import InputError from '@/components/input-error';
import ImagePicker from '@/components/ui/image-picker';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Icons
import {
    Globe,
    Save,
    Image as ImageIcon,
    Mail,
    Phone,
    MapPin,
    Search,
} from 'lucide-react';

interface Props {
    settings?: WebsiteSetting;
}

export default function WebsiteSettingsPage({ settings }: Props) {
    const { t } = useImport();
    const [activeTab, setActiveTab] = useState<'general' | 'media' | 'contact'>('general');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [darkLogoFile, setDarkLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);

    // Validation Schema
    const validationSchema = Yup.object({
        title_en: Yup.string().nullable(),
        title_ar: Yup.string().nullable(),
        description_en: Yup.string().nullable(),
        description_ar: Yup.string().nullable(),
        keywords_en: Yup.string().nullable(),
        keywords_ar: Yup.string().nullable(),
        email: Yup.string().email().nullable(),
        phone: Yup.string().nullable(),
        address: Yup.string().nullable(),
    });

    const formik = useFormik<WebsiteSettingFormValues>({
        initialValues: {
            title_en: settings?.title_en || '',
            title_ar: settings?.title_ar || '',
            description_en: settings?.description_en || '',
            description_ar: settings?.description_ar || '',
            keywords_en: settings?.keywords_en || '',
            keywords_ar: settings?.keywords_ar || '',
            email: settings?.email || '',
            phone: settings?.phone || '',
            address: settings?.address || '',
            logo: null,
            dark_logo: null,
            favicon: null,
            remove_logo: false,
            remove_dark_logo: false,
            remove_favicon: false,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const formData = new FormData();

            formData.append('title_en', values.title_en || '');
            formData.append('title_ar', values.title_ar || '');
            formData.append('description_en', values.description_en || '');
            formData.append('description_ar', values.description_ar || '');
            formData.append('keywords_en', values.keywords_en || '');
            formData.append('keywords_ar', values.keywords_ar || '');
            formData.append('email', values.email || '');
            formData.append('phone', values.phone || '');
            formData.append('address', values.address || '');

            if (logoFile) {
                formData.append('logo', logoFile);
            } else if (values.remove_logo) {
                formData.append('remove_logo', '1');
            }

            if (darkLogoFile) {
                formData.append('dark_logo', darkLogoFile);
            } else if (values.remove_dark_logo) {
                formData.append('remove_dark_logo', '1');
            }

            if (faviconFile) {
                formData.append('favicon', faviconFile);
            } else if (values.remove_favicon) {
                formData.append('remove_favicon', '1');
            }

            router.post('/admin/website-settings', formData, {
                onSuccess: () => {
                    toast.success(t('website_settings.updated_success', 'Website settings updated successfully!'));
                },
                onError: (errors) => {
                    toast.error((Object.values(errors)[0] as string) || 'Error updating settings');
                },
                onFinish: () => setSubmitting(false),
            });
        },
    });

    return (
        <AdminLayout title={t('website_settings.title', 'Website Settings')}>
            <div className="space-y-6">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                <Globe size={22} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t('website_settings.title', 'Website Settings')}
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {t('website_settings.subtitle', 'Manage site metadata, contact info, logos, and favicon.')}
                        </p>
                    </div>

                    <Button
                        onClick={() => formik.handleSubmit()}
                        disabled={formik.isSubmitting}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm font-medium rounded-xl h-10 px-5 transition-transform active:scale-95 cursor-pointer"
                    >
                        <Save size={18} />
                        <span>
                            {formik.isSubmitting
                                ? t('common.processing', 'Saving...')
                                : t('website_settings.save_changes', 'Save Settings')}
                        </span>
                    </Button>
                </div>

                {/* Settings Form Tabs */}
                <form onSubmit={formik.handleSubmit}>
                    <div className="space-y-6">
                        <div className="flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-1.5 rounded-2xl w-full justify-start overflow-x-auto gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('general')}
                                className={`flex items-center gap-2 rounded-xl text-xs sm:text-sm px-4 py-2 font-medium transition-all ${
                                    activeTab === 'general'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Search size={16} />
                                <span>{t('website_settings.general_tab', 'General & SEO')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('media')}
                                className={`flex items-center gap-2 rounded-xl text-xs sm:text-sm px-4 py-2 font-medium transition-all ${
                                    activeTab === 'media'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <ImageIcon size={16} />
                                <span>{t('website_settings.media_tab', 'Logos & Favicon')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('contact')}
                                className={`flex items-center gap-2 rounded-xl text-xs sm:text-sm px-4 py-2 font-medium transition-all ${
                                    activeTab === 'contact'
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Mail size={16} />
                                <span>{t('website_settings.contact_tab', 'Contact Info')}</span>
                            </button>
                        </div>

                        {/* General & SEO Tab Content */}
                        {activeTab === 'general' && (
                            <Card className="border-gray-100 dark:border-gray-800 shadow-xs rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Search size={18} className="text-primary" />
                                        {t('website_settings.general_tab', 'General & SEO Information')}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Configure site titles, description metadata, and search keywords in Arabic and English.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Arabic Title */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="title_ar" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {t('website_settings.title_ar', 'Arabic Title')}
                                            </Label>
                                            <Input
                                                id="title_ar"
                                                name="title_ar"
                                                dir="rtl"
                                                placeholder="مثال: نظام إدارة العيادات الطبية"
                                                value={formik.values.title_ar}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary"
                                            />
                                        </div>

                                        {/* English Title */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="title_en" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {t('website_settings.title_en', 'English Title')}
                                            </Label>
                                            <Input
                                                id="title_en"
                                                name="title_en"
                                                dir="ltr"
                                                placeholder="e.g. Clinic Management System"
                                                value={formik.values.title_en}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Arabic Description */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="description_ar" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {t('website_settings.description_ar', 'Arabic Meta Description')}
                                            </Label>
                                            <textarea
                                                id="description_ar"
                                                name="description_ar"
                                                dir="rtl"
                                                rows={3}
                                                placeholder="وصف المختصر للموقع باللغة العربية..."
                                                value={formik.values.description_ar}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-xs focus:ring-primary focus:outline-hidden resize-none"
                                            />
                                        </div>

                                        {/* English Description */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="description_en" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {t('website_settings.description_en', 'English Meta Description')}
                                            </Label>
                                            <textarea
                                                id="description_en"
                                                name="description_en"
                                                dir="ltr"
                                                rows={3}
                                                placeholder="Brief meta description of the site in English..."
                                                value={formik.values.description_en}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-xs focus:ring-primary focus:outline-hidden resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Arabic Keywords */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="keywords_ar" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {t('website_settings.keywords_ar', 'Arabic Keywords')}
                                            </Label>
                                            <Input
                                                id="keywords_ar"
                                                name="keywords_ar"
                                                dir="rtl"
                                                placeholder="مثال: عيادات، أطباء، حجز موعد"
                                                value={formik.values.keywords_ar}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary"
                                            />
                                        </div>

                                        {/* English Keywords */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="keywords_en" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {t('website_settings.keywords_en', 'English Keywords')}
                                            </Label>
                                            <Input
                                                id="keywords_en"
                                                name="keywords_en"
                                                dir="ltr"
                                                placeholder="e.g. clinics, doctors, appointments"
                                                value={formik.values.keywords_en}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Media & Logos Tab Content */}
                        {activeTab === 'media' && (
                            <Card className="border-gray-100 dark:border-gray-800 shadow-xs rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <ImageIcon size={18} className="text-primary" />
                                        {t('website_settings.media_tab', 'Logos & Favicon')}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Upload light logo, dark logo, and site favicon image. Images will be automatically optimized via Cloudinary.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Light Mode Logo */}
                                    <ImagePicker
                                        id="logo"
                                        label={t('website_settings.logo', 'Light Mode Logo')}
                                        initialPreview={settings?.logo || null}
                                        onChange={(file) => {
                                            setLogoFile(file);
                                            if (!file) {
                                                formik.setFieldValue('remove_logo', true);
                                            } else {
                                                formik.setFieldValue('remove_logo', false);
                                            }
                                        }}
                                    />

                                    {/* Dark Mode Logo */}
                                    <ImagePicker
                                        id="dark_logo"
                                        label={t('website_settings.dark_logo', 'Dark Mode Logo')}
                                        initialPreview={settings?.dark_logo || null}
                                        onChange={(file) => {
                                            setDarkLogoFile(file);
                                            if (!file) {
                                                formik.setFieldValue('remove_dark_logo', true);
                                            } else {
                                                formik.setFieldValue('remove_dark_logo', false);
                                            }
                                        }}
                                    />

                                    {/* Favicon */}
                                    <ImagePicker
                                        id="favicon"
                                        label={t('website_settings.favicon', 'Favicon Icon')}
                                        initialPreview={settings?.favicon || null}
                                        onChange={(file) => {
                                            setFaviconFile(file);
                                            if (!file) {
                                                formik.setFieldValue('remove_favicon', true);
                                            } else {
                                                formik.setFieldValue('remove_favicon', false);
                                            }
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Info Tab Content */}
                        {activeTab === 'contact' && (
                            <Card className="border-gray-100 dark:border-gray-800 shadow-xs rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Mail size={18} className="text-primary" />
                                        {t('website_settings.contact_tab', 'Contact Information')}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Update support email, phone number, and physical office address.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                                <Mail size={14} className="text-gray-400" />
                                                {t('website_settings.email', 'Email Address')}
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                dir="ltr"
                                                placeholder="info@clinic.com"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary"
                                            />
                                            {formik.touched.email && formik.errors.email && (
                                                <InputError message={formik.errors.email} />
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="phone" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                                <Phone size={14} className="text-gray-400" />
                                                {t('website_settings.phone', 'Phone Number')}
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                dir="ltr"
                                                placeholder="+20 100 000 0000"
                                                value={formik.values.phone}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="address" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                            <MapPin size={14} className="text-gray-400" />
                                            {t('website_settings.address', 'Physical Address')}
                                        </Label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            rows={2}
                                            placeholder="Enter complete office address..."
                                            value={formik.values.address}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-xs focus:ring-primary focus:outline-hidden resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm font-medium rounded-xl h-10 px-6 cursor-pointer"
                        >
                            <Save size={18} />
                            <span>
                                {formik.isSubmitting
                                    ? t('common.processing', 'Saving...')
                                    : t('website_settings.save_changes', 'Save Settings')}
                            </span>
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
