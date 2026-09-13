export interface PatientFieldValue {
    id?: number;
    patient_id?: number;
    patient_field_id: number;
    value: string | null;
    field?: PatientField;
}

export interface Patient {
    id: number;
    patient_number: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    gender?: 'male' | 'female' | 'other' | string | null;
    date_of_birth?: string | null;
    phone?: string | null;
    secondary_phone?: string | null;
    address?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    emergency_contact_relation?: string | null;
    blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | string | null;
    clinic_id?: number | null;
    user_id?: number | null;
    notes?: string | null;
    marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    field_values?: PatientFieldValue[];
}

export interface PatientFormValues {
    patient_number?: string;
    first_name: string;
    last_name: string;
    gender?: string;
    date_of_birth?: string;
    phone?: string;
    secondary_phone?: string;
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    blood_type?: string;
    notes?: string;
    marital_status?: string;
    is_active: boolean;
    custom_fields?: Record<number, any>;
}

export interface PatientFieldOption {
    id?: number;
    patient_field_id?: number;
    label: string;
    value: string;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
}

export type PatientFieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

export interface PatientField {
    id: number;
    clinic_id: number;
    clinic_type_id?: number | null;
    name: string;
    label: string;
    type: PatientFieldType;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
    options?: PatientFieldOption[];
    created_at?: string;
    updated_at?: string;
}

export interface PatientFieldFormValues {
    name?: string;
    label: string;
    type: PatientFieldType;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
    options: { label: string; value: string }[];
    [key: string]: any;
}

