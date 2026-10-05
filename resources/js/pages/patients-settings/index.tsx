import React, { useState } from 'react';
import ClinicLayout from '@/layouts/clinic-layout';
import { Clinic } from '@/types/clinic';
import { PatientField, PatientFieldType } from '@/types/patient';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import useImport from '@/hooks/use-import';


// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import PageHeader from '@/components/shared/page-header';
import Stats from './components/stats.';
import FieldsGrid from './components/fields-grid';
import CustomFieldsDialog from './components/custom-fields-dialog';
import useCustomPatientFields from './hooks/use-custom-patient-fields';
import FieldsFilterSearch from './components/fields-filter-search';



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
    
    const { isAddModalOpen, setIsAddModalOpen, formik ,getTypeLabel ,defaultFieldTypes} = useCustomPatientFields({ fields, field_types })
    const { t, isRtl } = useImport();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
    // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

    // const defaultFieldTypes: FieldTypeOption[] = [
    //     { value: 'text', label: t('patients_settings.type_text', 'Text Input') },
    //     { value: 'number', label: t('patients_settings.type_number', 'Number Input') },
    //     { value: 'textarea', label: t('patients_settings.type_textarea', 'Text Area') },
    //     { value: 'select', label: t('patients_settings.type_select', 'Dropdown Select') },
    //     { value: 'radio', label: t('patients_settings.type_radio', 'Radio Choice') },
    //     { value: 'checkbox', label: t('patients_settings.type_checkbox', 'Checkbox Group') },
    //     { value: 'date', label: t('patients_settings.type_date', 'Date Picker') },
    // ];

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

    // const getTypeLabel = (type: PatientFieldType) => {
    //     const found = availableFieldTypes.find((f) => f.value === type);
    //     return found ? found.label : type;
    // };

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

    // const addOptionRow = () => {
    //     const currentOptions = formik.values.options || [];
    //     formik.setFieldValue('options', [...currentOptions, { label: '', value: '' }]);
    // };

    // const removeOptionRow = (index: number) => {
    //     const currentOptions = [...(formik.values.options || [])];
    //     currentOptions.splice(index, 1);
    //     formik.setFieldValue('options', currentOptions);
    // };

    // const hasOptions = ['select', 'radio', 'checkbox'].includes(formik.values.type);

    return (
        <ClinicLayout title={t('patients_settings.page_title', 'Patient Settings')}>
            <div className="space-y-6  mx-auto">


                <PageHeader
                    title={t('patients_settings.header_title')}
                    subtitle={t('patients_settings.header_subtitle')}
                    icon={<Sliders size={22} />}
                >
                    <Button
                        onClick={() => {
                            setEditingField(null);
                            formik.resetForm();
                            setIsAddModalOpen(true);
                        }}

                    >
                        <Plus size={18} />
                        <span>{t('patients_settings.add_field_button', 'Add Custom Field')}</span>
                    </Button>
                </PageHeader>


                <CustomFieldsDialog
                    formik={formik}
                    isAddModalOpen={isAddModalOpen}
                    setIsAddModalOpen={setIsAddModalOpen}
                    fields={fields}
                    field_types={field_types} />

                {/* Stats Grid */}

                <Stats
                    fields={fields}
                    activeCount={activeCount}
                    requiredCount={requiredCount}
                    optionsCount={optionsCount}
                />

                {/* Filters & Search */}
          
                <FieldsFilterSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedTypeFilter={selectedTypeFilter}
                    setSelectedTypeFilter={setSelectedTypeFilter}
                    availableFieldTypes={availableFieldTypes} />

                {/* Fields Table */}
                <FieldsGrid
                    filteredFields={filteredFields}
                    getTypeIcon={getTypeIcon}
                    handleToggleStatus={handleToggleStatus}
                    getTypeLabel={getTypeLabel}
                    setOptionsField={setOptionsField}
                    setEditingField={setEditingField}
                    setDeletingField={setDeletingField} />



                {/* Create / Edit Dialog */}


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
