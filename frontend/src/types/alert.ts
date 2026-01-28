export interface Alert {
    id: number;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affected_area: string;
    is_active: boolean;
    expires_at: string;
    disease_id: number;
    created_at: string;
    disease?: {
        id: number;
        name: string;
    };
}
