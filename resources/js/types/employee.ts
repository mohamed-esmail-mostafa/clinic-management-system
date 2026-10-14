import { Role } from './role';
import { User } from './auth';

export interface ClinicEmployee {
    id: number;
    clinic_id: number;
    user_id: number;
    role_id: number;
    created_at?: string;
    updated_at?: string;
    user: User;
    role: Role;
}

export interface StoreEmployeeFormValues {
    name: string;
    email: string;
    phone: string;
    password: string;
    role_id: number | string;
}

export interface UpdateEmployeeFormValues {
    name: string;
    email: string;
    phone: string;
    role_id: number | string;
    password?: string;
}
