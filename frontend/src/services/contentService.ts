import api from './api';
import type { EducationalContent } from '../types/content';

export const contentService = {
    getAll: async (params?: any): Promise<EducationalContent[]> => {
        const response = await api.get<any>('/admin/content', { params });
        // Handle { data: [...] } structure
        return Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
    },

    create: async (data: Partial<EducationalContent>): Promise<EducationalContent> => {
        const response = await api.post<EducationalContent>('/content', data);
        return response.data;
    },

    update: async (id: number, data: Partial<EducationalContent>): Promise<EducationalContent> => {
        const response = await api.put<EducationalContent>(`/content/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/content/${id}`);
    }
};
