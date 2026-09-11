import { Country } from './country';
import { Governorate } from './governorate';
import { City } from './city';
import { Specialty } from './specialty';

export interface Clinic {
    id: number;
    country_id?: number | null;
    governorate_id?: number | null;
    city_id?: number | null;
    name: string;
    slug: string;
    type: 'personal' | 'medical_center';
    phone?: string | null;
    address?: string | null;
    description?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    is_active: boolean;
    country?: Country;
    governorate?: Governorate;
    city?: City;
    specialties?: Specialty[];
    created_at?: string;
    updated_at?: string;
}

export interface ClinicFormValues {
    name: string;
    type: 'personal' | 'medical_center';
    country_id: number | string;
    governorate_id: number | string;
    city_id: number | string;
    phone: string;
    address: string;
    description: string;
    specialty_ids: number[];
    is_active: boolean;
    [key: string]: any;
}