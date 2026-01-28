import api from './api';
import type { DiseaseCase, Disease, PaginatedResponse } from '../types/case';

export const caseService = {
    getAll: async (params?: any): Promise<PaginatedResponse<DiseaseCase>> => {
        const response = await api.get<PaginatedResponse<DiseaseCase>>('/cases', { params });
        return response.data;
    },

    getById: async (id: number): Promise<DiseaseCase> => {
        const response = await api.get<DiseaseCase>(`/cases/${id}`);
        return response.data;
    },

    create: async (data: Partial<DiseaseCase>): Promise<DiseaseCase> => {
        const response = await api.post<DiseaseCase>('/cases', data);
        return response.data;
    },

    update: async (id: number, data: Partial<DiseaseCase>): Promise<DiseaseCase> => {
        const response = await api.put<DiseaseCase>(`/cases/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/cases/${id}`);
    },

    getDiseases: async (): Promise<Disease[]> => {
        // Mocking for now as endpoint exists
        const response = await api.get<Disease[]>('/diseases');
        return response.data;
    }
};
