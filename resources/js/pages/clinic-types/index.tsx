import React, { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { ClinicType, ClinicTypeFormValues } from '@/types/clinic-type';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import useImport from '@/hooks/use-import';
import InputError from '@/components/input-error';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Icons
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Building2,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

interface Props {
    clinicTypes?: ClinicType[];
}

export default function ClinicTypesPage({ clinicTypes = [] }: Props) {
    const { t, isRtl } = useImport();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingClinicType, setEditingClinicType] = useState<ClinicType | null>(null);
    const [deletingClinicType, setDeletingClinicType] = useState<ClinicType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        title_ar: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        title_en: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        is_active: Yup.boolean().default(true),
    });

    // Formik for Add/Edit ClinicType
    const formik = useFormik<ClinicTypeFormValues>({
        initialValues: {
            title_ar: editingClinicType?.title_ar || '',
            title_en: editingClinicType?.title_en || '',
            is_active: editingClinicType ? editingClinicType.is_active : true,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (editingClinicType) {
                // Update operation
                router.put(`/admin/clinic-types/${editingClinicType.id}`, values, {
                    onSuccess: () => {
                        toast.success(t('clinic_types.updated_success', 'Clinic type updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating clinic type');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create operation
                router.post('/admin/clinic-types', values, {
                    onSuccess: () => {
                        toast.success(t('clinic_types.created_success', 'Clinic type created successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error creating clinic type');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleOpenAdd = () => {
        setEditingClinicType(null);
        formik.resetForm({
            values: {
                title_ar: '',
                title_en: '',
                is_active: true,
            },
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (type: ClinicType) => {
        setEditingClinicType(type);
        formik.setValues({
            title_ar: type.title_ar,
            title_en: type.title_en,
            is_active: type.is_active,
        });
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingClinicType(null);
        formik.resetForm();
    };

    // Toggle Active Status
    const handleToggleStatus = (type: ClinicType) => {
        router.patch(`/admin/clinic-types/${type.id}/toggle-status`, {}, {
            onSuccess: () => {
                toast.success(t('clinic_types.status_updated', 'Clinic type status updated!'));
            },
            onError: () => {
                toast.error('Failed to update status');
            },
        });
    };

    // Confirm Delete
    const handleDeleteConfirm = () => {
        if (!deletingClinicType) return;
        setIsDeleting(true);

        router.delete(`/admin/clinic-types/${deletingClinicType.id}`, {
            onSuccess: () => {
                toast.success(t('clinic_types.deleted_success', 'Clinic type deleted successfully!'));
                setDeletingClinicType(null);
            },
            onError: () => {
                toast.error('Failed to delete clinic type');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    // Filtering clinic types
    const filteredClinicTypes = clinicTypes.filter((type) => {
        const query = searchTerm.toLowerCase().trim();
        return (
            (type.title_ar && type.title_ar.toLowerCase().includes(query)) ||
            (type.title_en && type.title_en.toLowerCase().includes(query)) ||
            (type.slug && type.slug.toLowerCase().includes(query))
        );
    });

    const activeCount = clinicTypes.filter((t) => t.is_active).length;
    const inactiveCount = clinicTypes.length - activeCount;

    return (
        <AdminLayout title={t('clinic_types.title', 'Clinic Types')}>
            <div className="space-y-6">
                {/* Header Title & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                <Building2 size={22} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t('clinic_types.title', 'Clinic Types')}
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {t('clinic_types.subtitle', 'Manage clinic types, titles in Arabic and English, and active status.')}
                        </p>
                    </div>

                    <Button
                        onClick={handleOpenAdd}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm font-medium rounded-xl h-10 px-4 transition-transform active:scale-95 cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>{t('clinic_types.add_new', 'Add Clinic Type')}</span>
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('clinic_types.total', 'Total Clinic Types')}
                                </p>
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
                                    {clinicTypes.length}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('clinic_types.active_count', 'Active Clinic Types')}
                                </p>
                                <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {activeCount}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                                <CheckCircle2 size={24} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('clinic_types.inactive_count', 'Inactive Clinic Types')}
                                </p>
                                <h3 className="text-2xl font-extrabold text-rose-500 dark:text-rose-400 mt-1">
                                    {inactiveCount}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                                <XCircle size={24} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search
                            size={16}
                            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                                isRtl ? 'right-3' : 'left-3'
                            }`}
                        />
                        <Input
                            placeholder={t('clinic_types.search_placeholder', 'Search clinic types...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-primary`}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>{t('clinic_types.title_ar', 'Arabic Title')}</TableHead>
                            <TableHead>{t('clinic_types.title_en', 'English Title')}</TableHead>
                            <TableHead>{t('clinic_types.slug', 'Slug')}</TableHead>
                            <TableHead>{t('common.status', 'Status')}</TableHead>
                            <TableHead className="text-end">{t('common.actions', 'Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClinicTypes.length > 0 ? (
                            filteredClinicTypes.map((type, idx) => (
                                <TableRow key={type.id}>
                                    <TableCell className="font-semibold text-gray-500">
                                        {idx + 1}
                                    </TableCell>

                                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                                        {type.title_ar || '-'}
                                    </TableCell>

                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {type.title_en || '-'}
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className="bg-secondary text-secondary-foreground font-mono text-[11px]"
                                        >
                                            {type.slug}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={type.is_active}
                                                onCheckedChange={() => handleToggleStatus(type)}
                                            />
                                            <Badge
                                                className={
                                                    type.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                }
                                            >
                                                {type.is_active
                                                    ? t('clinic_types.active', 'Active')
                                                    : t('clinic_types.inactive', 'Inactive')}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-end">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(type)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg"
                                                title={t('clinic_types.edit', 'Edit')}
                                            >
                                                <Pencil size={15} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setDeletingClinicType(type)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                                title={t('clinic_types.delete', 'Delete')}
                                            >
                                                <Trash2 size={15} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Building2 size={32} className="text-gray-300 dark:text-gray-700" />
                                        <span>{t('clinic_types.no_clinic_types', 'No clinic types found.')}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Create / Edit Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {editingClinicType
                                    ? t('clinic_types.edit', 'Edit Clinic Type')
                                    : t('clinic_types.add_new', 'Add Clinic Type')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Fill in clinic type titles in Arabic and English. Form validated with Formik & Yup.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
                            {/* Arabic Title */}
                            <div className="space-y-1.5">
                                <Label htmlFor="title_ar" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('clinic_types.title_ar', 'Arabic Title')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="title_ar"
                                    name="title_ar"
                                    placeholder="مثال: عيادة تخصصية"
                                    dir="rtl"
                                    value={formik.values.title_ar}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary"
                                />
                                {formik.touched.title_ar && formik.errors.title_ar && (
                                    <InputError message={formik.errors.title_ar} />
                                )}
                            </div>

                            {/* English Title */}
                            <div className="space-y-1.5">
                                <Label htmlFor="title_en" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('clinic_types.title_en', 'English Title')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="title_en"
                                    name="title_en"
                                    placeholder="e.g. Specialized Clinic"
                                    dir="ltr"
                                    value={formik.values.title_en}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary"
                                />
                                {formik.touched.title_en && formik.errors.title_en && (
                                    <InputError message={formik.errors.title_en} />
                                )}
                            </div>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinic_types.is_active', 'Active Status')}
                                    </Label>
                                    <p className="text-[11px] text-gray-400">
                                        Active clinic types will be selectable when creating clinics.
                                    </p>
                                </div>
                                <Switch
                                    checked={formik.values.is_active}
                                    onCheckedChange={(checked) => formik.setFieldValue('is_active', checked)}
                                />
                            </div>

                            <DialogFooter className="pt-4 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseModal}
                                    className="rounded-xl border-gray-200 dark:border-gray-800"
                                >
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium"
                                >
                                    {formik.isSubmitting
                                        ? t('common.processing', 'Saving...')
                                        : t('common.save', 'Save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={!!deletingClinicType} onOpenChange={() => setDeletingClinicType(null)}>
                    <DialogContent className="sm:max-w-sm rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-rose-600 dark:text-rose-400">
                                {t('clinic_types.delete', 'Delete Clinic Type')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-600 dark:text-gray-400 pt-2">
                                {t('clinic_types.delete_confirm', 'Are you sure you want to delete this clinic type?')}
                                {deletingClinicType && (
                                    <span className="block font-bold text-gray-900 dark:text-gray-100 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                        {deletingClinicType.title_ar} ({deletingClinicType.title_en})
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingClinicType(null)}
                                className="rounded-xl border-gray-200 dark:border-gray-800"
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={isDeleting}
                                onClick={handleDeleteConfirm}
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                            >
                                {isDeleting ? t('common.processing', 'Deleting...') : t('common.delete', 'Delete')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
