import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth.ts';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    getCurrentUser: async (): Promise<{ user: User }> => {
        const response = await api.get<{ user: User }>('/auth/me');
        return response.data;
    },
};
