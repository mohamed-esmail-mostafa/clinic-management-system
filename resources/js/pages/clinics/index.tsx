import React, { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Clinic, ClinicFormValues } from '@/types/clinic';
import { Country } from '@/types/country';
import { Governorate } from '@/types/governorate';
import { City } from '@/types/city';
import { Specialty } from '@/types/specialty';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router, Link } from '@inertiajs/react';
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
    Phone,
    UserCheck,
    Building,
    Check,
} from 'lucide-react';

interface Props {
    clinics: Clinic[];
    countries?: Country[];
    governorates?: Governorate[];
    cities?: City[];
    specialties?: Specialty[];
}

export default function ClinicsPage({
    clinics = [],
    countries = [],
    governorates = [],
    cities = [],
    specialties = [],
}: Props) {
    const { t, isRtl } = useImport();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
    const [deletingClinic, setDeletingClinic] = useState<Clinic | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filtered dropdowns for location cascade inside edit modal
    const [editCountryId, setEditCountryId] = useState<string>('');
    const [editGovId, setEditGovId] = useState<string>('');

    const filteredGovs = editCountryId
        ? governorates.filter((g) => String(g.country_id) === editCountryId)
        : governorates;

    const filteredCities = editGovId
        ? cities.filter((c) => String(c.governorate_id) === editGovId)
        : cities;

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        name: Yup.string()
            .trim()
            .required(t('common.required', 'Clinic name is required')),
        type: Yup.string().oneOf(['personal', 'medical_center']).required(),
        phone: Yup.string().nullable(),
        address: Yup.string().nullable(),
        description: Yup.string().nullable(),
        is_active: Yup.boolean().default(true),
    });

    // Formik for Edit Clinic Modal
    const formik = useFormik<ClinicFormValues>({
        initialValues: {
            name: editingClinic?.name || '',
            type: editingClinic?.type || 'personal',
            country_id: editingClinic?.country_id || '',
            governorate_id: editingClinic?.governorate_id || '',
            city_id: editingClinic?.city_id || '',
            phone: editingClinic?.phone || '',
            address: editingClinic?.address || '',
            description: editingClinic?.description || '',
            specialty_ids: editingClinic?.specialties?.map((s) => s.id) || [],
            is_active: editingClinic ? editingClinic.is_active : true,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            if (!editingClinic) return;

            const payload = {
                ...values,
                country_id: values.country_id ? Number(values.country_id) : null,
                governorate_id: values.governorate_id ? Number(values.governorate_id) : null,
                city_id: values.city_id ? Number(values.city_id) : null,
            };

            router.put(`/admin/clinics/${editingClinic.id}`, payload, {
                onSuccess: () => {
                    toast.success(t('clinics.updated_success', 'Clinic updated successfully!'));
                    handleCloseModal();
                },
                onError: (errors) => {
                    toast.error((Object.values(errors)[0] as string) || 'Error updating clinic');
                },
                onFinish: () => setSubmitting(false),
            });
        },
    });

    const handleOpenEdit = (clinic: Clinic) => {
        setEditingClinic(clinic);
        setEditCountryId(clinic.country_id ? String(clinic.country_id) : '');
        setEditGovId(clinic.governorate_id ? String(clinic.governorate_id) : '');
        formik.setValues({
            name: clinic.name,
            type: clinic.type,
            country_id: clinic.country_id || '',
            governorate_id: clinic.governorate_id || '',
            city_id: clinic.city_id || '',
            phone: clinic.phone || '',
            address: clinic.address || '',
            description: clinic.description || '',
            specialty_ids: clinic.specialties?.map((s) => s.id) || [],
            is_active: clinic.is_active,
        });
    };

    const handleCloseModal = () => {
        setEditingClinic(null);
        formik.resetForm();
    };

    // Toggle Active Status
    const handleToggleStatus = (clinic: Clinic) => {
        router.patch(`/admin/clinics/${clinic.id}/toggle-status`, {}, {
            onSuccess: () => {
                toast.success(t('clinics.status_updated', 'Clinic status updated!'));
            },
            onError: () => {
                toast.error('Failed to update status');
            },
        });
    };

    // Confirm Delete
    const handleDeleteConfirm = () => {
        if (!deletingClinic) return;
        setIsDeleting(true);

        router.delete(`/admin/clinics/${deletingClinic.id}`, {
            onSuccess: () => {
                toast.success(t('clinics.deleted_success', 'Clinic deleted successfully!'));
                setDeletingClinic(null);
            },
            onError: () => {
                toast.error('Failed to delete clinic');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const toggleSpecialty = (specialtyId: number) => {
        const currentIds = [...formik.values.specialty_ids];
        const index = currentIds.indexOf(specialtyId);
        if (index > -1) {
            currentIds.splice(index, 1);
        } else {
            currentIds.push(specialtyId);
        }
        formik.setFieldValue('specialty_ids', currentIds);
    };

    // Filtering clinics
    const filteredClinics = clinics.filter((c) => {
        const query = searchTerm.toLowerCase().trim();
        return (
            c.name.toLowerCase().includes(query) ||
            c.slug.toLowerCase().includes(query) ||
            (c.phone && c.phone.toLowerCase().includes(query)) ||
            (c.address && c.address.toLowerCase().includes(query))
        );
    });

    const activeCount = clinics.filter((c) => c.is_active).length;
    const personalCount = clinics.filter((c) => c.type === 'personal').length;
    const centerCount = clinics.filter((c) => c.type === 'medical_center').length;

    return (
        <AdminLayout title={t('clinics.title', 'Clinics Management')}>
            <div className="space-y-6">
                {/* Header Title & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl">
                                <Building2 size={22} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t('clinics.title', 'Clinics Management')}
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {t('clinics.subtitle', 'Manage registered clinics, medical centers, and locations.')}
                        </p>
                    </div>

                    <Link href="/create/clinic/page">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm font-medium rounded-xl h-10 px-4 transition-transform active:scale-95 cursor-pointer">
                            <Plus size={18} />
                            <span>{t('clinics.add-new', 'Add New Clinic')}</span>
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('clinics.total', 'Total Clinics')}
                                </p>
                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
                                    {clinics.length}
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
                                    {t('clinics.personal', 'Personal Clinics')}
                                </p>
                                <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                                    {personalCount}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
                                <UserCheck size={24} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('clinics.medical_center', 'Medical Centers')}
                                </p>
                                <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {centerCount}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                                <Building size={24} />
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
                            placeholder={t('clinics.search_placeholder', 'Search clinics...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-orange-500`}
                        />
                    </div>
                </div>

                {/* Clinics Data Table */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>{t('clinics.name', 'Clinic Name')}</TableHead>
                            <TableHead>{t('clinics.type', 'Type')}</TableHead>
                            <TableHead>{t('clinics.country', 'Location')}</TableHead>
                            <TableHead>{t('clinics.phone', 'Phone')}</TableHead>
                            <TableHead>{t('common.status', 'Status')}</TableHead>
                            <TableHead className="text-end">{t('common.actions', 'Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClinics.length > 0 ? (
                            filteredClinics.map((clinic, idx) => (
                                <TableRow key={clinic.id}>
                                    <TableCell className="font-semibold text-gray-500">
                                        {idx + 1}
                                    </TableCell>

                                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                                        <div>
                                            <span>{clinic.name}</span>
                                            {clinic.description && (
                                                <p className="text-xs font-normal text-gray-400 line-clamp-1 mt-0.5">
                                                    {clinic.description}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                clinic.type === 'medical_center'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                                            }
                                        >
                                            {clinic.type === 'medical_center'
                                                ? t('clinics.medical_center', 'Medical Center')
                                                : t('clinics.personal', 'Personal')}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                            <MapPin size={13} className="text-orange-500 shrink-0" />
                                            <span>
                                                {[
                                                    clinic.city ? (isRtl ? clinic.city.name_ar : clinic.city.name_en) : null,
                                                    clinic.governorate ? (isRtl ? clinic.governorate.name_ar : clinic.governorate.name_en) : null,
                                                    clinic.country ? (isRtl ? clinic.country.name_ar : clinic.country.name_en) : null,
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ') || '—'}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                            <Phone size={13} className="text-gray-400 shrink-0" />
                                            <span>{clinic.phone || '—'}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={clinic.is_active}
                                                onCheckedChange={() => handleToggleStatus(clinic)}
                                            />
                                            <Badge
                                                className={
                                                    clinic.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                }
                                            >
                                                {clinic.is_active
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
                                                onClick={() => handleOpenEdit(clinic)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg"
                                                title={t('clinics.edit', 'Edit')}
                                            >
                                                <Pencil size={15} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setDeletingClinic(clinic)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                                title={t('clinics.delete', 'Delete')}
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
                                        <span>{t('clinics.no_clinics', 'No clinics found.')}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Edit Clinic Modal */}
                <Dialog open={!!editingClinic} onOpenChange={handleCloseModal}>
                    <DialogContent className="sm:max-w-xl rounded-2xl bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {t('clinics.edit', 'Edit Clinic')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Update clinic details and specialties.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('clinics.name', 'Clinic Name')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <InputError message={formik.errors.name} />
                                )}
                            </div>

                            {/* Type */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('clinics.type', 'Type')}
                                </Label>
                                <Select
                                    value={formik.values.type}
                                    onValueChange={(val) => formik.setFieldValue('type', val)}
                                >
                                    <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-900">
                                        <SelectItem value="personal">{t('clinics.personal', 'Personal Clinic')}</SelectItem>
                                        <SelectItem value="medical_center">{t('clinics.medical_center', 'Medical Center')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Phone & Address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-phone" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.phone', 'Phone')}
                                    </Label>
                                    <Input
                                        id="edit-phone"
                                        name="phone"
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                        className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-address" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.address', 'Address')}
                                    </Label>
                                    <Input
                                        id="edit-address"
                                        name="address"
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
                                        className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Location Cascade */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.country', 'Country')}
                                    </Label>
                                    <Select
                                        value={String(formik.values.country_id)}
                                        onValueChange={(val) => {
                                            formik.setFieldValue('country_id', val);
                                            setEditCountryId(val);
                                            formik.setFieldValue('governorate_id', '');
                                            formik.setFieldValue('city_id', '');
                                            setEditGovId('');
                                        }}
                                    >
                                        <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800">
                                            <SelectValue placeholder="Select Country" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-900">
                                            {countries.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {isRtl ? c.name_ar : c.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.governorate', 'Governorate')}
                                    </Label>
                                    <Select
                                        value={String(formik.values.governorate_id)}
                                        onValueChange={(val) => {
                                            formik.setFieldValue('governorate_id', val);
                                            setEditGovId(val);
                                            formik.setFieldValue('city_id', '');
                                        }}
                                    >
                                        <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800">
                                            <SelectValue placeholder="Select Governorate" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-900">
                                            {filteredGovs.map((g) => (
                                                <SelectItem key={g.id} value={String(g.id)}>
                                                    {isRtl ? g.name_ar : g.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {t('clinics.city', 'City')}
                                    </Label>
                                    <Select
                                        value={String(formik.values.city_id)}
                                        onValueChange={(val) => formik.setFieldValue('city_id', val)}
                                    >
                                        <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800">
                                            <SelectValue placeholder="Select City" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-900">
                                            {filteredCities.map((ct) => (
                                                <SelectItem key={ct.id} value={String(ct.id)}>
                                                    {isRtl ? ct.name_ar : ct.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Specialties */}
                            <div className="space-y-1.5 pt-1">
                                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('clinics.specialties', 'Specialties')}
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border rounded-xl border-gray-100 dark:border-gray-800">
                                    {specialties.map((s) => {
                                        const isSelected = formik.values.specialty_ids.includes(s.id);
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => toggleSpecialty(s.id)}
                                                className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 font-semibold'
                                                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                <span className="truncate">{isRtl ? s.name_ar : s.name_en}</span>
                                                {isSelected && <Check size={12} className="text-orange-500 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
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
                <Dialog open={!!deletingClinic} onOpenChange={() => setDeletingClinic(null)}>
                    <DialogContent className="sm:max-w-sm rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-rose-600 dark:text-rose-400">
                                {t('clinics.delete', 'Delete Clinic')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-600 dark:text-gray-400 pt-2">
                                {t('clinics.delete_confirm', 'Are you sure you want to delete this clinic?')}
                                {deletingClinic && (
                                    <span className="block font-bold text-gray-900 dark:text-gray-100 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                        {deletingClinic.name}
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingClinic(null)}
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
