import api from './api';
import type { Disease } from '../types/case';

export const diseaseService = {
    getAll: async (params?: any): Promise<Disease[]> => {
        // Handling both paginated and list responses generally
        const response = await api.get<any>('/diseases', { params });
        // If backend returns { data: [...] } for pagination
        return Array.isArray(response.data) ? response.data : response.data.data;
    },

    getById: async (id: number): Promise<Disease> => {
        const response = await api.get<Disease>(`/diseases/${id}`);
        return response.data;
    },

    create: async (data: Partial<Disease>): Promise<Disease> => {
        const response = await api.post<Disease>('/diseases', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Disease>): Promise<Disease> => {
        const response = await api.put<Disease>(`/diseases/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/diseases/${id}`);
    }
};
