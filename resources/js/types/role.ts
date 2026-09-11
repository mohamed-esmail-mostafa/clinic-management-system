export interface Role {
    id: number;
    name: string;
    slug: string;
    created_at?: string;
    updated_at?: string;
}

export interface RoleFormValues {
    name: string;
    [key: string]: any;
}