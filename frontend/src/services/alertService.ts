import api from './api';
import type { Alert } from '../types/alert';
import type { PaginatedResponse } from '../types/case';

export const alertService = {
    getAll: async (params?: any): Promise<PaginatedResponse<Alert> | Alert[]> => {
        // API returns array for public endpoint, pagination for admin
        const response = await api.get<PaginatedResponse<Alert> | Alert[]>('/alerts', { params });
        return response.data;
    },

    getActive: async (): Promise<Alert[]> => {
        const response = await api.get<Alert[]>('/public/alerts');
        return response.data;
    },

    create: async (data: Partial<Alert>): Promise<Alert> => {
        const response = await api.post<Alert>('/alerts', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Alert>): Promise<Alert> => {
        const response = await api.put<Alert>(`/alerts/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/alerts/${id}`);
    }
};
