export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'health_professional' | 'public';
    institution?: string;
    phone?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: 'public' | 'health_professional';
    institution?: string;
    phone?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}
