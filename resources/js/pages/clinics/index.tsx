import React, { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Clinic, ClinicFormValues, AddClinicUserFormValues } from '@/types/clinic';
import { Country } from '@/types/country';
import { Governorate } from '@/types/governorate';
import { City } from '@/types/city';
import { Specialty } from '@/types/specialty';
import { User } from '@/types/auth';
import { Role } from '@/types/role';
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
    MapPin,
    Phone,
    UserCheck,
    Building,
    Check,
    UserPlus,
    Users,
    User as UserIcon,
    Mail,
    Lock,
    ShieldCheck,
} from 'lucide-react';

interface Props {
    clinics: Clinic[];
    countries?: Country[];
    governorates?: Governorate[];
    cities?: City[];
    specialties?: Specialty[];
    all_users?: User[];
    roles?: Role[];
}

export default function ClinicsPage({
    clinics = [],
    countries = [],
    governorates = [],
    cities = [],
    specialties = [],
    all_users = [],
    roles = [],
}: Props) {
    const { t, isRtl } = useImport();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
    const [deletingClinic, setDeletingClinic] = useState<Clinic | null>(null);
    const [selectedClinicForUsers, setSelectedClinicForUsers] = useState<Clinic | null>(null);
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

    // Validation Schema for Clinic Edit using Yup
    const validationSchema = Yup.object({
        name: Yup.string()
            .trim()
            .required(t('common.required', 'Clinic name is required')),
        type: Yup.string().oneOf(['personal', 'medical_center']).required(),
        country_id: Yup.mixed().nullable(),
        governorate_id: Yup.mixed().nullable(),
        city_id: Yup.mixed().nullable(),
        phone: Yup.string().nullable(),
        address: Yup.string().nullable(),
        description: Yup.string().nullable(),
        is_active: Yup.boolean().required(),
        specialty_ids: Yup.array().of(Yup.number()),
    });

    const formik = useFormik<ClinicFormValues>({
        initialValues: {
            name: '',
            type: 'personal',
            country_id: '',
            governorate_id: '',
            city_id: '',
            phone: '',
            address: '',
            description: '',
            specialty_ids: [],
            is_active: true,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            if (!editingClinic) return;

            router.put(
                `/admin/clinics/${editingClinic.id}`,
                values,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            t('clinics.updated_success', 'Clinic updated successfully!')
                        );
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        const firstError = Object.values(errors)[0];
                        toast.error(
                            typeof firstError === 'string'
                                ? firstError
                                : t('common.error', 'Validation failed')
                        );
                    },
                    onFinish: () => setSubmitting(false),
                }
            );
        },
    });

    // Validation Schema & Formik for Adding User to Clinic
    const userValidationSchema = Yup.object({
        mode: Yup.string().oneOf(['existing', 'new']).required(),
        role_id: Yup.mixed().required(t('common.required', 'Role is required')),
        user_id: Yup.mixed().when('mode', {
            is: 'existing',
            then: (schema) => schema.required(t('common.required', 'User is required')),
            otherwise: (schema) => schema.optional(),
        }),
        name: Yup.string().when('mode', {
            is: 'new',
            then: (schema) => schema.required(t('common.required', 'Name is required')),
            otherwise: (schema) => schema.optional(),
        }),
        email: Yup.string().when('mode', {
            is: 'new',
            then: (schema) =>
                schema
                    .email(t('common.invalid_email', 'Invalid email address'))
                    .required(t('common.required', 'Email is required')),
            otherwise: (schema) => schema.optional(),
        }),
        password: Yup.string().when('mode', {
            is: 'new',
            then: (schema) =>
                schema
                    .min(8, t('common.min_8', 'Minimum 8 characters'))
                    .required(t('common.required', 'Password is required')),
            otherwise: (schema) => schema.optional(),
        }),
        phone: Yup.string().optional(),
    });

    const userFormik = useFormik<AddClinicUserFormValues>({
        initialValues: {
            mode: 'existing',
            user_id: '',
            role_id: roles[0]?.id ? String(roles[0].id) : '',
            name: '',
            email: '',
            password: '',
            phone: '',
        },
        enableReinitialize: true,
        validationSchema: userValidationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (!selectedClinicForUsers) return;

            router.post(
                `/admin/clinics/${selectedClinicForUsers.id}/users`,
                values,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            t('clinics.user_added_success', 'User added to clinic successfully!')
                        );
                        resetForm();
                        setSelectedClinicForUsers(null);
                    },
                    onError: (errors) => {
                        const firstError = Object.values(errors)[0];
                        toast.error(
                            typeof firstError === 'string'
                                ? firstError
                                : t('common.error', 'Something went wrong')
                        );
                    },
                    onFinish: () => setSubmitting(false),
                }
            );
        },
    });

    const handleOpenEdit = (clinic: Clinic) => {
        setEditingClinic(clinic);
        setEditCountryId(clinic.country_id ? String(clinic.country_id) : '');
        setEditGovId(clinic.governorate_id ? String(clinic.governorate_id) : '');

        formik.setValues({
            name: clinic.name,
            type: clinic.type,
            country_id: clinic.country_id ? String(clinic.country_id) : '',
            governorate_id: clinic.governorate_id ? String(clinic.governorate_id) : '',
            city_id: clinic.city_id ? String(clinic.city_id) : '',
            phone: clinic.phone || '',
            address: clinic.address || '',
            description: clinic.description || '',
            specialty_ids: clinic.specialties ? clinic.specialties.map((s) => s.id) : [],
            is_active: clinic.is_active,
        });
    };

    const handleCloseModal = () => {
        setEditingClinic(null);
        formik.resetForm();
    };

    const handleToggleStatus = (clinic: Clinic) => {
        router.patch(
            `/admin/clinics/${clinic.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('clinics.status_updated', 'Clinic status updated!'));
                },
            }
        );
    };

    const handleDeleteClinic = () => {
        if (!deletingClinic) return;
        setIsDeleting(true);

        router.delete(`/admin/clinics/${deletingClinic.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('clinics.deleted_success', 'Clinic deleted successfully!'));
                setDeletingClinic(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleRemoveUserFromClinic = (userId: number) => {
        if (!selectedClinicForUsers) return;

        if (
            confirm(
                t(
                    'clinics.confirm_remove_user',
                    'Are you sure you want to remove this user from the clinic?'
                )
            )
        ) {
            router.delete(
                `/admin/clinics/${selectedClinicForUsers.id}/users/${userId}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            t(
                                'clinics.user_removed_success',
                                'User removed from clinic successfully!'
                            )
                        );
                        setSelectedClinicForUsers(null);
                    },
                }
            );
        }
    };

    const handleToggleSpecialty = (specialtyId: number) => {
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
                            {t(
                                'clinics.subtitle',
                                'Manage registered clinics, medical centers, locations, and assigned users.'
                            )}
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
                            <TableHead>{t('clinics.users', 'Users')}</TableHead>
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

                                    {/* Users Column */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 font-semibold gap-1"
                                            >
                                                <Users size={12} />
                                                <span>{clinic.clinic_users?.length || 0}</span>
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelectedClinicForUsers(clinic)}
                                                className="h-7 px-2.5 text-xs font-medium gap-1 rounded-lg border-gray-200 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-800 transition-colors"
                                                title={t('clinics.manage_users', 'Manage Users')}
                                            >
                                                <UserPlus size={13} />
                                                <span>{t('clinics.add_user', 'Add User')}</span>
                                            </Button>
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
                                <TableCell colSpan={8} className="h-32 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Building2 size={32} className="text-gray-300 dark:text-gray-700" />
                                        <span>{t('clinics.no_clinics', 'No clinics found.')}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Manage Clinic Users Modal */}
                <Dialog
                    open={!!selectedClinicForUsers}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedClinicForUsers(null);
                            userFormik.resetForm();
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-xl rounded-2xl bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <Users size={20} className="text-orange-500" />
                                <span>{t('clinics.manage_users', 'Manage Users')}</span>
                                <span className="text-gray-400 font-normal">
                                    ({selectedClinicForUsers?.name})
                                </span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                {t('clinics.manage_users_desc', 'Add new or existing users to this clinic with specific roles.')}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Assigned Users Section */}
                        <div className="space-y-3 mt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                {t('clinics.assigned_users', 'Assigned Users')}
                            </h4>

                            {selectedClinicForUsers?.clinic_users &&
                            selectedClinicForUsers.clinic_users.length > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                                    {selectedClinicForUsers.clinic_users.map((cu) => (
                                        <div
                                            key={cu.id}
                                            className="p-3 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 font-bold flex items-center justify-center text-xs shrink-0">
                                                    {cu.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                        {cu.user?.name || 'User #' + cu.user_id}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {cu.user?.email || '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 capitalize text-xs"
                                                >
                                                    {cu.role?.name || 'Staff'}
                                                </Badge>

                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveUserFromClinic(cu.user_id)}
                                                    className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                                    title={t('common.delete', 'Remove')}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-center">
                                    {t('clinics.no_assigned_users', 'No users assigned to this clinic.')}
                                </p>
                            )}
                        </div>

                        {/* Add User Form Section */}
                        <form onSubmit={userFormik.handleSubmit} className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                <UserPlus size={14} className="text-orange-500" />
                                <span>{t('clinics.add_user', 'Add User to Clinic')}</span>
                            </h4>

                            {/* Mode Selector (Existing vs New) */}
                            <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => userFormik.setFieldValue('mode', 'existing')}
                                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        userFormik.values.mode === 'existing'
                                            ? 'bg-white dark:bg-gray-900 text-orange-600 dark:text-orange-400 shadow-xs'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {t('clinics.existing_user', 'Existing User')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => userFormik.setFieldValue('mode', 'new')}
                                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        userFormik.values.mode === 'new'
                                            ? 'bg-white dark:bg-gray-900 text-orange-600 dark:text-orange-400 shadow-xs'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {t('clinics.new_user', 'New User')}
                                </button>
                            </div>

                            {/* Role Select (Common for both modes) */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium flex items-center gap-1">
                                    <ShieldCheck size={14} className="text-gray-400" />
                                    <span>{t('clinics.select_role', 'Select Role')}</span>
                                    <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={String(userFormik.values.role_id)}
                                    onValueChange={(val) => userFormik.setFieldValue('role_id', val)}
                                >
                                    <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                        <SelectValue placeholder={t('clinics.select_role', 'Select Role')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {userFormik.touched.role_id && userFormik.errors.role_id && (
                                    <InputError message={String(userFormik.errors.role_id)} />
                                )}
                            </div>

                            {/* Existing User Selection */}
                            {userFormik.values.mode === 'existing' && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium flex items-center gap-1">
                                        <UserIcon size={14} className="text-gray-400" />
                                        <span>{t('clinics.select_user', 'Select User')}</span>
                                        <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                        value={String(userFormik.values.user_id)}
                                        onValueChange={(val) => userFormik.setFieldValue('user_id', val)}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                            <SelectValue placeholder={t('clinics.select_user', 'Select User')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {all_users.map((u) => (
                                                <SelectItem key={u.id} value={String(u.id)}>
                                                    {u.name} ({u.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {userFormik.touched.user_id && userFormik.errors.user_id && (
                                        <InputError message={String(userFormik.errors.user_id)} />
                                    )}
                                </div>
                            )}

                            {/* New User Fields */}
                            {userFormik.values.mode === 'new' && (
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium flex items-center gap-1">
                                            <UserIcon size={14} className="text-gray-400" />
                                            <span>{t('clinics.user_name', 'Full Name')}</span>
                                            <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            name="name"
                                            value={userFormik.values.name}
                                            onChange={userFormik.handleChange}
                                            onBlur={userFormik.handleBlur}
                                            placeholder="John Doe"
                                            className="h-10 rounded-xl"
                                        />
                                        {userFormik.touched.name && userFormik.errors.name && (
                                            <InputError message={userFormik.errors.name} />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium flex items-center gap-1">
                                                <Mail size={14} className="text-gray-400" />
                                                <span>{t('clinics.user_email', 'Email Address')}</span>
                                                <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                name="email"
                                                type="email"
                                                value={userFormik.values.email}
                                                onChange={userFormik.handleChange}
                                                onBlur={userFormik.handleBlur}
                                                placeholder="john@example.com"
                                                className="h-10 rounded-xl"
                                            />
                                            {userFormik.touched.email && userFormik.errors.email && (
                                                <InputError message={userFormik.errors.email} />
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium flex items-center gap-1">
                                                <Lock size={14} className="text-gray-400" />
                                                <span>{t('clinics.user_password', 'Password')}</span>
                                                <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                name="password"
                                                type="password"
                                                value={userFormik.values.password}
                                                onChange={userFormik.handleChange}
                                                onBlur={userFormik.handleBlur}
                                                placeholder="••••••••"
                                                className="h-10 rounded-xl"
                                            />
                                            {userFormik.touched.password && userFormik.errors.password && (
                                                <InputError message={userFormik.errors.password} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium flex items-center gap-1">
                                            <Phone size={14} className="text-gray-400" />
                                            <span>{t('clinics.user_phone', 'Phone Number')}</span>
                                        </Label>
                                        <Input
                                            name="phone"
                                            value={userFormik.values.phone}
                                            onChange={userFormik.handleChange}
                                            onBlur={userFormik.handleBlur}
                                            placeholder="+123456789"
                                            className="h-10 rounded-xl"
                                        />
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSelectedClinicForUsers(null)}
                                    className="rounded-xl h-10 px-4 cursor-pointer"
                                >
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={userFormik.isSubmitting}
                                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 px-5 font-medium cursor-pointer"
                                >
                                    {userFormik.isSubmitting
                                        ? t('common.saving', 'Saving...')
                                        : t('clinics.add_user', 'Add User')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Clinic Modal */}
                <Dialog open={!!editingClinic} onOpenChange={handleCloseModal}>
                    <DialogContent className="sm:max-w-xl rounded-2xl bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {t('clinics.edit', 'Edit Clinic')}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={formik.handleSubmit} className="space-y-4 mt-2">
                            {/* Clinic Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-medium">
                                    {t('clinics.name', 'Clinic Name')}{' '}
                                    <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="h-10 rounded-xl"
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <InputError message={formik.errors.name} />
                                )}
                            </div>

                            {/* Type Select */}
                            <div className="space-y-1.5">
                                <Label htmlFor="type" className="text-xs font-medium">
                                    {t('clinics.type', 'Clinic Type')}{' '}
                                    <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={formik.values.type}
                                    onValueChange={(val) => formik.setFieldValue('type', val)}
                                >
                                    <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                        <SelectValue placeholder={t('clinics.type', 'Select Type')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="personal">
                                            {t('clinics.personal', 'Personal Clinic')}
                                        </SelectItem>
                                        <SelectItem value="medical_center">
                                            {t('clinics.medical_center', 'Medical Center')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Location Cascade */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        {t('clinics.country', 'Country')}
                                    </Label>
                                    <Select
                                        value={String(formik.values.country_id)}
                                        onValueChange={(val) => {
                                            formik.setFieldValue('country_id', val);
                                            formik.setFieldValue('governorate_id', '');
                                            formik.setFieldValue('city_id', '');
                                            setEditCountryId(val);
                                            setEditGovId('');
                                        }}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                            <SelectValue
                                                placeholder={t('clinics.select_country', 'Select Country')}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {isRtl ? c.name_ar : c.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        {t('clinics.governorate', 'Governorate')}
                                    </Label>
                                    <Select
                                        value={String(formik.values.governorate_id)}
                                        onValueChange={(val) => {
                                            formik.setFieldValue('governorate_id', val);
                                            formik.setFieldValue('city_id', '');
                                            setEditGovId(val);
                                        }}
                                        disabled={!formik.values.country_id}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                            <SelectValue
                                                placeholder={t(
                                                    'clinics.select_governorate',
                                                    'Select Governorate'
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredGovs.map((g) => (
                                                <SelectItem key={g.id} value={String(g.id)}>
                                                    {isRtl ? g.name_ar : g.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        {t('clinics.city', 'City')}
                                    </Label>
                                    <Select
                                        value={String(formik.values.city_id)}
                                        onValueChange={(val) => formik.setFieldValue('city_id', val)}
                                        disabled={!formik.values.governorate_id}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                            <SelectValue
                                                placeholder={t('clinics.select_city', 'Select City')}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCities.map((ct) => (
                                                <SelectItem key={ct.id} value={String(ct.id)}>
                                                    {isRtl ? ct.name_ar : ct.name_en}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Phone & Address */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-medium">
                                        {t('clinics.phone', 'Phone')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="address" className="text-xs font-medium">
                                        {t('clinics.address', 'Address')}
                                    </Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-xs font-medium">
                                    {t('clinics.description', 'Description')}
                                </Label>
                                <Input
                                    id="description"
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    className="h-10 rounded-xl"
                                />
                            </div>

                            {/* Specialties checkboxes */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium">
                                    {t('clinics.specialties', 'Specialties')}
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-gray-100 dark:border-gray-800 p-3 rounded-xl max-h-36 overflow-y-auto">
                                    {specialties.map((s) => {
                                        const selected = formik.values.specialty_ids.includes(s.id);
                                        return (
                                            <div
                                                key={s.id}
                                                onClick={() => handleToggleSpecialty(s.id)}
                                                className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                                                    selected
                                                        ? 'border-orange-500 bg-orange-50/50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
                                                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                <span>{isRtl ? s.name_ar : s.name_en}</span>
                                                {selected && <Check size={14} className="text-orange-600" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('countries.active', 'Active')}
                                </span>
                                <Switch
                                    checked={formik.values.is_active}
                                    onCheckedChange={(val) => formik.setFieldValue('is_active', val)}
                                />
                            </div>

                            <DialogFooter className="pt-2">
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
                                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 px-5 font-medium cursor-pointer"
                                >
                                    {formik.isSubmitting
                                        ? t('common.saving', 'Saving...')
                                        : t('common.save', 'Save Changes')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={!!deletingClinic} onOpenChange={() => setDeletingClinic(null)}>
                    <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {t('clinics.delete', 'Delete Clinic')}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 mt-2">
                                {t(
                                    'clinics.delete_confirm',
                                    'Are you sure you want to delete this clinic?'
                                )}{' '}
                                <strong className="text-gray-900 dark:text-gray-100">
                                    {deletingClinic?.name}
                                </strong>
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="gap-2 sm:gap-0 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingClinic(null)}
                                disabled={isDeleting}
                                className="rounded-xl h-10 px-4 cursor-pointer"
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteClinic}
                                disabled={isDeleting}
                                className="rounded-xl h-10 px-4 font-medium cursor-pointer"
                            >
                                {isDeleting
                                    ? t('common.deleting', 'Deleting...')
                                    : t('common.delete', 'Delete')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
