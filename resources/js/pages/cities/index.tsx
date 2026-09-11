import React, { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { City, CityFormValues } from '@/types/city';
import { Governorate } from '@/types/governorate';
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
    Building2,
    CheckCircle2,
    XCircle,
    MapPin,
    Globe,
} from 'lucide-react';

interface Props {
    cities: City[];
    governorates: Governorate[];
}

export default function CitiesPage({ cities = [], governorates = [] }: Props) {
    const { t, isRtl } = useImport();
    const [searchTerm, setSearchTerm] = useState('');
    const [governorateFilter, setGovernorateFilter] = useState<string>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);
    const [deletingCity, setDeletingCity] = useState<City | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        governorate_id: Yup.mixed()
            .required(t('common.required', 'This field is required')),
        name_ar: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        name_en: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        is_active: Yup.boolean().default(true),
    });

    // Formik for Add/Edit City
    const formik = useFormik<CityFormValues>({
        initialValues: {
            governorate_id: editingCity?.governorate_id || '',
            name_ar: editingCity?.name_ar || '',
            name_en: editingCity?.name_en || '',
            is_active: editingCity ? editingCity.is_active : true,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const payload = {
                ...values,
                governorate_id: Number(values.governorate_id),
            };

            if (editingCity) {
                // Update operation
                router.put(`/admin/cities/${editingCity.id}`, payload, {
                    onSuccess: () => {
                        toast.success(t('cities.updated_success', 'City updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating city');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create operation
                router.post('/admin/cities', payload, {
                    onSuccess: () => {
                        toast.success(t('cities.created_success', 'City created successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error creating city');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleOpenAdd = () => {
        setEditingCity(null);
        formik.resetForm({
            values: {
                governorate_id: governorates.length > 0 ? governorates[0].id : '',
                name_ar: '',
                name_en: '',
                is_active: true,
            },
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (city: City) => {
        setEditingCity(city);
        formik.setValues({
            governorate_id: city.governorate_id,
            name_ar: city.name_ar,
            name_en: city.name_en,
            is_active: city.is_active,
        });
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingCity(null);
        formik.resetForm();
    };

    // Toggle Active Status
    const handleToggleStatus = (city: City) => {
        router.patch(`/admin/cities/${city.id}/toggle-status`, {}, {
            onSuccess: () => {
                toast.success(t('cities.status_updated', 'City status updated!'));
            },
            onError: () => {
                toast.error('Failed to update status');
            },
        });
    };

    // Confirm Delete
    const handleDeleteConfirm = () => {
        if (!deletingCity) return;
        setIsDeleting(true);

        router.delete(`/admin/cities/${deletingCity.id}`, {
            onSuccess: () => {
                toast.success(t('cities.deleted_success', 'City deleted successfully!'));
                setDeletingCity(null);
            },
            onError: () => {
                toast.error('Failed to delete city');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    // Filtering cities
    const filteredCities = cities.filter((c) => {
        const query = searchTerm.toLowerCase().trim();
        const matchesQuery =
            c.name_ar.toLowerCase().includes(query) ||
            c.name_en.toLowerCase().includes(query) ||
            (c.governorate && (c.governorate.name_ar.toLowerCase().includes(query) || c.governorate.name_en.toLowerCase().includes(query)));
        const matchesGov = governorateFilter === 'all' || String(c.governorate_id) === governorateFilter;
        return matchesQuery && matchesGov;
    });

    const activeCount = cities.filter((c) => c.is_active).length;
    const inactiveCount = cities.length - activeCount;

    return (
        <AdminLayout title={t('cities.title', 'Cities Management')}>
            <div className="space-y-6">
                {/* Header Title & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
                                <Building2 size={22} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t('cities.title', 'Cities Management')}
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {t('cities.subtitle', 'Manage cities under each governorate.')}
                        </p>
                    </div>

                    <Button
                        onClick={handleOpenAdd}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm font-medium rounded-xl h-10 px-4 transition-transform active:scale-95 cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>{t('cities.add_new', 'Add City')}</span>
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('cities.total', 'Total Cities')}
                                </p>
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
                                    {cities.length}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('cities.active_count', 'Active Cities')}
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
                                    {t('cities.inactive_count', 'Inactive Cities')}
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
                            placeholder={t('cities.search_placeholder', 'Search cities...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-orange-500`}
                        />
                    </div>

                    <div className="w-full sm:w-60">
                        <Select value={governorateFilter} onValueChange={setGovernorateFilter}>
                            <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder={t('cities.select_governorate', 'Select Governorate')} />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900">
                                <SelectItem value="all">
                                    {t('cities.select_governorate', 'All Governorates')}
                                </SelectItem>
                                {governorates.map((gov) => (
                                    <SelectItem key={gov.id} value={String(gov.id)}>
                                        {isRtl ? gov.name_ar : gov.name_en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Cities Data Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>{t('cities.name_ar', 'Arabic Name')}</TableHead>
                            <TableHead>{t('cities.name_en', 'English Name')}</TableHead>
                            <TableHead>{t('cities.governorate', 'Governorate')}</TableHead>
                            <TableHead>{t('cities.country', 'Country')}</TableHead>
                            <TableHead>{t('common.status', 'Status')}</TableHead>
                            <TableHead className="text-end">{t('common.actions', 'Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCities.length > 0 ? (
                            filteredCities.map((city, idx) => (
                                <TableRow key={city.id}>
                                    <TableCell className="font-semibold text-gray-500">
                                        {idx + 1}
                                    </TableCell>

                                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                                        {city.name_ar}
                                    </TableCell>

                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {city.name_en}
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/50 gap-1.5"
                                        >
                                            <MapPin size={12} />
                                            <span>{city.governorate ? (isRtl ? city.governorate.name_ar : city.governorate.name_en) : '—'}</span>
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                            <Globe size={14} className="text-orange-500" />
                                            <span>
                                                {city.governorate?.country
                                                    ? (isRtl ? city.governorate.country.name_ar : city.governorate.country.name_en)
                                                    : '—'}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={city.is_active}
                                                onCheckedChange={() => handleToggleStatus(city)}
                                            />
                                            <Badge
                                                className={
                                                    city.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                }
                                            >
                                                {city.is_active
                                                    ? t('cities.active', 'Active')
                                                    : t('cities.inactive', 'Inactive')}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-end">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(city)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg"
                                                title={t('cities.edit', 'Edit')}
                                            >
                                                <Pencil size={15} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setDeletingCity(city)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                                title={t('cities.delete', 'Delete')}
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
                                        <Building2 size={32} className="text-gray-300 dark:text-gray-700" />
                                        <span>{t('cities.no_cities', 'No cities found.')}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Create / Edit City Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {editingCity
                                    ? t('cities.edit', 'Edit City')
                                    : t('cities.add_new', 'Add City')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Fill in city details. Form validated with Formik & Yup.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
                            {/* Governorate Dropdown */}
                            <div className="space-y-1.5">
                                <Label htmlFor="governorate_id" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('cities.governorate', 'Governorate')} <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={String(formik.values.governorate_id)}
                                    onValueChange={(val) => formik.setFieldValue('governorate_id', val)}
                                >
                                    <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500">
                                        <SelectValue placeholder={t('cities.select_governorate', 'Select Governorate')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-900">
                                        {governorates.map((g) => (
                                            <SelectItem key={g.id} value={String(g.id)}>
                                                {isRtl ? g.name_ar : g.name_en}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formik.touched.governorate_id && formik.errors.governorate_id && (
                                    <InputError message={String(formik.errors.governorate_id)} />
                                )}
                            </div>

                            {/* Arabic Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name_ar" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('cities.name_ar', 'Arabic Name')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="name_ar"
                                    name="name_ar"
                                    placeholder="مثال: مدينة نصر"
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
                                    {t('cities.name_en', 'English Name')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="name_en"
                                    name="name_en"
                                    placeholder="e.g. Nasr City"
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
                                        {t('cities.is_active', 'Active Status')}
                                    </Label>
                                    <p className="text-[11px] text-gray-400">
                                        Active cities will be available for selection.
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
                <Dialog open={!!deletingCity} onOpenChange={() => setDeletingCity(null)}>
                    <DialogContent className="sm:max-w-sm rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-rose-600 dark:text-rose-400">
                                {t('cities.delete', 'Delete City')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-600 dark:text-gray-400 pt-2">
                                {t('cities.delete_confirm', 'Are you sure you want to delete this city?')}
                                {deletingCity && (
                                    <span className="block font-bold text-gray-900 dark:text-gray-100 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                        {deletingCity.name_ar} ({deletingCity.name_en})
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingCity(null)}
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
