export interface Disease {
    id: number;
    name: string;
    description?: string;
    vector?: string;
    symptoms?: string;
    prevention?: string;
    is_endemic?: boolean;
    created_at?: string;
    updated_at?: string;
}
