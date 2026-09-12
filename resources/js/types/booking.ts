import { Patient } from './patient';
import { User } from './auth';

export type BookingType = 'new' | 'follow_up';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type BookingSource = 'patient' | 'reception';

export interface Booking {
    id: number;
    clinic_id: number;
    patient_id?: number | null;
    doctor_id?: number | null;
    appointment_date: string;
    appointment_time: string;
    type: BookingType;
    status: BookingStatus;
    booking_source: BookingSource;
    booked_by?: string | null;
    notes?: string | null;
    patient?: Patient | null;
    doctor?: User | null;
    created_at?: string;
    updated_at?: string;
}

export interface BookingFormValues {
    patient_id?: string | number;
    doctor_id?: string | number;
    appointment_date: string;
    appointment_time: string;
    type: BookingType;
    status: BookingStatus;
    booking_source: BookingSource;
    booked_by?: string;
    notes?: string;
}
