import React, { useState, useMemo } from 'react';
import { Patient, PatientField, PatientFormValues } from '@/types/patient';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import useImport from '@/hooks/use-import';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sliders, User, Save, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface PatientFormProps {
    clinic?: any;
    patient?: Patient;
    custom_fields?: PatientField[];
}

export default function PatientForm({ clinic, patient, custom_fields = [] }: PatientFormProps) {
    const { t, isRtl } = useImport();
    const [activeTab, setActiveTab] = useState<'basic' | 'emergency' | 'custom'>('basic');

    const clinicSlug = clinic?.slug || '';

    // Build initial custom field values for Formik
    const initialCustomFields = useMemo(() => {
        const fieldValuesObj: Record<number, any> = {};
        const patientValues = patient?.field_values || (patient as any)?.fieldValues || [];

        custom_fields.forEach((field) => {
            const matchedValue = patientValues.find((fv: any) => fv.patient_field_id === field.id);
            if (matchedValue && matchedValue.value !== null && matchedValue.value !== undefined) {
                if (field.type === 'checkbox') {
                    try {
                        fieldValuesObj[field.id] = JSON.parse(matchedValue.value);
                    } catch {
                        fieldValuesObj[field.id] = matchedValue.value ? [matchedValue.value] : [];
                    }
                } else {
                    fieldValuesObj[field.id] = matchedValue.value;
                }
            } else {
                fieldValuesObj[field.id] = field.type === 'checkbox' ? [] : '';
            }
        });

        return fieldValuesObj;
    }, [patient, custom_fields]);

    // Validation Schema
    const validationSchema = useMemo(() => {
        const customFieldSchema: Record<string, any> = {};
        custom_fields.forEach((field) => {
            if (field.is_required) {
                if (field.type === 'checkbox') {
                    customFieldSchema[field.id] = Yup.array().min(1, t('common.required', 'This field is required'));
                } else {
                    customFieldSchema[field.id] = Yup.string().required(t('common.required', 'This field is required'));
                }
            }
        });

        return Yup.object({
            first_name: Yup.string().trim().required(t('common.required', 'This field is required')),
            last_name: Yup.string().trim().required(t('common.required', 'This field is required')),
            phone: Yup.string().nullable(),
            date_of_birth: Yup.string().nullable(),
            gender: Yup.string().nullable(),
            is_active: Yup.boolean().default(true),
            custom_fields: Yup.object(customFieldSchema),
        });
    }, [custom_fields, t]);

    const initialValues: PatientFormValues = useMemo(() => {
        return {
            patient_number: patient?.patient_number || '',
            first_name: patient?.first_name || '',
            last_name: patient?.last_name || '',
            gender: patient?.gender || '',
            date_of_birth: patient?.date_of_birth || '',
            phone: patient?.phone || '',
            secondary_phone: patient?.secondary_phone || '',
            address: patient?.address || '',
            emergency_contact_name: patient?.emergency_contact_name || '',
            emergency_contact_phone: patient?.emergency_contact_phone || '',
            emergency_contact_relation: patient?.emergency_contact_relation || '',
            blood_type: patient?.blood_type || '',
            notes: patient?.notes || '',
            marital_status: patient?.marital_status || '',
            is_active: patient ? Boolean(patient.is_active) : true,
            custom_fields: initialCustomFields,
        };
    }, [patient, initialCustomFields]);

    const formik = useFormik<PatientFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            if (!clinicSlug) {
                toast.error('Clinic slug is missing.');
                setSubmitting(false);
                return;
            }

            if (patient) {
                // Update Patient
                router.put(`/clinic/${clinicSlug}/patients/${patient.id}`, values as any, {
                    onSuccess: () => {
                        toast.success(t('patients.updated_success', 'Patient updated successfully!'));
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating patient');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create Patient
                router.post(`/clinic/${clinicSlug}/patients`, values as any, {
                    onSuccess: () => {
                        toast.success(t('patients.created_success', 'Patient created successfully!'));
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error creating patient');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const renderCustomFieldInput = (field: PatientField) => {
        const fieldName = `custom_fields.${field.id}`;
        const value = formik.values.custom_fields?.[field.id] ?? (field.type === 'checkbox' ? [] : '');
        const touched = (formik.touched.custom_fields as any)?.[field.id];
        const error = (formik.errors.custom_fields as any)?.[field.id];

        switch (field.type) {
            case 'textarea':
                return (
                    <div key={field.id} className="space-y-1 md:col-span-2">
                        <Label htmlFor={`custom_field_${field.id}`}>
                            {field.label} {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <textarea
                            id={`custom_field_${field.id}`}
                            name={fieldName}
                            rows={3}
                            value={value}
                            onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
                            className="w-full p-2 text-sm border rounded-md bg-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                            placeholder={field.label}
                        />
                        {touched && error && <p className="text-xs text-red-500">{String(error)}</p>}
                    </div>
                );
            case 'select':
                return (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={`custom_field_${field.id}`}>
                            {field.label} {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <Select
                            value={value || ''}
                            onValueChange={(val) => formik.setFieldValue(fieldName, val)}
                        >
                            <SelectTrigger id={`custom_field_${field.id}`} className="mt-1">
                                <SelectValue placeholder={t('common.select', 'Select option')} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((opt) => (
                                    <SelectItem key={opt.id || opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {touched && error && <p className="text-xs text-red-500">{String(error)}</p>}
                    </div>
                );
            case 'radio':
                return (
                    <div key={field.id} className="space-y-2 md:col-span-2">
                        <Label>
                            {field.label} {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <div className="flex flex-wrap gap-4 pt-1">
                            {field.options?.map((opt) => (
                                <label key={opt.id || opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name={fieldName}
                                        value={opt.value}
                                        checked={value === opt.value}
                                        onChange={() => formik.setFieldValue(fieldName, opt.value)}
                                        className="accent-primary"
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                        {touched && error && <p className="text-xs text-red-500">{String(error)}</p>}
                    </div>
                );
            case 'checkbox':
                return (
                    <div key={field.id} className="space-y-2 md:col-span-2">
                        <Label>
                            {field.label} {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <div className="flex flex-wrap gap-4 pt-1">
                            {field.options?.map((opt) => {
                                const currentList: string[] = Array.isArray(value) ? value : [];
                                const isChecked = currentList.includes(opt.value);
                                return (
                                    <label key={opt.id || opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                                const newList = e.target.checked
                                                    ? [...currentList, opt.value]
                                                    : currentList.filter((v) => v !== opt.value);
                                                formik.setFieldValue(fieldName, newList);
                                            }}
                                            className="rounded border-gray-300 accent-primary"
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {touched && error && <p className="text-xs text-red-500">{String(error)}</p>}
                    </div>
                );
            case 'date':
                return (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={`custom_field_${field.id}`}>
                            {field.label} {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={`custom_field_${field.id}`}
                            name={fieldName}
                            type="date"
                            value={value}
                            onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
                            className="mt-1"
                        />
                        {touched && error && <p className="text-xs text-red-500">{String(error)}</p>}
                    </div>
                );
            case 'number':
                return (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={`custom_field_${field.id}`}>
                            {field.label} {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={`custom_field_${field.id}`}
                            name={fieldName}
                            type="number"
                            value={value}
                            onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
                            className="mt-1"
                            placeholder={field.label}
                        />
                        {touched && error && <p className="text-xs text-red-500">{String(error)}</p>}
                    </div>
                );
            case 'text':
            default:
                return (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={`custom_field_${field.id}`}>
                            {field.label} {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={`custom_field_${field.id}`}
                            name={fieldName}
                            type="text"
                            value={value}
                            onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
                            className="mt-1"
                            placeholder={field.label}
                        />
                        {touched && error && <p className="text-xs text-red-500">{String(error)}</p>}
                    </div>
                );
        }
    };

    return (
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm max-w-4xl mx-auto w-full">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            {patient ? t('patients.edit') : t('patients.add_new')}
                        </CardTitle>
                        {/* <CardDescription className="text-xs mt-1">
                            {patient
                                ? t('patients.edit_desc', 'Update patient profile, emergency details, and custom fields.')
                                : t('patients.add_desc', 'Fill in patient personal details, contact info, and clinic specific fields.')}
                        </CardDescription> */}
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="is_active" className="text-xs font-semibold cursor-pointer">
                            {formik.values.is_active ? t('patients.active', 'Active') : t('patients.inactive', 'Inactive')}
                        </Label>
                        <Switch
                            id="is_active"
                            checked={formik.values.is_active}
                            onCheckedChange={(checked) => formik.setFieldValue('is_active', checked)}
                        />
                    </div>
                </div>

                {/* Form Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6 mt-4 pt-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'basic'
                                ? 'border-primary text-primary font-semibold'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                    >
                        {t('patients.tab_basic')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('emergency')}
                        className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'emergency'
                                ? 'border-primary text-primary font-semibold'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                    >
                        {t('patients.tab_emergency', 'Emergency & Notes')}
                    </button>
                    {custom_fields.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('custom')}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                                activeTab === 'custom'
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            <Sliders className="h-3.5 w-3.5" />
                            {t('patients.tab_custom_fields')}
                            <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5">
                                {custom_fields.length}
                            </Badge>
                        </button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    {/* Tab 1: Basic & Contact */}
                    {activeTab === 'basic' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="first_name">
                                        {t('patients.first_name', 'First Name')} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        value={formik.values.first_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="mt-1"
                                        placeholder={t('patients.first_name', 'First Name')}
                                    />
                                    {formik.touched.first_name && formik.errors.first_name && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.first_name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="last_name">
                                        {t('patients.last_name', 'Last Name')} <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        value={formik.values.last_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="mt-1"
                                        placeholder={t('patients.last_name', 'Last Name')}
                                    />
                                    {formik.touched.last_name && formik.errors.last_name && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.last_name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="patient_number">{t('patients.patient_number', 'Patient ID / Code')}</Label>
                                    <Input
                                        id="patient_number"
                                        name="patient_number"
                                        placeholder={t('patients.auto_generated', 'Auto-generated if empty')}
                                        value={formik.values.patient_number || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="gender">{t('patients.gender', 'Gender')}</Label>
                                    <Select
                                        value={formik.values.gender || ''}
                                        onValueChange={(val) => formik.setFieldValue('gender', val)}
                                    >
                                        <SelectTrigger id="gender" className="mt-1">
                                            <SelectValue placeholder={t('patients.select_gender', 'Select gender')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">{t('patients.male', 'Male')}</SelectItem>
                                            <SelectItem value="female">{t('patients.female', 'Female')}</SelectItem>
                                            <SelectItem value="other">{t('patients.other', 'Other')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="date_of_birth">{t('patients.date_of_birth', 'Date of Birth')}</Label>
                                    <Input
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        type="date"
                                        value={formik.values.date_of_birth || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">{t('patients.phone', 'Phone Number')}</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="e.g. +1234567890"
                                        value={formik.values.phone || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="secondary_phone">{t('patients.secondary_phone', 'Secondary Phone')}</Label>
                                    <Input
                                        id="secondary_phone"
                                        name="secondary_phone"
                                        type="tel"
                                        value={formik.values.secondary_phone || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="address">{t('patients.address', 'Address')}</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder={t('patients.address_placeholder', 'Street, city, area...')}
                                        value={formik.values.address || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Emergency & Notes */}
                    {activeTab === 'emergency' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="emergency_contact_name">{t('patients.emergency_name')}</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        name="emergency_contact_name"
                                        value={formik.values.emergency_contact_name || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="emergency_contact_phone">{t('patients.emergency_phone')}</Label>
                                    <Input
                                        id="emergency_contact_phone"
                                        name="emergency_contact_phone"
                                        type="tel"
                                        value={formik.values.emergency_contact_phone || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="emergency_contact_relation">{t('patients.emergency_relation', 'Relation')}</Label>
                                    <Input
                                        id="emergency_contact_relation"
                                        name="emergency_contact_relation"
                                        placeholder="e.g. Spouse, Parent, Sibling"
                                        value={formik.values.emergency_contact_relation || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="blood_type">{t('patients.blood_type', 'Blood Type')}</Label>
                                    <Select
                                        value={formik.values.blood_type || ''}
                                        onValueChange={(val) => formik.setFieldValue('blood_type', val)}
                                    >
                                        <SelectTrigger id="blood_type" className="mt-1">
                                            <SelectValue placeholder={t('common.select', 'Select blood type')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                                                <SelectItem key={bt} value={bt}>
                                                    {bt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="marital_status">{t('patients.marital_status', 'Marital Status')}</Label>
                                    <Select
                                        value={formik.values.marital_status || ''}
                                        onValueChange={(val) => formik.setFieldValue('marital_status', val)}
                                    >
                                        <SelectTrigger id="marital_status" className="mt-1">
                                            <SelectValue placeholder={t('common.select', 'Select status')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">{t('patients.single', 'Single')}</SelectItem>
                                            <SelectItem value="married">{t('patients.married', 'Married')}</SelectItem>
                                            <SelectItem value="divorced">{t('patients.divorced', 'Divorced')}</SelectItem>
                                            <SelectItem value="widowed">{t('patients.widowed', 'Widowed')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">{t('patients.notes', 'Medical & General Notes')}</Label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={4}
                                    value={formik.values.notes || ''}
                                    onChange={formik.handleChange}
                                    className="w-full mt-1 p-3 text-sm border rounded-md bg-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                                    placeholder={t('patients.notes_placeholder', 'Add any relevant medical history, allergies, or notes...')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Clinic Custom Fields */}
                    {activeTab === 'custom' && custom_fields.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {custom_fields.map((field) => renderCustomFieldInput(field))}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Link href={`/clinic/${clinicSlug}/patients`}>
                            <Button variant="outline" type="button" className="gap-2">
                                {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                                {t('common.cancel')}
                            </Button>
                        </Link>

                        <div className="flex items-center gap-3">
                            {activeTab !== 'basic' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab(activeTab === 'custom' ? 'emergency' : 'basic')}
                                >
                                    {t('common.previous')}
                                </Button>
                            )}

                            {activeTab !== 'custom' && (custom_fields.length > 0 || activeTab === 'basic') && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setActiveTab(activeTab === 'basic' ? 'emergency' : 'custom')}
                                >
                                    {t('common.next')}
                                </Button>
                            )}

                            <Button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 min-w-[120px]"
                            >
                                {formik.isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {patient ? t('common.save_changes') : t('common.create')}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
