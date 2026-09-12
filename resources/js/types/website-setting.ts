export interface WebsiteSetting {
    id?: number;
    title_en?: string | null;
    title_ar?: string | null;
    description_en?: string | null;
    description_ar?: string | null;
    keywords_en?: string | null;
    keywords_ar?: string | null;
    logo?: string | null;
    public_logo_id?: string | null;
    dark_logo?: string | null;
    public_dark_logo_id?: string | null;
    favicon?: string | null;
    public_favicon_id?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface WebsiteSettingFormValues {
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    keywords_en: string;
    keywords_ar: string;
    email: string;
    phone: string;
    address: string;
    logo: File | null;
    dark_logo: File | null;
    favicon: File | null;
    remove_logo?: boolean;
    remove_dark_logo?: boolean;
    remove_favicon?: boolean;
}
