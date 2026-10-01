import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Activity, Pill, PlusCircle, Stethoscope, X } from 'lucide-react';
import useImport from '@/hooks/use-import';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Medication, Visit, VisitField, VisitFormValues } from '@/types';
import useAuthClinics from '@/hooks/use-auth-clinics';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';

interface VisitDialogProps {
    isAddModalOpen: boolean;
    handleCloseModal: () => void;
    editingVisit: Visit | null;
    patient: any;
    medications: Medication[];
    visit_fields?: VisitField[];
}

export default function VisitDialog({
    isAddModalOpen,
    handleCloseModal,
    editingVisit,
    patient,
    medications = [],
    visit_fields = [],
}: VisitDialogProps) {
    const { t } = useImport();
    const { authClinic } = useAuthClinics();
    const [prescriptions, setPrescriptions] = useState<
        Array<{ medication_id?: number | null; medication_name: string }>
    >([]);

    // Sync prescribed medications when modal opens or editingVisit changes
    useEffect(() => {
        if (editingVisit && editingVisit.visit_medications && editingVisit.visit_medications.length > 0) {
            const existingMeds = editingVisit.visit_medications.map((vm) => ({
                medication_id: vm.medication_id || null,
                medication_name: vm.medication_name || '',
            }));
            setPrescriptions(existingMeds);
        } else {
            setPrescriptions([{ medication_id: null, medication_name: '' }]);
        }
    }, [editingVisit, isAddModalOpen]);

    // Build initial custom fields values for Formik
    const initialCustomFields = useMemo(() => {
        const fieldValuesObj: Record<number, any> = {};
        const visitValues = editingVisit?.field_values || (editingVisit as any)?.fieldValues || [];

        visit_fields.forEach((field) => {
            const matchedValue = visitValues.find(
                (fv: any) => fv.visit_field_id === field.id
            );
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
    }, [editingVisit, visit_fields]);

    // Validation Schema
    const validationSchema = useMemo(() => {
        const customFieldSchema: Record<string, any> = {};
        visit_fields.forEach((field) => {
            if (field.is_required) {
                if (field.type === 'checkbox') {
                    customFieldSchema[field.id] = Yup.array().min(
                        1,
                        t('common.required', 'This field is required')
                    );
                } else {
                    customFieldSchema[field.id] = Yup.string().required(
                        t('common.required', 'This field is required')
                    );
                }
            }
        });

        return Yup.object({
            visited_at: Yup.string().required(t('common.required', 'This field is required')),
            type: Yup.string().required(t('common.required', 'This field is required')),
            custom_fields: Yup.object(customFieldSchema),
        });
    }, [visit_fields, t]);

    const formik = useFormik<VisitFormValues>({
        initialValues: {
            visited_at: editingVisit?.visited_at
                ? new Date(editingVisit.visited_at).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16),
            type: editingVisit?.type || 'examination',
            medications: [],
            custom_fields: initialCustomFields,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const clinicSlug = authClinic?.slug;
            if (!clinicSlug || !patient?.id) {
                toast.error('Missing clinic or patient parameters.');
                setSubmitting(false);
                return;
            }

            const payload = {
                ...values,
                medications: prescriptions.filter((p) => p.medication_name.trim() !== ''),
                custom_fields: values.custom_fields,
            };

            if (editingVisit) {
                // Update Visit
                router.put(
                    `/clinic/${clinicSlug}/patients/${patient.id}/visits/${editingVisit.id}`,
                    payload as any,
                    {
                        onSuccess: () => {
                            toast.success(t('visits.updated_success', 'Visit updated successfully!'));
                            handleCloseModal();
                        },
                        onError: (errors) => {
                            toast.error(
                                (Object.values(errors)[0] as string) || 'Error updating visit'
                            );
                        },
                        onFinish: () => setSubmitting(false),
                    }
                );
            } else {
                // Create Visit
                router.post(
                    `/clinic/${clinicSlug}/patients/${patient.id}/visits`,
                    payload as any,
                    {
                        onSuccess: () => {
                            toast.success(t('visits.created_success', 'Visit recorded successfully!'));
                            handleCloseModal();
                            resetForm();
                        },
                        onError: (errors) => {
                            toast.error(
                                (Object.values(errors)[0] as string) || 'Error recording visit'
                            );
                        },
                        onFinish: () => setSubmitting(false),
                    }
                );
            }
        },
    });

    const handleAddPrescriptionRow = () => {
        setPrescriptions((prev) => [...prev, { medication_id: null, medication_name: '' }]);
    };

    const handleRemovePrescriptionRow = (index: number) => {
        setPrescriptions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSelectMedication = (index: number, medicationIdStr: string) => {
        if (medicationIdStr === 'custom') {
            setPrescriptions((prev) => {
                const next = [...prev];
                next[index] = { medication_id: null, medication_name: '' };
                return next;
            });
            return;
        }

        const medId = Number(medicationIdStr);
        const found = medications.find((m: Medication) => m.id === medId);
        if (found) {
            const fullName = `${found.name} ${
                found.strength ? '(' + found.strength + (found.unit || '') + ')' : ''
            }`.trim();
            setPrescriptions((prev) => {
                const next = [...prev];
                next[index] = { medication_id: found.id, medication_name: fullName };
                return next;
            });
        }
    };

    const handleCustomMedNameChange = (index: number, name: string) => {
        setPrescriptions((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], medication_name: name };
            return next;
        });
    };

    const renderCustomFieldInput = (field: VisitField) => {
        const fieldName = `custom_fields.${field.id}`;
        const value =
            formik.values.custom_fields?.[field.id] ??
            (field.type === 'checkbox' ? [] : '');
        const touched = (formik.touched.custom_fields as any)?.[field.id];
        const error = (formik.errors.custom_fields as any)?.[field.id];

        switch (field.type) {
            case 'textarea':
                return (
                    <div key={field.id} className="space-y-1 md:col-span-2">
                        <Label
                            htmlFor={`custom_field_${field.id}`}
                            className="text-xs font-medium flex items-center justify-between"
                        >
                            <span>
                                {field.label}{' '}
                                {field.is_required && <span className="text-red-500">*</span>}
                            </span>
                        </Label>
                        <textarea
                            id={`custom_field_${field.id}`}
                            name={fieldName}
                            rows={2}
                            value={value}
                            onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
                            className="w-full p-2 text-xs border rounded-xl bg-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                            placeholder={field.label}
                        />
                        {touched && error && (
                            <p className="text-xs text-red-500">{String(error)}</p>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.id} className="space-y-1">
                        <Label
                            htmlFor={`custom_field_${field.id}`}
                            className="text-xs font-medium flex items-center justify-between"
                        >
                            <span>
                                {field.label}{' '}
                                {field.is_required && <span className="text-red-500">*</span>}
                            </span>
                            {field.unit && (
                                <span className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                                    {field.unit}
                                </span>
                            )}
                        </Label>
                        <Select
                            value={value || ''}
                            onValueChange={(val) => formik.setFieldValue(fieldName, val)}
                        >
                            <SelectTrigger id={`custom_field_${field.id}`} className="h-9 text-xs rounded-xl">
                                <SelectValue placeholder={t('common.select', 'Select option')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {field.options?.map((opt) => (
                                    <SelectItem key={opt.id || opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {touched && error && (
                            <p className="text-xs text-red-500">{String(error)}</p>
                        )}
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.id} className="space-y-1.5 md:col-span-2">
                        <Label className="text-xs font-medium">
                            {field.label}{' '}
                            {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <div className="flex flex-wrap gap-3 pt-0.5">
                            {field.options?.map((opt) => (
                                <label
                                    key={opt.id || opt.value}
                                    className="flex items-center gap-1.5 text-xs cursor-pointer"
                                >
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
                        {touched && error && (
                            <p className="text-xs text-red-500">{String(error)}</p>
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.id} className="space-y-1.5 md:col-span-2">
                        <Label className="text-xs font-medium">
                            {field.label}{' '}
                            {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <div className="flex flex-wrap gap-3 pt-0.5">
                            {field.options?.map((opt) => {
                                const currentList: string[] = Array.isArray(value) ? value : [];
                                const isChecked = currentList.includes(opt.value);
                                return (
                                    <label
                                        key={opt.id || opt.value}
                                        className="flex items-center gap-1.5 text-xs cursor-pointer"
                                    >
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
                        {touched && error && (
                            <p className="text-xs text-red-500">{String(error)}</p>
                        )}
                    </div>
                );

            case 'date':
                return (
                    <div key={field.id} className="space-y-1">
                        <Label
                            htmlFor={`custom_field_${field.id}`}
                            className="text-xs font-medium"
                        >
                            {field.label}{' '}
                            {field.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            id={`custom_field_${field.id}`}
                            name={fieldName}
                            type="date"
                            value={value}
                            onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
                            className="h-9 text-xs rounded-xl"
                        />
                        {touched && error && (
                            <p className="text-xs text-red-500">{String(error)}</p>
                        )}
                    </div>
                );

            case 'number':
                return (
                    <div key={field.id} className="space-y-1">
                        <Label
                            htmlFor={`custom_field_${field.id}`}
                            className="text-xs font-medium flex items-center justify-between"
                        >
                            <span>
                                {field.label}{' '}
                                {field.is_required && <span className="text-red-500">*</span>}
                            </span>
                            {field.unit && (
                                <span className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                                    {field.unit}
                                </span>
                            )}
                        </Label>
                        <Input
                            id={`custom_field_${field.id}`}
                            name={fieldName}
                            type="number"
                            value={value}
                            onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
                            className="h-9 text-xs rounded-xl"
                            placeholder={field.unit ? `${field.label} (${field.unit})` : field.label}
                        />
                        {touched && error && (
                            <p className="text-xs text-red-500">{String(error)}</p>
                        )}
                    </div>
                );

            case 'text':
            default:
                return (
                    <div key={field.id} className="space-y-1">
                        <Label
                            htmlFor={`custom_field_${field.id}`}
                            className="text-xs font-medium flex items-center justify-between"
                        >
                            <span>
                                {field.label}{' '}
                                {field.is_required && <span className="text-red-500">*</span>}
                            </span>
                            {field.unit && (
                                <span className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                                    {field.unit}
                                </span>
                            )}
                        </Label>
                        <Input
                            id={`custom_field_${field.id}`}
                            name={fieldName}
                            type="text"
                            value={value}
                            onChange={(e) => formik.setFieldValue(fieldName, e.target.value)}
                            className="h-9 text-xs rounded-xl"
                            placeholder={field.unit ? `${field.label} (${field.unit})` : field.label}
                        />
                        {touched && error && (
                            <p className="text-xs text-red-500">{String(error)}</p>
                        )}
                    </div>
                );
        }
    };

    return (
        <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader className="mt-2">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        {editingVisit
                            ? t('visits.edit', 'Edit Visit')
                            : t('visits.add_new', 'Add New Visit')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('visits.subtitle', 'Record clinical details, vital signs, and prescribed medications.')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
                    {/* Basic Visit Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="visited_at" className="text-xs font-medium required">
                                {t('visits.visited_at', 'Visit Date & Time')} *
                            </Label>
                            <Input
                                id="visited_at"
                                name="visited_at"
                                type="datetime-local"
                                value={formik.values.visited_at}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="mt-1 h-9 text-xs rounded-xl"
                            />
                            {formik.touched.visited_at && formik.errors.visited_at && (
                                <InputError message={formik.errors.visited_at} />
                            )}
                        </div>

                        <div>
                            <Label htmlFor="type" className="text-xs font-medium required">
                                {t('visits.type', 'Visit Type')} *
                            </Label>
                            <Select
                                value={formik.values.type}
                                onValueChange={(val) => formik.setFieldValue('type', val)}
                            >
                                <SelectTrigger className="mt-1 h-9 text-xs rounded-xl">
                                    <SelectValue placeholder={t('visits.type', 'Select visit type')} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="examination">
                                        {t('visits.examination', 'Examination / كشف')}
                                    </SelectItem>
                                    <SelectItem value="follow_up">
                                        {t('visits.follow_up', 'Follow-up / إعادة')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Clinical Custom Fields & Vital Signs */}
                    {visit_fields.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="font-semibold text-sm flex items-center gap-1.5">
                                    <Activity className="h-4 w-4 text-primary" />
                                    {t('visits.clinical_fields', 'Clinical Measurements & Findings')}
                                </Label>
                                <span className="text-[11px] text-muted-foreground font-mono">
                                    {visit_fields.length} {t('visits.fields_count', 'fields')}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                {visit_fields.map((field) => renderCustomFieldInput(field))}
                            </div>
                        </div>
                    )}

                    {/* Prescribed Medications */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="font-semibold text-sm flex items-center gap-1.5">
                                <Pill className="h-4 w-4 text-primary" />
                                {t('visits.prescribed_medications', 'Prescribed Medications (الروشتة)')}
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddPrescriptionRow}
                                className="h-8 rounded-lg gap-1 text-xs text-primary border-primary/20 hover:bg-primary/10 cursor-pointer"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                {t('visits.add_medication', 'Add Medication')}
                            </Button>
                        </div>

                        {prescriptions.length === 0 ? (
                            <p className="text-xs text-gray-400 italic text-center py-2">
                                {t('visits.no_medications_added', 'No medications added yet.')}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {prescriptions.map((presc, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800"
                                    >
                                        {medications.length > 0 && (
                                            <div className="w-1/2">
                                                <Select
                                                    value={
                                                        presc.medication_id
                                                            ? String(presc.medication_id)
                                                            : 'custom'
                                                    }
                                                    onValueChange={(val) =>
                                                        handleSelectMedication(idx, val)
                                                    }
                                                >
                                                    <SelectTrigger className="h-9 text-xs rounded-xl">
                                                        <SelectValue
                                                            placeholder={t(
                                                                'visits.select_medication',
                                                                'Select medication...'
                                                            )}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="custom">
                                                            -- {t('visits.custom_name', 'Custom Name')} --
                                                        </SelectItem>
                                                        {medications.map((m: Medication) => (
                                                            <SelectItem key={m.id} value={String(m.id)}>
                                                                {m.name}{' '}
                                                                {m.strength
                                                                    ? `(${m.strength}${m.unit || ''})`
                                                                    : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <Input
                                                placeholder={t(
                                                    'visits.custom_name',
                                                    'Medication Name & Dosage'
                                                )}
                                                value={presc.medication_name}
                                                onChange={(e) =>
                                                    handleCustomMedNameChange(idx, e.target.value)
                                                }
                                                className="h-9 text-xs rounded-xl"
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemovePrescriptionRow(idx)}
                                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg shrink-0 cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseModal}
                            className="rounded-xl h-10 px-4 cursor-pointer"
                        >
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="rounded-xl h-10 px-5 cursor-pointer shadow-xs"
                        >
                            {formik.isSubmitting
                                ? t('common.processing', 'Processing...')
                                : editingVisit
                                ? t('common.save', 'Save Changes')
                                : t('visits.record_visit', 'Record Visit')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
