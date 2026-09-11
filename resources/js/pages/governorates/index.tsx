import React, { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Governorate, GovernorateFormValues } from '@/types/governorate';
import { Country } from '@/types/country';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    MapPin,
    CheckCircle2,
    XCircle,
    Building2,
    Globe,
} from 'lucide-react';

interface Props {
    governorates: Governorate[];
    countries: Country[];
}

export default function GovernoratesPage({ governorates = [], countries = [] }: Props) {
    const { t, isRtl } = useImport();
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingGovernorate, setEditingGovernorate] = useState<Governorate | null>(null);
    const [deletingGovernorate, setDeletingGovernorate] = useState<Governorate | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        country_id: Yup.mixed()
            .required(t('common.required', 'This field is required')),
        name_ar: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        name_en: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        is_active: Yup.boolean().default(true),
    });

    // Formik for Add/Edit Governorate
    const formik = useFormik<GovernorateFormValues>({
        initialValues: {
            country_id: editingGovernorate?.country_id || '',
            name_ar: editingGovernorate?.name_ar || '',
            name_en: editingGovernorate?.name_en || '',
            is_active: editingGovernorate ? editingGovernorate.is_active : true,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const payload = {
                ...values,
                country_id: Number(values.country_id),
            };

            if (editingGovernorate) {
                // Update operation
                router.put(`/admin/governorates/${editingGovernorate.id}`, payload, {
                    onSuccess: () => {
                        toast.success(t('governorates.updated_success', 'Governorate updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating governorate');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create operation
                router.post('/admin/governorates', payload, {
                    onSuccess: () => {
                        toast.success(t('governorates.created_success', 'Governorate created successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error creating governorate');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleOpenAdd = () => {
        setEditingGovernorate(null);
        formik.resetForm({
            values: {
                country_id: countries.length > 0 ? countries[0].id : '',
                name_ar: '',
                name_en: '',
                is_active: true,
            },
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (governorate: Governorate) => {
        setEditingGovernorate(governorate);
        formik.setValues({
            country_id: governorate.country_id,
            name_ar: governorate.name_ar,
            name_en: governorate.name_en,
            is_active: governorate.is_active,
        });
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingGovernorate(null);
        formik.resetForm();
    };

    // Toggle Active Status
    const handleToggleStatus = (governorate: Governorate) => {
        router.patch(`/admin/governorates/${governorate.id}/toggle-status`, {}, {
            onSuccess: () => {
                toast.success(t('governorates.status_updated', 'Governorate status updated!'));
            },
            onError: () => {
                toast.error('Failed to update status');
            },
        });
    };

    // Confirm Delete
    const handleDeleteConfirm = () => {
        if (!deletingGovernorate) return;
        setIsDeleting(true);

        router.delete(`/admin/governorates/${deletingGovernorate.id}`, {
            onSuccess: () => {
                toast.success(t('governorates.deleted_success', 'Governorate deleted successfully!'));
                setDeletingGovernorate(null);
            },
            onError: () => {
                toast.error('Failed to delete governorate');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    // Filtering governorates
    const filteredGovernorates = governorates.filter((g) => {
        const query = searchTerm.toLowerCase().trim();
        const matchesQuery =
            g.name_ar.toLowerCase().includes(query) ||
            g.name_en.toLowerCase().includes(query) ||
            (g.country && (g.country.name_ar.toLowerCase().includes(query) || g.country.name_en.toLowerCase().includes(query)));
        const matchesCountry = countryFilter === 'all' || String(g.country_id) === countryFilter;
        return matchesQuery && matchesCountry;
    });

    const activeCount = governorates.filter((g) => g.is_active).length;
    const inactiveCount = governorates.length - activeCount;

    return (
        <AdminLayout title={t('governorates.title', 'Governorates Management')}>
            <div className="space-y-6">
                {/* Header Title & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
                                <MapPin size={22} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t('governorates.title', 'Governorates Management')}
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {t('governorates.subtitle', 'Manage governorates/states under each country.')}
                        </p>
                    </div>

                    <Button
                        onClick={handleOpenAdd}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm font-medium rounded-xl h-10 px-4 transition-transform active:scale-95 cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>{t('governorates.add_new', 'Add Governorate')}</span>
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('governorates.total', 'Total Governorates')}
                                </p>
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
                                    {governorates.length}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                                <MapPin size={24} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('governorates.active_count', 'Active Governorates')}
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
                                    {t('governorates.inactive_count', 'Inactive Governorates')}
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
                            placeholder={t('governorates.search_placeholder', 'Search governorates...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-orange-500`}
                        />
                    </div>

                    <div className="w-full sm:w-60">
                        <Select value={countryFilter} onValueChange={setCountryFilter}>
                            <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder={t('governorates.select_country', 'Select Country')} />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900">
                                <SelectItem value="all">
                                    {t('governorates.select_country', 'All Countries')}
                                </SelectItem>
                                {countries.map((country) => (
                                    <SelectItem key={country.id} value={String(country.id)}>
                                        {isRtl ? country.name_ar : country.name_en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Governorates Data Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>{t('governorates.name_ar', 'Arabic Name')}</TableHead>
                            <TableHead>{t('governorates.name_en', 'English Name')}</TableHead>
                            <TableHead>{t('governorates.country', 'Country')}</TableHead>
                            <TableHead>{t('governorates.cities_count', 'Cities')}</TableHead>
                            <TableHead>{t('common.status', 'Status')}</TableHead>
                            <TableHead className="text-end">{t('common.actions', 'Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredGovernorates.length > 0 ? (
                            filteredGovernorates.map((gov, idx) => (
                                <TableRow key={gov.id}>
                                    <TableCell className="font-semibold text-gray-500">
                                        {idx + 1}
                                    </TableCell>

                                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                                        {gov.name_ar}
                                    </TableCell>

                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {gov.name_en}
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/50 gap-1.5"
                                        >
                                            <Globe size={12} />
                                            <span>{gov.country ? (isRtl ? gov.country.name_ar : gov.country.name_en) : '—'}</span>
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                            <Building2 size={14} className="text-orange-500" />
                                            <span>{gov.cities_count ?? 0}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={gov.is_active}
                                                onCheckedChange={() => handleToggleStatus(gov)}
                                            />
                                            <Badge
                                                className={
                                                    gov.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                }
                                            >
                                                {gov.is_active
                                                    ? t('governorates.active', 'Active')
                                                    : t('governorates.inactive', 'Inactive')}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-end">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(gov)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg"
                                                title={t('governorates.edit', 'Edit')}
                                            >
                                                <Pencil size={15} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setDeletingGovernorate(gov)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                                title={t('governorates.delete', 'Delete')}
                                            >
                                                <Trash2 size={15} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <MapPin size={32} className="text-gray-300 dark:text-gray-700" />
                                        <span>{t('governorates.no_governorates', 'No governorates found.')}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Create / Edit Governorate Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {editingGovernorate
                                    ? t('governorates.edit', 'Edit Governorate')
                                    : t('governorates.add_new', 'Add Governorate')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Fill in governorate details. Form validated with Formik & Yup.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
                            {/* Country Dropdown */}
                            <div className="space-y-1.5">
                                <Label htmlFor="country_id" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('governorates.country', 'Country')} <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={String(formik.values.country_id)}
                                    onValueChange={(val) => formik.setFieldValue('country_id', val)}
                                >
                                    <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500">
                                        <SelectValue placeholder={t('governorates.select_country', 'Select Country')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-900">
                                        {countries.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {isRtl ? c.name_ar : c.name_en} ({c.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formik.touched.country_id && formik.errors.country_id && (
                                    <InputError message={String(formik.errors.country_id)} />
                                )}
                            </div>

                            {/* Arabic Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name_ar" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('governorates.name_ar', 'Arabic Name')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="name_ar"
                                    name="name_ar"
                                    placeholder="مثال: القاهرة"
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
                                    {t('governorates.name_en', 'English Name')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="name_en"
                                    name="name_en"
                                    placeholder="e.g. Cairo"
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

                            {/* Active Switch */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('governorates.is_active', 'Active Status')}
                                    </Label>
                                    <p className="text-[11px] text-gray-400">
                                        Active governorates will be available for selection.
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
                <Dialog open={!!deletingGovernorate} onOpenChange={() => setDeletingGovernorate(null)}>
                    <DialogContent className="sm:max-w-sm rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-rose-600 dark:text-rose-400">
                                {t('governorates.delete', 'Delete Governorate')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-600 dark:text-gray-400 pt-2">
                                {t('governorates.delete_confirm', 'Are you sure you want to delete this governorate?')}
                                {deletingGovernorate && (
                                    <span className="block font-bold text-gray-900 dark:text-gray-100 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                        {deletingGovernorate.name_ar} ({deletingGovernorate.name_en})
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingGovernorate(null)}
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
