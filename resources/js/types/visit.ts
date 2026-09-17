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
}
