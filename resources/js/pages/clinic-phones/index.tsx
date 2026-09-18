import React, { useState, useMemo } from 'react';
import ClinicLayout from '@/layouts/clinic-layout';
import useImport from '@/hooks/use-import';
import useAuthClinics from '@/hooks/use-auth-clinics';
import { ClinicPhone, ClinicPhoneFormValues } from '@/types/clinic-phone';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

// UI Components
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

// Icons
import {
    Phone,
    Plus,
    Pencil,
    Trash2,
    Search,
    Star,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Smartphone,
    PhoneCall,
    Flame,
    MessageCircle,
} from 'lucide-react';

interface Props {
    clinic?: any;
    phones?: ClinicPhone[];
}

const PHONE_TYPES = [
    { value: 'phone', labelKey: 'clinic_phones.types.phone', defaultLabel: 'General Phone' },
    { value: 'mobile', labelKey: 'clinic_phones.types.mobile', defaultLabel: 'Mobile' },
    { value: 'landline', labelKey: 'clinic_phones.types.landline', defaultLabel: 'Landline' },
    { value: 'emergency', labelKey: 'clinic_phones.types.emergency', defaultLabel: 'Emergency' },
    { value: 'whatsapp', labelKey: 'clinic_phones.types.whatsapp', defaultLabel: 'WhatsApp Only' },
    { value: 'hotline', labelKey: 'clinic_phones.types.hotline', defaultLabel: 'Hotline' },
];

