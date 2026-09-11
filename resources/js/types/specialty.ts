export interface Specialty {
    id: number;
    name_ar: string;
    name_en: string;
    slug: string;
    description_ar?: string;
    description_en?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface SpecialtyFormValues {
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    is_active: boolean;
    [key: string]: any;
}
