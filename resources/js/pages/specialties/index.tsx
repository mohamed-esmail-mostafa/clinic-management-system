import React, { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Specialty, SpecialtyFormValues } from '@/types/specialty';
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
    Stethoscope,
    CheckCircle2,
    XCircle,
    Activity,
} from 'lucide-react';

interface Props {
    specialties: Specialty[];
}

export default function SpecialtiesPage({ specialties = [] }: Props) {
    const { t, isRtl } = useImport();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
    const [deletingSpecialty, setDeletingSpecialty] = useState<Specialty | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        name_ar: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        name_en: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        description_ar: Yup.string().nullable(),
        description_en: Yup.string().nullable(),
        is_active: Yup.boolean().default(true),
    });

    // Formik for Add/Edit Specialty
    const formik = useFormik<SpecialtyFormValues>({
        initialValues: {
            name_ar: editingSpecialty?.name_ar || '',
            name_en: editingSpecialty?.name_en || '',
            description_ar: editingSpecialty?.description_ar || '',
            description_en: editingSpecialty?.description_en || '',
            is_active: editingSpecialty ? editingSpecialty.is_active : true,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (editingSpecialty) {
                // Update operation
                router.put(`/admin/specialties/${editingSpecialty.id}`, values, {
                    onSuccess: () => {
                        toast.success(t('specialties.updated_success', 'Specialty updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating specialty');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create operation
                router.post('/admin/specialties', values, {
                    onSuccess: () => {
                        toast.success(t('specialties.created_success', 'Specialty created successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error creating specialty');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleOpenAdd = () => {
        setEditingSpecialty(null);
        formik.resetForm({
            values: {
                name_ar: '',
                name_en: '',
                description_ar: '',
                description_en: '',
                is_active: true,
            },
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (specialty: Specialty) => {
        setEditingSpecialty(specialty);
        formik.setValues({
            name_ar: specialty.name_ar,
            name_en: specialty.name_en,
            description_ar: specialty.description_ar || '',
            description_en: specialty.description_en || '',
            is_active: specialty.is_active,
        });
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingSpecialty(null);
        formik.resetForm();
    };

    // Toggle Active Status
    const handleToggleStatus = (specialty: Specialty) => {
        router.patch(`/admin/specialties/${specialty.id}/toggle-status`, {}, {
            onSuccess: () => {
                toast.success(t('specialties.status_updated', 'Specialty status updated!'));
            },
            onError: () => {
                toast.error('Failed to update status');
            },
        });
    };

    // Confirm Delete
    const handleDeleteConfirm = () => {
        if (!deletingSpecialty) return;
        setIsDeleting(true);

        router.delete(`/admin/specialties/${deletingSpecialty.id}`, {
            onSuccess: () => {
                toast.success(t('specialties.deleted_success', 'Specialty deleted successfully!'));
                setDeletingSpecialty(null);
            },
            onError: () => {
                toast.error('Failed to delete specialty');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    // Filtering specialties
    const filteredSpecialties = specialties.filter((s) => {
        const query = searchTerm.toLowerCase().trim();
        return (
            s.name_ar.toLowerCase().includes(query) ||
            s.name_en.toLowerCase().includes(query) ||
            s.slug.toLowerCase().includes(query)
        );
    });

    const activeCount = specialties.filter((s) => s.is_active).length;
    const inactiveCount = specialties.length - activeCount;

    return (
        <AdminLayout title={t('specialties.title', 'Medical Specialties')}>
            <div className="space-y-6">
                {/* Header Title & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
                                <Stethoscope size={22} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t('specialties.title', 'Medical Specialties')}
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {t('specialties.subtitle', 'Manage medical specialties, descriptions, and active status.')}
                        </p>
                    </div>

                    <Button
                        onClick={handleOpenAdd}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm font-medium rounded-xl h-10 px-4 transition-transform active:scale-95 cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>{t('specialties.add_new', 'Add Specialty')}</span>
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('specialties.total', 'Total Specialties')}
                                </p>
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
                                    {specialties.length}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                                <Stethoscope size={24} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('specialties.active_count', 'Active Specialties')}
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
                                    {t('specialties.inactive_count', 'Inactive Specialties')}
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
                            placeholder={t('specialties.search_placeholder', 'Search specialties...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-orange-500`}
                        />
                    </div>
                </div>

                {/* Specialties Data Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>{t('specialties.name_ar', 'Arabic Name')}</TableHead>
                            <TableHead>{t('specialties.name_en', 'English Name')}</TableHead>
                            <TableHead>{t('specialties.slug', 'Slug')}</TableHead>
                            <TableHead>{t('common.status', 'Status')}</TableHead>
                            <TableHead className="text-end">{t('common.actions', 'Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSpecialties.length > 0 ? (
                            filteredSpecialties.map((specialty, idx) => (
                                <TableRow key={specialty.id}>
                                    <TableCell className="font-semibold text-gray-500">
                                        {idx + 1}
                                    </TableCell>

                                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                                        <div>
                                            <span>{specialty.name_ar}</span>
                                            {specialty.description_ar && (
                                                <p className="text-xs font-normal text-gray-400 line-clamp-1 mt-0.5">
                                                    {specialty.description_ar}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        <div>
                                            <span>{specialty.name_en}</span>
                                            {specialty.description_en && (
                                                <p className="text-xs font-normal text-gray-400 line-clamp-1 mt-0.5">
                                                    {specialty.description_en}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/50 font-mono text-[11px]"
                                        >
                                            {specialty.slug}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={specialty.is_active}
                                                onCheckedChange={() => handleToggleStatus(specialty)}
                                            />
                                            <Badge
                                                className={
                                                    specialty.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                }
                                            >
                                                {specialty.is_active
                                                    ? t('specialties.active', 'Active')
                                                    : t('specialties.inactive', 'Inactive')}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-end">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(specialty)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg"
                                                title={t('specialties.edit', 'Edit')}
                                            >
                                                <Pencil size={15} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setDeletingSpecialty(specialty)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                                title={t('specialties.delete', 'Delete')}
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
                                        <Stethoscope size={32} className="text-gray-300 dark:text-gray-700" />
                                        <span>{t('specialties.no_specialties', 'No specialties found.')}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Create / Edit Specialty Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {editingSpecialty
                                    ? t('specialties.edit', 'Edit Specialty')
                                    : t('specialties.add_new', 'Add Specialty')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Fill in medical specialty details. Form validated with Formik & Yup.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
                            {/* Arabic Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name_ar" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('specialties.name_ar', 'Arabic Name')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="name_ar"
                                    name="name_ar"
                                    placeholder="مثال: طب الأسنان"
                                    dir="rtl"
                                    value={formik.values.name_ar}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                />
                                {formik.touched.name_ar && formik.errors.name_ar && (
                                    <InputError message={formik.errors.name_ar} />
                                )}
                            </div>

                            {/* English Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name_en" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('specialties.name_en', 'English Name')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="name_en"
                                    name="name_en"
                                    placeholder="e.g. Dentistry"
                                    dir="ltr"
                                    value={formik.values.name_en}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                />
                                {formik.touched.name_en && formik.errors.name_en && (
                                    <InputError message={formik.errors.name_en} />
                                )}
                            </div>

                            {/* Arabic Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description_ar" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('specialties.description_ar', 'Arabic Description')}
                                </Label>
                                <Input
                                    id="description_ar"
                                    name="description_ar"
                                    placeholder="وصف مختصر بالتخصص باللغة العربية..."
                                    dir="rtl"
                                    value={formik.values.description_ar}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                />
                            </div>

                            {/* English Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description_en" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('specialties.description_en', 'English Description')}
                                </Label>
                                <Input
                                    id="description_en"
                                    name="description_en"
                                    placeholder="Brief description of the specialty in English..."
                                    dir="ltr"
                                    value={formik.values.description_en}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                />
                            </div>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('specialties.is_active', 'Active Status')}
                                    </Label>
                                    <p className="text-[11px] text-gray-400">
                                        Active specialties will be available for clinic selection.
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
                                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium"
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
                <Dialog open={!!deletingSpecialty} onOpenChange={() => setDeletingSpecialty(null)}>
                    <DialogContent className="sm:max-w-sm rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-rose-600 dark:text-rose-400">
                                {t('specialties.delete', 'Delete Specialty')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-600 dark:text-gray-400 pt-2">
                                {t('specialties.delete_confirm', 'Are you sure you want to delete this specialty?')}
                                {deletingSpecialty && (
                                    <span className="block font-bold text-gray-900 dark:text-gray-100 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                        {deletingSpecialty.name_ar} ({deletingSpecialty.name_en})
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingSpecialty(null)}
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
