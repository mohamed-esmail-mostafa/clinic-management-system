import { PatientField, PatientFieldFormValues, PatientFieldType } from '@/types';
import React, { useState } from 'react'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useImport from '@/hooks/use-import';
import { router } from '@inertiajs/react';
import useAuthClinics from '@/hooks/use-auth-clinics';
import { toast } from 'sonner';
import { AlignLeft, Calendar, CheckSquare, CircleDot, Hash, ListFilter, Type } from 'lucide-react';



interface FieldTypeOption {
    value: PatientFieldType;
    label: string;
}

export default function useCustomPatientFields({ fields, field_types }: any) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<PatientField | null>(null);
    const { t } = useImport()
    const { authClinic } = useAuthClinics()


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
                    `/clinic/settings/${authClinic.slug}/patients/fields/${editingField.id}`,
                    values as any,
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(
                                t(
                                    'patients_settings.field_updated_success',
                                )
                            );
                            setEditingField(null);
                            resetForm();
                        },
                        onError: (errors) => {
                            toast.error(
                                t(
                                    'patients_settings.field_update_error',

                                )
                            );
                        },
                        onFinish: () => setSubmitting(false),
                    }
                );
            } else {
                router.post(`/clinic/settings/${authClinic.slug}/patients/fields`, values as any, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            t('patients_settings.field_created_success'));
                        setIsAddModalOpen(false);
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error(
                            t('patients_settings.field_create_error',));
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });


    const hasOptions = ['select', 'radio', 'checkbox'].includes(formik.values.type);


    const addOptionRow = () => {
        const currentOptions = formik.values.options || [];
        formik.setFieldValue('options', [...currentOptions, { label: '', value: '' }]);
    };

    const removeOptionRow = (index: number) => {
        const currentOptions = [...(formik.values.options || [])];
        currentOptions.splice(index, 1);
        formik.setFieldValue('options', currentOptions);
    };


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
        const found = availableFieldTypes.find((f: any) => f.value === type);
        return found ? found.label : type;
    };

    const defaultFieldTypes: FieldTypeOption[] = [
        { value: 'text', label: t('patients_settings.type_text') },
        { value: 'number', label: t('patients_settings.type_number') },
        { value: 'textarea', label: t('patients_settings.type_textarea') },
        { value: 'select', label: t('patients_settings.type_select') },
        { value: 'radio', label: t('patients_settings.type_radio') },
        { value: 'checkbox', label: t('patients_settings.type_checkbox') },
        { value: 'date', label: t('patients_settings.type_date') },
    ];

    const availableFieldTypes = field_types.length > 0 ? field_types : defaultFieldTypes;
    return {
        isAddModalOpen,
        editingField,
        setIsAddModalOpen,
        setEditingField,
        formik,
        availableFieldTypes,
        addOptionRow,
        getTypeIcon,
        getTypeLabel,
        hasOptions,
        removeOptionRow,
        defaultFieldTypes
    }
}
