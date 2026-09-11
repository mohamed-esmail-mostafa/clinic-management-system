export interface Country {
    id: number;
    name_ar: string;
    name_en: string;
    code: string | null;
    is_active: boolean;
    governorates_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface CountryFormValues {
    name_ar: string;
    name_en: string;
    code: string;
    is_active: boolean;
}