import { Governorate } from './governorate';

export interface City {
    id: number;
    governorate_id: number;
    name_ar: string;
    name_en: string;
    is_active: boolean;
    governorate?: Governorate;
    created_at?: string;
    updated_at?: string;
}

export interface CityFormValues {
    governorate_id: number | string;
    name_ar: string;
    name_en: string;
    is_active: boolean;
}
