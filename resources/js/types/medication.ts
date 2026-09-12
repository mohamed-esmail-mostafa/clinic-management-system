export interface Medication {
    id: number;
    clinic_id?: number | null;
    name: string;
    generic_name?: string | null;
    form?: string | null;
    strength?: string | null;
    unit?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface MedicationFormValues {
    name: string;
    generic_name?: string;
    form?: string;
    strength?: string;
    unit?: string;
    is_active: boolean;
}
