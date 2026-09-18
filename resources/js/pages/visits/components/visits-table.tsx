import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import useAuthClinics from '@/hooks/use-auth-clinics';
import useImport from '@/hooks/use-import';
import { Visit } from '@/types';
import { AlertCircle, Clock, Download, ExternalLink, Eye, MoreHorizontal, FileImage, Loader2, Pencil, Pill, Plus, Share2, Stethoscope, Trash2 } from 'lucide-react';
import React, { useState, useRef } from 'react'
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import VisitPrescription from './visit-prescription';
import { toPng } from 'html-to-image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';



export default function VisitsTable({ filteredVisits, handleOpenAdd, setPrescriptions, setIsAddModalOpen, patient }: any) {
    const { t } = useImport()
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
    const [deletingVisit, setDeletingVisit] = useState<Visit | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { authClinic } = useAuthClinics()
    const prescriptionRef = useRef<HTMLDivElement>(null);
    const [prescriptionVisit, setPrescriptionVisit] = useState<Visit | null>(null);
    const [generatingVisitId, setGeneratingVisitId] = useState<number | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);


    const handleShareWhatsApp = async (visit: Visit) => {
        const rawPhone = patient.phone || patient.secondary_phone;
        if (!rawPhone || !rawPhone.trim()) {
            toast.error(t('visits.no_phone_error', 'Patient phone number is not available for WhatsApp sharing.'));
            return;
        }

        let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
            cleanPhone = '2' + cleanPhone;
        }

        let imageUrl = visit.image_url;

        if (!imageUrl) {
            imageUrl = await generateAndUploadPrescription(visit);
        }

        const clinicName = authClinic?.name || 'Medical Clinic';
        const patientName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
        const visitTypeStr = visit.type === 'examination' ? 'كشف / Examination' : 'إعادة / Follow-up';
        const visitDateStr = new Date(visit.visited_at).toLocaleString();

        const medsList = (visit.visit_medications || [])
            .map((m, i) => `${i + 1}. ${m.medication_name}`)
            .join('\n');

        const prescriptionImageSection = imageUrl
            ? `\n📄 *رابط صورة الروشتة / Prescription Image:*\n${imageUrl}\n`
            : '';

        const message = `🏥 *${clinicName}*
------------------------------
👤 *المريض / Patient:* ${patientName}
📋 *نوع الزيارة / Visit Type:* ${visitTypeStr}
📅 *التاريخ / Date:* ${visitDateStr}

💊 *الروشتة والأدوية الموصوفة / Prescribed Medications:*
${medsList || 'لا توجد أدوية موصوفة / No medications prescribed'}
${prescriptionImageSection}
✨ *مع تمنياتنا بالشفاء العاجل! / Get well soon!*`;

        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };


    const generateAndUploadPrescription = async (visit: Visit) => {
        try {
            setGeneratingVisitId(visit.id);
            setPrescriptionVisit(visit);

            // Wait for DOM to render the prescription template
            await new Promise((resolve) => setTimeout(resolve, 150));

            if (!prescriptionRef.current) {
                toast.error(t('visits.prescription_not_found', 'Prescription template not found'));
                return null;
            }

            const toastId = toast.loading(
                t('visits.generating_prescription', 'Generating prescription image and uploading to Cloudinary...')
            );

            const dataUrl = await toPng(prescriptionRef.current, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                cacheBust: true,
            });

            const clinicParam = authClinic?.slug || authClinic?.id;

            const response = await fetch(
                `/clinic/${clinicParam}/patients/${patient.id}/visits/${visit.id}/prescription-image`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        image: dataUrl,
                    }),
                }
            );

            const result = await response.json();

            toast.dismiss(toastId);

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to upload prescription');
            }

            toast.success(
                t('visits.prescription_generated', 'Prescription image generated and saved successfully!')
            );

            router.reload({ only: ['visits'] });

            return result.url;
        } catch (error: any) {
            toast.dismiss();
            console.error(error);
            toast.error(
                error?.message ||
                t('visits.prescription_generate_error', 'Failed to generate prescription image.')
            );
            return null;
        } finally {
            setGeneratingVisitId(null);
        }
    };


    const handleOpenEdit = (visit: Visit) => {
        setEditingVisit(visit);
        const existingMeds = (visit.visit_medications || []).map((vm) => ({
            medication_id: vm.medication_id || null,
            medication_name: vm.medication_name,
        }));
        setPrescriptions(existingMeds.length > 0 ? existingMeds : [{ medication_id: null, medication_name: '' }]);
        setIsAddModalOpen(true);
    };


    const handleDelete = () => {
        if (!deletingVisit || !authClinic.slug || !patient?.id) return;

        setIsDeleting(true);
        router.delete(`/clinic/${authClinic.slug}/patients/${patient.id}/visits/${deletingVisit.id}`, {
            onSuccess: () => {
                toast.success(t('visits.deleted_success', 'Visit record deleted successfully!'));
                setDeletingVisit(null);
            },
            onError: () => {
                toast.error('Failed to delete visit');
            },
            onFinish: () => setIsDeleting(false),
        });
    };
    return (
        <>
            <div className="space-y-4">
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
                    filteredVisits.map((visit: Visit) => {
                        const isExamination = visit.type === 'examination';
                        const meds = visit.visit_medications || [];

                        return (
                            <Card
                                key={visit.id}
                                className="border-gray-200 dark:border-gray-800 shadow-xs hover:border-orange-300 dark:hover:border-orange-900 transition-colors"
                            >
                                <CardContent className="p-5">
                                    <div className="flex md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
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

                                        {/* <div className="flex items-center gap-2">
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
                                                {t('common.edit')}
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


                                            {visit.image_url && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setPreviewImageUrl(visit.image_url || null)}
                                                    className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1.5 font-medium"
                                                    title={t('visits.view_prescription', 'View Prescription')}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    {t('visits.view_prescription', 'View Prescription')}
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => generateAndUploadPrescription(visit)}
                                                disabled={generatingVisitId === visit.id}
                                                className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1.5"
                                            >
                                                {generatingVisitId === visit.id ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        {t('visits.generating', 'Generating...')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileImage className="h-4 w-4" />
                                                        {visit.image_url
                                                            ? t('visits.regenerate_prescription', 'Regenerate')
                                                            : t('visits.generate_prescription', 'Generate Prescription')}
                                                    </>
                                                )}
                                            </Button>
                                        </div> */}


                                        <div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="default"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            {t('common.actions', 'Actions')}
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end" className="w-52">

                                                    {/* WhatsApp */}
                                                    <DropdownMenuItem
                                                        onClick={() => handleShareWhatsApp(visit)}
                                                        className="text-emerald-600 focus:text-emerald-600"
                                                    >
                                                        <Share2 className="h-4 w-4 mr-2" />
                                                        {t('visits.whatsapp', 'WhatsApp')}
                                                    </DropdownMenuItem>

                                                    {/* Edit */}
                                                    <DropdownMenuItem
                                                        onClick={() => handleOpenEdit(visit)}
                                                        className="text-amber-600 focus:text-amber-600"
                                                    >
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        {t('common.edit')}
                                                    </DropdownMenuItem>

                                                    {/* View Prescription */}
                                                    {visit.image_url && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setPreviewImageUrl(visit.image_url || null)
                                                            }
                                                            className="text-emerald-600 focus:text-emerald-600"
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            {t(
                                                                'visits.view_prescription',
                                                                'View Prescription'
                                                            )}
                                                        </DropdownMenuItem>
                                                    )}

                                                    {/* Generate / Regenerate Prescription */}
                                                    <DropdownMenuItem
                                                        onClick={() => generateAndUploadPrescription(visit)}
                                                        disabled={generatingVisitId === visit.id}
                                                        className="text-blue-600 focus:text-blue-600"
                                                    >
                                                        {generatingVisitId === visit.id ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                {t('visits.generating', 'Generating...')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FileImage className="h-4 w-4 mr-2" />
                                                                {visit.image_url
                                                                    ? t(
                                                                        'visits.regenerate_prescription',
                                                                        'Regenerate'
                                                                    )
                                                                    : t(
                                                                        'visits.generate_prescription',
                                                                    )}
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>

                                                    {/* Delete */}
                                                    <DropdownMenuItem
                                                        onClick={() => setDeletingVisit(visit)}
                                                        className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/40"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {t('common.delete', 'Delete')}
                                                    </DropdownMenuItem>

                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Prescribed Medications */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Pill className="h-3.5 w-3.5 text-orange-500" />
                                            {t('visits.prescribed_medications', 'Prescribed Medications (الروشتة)')} ({meds.length})
                                        </h4>
                                        {meds.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">No medications prescribed for this visit.</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {meds.map((vm: any, idx: any) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="secondary"
                                                        className="bg-orange-50 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 text-xs py-1 px-2.5 font-medium flex items-center gap-1.5"
                                                    >
                                                        <Pill className="h-3 w-3 text-primary" />
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
            </div>

            <Dialog open={Boolean(deletingVisit)} onOpenChange={() => setDeletingVisit(null)}>
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
            </Dialog>

            {/* Prescription Preview Modal */}
            <Dialog open={Boolean(previewImageUrl)} onOpenChange={() => setPreviewImageUrl(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-4">
                    <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <FileImage className="h-5 w-5 text-blue-600" />
                            {t('visits.prescription_preview', 'Prescription Image')}
                        </DialogTitle>
                        {previewImageUrl && (
                            <div className="flex items-center gap-2 mr-6">
                                <a
                                    href={previewImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    {t('common.open', 'Open in new tab')}
                                </a>
                                <a
                                    href={previewImageUrl}
                                    download="prescription.webp"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1.5 rounded-md"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    {t('common.download', 'Download')}
                                </a>
                            </div>
                        )}
                    </DialogHeader>
                    <div className="flex-1 overflow-auto py-2 flex justify-center bg-slate-100 dark:bg-slate-900 rounded-lg">
                        {previewImageUrl && (
                            <img
                                src={previewImageUrl}
                                alt="Prescription"
                                className="max-w-full h-auto rounded-md shadow-md object-contain"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Off-screen Prescription Template for html-to-image capture */}
            <div
                className="fixed -left-[9999px] top-0 pointer-events-none z-[-100]"
                aria-hidden="true"
            >
                <div ref={prescriptionRef} className="bg-white">
                    {prescriptionVisit && (
                        <VisitPrescription
                            clinic={authClinic}
                            patient={patient}
                            visit={prescriptionVisit}
                        />
                    )}
                </div>
            </div>
        </>
    )
}
