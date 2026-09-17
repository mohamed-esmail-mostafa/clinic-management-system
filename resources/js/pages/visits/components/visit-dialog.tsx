import React, { useState } from 'react'
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
import { Pill, PlusCircle, Stethoscope, X } from 'lucide-react';
import useImport from '@/hooks/use-import';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { Medication, VisitFormValues } from '@/types';
import useAuthClinics from '@/hooks/use-auth-clinics';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';




export default function VisitDialog({ isAddModalOpen, handleCloseModal, editingVisit, patient, medications }: any) {
    const { t } = useImport()
    const { authClinic } = useAuthClinics()
    const [prescriptions, setPrescriptions] = useState<Array<{ medication_id?: number | null; medication_name: string }>>([]);

    const validationSchema = Yup.object({
        visited_at: Yup.string().required(t('common.required')),
        type: Yup.string().required(t('common.required')),
    });

    const formik = useFormik<VisitFormValues>({
        initialValues: {
            visited_at: editingVisit?.visited_at
                ? new Date(editingVisit.visited_at).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16),
            type: editingVisit?.type || 'examination',
            medications: [],
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (!authClinic.slug || !patient?.id) {
                toast.error('Missing clinic or patient parameters.');
                setSubmitting(false);
                return;
            }

            const payload = {
                ...values,
                medications: prescriptions.filter((p) => p.medication_name.trim() !== ''),
            };

            if (editingVisit) {
                // Update Visit
                router.put(`/clinic/${authClinic.slug}/patients/${patient.id}/visits/${editingVisit.id}`, payload as any, {
                    onSuccess: () => {
                        toast.success(t('visits.updated_success', 'Visit updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating visit');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create Visit
                router.post(`/clinic/${authClinic.slug}/patients/${patient.id}/visits`, payload as any, {
                    onSuccess: () => {
                        toast.success(t('visits.created_success', 'Visit recorded successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error recording visit');
                    },
                    onFinish: () => setSubmitting(false),
                });
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
            const fullName = `${found.name} ${found.strength ? '(' + found.strength + (found.unit || '') + ')' : ''}`.trim();
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

    return (
        <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className='mt-5'>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        {editingVisit ? t('visits.edit', 'Edit Visit') : t('visits.add_new', 'Add New Visit')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('visits.subtitle')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="visited_at" className="required">
                                {t('visits.visited_at')} *
                            </Label>
                            <Input
                                id="visited_at"
                                name="visited_at"
                                type="datetime-local"
                                value={formik.values.visited_at}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="mt-1"
                            />
                            {formik.touched.visited_at && formik.errors.visited_at && (
                                <InputError message={formik.errors.visited_at} />
                            )}
                        </div>

                        <div>
                            <Label htmlFor="type" className="required">
                                {t('visits.type')} *
                            </Label>
                            <Select
                                value={formik.values.type}
                                onValueChange={(val) => formik.setFieldValue('type', val)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={t('visits.type')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="examination">{t('visits.examination')}</SelectItem>
                                    <SelectItem value="follow_up">{t('visits.follow_up')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>


                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="font-semibold text-sm flex items-center gap-1.5">
                                <Pill className="h-4 w-4 text-primary" />
                                {t('visits.prescribed_medications')}
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddPrescriptionRow}

                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                {t('visits.add_medication')}
                            </Button>
                        </div>

                        {prescriptions.length === 0 ? (
                            <p className="text-xs text-gray-400 italic text-center py-2">
                                {t('visits.no_medications_added')}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {prescriptions.map((presc, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border">

                                        {medications.length > 0 && (
                                            <div className="w-1/2">
                                                <Select
                                                    value={presc.medication_id ? String(presc.medication_id) : 'custom'}
                                                    onValueChange={(val) => handleSelectMedication(idx, val)}
                                                >
                                                    <SelectTrigger className="h-9 text-xs">
                                                        <SelectValue placeholder={t('visits.select_medication', 'Select medication...')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="custom">-- Custom Name --</SelectItem>
                                                        {medications.map((m: Medication) => (
                                                            <SelectItem key={m.id} value={String(m.id)}>
                                                                {m.name} {m.strength ? `(${m.strength}${m.unit || ''})` : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}


                                        <div className="flex-1">
                                            <Input
                                                placeholder={t('visits.custom_name', 'Medication Name & Dosage')}
                                                value={presc.medication_name}
                                                onChange={(e) => handleCustomMedNameChange(idx, e.target.value)}
                                                className="h-9 text-xs"
                                            />
                                        </div>


                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemovePrescriptionRow(idx)}
                                            className="h-8 w-8 text-red-500 hover:bg-red-50 shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting
                                ? t('common.processing', 'Processing...')
                                : editingVisit
                                    ? t('common.save')
                                    : t('common.save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