export default function ClinicPhones({ clinic, phones = [] }: Props) {
    const { t } = useImport();
    const { authClinic } = useAuthClinics();
    const clinicSlug = clinic?.slug || authClinic?.slug;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPhone, setEditingPhone] = useState<ClinicPhone | null>(null);
    const [deletingPhone, setDeletingPhone] = useState<ClinicPhone | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Stats
    const stats = useMemo(() => {
        return {
            total: phones.length,
            active: phones.filter((p) => p.is_active).length,
            inactive: phones.filter((p) => !p.is_active).length,
            whatsapp: phones.filter((p) => p.is_whatsapp).length,
            primary: phones.find((p) => p.is_primary)?.phone || '-',
        };
    }, [phones]);

    // Filtered Phones
    const filteredPhones = useMemo(() => {
        return phones.filter((item) => {
            const matchesSearch =
                item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.label && item.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.country_code && item.country_code.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesType = selectedType === 'all' || item.type === selectedType;

            return matchesSearch && matchesType;
        });
    }, [phones, searchTerm, selectedType]);

    // Formik & Yup
    const validationSchema = Yup.object({
        phone: Yup.string().trim().required(t('common.required', 'This field is required')),
        country_code: Yup.string().nullable(),
        type: Yup.string().required(t('common.required', 'This field is required')),
        label: Yup.string().nullable(),
        is_whatsapp: Yup.boolean().default(false),
        is_primary: Yup.boolean().default(false),
        is_active: Yup.boolean().default(true),
        sort_order: Yup.number().typeError(t('common.number_required', 'Must be a number')).min(0).default(0),
    });

    const initialValues: ClinicPhoneFormValues = {
        phone: editingPhone?.phone || '',
        country_code: editingPhone?.country_code || '+20',
        type: editingPhone?.type || 'phone',
        label: editingPhone?.label || '',
        is_whatsapp: editingPhone ? Boolean(editingPhone.is_whatsapp) : false,
        is_primary: editingPhone ? Boolean(editingPhone.is_primary) : false,
        is_active: editingPhone ? Boolean(editingPhone.is_active) : true,
        sort_order: editingPhone?.sort_order ?? 0,
    };

    const formik = useFormik<ClinicPhoneFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (!clinicSlug) {
                toast.error('Clinic slug is missing.');
                setSubmitting(false);
                return;
            }

            if (editingPhone) {
                // Update Phone
                router.put(`/clinic/${clinicSlug}/phones/${editingPhone.id}`, values as any, {
                    onSuccess: () => {
                        toast.success(t('clinic_phones.updated_success', 'Phone number updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating phone number');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create Phone
                router.post(`/clinic/${clinicSlug}/phones`, values as any, {
                    onSuccess: () => {
                        toast.success(t('clinic_phones.created_success', 'Phone number added successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error adding phone number');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPhone(null);
        formik.resetForm();
    };

    const handleOpenEdit = (phoneItem: ClinicPhone) => {
        setEditingPhone(phoneItem);
        setIsModalOpen(true);
    };

    const handleToggleStatus = (phoneItem: ClinicPhone) => {
        if (!clinicSlug) return;
        router.patch(`/clinic/${clinicSlug}/phones/${phoneItem.id}/toggle-status`, {}, {
            onSuccess: () => {
                toast.success(t('clinic_phones.status_updated', 'Phone status updated successfully!'));
            },
            onError: () => {
                toast.error('Failed to update phone status');
            },
        });
    };

    const handleTogglePrimary = (phoneItem: ClinicPhone) => {
        if (!clinicSlug) return;
        router.patch(`/clinic/${clinicSlug}/phones/${phoneItem.id}/toggle-primary`, {}, {
            onSuccess: () => {
                toast.success(t('clinic_phones.primary_updated', 'Primary phone updated successfully!'));
            },
            onError: () => {
                toast.error('Failed to set primary phone');
            },
        });
    };

    const handleDelete = () => {
        if (!deletingPhone || !clinicSlug) return;

        setIsDeleting(true);
        router.delete(`/clinic/${clinicSlug}/phones/${deletingPhone.id}`, {
            onSuccess: () => {
                toast.success(t('clinic_phones.deleted_success', 'Phone number deleted successfully!'));
                setDeletingPhone(null);
            },
            onError: () => {
                toast.error('Failed to delete phone number');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    // Helper for type icons
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'mobile':
                return <Smartphone className="h-4 w-4 text-primary" />;
            case 'landline':
                return <PhoneCall className="h-4 w-4 text-primary" />;
            case 'emergency':
            case 'hotline':
                return <Flame className="h-4 w-4 text-red-500" />;
            case 'whatsapp':
                return <MessageCircle className="h-4 w-4 text-emerald-600" />;
            default:
                return <Phone className="h-4 w-4 text-primary" />;
        }
    };

    return (
        <ClinicLayout>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    icon={<Phone className="h-7 w-7 text-primary" />}
                    title={t('clinic_phones.title', 'Clinic Phone Numbers')}
                    subtitle={t(
                        'clinic_phones.subtitle',
                        'Manage direct phone lines, WhatsApp numbers, emergency hotlines, and reception contacts.'
                    )}
                >
                    <Button
                        onClick={() => {
                            setEditingPhone(null);
                            setIsModalOpen(true);
                        }}
                        className="gap-2 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        {t('clinic_phones.add_new', 'Add Phone Number')}
                    </Button>
                </PageHeader>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('clinic_phones.total', 'Total Numbers')}
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Phone className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('clinic_phones.primary_count', 'Primary Line')}
                                </p>
                                <p className="text-lg font-bold text-primary mt-1 font-mono truncate max-w-[150px]">
                                    {stats.primary}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Star className="h-5 w-5 fill-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('clinic_phones.whatsapp_count', 'WhatsApp Lines')}
                                </p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {stats.whatsapp}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('clinic_phones.active_count', 'Active Lines')}
                                </p>
                                <p className="text-2xl font-bold text-primary mt-1">
                                    {stats.active}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="shadow-xs">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            {/* Search */}
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('clinic_phones.search_placeholder', 'Search phone numbers, labels...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Type Filter */}
                            <div className="w-full sm:w-48">
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('clinic_phones.type_placeholder', 'Filter by type')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('common.all_types', 'All Types')}
                                        </SelectItem>
                                        {PHONE_TYPES.map((pt) => (
                                            <SelectItem key={pt.value} value={pt.value}>
                                                {t(pt.labelKey, pt.defaultLabel)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Phones Grid */}
                {filteredPhones.length === 0 ? (
                    <Card className="p-12 text-center shadow-xs">
                        <CardContent className="p-0 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                                <Phone className="h-6 w-6 text-muted-foreground/60" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground">
                                {t('clinic_phones.no_phones', 'No phone numbers found.')}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                {searchTerm || selectedType !== 'all'
                                    ? t('common.try_adjusting_search', 'Try adjusting your search or filter to find what you are looking for.')
                                    : t('clinic_phones.subtitle', 'Manage direct phone lines, WhatsApp numbers, emergency hotlines, and reception contacts.')}
                            </p>
                            {!searchTerm && selectedType === 'all' && (
                                <Button
                                    onClick={() => {
                                        setEditingPhone(null);
                                        setIsModalOpen(true);
                                    }}
                                    className="mt-4 gap-1.5"
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('clinic_phones.add_new', 'Add Phone Number')}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredPhones.map((item, idx) => (
                            <Card
                                key={item.id}
                                className={`p-0 gap-0 shadow-xs border transition-all duration-200 hover:shadow-md ${
                                    item.is_primary ? 'border-primary/50 bg-primary/[0.02]' : ''
                                } ${!item.is_active ? 'opacity-70 bg-muted/30' : ''}`}
                            >
                                {/* Card Header */}
                                <div className="p-4 pb-3 flex items-start justify-between gap-3 border-b">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                item.is_primary
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-primary/10 text-primary'
                                            }`}
                                        >
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <Badge variant="outline" className="capitalize text-xs font-medium">
                                                    {t(`clinic_phones.types.${item.type}`, item.type)}
                                                </Badge>
                                                {item.is_primary && (
                                                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4">
                                                        {t('clinic_phones.primary_badge', 'Primary')}
                                                    </Badge>
                                                )}
                                            </div>
                                            {item.label && (
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate font-medium">
                                                    {item.label}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Primary Star & Active Switch */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleTogglePrimary(item)}
                                            title={t('clinic_phones.set_as_primary', 'Set as Primary')}
                                            className="h-8 w-8 text-primary"
                                        >
                                            <Star
                                                className={`h-4 w-4 ${
                                                    item.is_primary
                                                        ? 'fill-primary text-primary'
                                                        : 'text-muted-foreground'
                                                }`}
                                            />
                                        </Button>
                                        <Switch
                                            checked={item.is_active}
                                            onCheckedChange={() => handleToggleStatus(item)}
                                            title={
                                                item.is_active
                                                    ? t('common.active', 'Active')
                                                    : t('common.inactive', 'Inactive')
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <a
                                            href={`tel:${item.phone}`}
                                            className="text-lg font-bold font-mono tracking-wide text-foreground hover:text-primary transition-colors flex items-center gap-2"
                                            dir="ltr"
                                        >
                                            {item.country_code && (
                                                <span className="text-sm font-semibold text-muted-foreground">
                                                    {item.country_code}
                                                </span>
                                            )}
                                            <span>{item.phone}</span>
                                        </a>
                                        <span className="text-[11px] font-mono text-muted-foreground">
                                            #{item.sort_order > 0 ? item.sort_order : idx + 1}
                                        </span>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                                        {item.is_whatsapp && (
                                            <a
                                                href={`https://wa.me/${(item.country_code || '').replace('+', '')}${item.phone.replace(/^0+/, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center"
                                            >
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 text-xs gap-1 cursor-pointer"
                                                >
                                                    <MessageCircle className="h-3 w-3" />
                                                    <span>{t('clinic_phones.whatsapp_badge', 'WhatsApp')}</span>
                                                </Badge>
                                            </a>
                                        )}

                                        <Badge
                                            variant={item.is_active ? 'default' : 'secondary'}
                                            className={`text-[11px] font-normal ${
                                                item.is_active
                                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {item.is_active
                                                ? t('common.active', 'Active')
                                                : t('common.inactive', 'Inactive')}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="px-4 py-2.5 bg-muted/20 border-t flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenEdit(item)}
                                        className="h-8 text-xs gap-1"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        <span>{t('common.edit')}</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeletingPhone(item)}
                                        className="h-8 text-xs text-destructive hover:text-destructive gap-1"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>{t('common.delete', 'Delete')}</span>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Dialog using Formik and Yup */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary" />
                            {editingPhone
                                ? t('clinic_phones.edit', 'Edit Phone Number')
                                : t('clinic_phones.add_new', 'Add Phone Number')}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
                        {/* Phone Number */}
                        <div>
                            <Label htmlFor="phone">
                                {t('clinic_phones.phone', 'Phone Number')} *
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder={t('clinic_phones.phone_placeholder', 'e.g. 01012345678')}
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="mt-1 font-mono"
                            />
                            {formik.touched.phone && formik.errors.phone && (
                                <p className="text-xs text-destructive mt-1">{formik.errors.phone}</p>
                            )}
                        </div>

                        {/* Country Code and Type */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="country_code">
                                    {t('clinic_phones.country_code', 'Country Code')}
                                </Label>
                                <Input
                                    id="country_code"
                                    name="country_code"
                                    placeholder={t('clinic_phones.country_code_placeholder', 'e.g. +20')}
                                    value={formik.values.country_code}
                                    onChange={formik.handleChange}
                                    className="mt-1 font-mono"
                                />
                            </div>

                            <div>
                                <Label htmlFor="type">
                                    {t('clinic_phones.type', 'Phone Type')} *
                                </Label>
                                <Select
                                    value={formik.values.type}
                                    onValueChange={(val) => formik.setFieldValue('type', val)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder={t('clinic_phones.type_placeholder', 'Select type')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PHONE_TYPES.map((pt) => (
                                            <SelectItem key={pt.value} value={pt.value}>
                                                {t(pt.labelKey, pt.defaultLabel)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Label / Description */}
                        <div>
                            <Label htmlFor="label">
                                {t('clinic_phones.label', 'Label / Description')}
                            </Label>
                            <Input
                                id="label"
                                name="label"
                                placeholder={t('clinic_phones.label_placeholder', 'e.g. Main Reception')}
                                value={formik.values.label}
                                onChange={formik.handleChange}
                                className="mt-1"
                            />
                        </div>

                        {/* Sort Order */}
                        <div>
                            <Label htmlFor="sort_order">
                                {t('clinic_phones.sort_order', 'Sort Order')}
                            </Label>
                            <Input
                                id="sort_order"
                                name="sort_order"
                                type="number"
                                min={0}
                                value={formik.values.sort_order}
                                onChange={formik.handleChange}
                                className="mt-1 font-mono"
                            />
                        </div>

                        {/* WhatsApp Toggle */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                                <Label htmlFor="is_whatsapp" className="cursor-pointer font-medium text-sm">
                                    {t('clinic_phones.is_whatsapp', 'WhatsApp Enabled')}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {t('clinic_phones.is_whatsapp_desc', 'This number is active on WhatsApp')}
                                </p>
                            </div>
                            <Switch
                                id="is_whatsapp"
                                checked={formik.values.is_whatsapp}
                                onCheckedChange={(val) => formik.setFieldValue('is_whatsapp', val)}
                            />
                        </div>

                        {/* Primary Phone Toggle */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                                <Label htmlFor="is_primary" className="cursor-pointer font-medium text-sm">
                                    {t('clinic_phones.is_primary', 'Primary Number')}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {t('clinic_phones.is_primary_desc', 'Main clinic contact shown on prescriptions')}
                                </p>
                            </div>
                            <Switch
                                id="is_primary"
                                checked={formik.values.is_primary}
                                onCheckedChange={(val) => formik.setFieldValue('is_primary', val)}
                            />
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                                <Label htmlFor="is_active" className="cursor-pointer font-medium text-sm">
                                    {t('clinic_phones.is_active', 'Active Status')}
                                </Label>
                            </div>
                            <Switch
                                id="is_active"
                                checked={formik.values.is_active}
                                onCheckedChange={(val) => formik.setFieldValue('is_active', val)}
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button type="submit" disabled={formik.isSubmitting}>
                                {formik.isSubmitting
                                    ? t('common.processing', 'Processing...')
                                    : editingPhone
                                    ? t('common.save', 'Save Changes')
                                    : t('common.save', 'Add Phone Number')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={Boolean(deletingPhone)} onOpenChange={() => setDeletingPhone(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            {t('clinic_phones.delete', 'Delete Phone Number')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('clinic_phones.delete_confirm', 'Are you sure you want to delete this phone number?')}
                            {deletingPhone && (
                                <span className="block mt-2 font-bold font-mono text-foreground">
                                    {deletingPhone.country_code ? `${deletingPhone.country_code} ` : ''}
                                    {deletingPhone.phone}{' '}
                                    {deletingPhone.label ? `(${deletingPhone.label})` : ''}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeletingPhone(null)}
                            disabled={isDeleting}
                        >
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ClinicLayout>
    );
}
