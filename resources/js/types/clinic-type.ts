export interface ClinicType {
    id: number;
    title_ar: string;
    title_en: string;
    slug: string;
    is_active: boolean;
    clinics_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ClinicTypeFormValues {
    title_ar: string;
    title_en: string;
    slug?: string;
    is_active: boolean;
    [key: string]: any;
}
