import React, { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Country, CountryFormValues } from '@/types/country';
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
    Globe,
    CheckCircle2,
    XCircle,
    Building2,
} from 'lucide-react';

interface Props {
    countries: Country[];
}

export default function CountriesPage({ countries = [] }: Props) {
    const { t, isRtl } = useImport();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] = useState<Country | null>(null);
    const [deletingCountry, setDeletingCountry] = useState<Country | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        name_ar: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        name_en: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        code: Yup.string()
            .trim()
            .uppercase()
            .max(10, 'Max 10 characters')
            .nullable(),
        is_active: Yup.boolean().default(true),
    });

    // Formik for Add/Edit Country
    const formik = useFormik<CountryFormValues>({
        initialValues: {
            name_ar: editingCountry?.name_ar || '',
            name_en: editingCountry?.name_en || '',
            code: editingCountry?.code || '',
            is_active: editingCountry ? editingCountry.is_active : true,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const payload = {
                ...values,
                code: values.code ? values.code.trim().toUpperCase() : null,
            };

            if (editingCountry) {
                // Update operation
                router.put(`/admin/countries/${editingCountry.id}`, payload, {
                    onSuccess: () => {
                        toast.success(t('countries.updated_success', 'Country updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error(Object.values(errors)[0] as string || 'Error updating country');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create operation
                router.post('/admin/countries', payload, {
                    onSuccess: () => {
                        toast.success(t('countries.created_success', 'Country created successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error(Object.values(errors)[0] as string || 'Error creating country');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleOpenAdd = () => {
        setEditingCountry(null);
        formik.resetForm({
            values: {
                name_ar: '',
                name_en: '',
                code: '',
                is_active: true,
            },
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (country: Country) => {
        setEditingCountry(country);
        formik.setValues({
            name_ar: country.name_ar,
            name_en: country.name_en,
            code: country.code || '',
            is_active: country.is_active,
        });
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingCountry(null);
        formik.resetForm();
    };

    // Toggle Active Status
    const handleToggleStatus = (country: Country) => {
        router.patch(`/admin/countries/${country.id}/toggle-status`, {}, {
            onSuccess: () => {
                toast.success(t('countries.status_updated', 'Country status updated!'));
            },
            onError: () => {
                toast.error('Failed to update status');
            },
        });
    };

    // Confirm Delete
    const handleDeleteConfirm = () => {
        if (!deletingCountry) return;
        setIsDeleting(true);

        router.delete(`/admin/countries/${deletingCountry.id}`, {
            onSuccess: () => {
                toast.success(t('countries.deleted_success', 'Country deleted successfully!'));
                setDeletingCountry(null);
            },
            onError: () => {
                toast.error('Failed to delete country');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    // Filtering countries based on search term
    const filteredCountries = countries.filter((c) => {
        const query = searchTerm.toLowerCase().trim();
        return (
            c.name_ar.toLowerCase().includes(query) ||
            c.name_en.toLowerCase().includes(query) ||
            (c.code && c.code.toLowerCase().includes(query))
        );
    });

    const activeCount = countries.filter((c) => c.is_active).length;
    const inactiveCount = countries.length - activeCount;

    return (
        <AdminLayout title={t('countries.title', 'Countries Management')}>
            <div className="space-y-6">
                {/* Header Title & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
                                <Globe size={22} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t('countries.title', 'Countries Management')}
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {t('countries.subtitle', 'Manage system countries, names, codes, and status.')}
                        </p>
                    </div>

                    <Button
                        onClick={handleOpenAdd}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm font-medium rounded-xl h-10 px-4 transition-transform active:scale-95 cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>{t('countries.add_new', 'Add Country')}</span>
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('countries.total', 'Total Countries')}
                                </p>
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
                                    {countries.length}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                                <Globe size={24} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('countries.active_count', 'Active Countries')}
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
                                    {t('countries.inactive_count', 'Inactive Countries')}
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
                            placeholder={t('countries.search_placeholder', 'Search countries...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-orange-500`}
                        />
                    </div>
                </div>

                {/* Countries Data Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>{t('countries.name_ar', 'Arabic Name')}</TableHead>
                            <TableHead>{t('countries.name_en', 'English Name')}</TableHead>
                            <TableHead>{t('countries.code', 'Code')}</TableHead>
                            <TableHead>{t('countries.governorates_count', 'Governorates')}</TableHead>
                            <TableHead>{t('common.status', 'Status')}</TableHead>
                            <TableHead className="text-end">{t('common.actions', 'Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country, idx) => (
                                <TableRow key={country.id}>
                                    <TableCell className="font-semibold text-gray-500">
                                        {idx + 1}
                                    </TableCell>

                                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                                        {country.name_ar}
                                    </TableCell>

                                    <TableCell className="text-gray-700 dark:text-gray-300">
                                        {country.name_en}
                                    </TableCell>

                                    <TableCell>
                                        {country.code ? (
                                            <Badge
                                                variant="outline"
                                                className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/50 font-mono tracking-wider font-bold"
                                            >
                                                {country.code}
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                            <Building2 size={14} className="text-orange-500" />
                                            <span>{country.governorates_count ?? 0}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={country.is_active}
                                                onCheckedChange={() => handleToggleStatus(country)}
                                            />
                                            <Badge
                                                className={
                                                    country.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                }
                                            >
                                                {country.is_active
                                                    ? t('countries.active', 'Active')
                                                    : t('countries.inactive', 'Inactive')}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-end">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(country)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg"
                                                title={t('countries.edit', 'Edit')}
                                            >
                                                <Pencil size={15} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setDeletingCountry(country)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                                title={t('countries.delete', 'Delete')}
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
                                        <Globe size={32} className="text-gray-300 dark:text-gray-700" />
                                        <span>{t('countries.no_countries', 'No countries found.')}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Create / Edit Country Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {editingCountry
                                    ? t('countries.edit', 'Edit Country')
                                    : t('countries.add_new', 'Add Country')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Fill in country details. Form validated with Formik & Yup.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
                            {/* Arabic Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name_ar" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('countries.name_ar', 'Arabic Name')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="name_ar"
                                    name="name_ar"
                                    placeholder="مثال: مصر"
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
                                    {t('countries.name_en', 'English Name')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="name_en"
                                    name="name_en"
                                    placeholder="e.g. Egypt"
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

                            {/* Country ISO Code */}
                            <div className="space-y-1.5">
                                <Label htmlFor="code" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('countries.code', 'Country Code (ISO)')}
                                </Label>
                                <Input
                                    id="code"
                                    name="code"
                                    placeholder="e.g. EG, SA, US"
                                    maxLength={10}
                                    dir="ltr"
                                    value={formik.values.code}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="rounded-xl font-mono uppercase border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                />
                                {formik.touched.code && formik.errors.code && (
                                    <InputError message={formik.errors.code} />
                                )}
                            </div>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('countries.is_active', 'Active Status')}
                                    </Label>
                                    <p className="text-[11px] text-gray-400">
                                        Active countries will be available for selection.
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
                <Dialog open={!!deletingCountry} onOpenChange={() => setDeletingCountry(null)}>
                    <DialogContent className="sm:max-w-sm rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-rose-600 dark:text-rose-400">
                                {t('countries.delete', 'Delete Country')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-600 dark:text-gray-400 pt-2">
                                {t('countries.delete_confirm', 'Are you sure you want to delete this country?')}
                                {deletingCountry && (
                                    <span className="block font-bold text-gray-900 dark:text-gray-100 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                        {deletingCountry.name_ar} ({deletingCountry.name_en})
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingCountry(null)}
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
