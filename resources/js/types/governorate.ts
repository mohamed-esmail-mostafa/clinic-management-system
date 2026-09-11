import { Country } from './country';

export interface Governorate {
    id: number;
    country_id: number;
    name_ar: string;
    name_en: string;
    is_active: boolean;
    country?: Country;
    cities_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface GovernorateFormValues {
    country_id: number | string;
    name_ar: string;
    name_en: string;
    is_active: boolean;
}
