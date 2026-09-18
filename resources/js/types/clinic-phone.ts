export interface ClinicPhone {
    id: number;
    clinic_id: number;
    type: 'phone' | 'mobile' | 'landline' | 'emergency' | 'whatsapp' | 'hotline' | string;
    label?: string | null;
    phone: string;
    country_code?: string | null;
    is_whatsapp: boolean;
    is_primary: boolean;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface ClinicPhoneFormValues {
    type: string;
    label: string;
    phone: string;
    country_code: string;
    is_whatsapp: boolean;
    is_primary: boolean;
    is_active: boolean;
    sort_order: number;
}
