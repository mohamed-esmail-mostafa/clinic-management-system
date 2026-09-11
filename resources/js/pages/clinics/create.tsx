import React, { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Country } from '@/types/country';
import { Governorate } from '@/types/governorate';
import { City } from '@/types/city';
import { Specialty } from '@/types/specialty';
import { ClinicFormValues } from '@/types/clinic';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import useImport from '@/hooks/use-import';
import InputError from '@/components/input-error';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Icons
import {
    Building2,
    MapPin,
    Phone,
    FileText,
    Stethoscope,
    ArrowLeft,
    ArrowRight,
    Check,
    Globe,
    UserCheck,
    Building,
} from 'lucide-react';

interface Props {
    countries?: Country[];
    governorates?: Governorate[];
    cities?: City[];
    specialties?: Specialty[];
}

export default function CreateClinicPage({
    countries = [],
    governorates = [],
    cities = [],
    specialties = [],
}: Props) {
    const { t, isRtl } = useImport();

    // Cascading location states
    const [selectedCountryId, setSelectedCountryId] = useState<string>('');
    const [selectedGovId, setSelectedGovId] = useState<string>('');

    // Available Governorates based on Country
    const filteredGovernorates = selectedCountryId
        ? governorates.filter((g) => String(g.country_id) === selectedCountryId)
        : governorates;

    // Available Cities based on Governorate
    const filteredCities = selectedGovId
        ? cities.filter((c) => String(c.governorate_id) === selectedGovId)
        : cities;

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        name: Yup.string()
            .trim()
            .required(t('common.required', 'Clinic name is required')),
        type: Yup.string().oneOf(['personal', 'medical_center']).required(),
        phone: Yup.string().nullable(),
        address: Yup.string().nullable(),
        description: Yup.string().nullable(),
        country_id: Yup.mixed().nullable(),
        governorate_id: Yup.mixed().nullable(),
        city_id: Yup.mixed().nullable(),
        specialty_ids: Yup.array().of(Yup.number()),
    });

    // Formik Form
    const formik = useFormik<ClinicFormValues>({
        initialValues: {
            name: '',
            type: 'personal',
            country_id: '',
            governorate_id: '',
            city_id: '',
            phone: '',
            address: '',
            description: '',
            specialty_ids: [],
            is_active: true,
        },
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const payload = {
                ...values,
                country_id: values.country_id ? Number(values.country_id) : null,
                governorate_id: values.governorate_id ? Number(values.governorate_id) : null,
                city_id: values.city_id ? Number(values.city_id) : null,
            };

            router.post('/store/clinic', payload, {
                onSuccess: () => {
                    toast.success(t('clinics.created_success', 'Clinic created successfully!'));
                },
                onError: (errors) => {
                    toast.error((Object.values(errors)[0] as string) || t('common.error', 'Error creating clinic'));
                },
                onFinish: () => setSubmitting(false),
            });
        },
    });

    const toggleSpecialty = (specialtyId: number) => {
        const currentIds = [...formik.values.specialty_ids];
        const index = currentIds.indexOf(specialtyId);
        if (index > -1) {
            currentIds.splice(index, 1);
        } else {
            currentIds.push(specialtyId);
        }
        formik.setFieldValue('specialty_ids', currentIds);
    };

    return (
        <AdminLayout title={t('clinics.create_title', 'Create Clinic')}>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Link & Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/clinics"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors"
                    >
                        {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                        <span>{t('clinics.title', 'Back to Clinics')}</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t('clinics.create_title', 'Create Clinic')}
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('clinics.create_subtitle', 'Fill in clinic details, location, and specialties.')}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    {/* Basic Information Card */}
                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                <Building2 size={18} className="text-orange-500" />
                                <span>Basic Information</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Clinic Name */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.name', 'Clinic Name')} <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Hope Dental Clinic"
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                    />
                                    {formik.touched.name && formik.errors.name && (
                                        <InputError message={formik.errors.name} />
                                    )}
                                </div>

                                {/* Clinic Type Toggle */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.type', 'Clinic Type')}
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => formik.setFieldValue('type', 'personal')}
                                            className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                                                formik.values.type === 'personal'
                                                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-semibold'
                                                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                            }`}
                                        >
                                            <UserCheck size={20} />
                                            <div className="text-start">
                                                <div className="text-sm">{t('clinics.personal', 'Personal Clinic')}</div>
                                                <div className="text-[11px] font-normal text-gray-400">Single practitioner</div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => formik.setFieldValue('type', 'medical_center')}
                                            className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                                                formik.values.type === 'medical_center'
                                                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-semibold'
                                                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                            }`}
                                        >
                                            <Building size={20} />
                                            <div className="text-start">
                                                <div className="text-sm">{t('clinics.medical_center', 'Medical Center')}</div>
                                                <div className="text-[11px] font-normal text-gray-400">Multi-specialty center</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.phone', 'Phone Number')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="e.g. +201000000000"
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                    />
                                </div>

                                {/* Address */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="address" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.address', 'Address Detail')}
                                    </Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder="e.g. Building 12, Main St."
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="description" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.description', 'Description')}
                                    </Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        placeholder="Brief description about the clinic..."
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Information Card */}
                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                <MapPin size={18} className="text-orange-500" />
                                <span>Location Details</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Country Select */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.country', 'Country')}
                                    </Label>
                                    <Select
                                        value={String(formik.values.country_id)}
                                        onValueChange={(val) => {
                                            formik.setFieldValue('country_id', val);
                                            setSelectedCountryId(val);
                                            formik.setFieldValue('governorate_id', '');
                                            formik.setFieldValue('city_id', '');
                                            setSelectedGovId('');
                                        }}
                                    >
                                        <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500">
                                            <SelectValue placeholder={t('clinics.select_country', 'Select Country')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-900">
                                            {countries.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {isRtl ? c.name_ar : c.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Governorate Select */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.governorate', 'Governorate')}
                                    </Label>
                                    <Select
                                        value={String(formik.values.governorate_id)}
                                        onValueChange={(val) => {
                                            formik.setFieldValue('governorate_id', val);
                                            setSelectedGovId(val);
                                            formik.setFieldValue('city_id', '');
                                        }}
                                    >
                                        <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500">
                                            <SelectValue placeholder={t('clinics.select_governorate', 'Select Governorate')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-900">
                                            {filteredGovernorates.map((g) => (
                                                <SelectItem key={g.id} value={String(g.id)}>
                                                    {isRtl ? g.name_ar : g.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* City Select */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.city', 'City')}
                                    </Label>
                                    <Select
                                        value={String(formik.values.city_id)}
                                        onValueChange={(val) => formik.setFieldValue('city_id', val)}
                                    >
                                        <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500">
                                            <SelectValue placeholder={t('clinics.select_city', 'Select City')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-900">
                                            {filteredCities.map((ct) => (
                                                <SelectItem key={ct.id} value={String(ct.id)}>
                                                    {isRtl ? ct.name_ar : ct.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical Specialties Card */}
                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                <Stethoscope size={18} className="text-orange-500" />
                                <span>{t('clinics.specialties', 'Medical Specialties')}</span>
                            </h2>

                            {specialties.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                                    {specialties.map((s) => {
                                        const isSelected = formik.values.specialty_ids.includes(s.id);
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => toggleSpecialty(s.id)}
                                                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 font-semibold'
                                                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                                }`}
                                            >
                                                <span className="truncate">{isRtl ? s.name_ar : s.name_en}</span>
                                                {isSelected && <Check size={14} className="text-orange-500 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400">No specialties available.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href="/admin/clinics">
                            <Button type="button" variant="outline" className="rounded-xl border-gray-200 dark:border-gray-800">
                                {t('common.cancel', 'Cancel')}
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 px-6 font-medium shadow-sm active:scale-95 transition-transform"
                        >
                            {formik.isSubmitting
                                ? t('common.processing', 'Saving...')
                                : t('common.save', 'Create Clinic')}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
