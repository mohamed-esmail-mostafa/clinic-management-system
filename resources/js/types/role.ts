export interface Role {
    id: number;
    name: string;
    slug: string;
    type: 'system' | 'clinic';
    created_at?: string;
    updated_at?: string;
}

export interface RoleFormValues {
    name: string;
    type: 'system' | 'clinic';
    [key: string]: any;
}