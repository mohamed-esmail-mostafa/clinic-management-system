import React, { useState } from 'react';
import ClinicLayout from '@/layouts/clinic-layout';
import { Clinic } from '@/types/clinic';
import { PatientField, PatientFieldFormValues, PatientFieldOption, PatientFieldType } from '@/types/patient';
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
    Type,
    Hash,
    AlignLeft,
    ListFilter,
    CircleDot,
    CheckSquare,
    Calendar,
    Settings2,
    Sliders,
    X,
    Layers,
    CheckCircle2,
    AlertCircle,
    ArrowUpDown,
} from 'lucide-react';

interface FieldTypeOption {
    value: PatientFieldType;
    label: string;
}

interface Props {
    clinic: Clinic;
    fields: PatientField[];
    field_types?: FieldTypeOption[];
}

export default function PatientSettingsPage({ clinic, fields = [], field_types = [] }: Props) {
    const { t, isRtl } = useImport();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<PatientField | null>(null);
    const [deletingField, setDeletingField] = useState<PatientField | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dedicated Options Management Modal State
    const [optionsField, setOptionsField] = useState<PatientField | null>(null);
    const [newOptLabel, setNewOptLabel] = useState('');
    const [newOptValue, setNewOptValue] = useState('');
    const [isAddingOpt, setIsAddingOpt] = useState(false);

    const handleAddOptionToField = () => {
        if (!optionsField || !newOptLabel.trim()) return;
        setIsAddingOpt(true);

        router.post(
            `/clinic/settings/${clinic.slug}/patients/fields/${optionsField.id}/options`,
            {
                label: newOptLabel,
                value: newOptValue,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        t('patients_settings.option_added_success', 'Option added successfully!')
                    );
                    setNewOptLabel('');
                    setNewOptValue('');
                },
                onError: () => {
                    toast.error(t('patients_settings.option_add_error', 'Failed to add option'));
                },
                onFinish: () => setIsAddingOpt(false),
            }
        );
    };

    const handleDeleteSingleOption = (optionId: number) => {
        router.delete(`/clinic/settings/${clinic.slug}/patients/options/${optionId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    t('patients_settings.option_deleted_success', 'Option deleted successfully!')
                );
            },
            onError: () => {
                toast.error(t('patients_settings.option_delete_error', 'Failed to delete option'));
            },
        });
    };

    const defaultFieldTypes: FieldTypeOption[] = [
        { value: 'text', label: t('patients_settings.type_text', 'Text Input') },
        { value: 'number', label: t('patients_settings.type_number', 'Number Input') },
        { value: 'textarea', label: t('patients_settings.type_textarea', 'Text Area') },
        { value: 'select', label: t('patients_settings.type_select', 'Dropdown Select') },
        { value: 'radio', label: t('patients_settings.type_radio', 'Radio Choice') },
        { value: 'checkbox', label: t('patients_settings.type_checkbox', 'Checkbox Group') },
        { value: 'date', label: t('patients_settings.type_date', 'Date Picker') },
    ];

    const availableFieldTypes = field_types.length > 0 ? field_types : defaultFieldTypes;

    const getTypeIcon = (type: PatientFieldType) => {
        switch (type) {
            case 'text':
                return <Type size={16} className="text-primary" />;
            case 'number':
                return <Hash size={16} className="text-primary" />;
            case 'textarea':
                return <AlignLeft size={16} className="text-primary" />;
            case 'select':
                return <ListFilter size={16} className="text-primary" />;
            case 'radio':
                return <CircleDot size={16} className="text-primary" />;
            case 'checkbox':
                return <CheckSquare size={16} className="text-primary" />;
            case 'date':
                return <Calendar size={16} className="text-primary" />;
            default:
                return <Type size={16} className="text-primary" />;
        }
    };

    const getTypeLabel = (type: PatientFieldType) => {
        const found = availableFieldTypes.find((f) => f.value === type);
        return found ? found.label : type;
    };

    // Filter fields by search term & type
    const filteredFields = fields.filter((field) => {
        const matchesSearch =
            field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            field.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedTypeFilter === 'all' || field.type === selectedTypeFilter;
        return matchesSearch && matchesType;
    });

    const activeCount = fields.filter((f) => f.is_active).length;
    const requiredCount = fields.filter((f) => f.is_required).length;
    const optionsCount = fields.filter((f) => ['select', 'radio', 'checkbox'].includes(f.type)).length;

    const validationSchema = Yup.object().shape({
        label: Yup.string()
            .required(t('patients_settings.label_required', 'Field label is required'))
            .max(255, t('patients_settings.max_255', 'Maximum 255 characters')),
        name: Yup.string().max(255, t('patients_settings.max_255', 'Maximum 255 characters')),
        type: Yup.string().required(t('patients_settings.type_required', 'Field type is required')),
        sort_order: Yup.number().min(0, t('patients_settings.min_0', 'Must be 0 or greater')),
        is_required: Yup.boolean(),
        is_active: Yup.boolean(),
    });

    const formik = useFormik<PatientFieldFormValues>({
        initialValues: {
            label: editingField?.label || '',
            name: editingField?.name || '',
            type: editingField?.type || 'text',
            is_required: editingField?.is_required ?? false,
            is_active: editingField?.is_active ?? true,
            sort_order: editingField?.sort_order ?? fields.length + 1,
            options: editingField?.options
                ? editingField.options.map((opt) => ({ label: opt.label, value: opt.value }))
                : [],
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (editingField) {
                router.put(
                    `/clinic/settings/${clinic.slug}/patients/fields/${editingField.id}`,
                    values as any,
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(
                                t(
                                    'patients_settings.field_updated_success',
                                    'Patient field updated successfully!'
                                )
                            );
                            setEditingField(null);
                            resetForm();
                        },
                        onError: (errors) => {
                            toast.error(
                                t(
                                    'patients_settings.field_update_error',
                                    'Failed to update patient field'
                                )
                            );
                        },
                        onFinish: () => setSubmitting(false),
                    }
                );
            } else {
                router.post(`/clinic/settings/${clinic.slug}/patients/fields`, values as any, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            t(
                                'patients_settings.field_created_success',
                                'Patient field created successfully!'
                            )
                        );
                        setIsAddModalOpen(false);
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error(
                            t(
                                'patients_settings.field_create_error',
                                'Failed to create patient field'
                            )
                        );
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleToggleStatus = (field: PatientField) => {
        router.patch(
            `/clinic/settings/${clinic.slug}/patients/fields/${field.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        t(
                            'patients_settings.status_updated_success',
                            'Field status updated successfully!'
                        )
                    );
                },
                onError: () => {
                    toast.error(
                        t('patients_settings.status_update_error', 'Failed to update field status')
                    );
                },
            }
        );
    };

    const handleDeleteField = () => {
        if (!deletingField) return;
        setIsDeleting(true);
        router.delete(`/clinic/settings/${clinic.slug}/patients/fields/${deletingField.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    t('patients_settings.field_deleted_success', 'Patient field deleted successfully!')
                );
                setDeletingField(null);
            },
            onError: () => {
                toast.error(
                    t('patients_settings.field_delete_error', 'Failed to delete patient field')
                );
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const addOptionRow = () => {
        const currentOptions = formik.values.options || [];
        formik.setFieldValue('options', [...currentOptions, { label: '', value: '' }]);
    };

    const removeOptionRow = (index: number) => {
        const currentOptions = [...(formik.values.options || [])];
        currentOptions.splice(index, 1);
        formik.setFieldValue('options', currentOptions);
    };

    const hasOptions = ['select', 'radio', 'checkbox'].includes(formik.values.type);

    return (
        <ClinicLayout title={t('patients_settings.page_title', 'Patient Settings')}>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <Sliders size={22} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {t('patients_settings.header_title', 'Patient Fields Settings')}
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t(
                                        'patients_settings.header_subtitle',
                                        'Customize additional data fields for patients in your clinic.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Button
                            onClick={() => {
                                setEditingField(null);
                                formik.resetForm();
                                setIsAddModalOpen(true);
                            }}
                            className="w-full sm:w-auto rounded-xl gap-2 h-10 px-5 cursor-pointer shadow-xs"
                        >
                            <Plus size={18} />
                            <span>{t('patients_settings.add_field_button', 'Add Custom Field')}</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center gap-3.5">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Layers size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {t('patients_settings.stat_total_fields', 'Total Fields')}
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {fields.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center gap-3.5">
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {t('patients_settings.stat_active_fields', 'Active Fields')}
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {activeCount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center gap-3.5">
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {t('patients_settings.stat_required_fields', 'Required Fields')}
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {requiredCount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center gap-3.5">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <ListFilter size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {t('patients_settings.stat_choice_fields', 'Fields with Options')}
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {optionsCount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Search */}
                <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                            <div className="relative w-full sm:w-80">
                                <Search
                                    size={16}
                                    className="absolute inset-y-0 start-3 my-auto text-gray-400"
                                />
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('patients_settings.search_placeholder', 'Search fields...')}
                                    className="h-10 ps-9 rounded-xl border-gray-200 dark:border-gray-800"
                                />
                            </div>
                            <div className="w-full sm:w-60">
                                <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                                    <SelectTrigger className="h-10 rounded-xl border-gray-200 dark:border-gray-800">
                                        <SelectValue placeholder={t('patients_settings.filter_by_type', 'Filter by Type')} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="all">
                                            {t('patients_settings.all_types', 'All Types')}
                                        </SelectItem>
                                        {availableFieldTypes.map((typeOption) => (
                                            <SelectItem key={typeOption.value} value={typeOption.value}>
                                                {typeOption.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Fields Table */}
                <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
                    <CardContent className="p-0">
                        {filteredFields.length === 0 ? (
                            <div className="py-16 text-center space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
                                    <Sliders size={24} />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                    {t('patients_settings.no_fields_title', 'No Custom Fields Found')}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    {t(
                                        'patients_settings.no_fields_desc',
                                        'Click the button above to add custom fields for patient registration.'
                                    )}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                                        <TableRow>
                                            <TableHead className="w-16 text-center">{t('patients_settings.col_order', 'Order')}</TableHead>
                                            <TableHead>{t('patients_settings.col_field', 'Field Name')}</TableHead>
                                            <TableHead>{t('patients_settings.col_type', 'Type')}</TableHead>
                                            <TableHead>{t('patients_settings.col_options', 'Options')}</TableHead>
                                            <TableHead className="text-center">{t('patients_settings.col_required', 'Required')}</TableHead>
                                            <TableHead className="text-center">{t('patients_settings.col_status', 'Status')}</TableHead>
                                            <TableHead className="text-end pe-6">{t('patients_settings.col_actions', 'Actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFields.map((field) => (
                                            <TableRow key={field.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-900/40">
                                                <TableCell className="text-center font-semibold text-xs text-gray-500">
                                                    <Badge variant="outline" className="rounded-lg font-mono">
                                                        #{field.sort_order}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                            {field.label}
                                                        </p>
                                                        <p className="text-xs text-gray-400 font-mono">
                                                            key: {field.name}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        {getTypeIcon(field.type)}
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            {getTypeLabel(field.type)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {field.options && field.options.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                                            {field.options.slice(0, 3).map((opt) => (
                                                                <Badge
                                                                    key={opt.id || opt.label}
                                                                    variant="secondary"
                                                                    className="text-[11px] rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                                >
                                                                    {opt.label}
                                                                </Badge>
                                                            ))}
                                                            {field.options.length > 3 && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[11px] rounded-lg text-gray-400"
                                                                >
                                                                    +{field.options.length - 3}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {field.is_required ? (
                                                        <Badge className="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 rounded-lg text-[11px] border border-rose-200 dark:border-rose-900">
                                                            {t('patients_settings.required', 'Required')}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-400 rounded-lg text-[11px]">
                                                            {t('patients_settings.optional', 'Optional')}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Switch
                                                        checked={field.is_active}
                                                        onCheckedChange={() => handleToggleStatus(field)}
                                                        className="data-[state=checked]:bg-primary"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-end pe-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {['select', 'radio', 'checkbox'].includes(field.type) && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setOptionsField(field)}
                                                                className="h-8 w-8 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 cursor-pointer"
                                                                title={t('patients_settings.manage_options', 'Manage Options')}
                                                            >
                                                                <ListFilter size={15} />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setEditingField(field)}
                                                            className="h-8 w-8 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 cursor-pointer"
                                                        >
                                                            <Pencil size={15} />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeletingField(field)}
                                                            className="h-8 w-8 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                                        >
                                                            <Trash2 size={15} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create / Edit Dialog */}
                <Dialog
                    open={isAddModalOpen || editingField !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setIsAddModalOpen(false);
                            setEditingField(null);
                            formik.resetForm();
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">
                                {editingField
                                    ? t('patients_settings.edit_field_title', 'Edit Patient Field')
                                    : t('patients_settings.add_field_title', 'Add New Patient Field')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                {t(
                                    'patients_settings.modal_subtitle',
                                    'Configure the label, type, requirement status, and options for this field.'
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
                            {/* Field Label */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium flex items-center gap-1">
                                    <span>{t('patients_settings.field_label', 'Field Label')}</span>
                                    <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    name="label"
                                    value={formik.values.label}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder={t('patients_settings.label_placeholder', 'e.g. Blood Type, Allergies')}
                                    className="h-10 rounded-xl"
                                />
                                {formik.touched.label && formik.errors.label && (
                                    <InputError message={formik.errors.label} />
                                )}
                            </div>

                            {/* System Name / Key */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    <span>{t('patients_settings.field_name_key', 'System Name / Key (Optional)')}</span>
                                </Label>
                                <Input
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder={t('patients_settings.name_placeholder', 'e.g. blood_type')}
                                    className="h-10 rounded-xl font-mono text-xs"
                                />
                                <p className="text-[11px] text-gray-400">
                                    {t(
                                        'patients_settings.name_hint',
                                        'Auto-generated from label if left empty.'
                                    )}
                                </p>
                            </div>

                            {/* Field Type & Sort Order */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        <span>{t('patients_settings.field_type', 'Field Type')}</span>
                                        <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                        value={formik.values.type}
                                        onValueChange={(val) => formik.setFieldValue('type', val)}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl">
                                            <SelectValue placeholder={t('patients_settings.select_type', 'Select field type')} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {availableFieldTypes.map((typeOption) => (
                                                <SelectItem key={typeOption.value} value={typeOption.value}>
                                                    <div className="flex items-center gap-2">
                                                        {getTypeIcon(typeOption.value)}
                                                        <span>{typeOption.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        <span>{t('patients_settings.sort_order', 'Sort Order')}</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        name="sort_order"
                                        value={formik.values.sort_order}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Switches: Required & Active */}
                            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium cursor-pointer" htmlFor="is_required">
                                        {t('patients_settings.is_required', 'Required Field')}
                                    </Label>
                                    <Switch
                                        id="is_required"
                                        checked={formik.values.is_required}
                                        onCheckedChange={(val) => formik.setFieldValue('is_required', val)}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium cursor-pointer" htmlFor="is_active">
                                        {t('patients_settings.is_active', 'Active Status')}
                                    </Label>
                                    <Switch
                                        id="is_active"
                                        checked={formik.values.is_active}
                                        onCheckedChange={(val) => formik.setFieldValue('is_active', val)}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            </div>

                            {/* Options builder for select, radio, checkbox */}
                            {hasOptions && (
                                <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                                            <ListFilter size={14} className="text-primary" />
                                            <span>{t('patients_settings.options_label', 'Field Options')}</span>
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addOptionRow}
                                            className="h-8 rounded-lg gap-1 text-xs text-primary border-primary/20 hover:bg-primary/10 cursor-pointer"
                                        >
                                            <Plus size={14} />
                                            <span>{t('patients_settings.add_option', 'Add Option')}</span>
                                        </Button>
                                    </div>

                                    <div className="space-y-2 max-h-48 overflow-y-auto pe-1">
                                        {formik.values.options.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic text-center py-2">
                                                {t('patients_settings.no_options_yet', 'No options added yet. Click "Add Option" to create choices.')}
                                            </p>
                                        ) : (
                                            formik.values.options.map((opt, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Input
                                                        placeholder={t('patients_settings.option_label_ph', 'Option Label (e.g. O+)')}
                                                        value={opt.label}
                                                        onChange={(e) => {
                                                            const newOpts = [...formik.values.options];
                                                            newOpts[idx].label = e.target.value;
                                                            if (!newOpts[idx].value) {
                                                                newOpts[idx].value = e.target.value.toLowerCase().replace(/\s+/g, '_');
                                                            }
                                                            formik.setFieldValue('options', newOpts);
                                                        }}
                                                        className="h-9 text-xs rounded-xl flex-1"
                                                    />
                                                    <Input
                                                        placeholder={t('patients_settings.option_val_ph', 'Value')}
                                                        value={opt.value}
                                                        onChange={(e) => {
                                                            const newOpts = [...formik.values.options];
                                                            newOpts[idx].value = e.target.value;
                                                            formik.setFieldValue('options', newOpts);
                                                        }}
                                                        className="h-9 text-xs rounded-xl flex-1 font-mono"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeOptionRow(idx)}
                                                        className="h-9 w-9 text-gray-400 hover:text-rose-500 rounded-xl shrink-0 cursor-pointer"
                                                    >
                                                        <X size={15} />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingField(null);
                                        formik.resetForm();
                                    }}
                                    className="rounded-xl h-10 px-4 cursor-pointer"
                                >
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                    className="rounded-xl h-10 px-5 cursor-pointer shadow-xs"
                                >
                                    {formik.isSubmitting
                                        ? t('common.saving', 'Saving...')
                                        : editingField
                                        ? t('patients_settings.save_changes', 'Save Changes')
                                        : t('patients_settings.create_field', 'Create Field')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deletingField !== null}
                    onOpenChange={(open) => {
                        if (!open) setDeletingField(null);
                    }}
                >
                    <DialogContent className="sm:max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {t('patients_settings.delete_modal_title', 'Delete Custom Field')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                {t(
                                    'patients_settings.delete_modal_desc',
                                    'Are you sure you want to delete this custom field? All associated patient data for this field will be permanently removed.'
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        {deletingField && (
                            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs space-y-1">
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {deletingField.label}
                                </p>
                                <p className="text-gray-400 font-mono">key: {deletingField.name}</p>
                            </div>
                        )}

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeletingField(null)}
                                className="rounded-xl h-10 px-4 cursor-pointer"
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteField}
                                disabled={isDeleting}
                                className="rounded-xl h-10 px-5 cursor-pointer"
                            >
                                {isDeleting
                                    ? t('common.deleting', 'Deleting...')
                                    : t('patients_settings.confirm_delete', 'Delete Field')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dedicated Options Management Dialog */}
                <Dialog
                    open={optionsField !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setOptionsField(null);
                            setNewOptLabel('');
                            setNewOptValue('');
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                <ListFilter size={20} className="text-primary" />
                                <span>
                                    {t('patients_settings.manage_options', 'Manage Options')}
                                    {optionsField ? `: ${optionsField.label}` : ''}
                                </span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                {t(
                                    'patients_settings.options_modal_desc',
                                    'Add, edit, or remove options for this selection field.'
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            {/* Add Option Form */}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2">
                                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                    {t('patients_settings.add_new_option', 'Add New Option')}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder={t('patients_settings.option_label_ph', 'Option Label (e.g. O+)')}
                                        value={newOptLabel}
                                        onChange={(e) => {
                                            setNewOptLabel(e.target.value);
                                            if (!newOptValue) {
                                                setNewOptValue(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                                            }
                                        }}
                                        className="h-9 text-xs rounded-xl flex-1"
                                    />
                                    <Input
                                        placeholder={t('patients_settings.option_val_ph', 'Value')}
                                        value={newOptValue}
                                        onChange={(e) => setNewOptValue(e.target.value)}
                                        className="h-9 text-xs rounded-xl flex-1 font-mono"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleAddOptionToField}
                                        disabled={isAddingOpt || !newOptLabel.trim()}
                                        className="h-9 rounded-xl gap-1 text-xs px-3 cursor-pointer shrink-0"
                                    >
                                        <Plus size={14} />
                                        <span>{t('patients_settings.add_option', 'Add')}</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Existing Options List */}
                            <div className="space-y-2 max-h-60 overflow-y-auto pe-1">
                                {optionsField && (optionsField.options || []).length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 space-y-1">
                                        <ListFilter size={24} className="mx-auto text-gray-300 dark:text-gray-700" />
                                        <p className="text-xs italic">
                                            {t('patients_settings.no_options_yet', 'No options added yet.')}
                                        </p>
                                    </div>
                                ) : (
                                    (optionsField?.options || []).map((opt) => (
                                        <div
                                            key={opt.id}
                                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs"
                                        >
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <Badge variant="secondary" className="rounded-lg text-xs font-semibold shrink-0">
                                                    {opt.label}
                                                </Badge>
                                                <span className="text-gray-400 font-mono text-[11px] truncate">
                                                    val: {opt.value}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => opt.id && handleDeleteSingleOption(opt.id)}
                                                className="h-8 w-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg shrink-0 cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <DialogFooter className="pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOptionsField(null)}
                                className="rounded-xl h-10 px-5 cursor-pointer"
                            >
                                {t('common.close', 'Close')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ClinicLayout>
    );
}
