import useAuthClinics from '@/hooks/use-auth-clinics';
import ClinicLayout from '@/layouts/clinic-layout';
import React, { useState, useMemo } from 'react';
import { Visit, VisitFormValues, VisitMedication } from '@/types/visit';
import { Patient } from '@/types/patient';
import { Medication } from '@/types/medication';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import useImport from '@/hooks/use-import';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Icons
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Stethoscope,
    Calendar,
    Clock,
    Pill,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    FileText,
    AlertCircle,
    User,
    Activity,
    PlusCircle,
    X,
    Share2,
} from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import InputError from '@/components/input-error';
import VisitDialog from './components/visit-dialog';
import VisitsTable from './components/visits-table';
import VisitsStats from './components/visits-stats';
import VisitsFilterSearch from './components/visits-filter-search';

interface Props {
    clinic?: any;
    patient: Patient;
    visits?: Visit[];
    medications?: Medication[];
}

export default function PatientVisitsPage({
    clinic: serverClinic,
    patient,
    visits = [],
    medications = [],
}: Props) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };

    // Clinic slug
    const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
    // const [deletingVisit, setDeletingVisit] = useState<Visit | null>(null);
    // const [isDeleting, setIsDeleting] = useState(false);

    // Dynamic Prescription state for form
    const [prescriptions, setPrescriptions] = useState<
        Array<{ medication_id?: number | null; medication_name: string }>
    >([]);

    // Filter visits
    const filteredVisits = useMemo(() => {
        return visits.filter((visit) => {
            const type = (visit.type || '').toLowerCase();
            const date = (visit.visited_at || '').toLowerCase();
            const medsNames = (visit.visit_medications || [])
                .map((m) => m.medication_name)
                .join(' ')
                .toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch = !search || type.includes(search) || date.includes(search) || medsNames.includes(search);
            const matchesType = typeFilter === 'all' || visit.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [visits, searchTerm, typeFilter]);

    // Statistics
    const stats = useMemo(() => {
        const total = visits.length;
        const examinations = visits.filter((v) => v.type === 'examination').length;
        const followUps = visits.filter((v) => v.type === 'follow_up').length;
        const lastVisitDate = visits.length > 0 ? visits[0].visited_at : null;

        return { total, examinations, followUps, lastVisitDate };
    }, [visits]);

    // Validation Schema
    const validationSchema = Yup.object({
        visited_at: Yup.string().required(t('common.required', 'This field is required')),
        type: Yup.string().required(t('common.required', 'This field is required')),
    });

    // const formik = useFormik<VisitFormValues>({
    //     initialValues: {
    //         visited_at: editingVisit?.visited_at
    //             ? new Date(editingVisit.visited_at).toISOString().slice(0, 16)
    //             : new Date().toISOString().slice(0, 16),
    //         type: editingVisit?.type || 'examination',
    //         medications: [],
    //     },
    //     enableReinitialize: true,
    //     validationSchema,
    //     onSubmit: (values, { setSubmitting, resetForm }) => {
    //         if (!clinicSlug || !patient?.id) {
    //             toast.error('Missing clinic or patient parameters.');
    //             setSubmitting(false);
    //             return;
    //         }

    //         const payload = {
    //             ...values,
    //             medications: prescriptions.filter((p) => p.medication_name.trim() !== ''),
    //         };

    //         if (editingVisit) {
    //             // Update Visit
    //             router.put(`/clinic/${clinicSlug}/patients/${patient.id}/visits/${editingVisit.id}`, payload as any, {
    //                 onSuccess: () => {
    //                     toast.success(t('visits.updated_success', 'Visit updated successfully!'));
    //                     handleCloseModal();
    //                 },
    //                 onError: (errors) => {
    //                     toast.error((Object.values(errors)[0] as string) || 'Error updating visit');
    //                 },
    //                 onFinish: () => setSubmitting(false),
    //             });
    //         } else {
    //             // Create Visit
    //             router.post(`/clinic/${clinicSlug}/patients/${patient.id}/visits`, payload as any, {
    //                 onSuccess: () => {
    //                     toast.success(t('visits.created_success', 'Visit recorded successfully!'));
    //                     handleCloseModal();
    //                     resetForm();
    //                 },
    //                 onError: (errors) => {
    //                     toast.error((Object.values(errors)[0] as string) || 'Error recording visit');
    //                 },
    //                 onFinish: () => setSubmitting(false),
    //             });
    //         }
    //     },
    // });

    const handleOpenAdd = () => {
        setEditingVisit(null);
        setPrescriptions([{ medication_id: null, medication_name: '' }]);
        setIsAddModalOpen(true);
    };

    // const handleOpenEdit = (visit: Visit) => {
    //     setEditingVisit(visit);
    //     const existingMeds = (visit.visit_medications || []).map((vm) => ({
    //         medication_id: vm.medication_id || null,
    //         medication_name: vm.medication_name,
    //     }));
    //     setPrescriptions(existingMeds.length > 0 ? existingMeds : [{ medication_id: null, medication_name: '' }]);
    //     setIsAddModalOpen(true);
    // };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingVisit(null);
        setPrescriptions([]);
        // formik.resetForm();
    };

    // const handleAddPrescriptionRow = () => {
    //     setPrescriptions((prev) => [...prev, { medication_id: null, medication_name: '' }]);
    // };

    // const handleRemovePrescriptionRow = (index: number) => {
    //     setPrescriptions((prev) => prev.filter((_, i) => i !== index));
    // };

    // const handleSelectMedication = (index: number, medicationIdStr: string) => {
    //     if (medicationIdStr === 'custom') {
    //         setPrescriptions((prev) => {
    //             const next = [...prev];
    //             next[index] = { medication_id: null, medication_name: '' };
    //             return next;
    //         });
    //         return;
    //     }

    //     const medId = Number(medicationIdStr);
    //     const found = medications.find((m) => m.id === medId);
    //     if (found) {
    //         const fullName = `${found.name} ${found.strength ? '(' + found.strength + (found.unit || '') + ')' : ''}`.trim();
    //         setPrescriptions((prev) => {
    //             const next = [...prev];
    //             next[index] = { medication_id: found.id, medication_name: fullName };
    //             return next;
    //         });
    //     }
    // };

    // const handleCustomMedNameChange = (index: number, name: string) => {
    //     setPrescriptions((prev) => {
    //         const next = [...prev];
    //         next[index] = { ...next[index], medication_name: name };
    //         return next;
    //     });
    // };

    // const handleDelete = () => {
    //     if (!deletingVisit || !clinicSlug || !patient?.id) return;

    //     setIsDeleting(true);
    //     router.delete(`/clinic/${clinicSlug}/patients/${patient.id}/visits/${deletingVisit.id}`, {
    //         onSuccess: () => {
    //             toast.success(t('visits.deleted_success', 'Visit record deleted successfully!'));
    //             setDeletingVisit(null);
    //         },
    //         onError: () => {
    //             toast.error('Failed to delete visit');
    //         },
    //         onFinish: () => setIsDeleting(false),
    //     });
    // };

    //     const handleShareWhatsApp = (visit: Visit) => {
    //         const rawPhone = patient.phone || patient.secondary_phone;
    //         if (!rawPhone || !rawPhone.trim()) {
    //             toast.error(t('visits.no_phone_error', 'Patient phone number is not available for WhatsApp sharing.'));
    //             return;
    //         }

    //         let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    //         if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
    //             cleanPhone = '2' + cleanPhone;
    //         }

    //         const clinicName = serverClinic?.name || 'Medical Clinic';
    //         const patientName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
    //         const visitTypeStr = visit.type === 'examination' ? 'كشف / Examination' : 'إعادة / Follow-up';
    //         const visitDateStr = new Date(visit.visited_at).toLocaleString();

    //         const medsList = (visit.visit_medications || [])
    //             .map((m, i) => `${i + 1}. ${m.medication_name}`)
    //             .join('\n');

    //         const message = `🏥 *${clinicName}*
    // ------------------------------
    // 👤 *المريض / Patient:* ${patientName}
    // 📋 *نوع الزيارة / Visit Type:* ${visitTypeStr}
    // 📅 *التاريخ / Date:* ${visitDateStr}

    // 💊 *الروشتة والأدوية الموصوفة / Prescribed Medications:*
    // ${medsList || 'لا توجد أدوية موصوفة / No medications prescribed'}

    // ✨ *مع تمنياتنا بالشفاء العاجل! / Get well soon!*`;

    //         const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    //         window.open(whatsappUrl, '_blank');
    //     };

    const patientFullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();

    return (
        <ClinicLayout title={`${t('visits.title', 'Visits')} - ${patientFullName}`}>
            <div className="space-y-6">


                <PageHeader icon={<Stethoscope className="h-7 w-7 text-primary" />} title={`${patientFullName} - ${patient.patient_number}`}
                    subtitle={t('visits.subtitle')}
                >
                    <div className='flex gap-4 items-center'>
                        <Link
                            href={`/clinic/${clinicSlug}/patients`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-primary hover:underline mb-2"
                        >
                            {isRtl ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                            {t('visits.back_to_patients', 'Back to Patients')}
                        </Link>

                        <Button
                            onClick={handleOpenAdd}

                        >
                            <Plus className="h-4 w-4" />
                            {t('visits.add_new', 'Add New Visit')}
                        </Button>
                    </div>
                </PageHeader>

                <VisitsStats stats={stats} />



                <VisitsFilterSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter} />

                {/* Visits List */}
                {/* <div className="space-y-4">
                    {filteredVisits.length === 0 ? (
                        <Card className="border-gray-200 dark:border-gray-800 shadow-xs text-center py-12">
                            <CardContent>
                                <Stethoscope className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                    {t('visits.no_visits', 'No visits recorded for this patient yet.')}
                                </p>
                                <Button onClick={handleOpenAdd} variant="outline" className="mt-4 gap-2">
                                    <Plus className="h-4 w-4" />
                                    {t('visits.add_new', 'Record First Visit')}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredVisits.map((visit) => {
                            const isExamination = visit.type === 'examination';
                            const meds = visit.visit_medications || [];

                            return (
                                <Card
                                    key={visit.id}
                                    className="border-gray-200 dark:border-gray-800 shadow-xs hover:border-orange-300 dark:hover:border-orange-900 transition-colors"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${isExamination
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                            : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                                        }`}
                                                >
                                                    <Stethoscope className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            className={
                                                                isExamination
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100'
                                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-100'
                                                            }
                                                        >
                                                            {isExamination
                                                                ? t('visits.examination', 'Examination / كشف')
                                                                : t('visits.follow_up', 'Follow-up / إعادة')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                        {new Date(visit.visited_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleShareWhatsApp(visit)}
                                                    className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1.5 font-medium"
                                                    title={t('visits.share_whatsapp', 'Share via WhatsApp')}
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                    {t('visits.whatsapp', 'WhatsApp')}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(visit)}
                                                    className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 gap-1.5"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    {t('common.edit', 'Edit')}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeletingVisit(visit)}
                                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {t('common.delete', 'Delete')}
                                                </Button>
                                            </div>
                                        </div>

                                
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <Pill className="h-3.5 w-3.5 text-orange-500" />
                                                {t('visits.prescribed_medications', 'Prescribed Medications (الروشتة)')} ({meds.length})
                                            </h4>
                                            {meds.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic">No medications prescribed for this visit.</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {meds.map((vm, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="secondary"
                                                            className="bg-orange-50 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 text-xs py-1 px-2.5 font-medium flex items-center gap-1.5"
                                                        >
                                                            <Pill className="h-3 w-3 text-orange-500" />
                                                            {vm.medication_name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div> */}
                <VisitsTable
                    filteredVisits={filteredVisits}
                    handleOpenAdd={handleOpenAdd}
                    setPrescriptions={setPrescriptions}
                    setIsAddModalOpen={setIsAddModalOpen}
                    patient={patient}
                />
            </div>

            {/* Create / Edit Visit Modal */}
            {/* <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
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
                                                            {medications.map((m) => (
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
            </Dialog> */}

            <VisitDialog isAddModalOpen={isAddModalOpen} handleCloseModal={handleCloseModal} editingVisit={editingVisit} patient={patient} medications={medications} />

            {/* Delete Confirmation Dialog */}
            {/* <Dialog open={Boolean(deletingVisit)} onOpenChange={() => setDeletingVisit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            {t('visits.delete', 'Delete Visit Record')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('visits.delete_confirm', 'Are you sure you want to delete this visit record?')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeletingVisit(null)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('common.processing', 'Deleting...') : t('common.delete', 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </ClinicLayout>
    );
}
