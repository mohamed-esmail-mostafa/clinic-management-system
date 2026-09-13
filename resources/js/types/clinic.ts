import { Country } from './country';
import { Governorate } from './governorate';
import { City } from './city';
import { Specialty } from './specialty';
import { ClinicType } from './clinic-type';
import { User } from './auth';
import { Role } from './role';

export interface ClinicUser {
    id: number;
    clinic_id: number;
    user_id: number;
    role_id: number;
    user?: User;
    role?: Role;
    created_at?: string;
    updated_at?: string;
}

export interface Clinic {
    id: number;
    country_id?: number | null;
    governorate_id?: number | null;
    city_id?: number | null;
    clinic_type_id?: number | null;
    name: string;
    slug: string;
    image?: string | null;
    public_id?: string | null;
    phone?: string | null;
    address?: string | null;
    description?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    is_active: boolean;
    country?: Country;
    governorate?: Governorate;
    city?: City;
    clinic_type?: ClinicType;
    specialties?: Specialty[];
    clinic_users?: ClinicUser[];
    users?: User[];
    created_at?: string;
    updated_at?: string;
}

export interface ClinicFormValues {
    name: string;
    clinic_type_id?: number | string;
    image?: File | string | null;
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

export interface AddClinicUserFormValues {
    mode: 'existing' | 'new';
    user_id: number | string;
    role_id: number | string;
    name: string;
    email: string;
    password: string;
    phone: string;
    [key: string]: any;
}