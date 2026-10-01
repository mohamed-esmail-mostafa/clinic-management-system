import { Medication } from './medication';
import { Patient } from './patient';

export interface VisitMedication {
    id?: number;
    visit_id?: number;
    medication_id?: number | null;
    medication_name: string;
    medication?: Medication | null;
    created_at?: string;
    updated_at?: string;
}

export interface Visit {
    id: number;
    clinic_id: number;
    patient_id: number;
    visited_at: string;
    type: 'examination' | 'follow_up';
    image_url?: string | null;
    patient?: Patient;
    visit_medications?: VisitMedication[];
    field_values?: VisitFieldValue[];
    created_at?: string;
    updated_at?: string;
}

export interface VisitFormValues {
    visited_at: string;
    type: 'examination' | 'follow_up';
    medications: Array<{
        medication_id?: number | null;
        medication_name: string;
    }>;
    custom_fields?: Record<number, any>;
}

export interface VisitFieldOption {
    id?: number;
    visit_field_id?: number;
    label: string;
    value: string;
    sort_order?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export type VisitFieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

export interface VisitField {
    id: number;
    clinic_id: number;
    clinic_type_id?: number | null;
    name: string;
    label: string;
    type: VisitFieldType;
    unit?: string | null;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
    options?: VisitFieldOption[];
    created_at?: string;
    updated_at?: string;
}

export interface VisitFieldValue {
    id?: number;
    visit_id?: number;
    visit_field_id: number;
    value: string | null;
    field?: VisitField;
}

export interface VisitFieldFormValues {
    name?: string;
    label: string;
    type: VisitFieldType;
    unit?: string;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
    options: { label: string; value: string }[];
    [key: string]: any;
}
