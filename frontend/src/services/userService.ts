import api from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'health_professional' | 'public';
    institution?: string;
    phone?: string;
    created_at?: string;
}

export const userService = {
    // Assuming a standard users endpoint exists or we use this for now
    getAll: async (params?: any): Promise<User[]> => {
        // If specific endpoint doesn't exist, we might need to rely on mocking or a specific backend route
        // For now assuming GET /users exists for admins
        const response = await api.get<any>('/users', { params });
        return Array.isArray(response.data) ? response.data : response.data.data;
    },

    updateRole: async (id: number, role: string): Promise<User> => {
        const response = await api.put<User>(`/users/${id}/role`, { role });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/users/${id}`);
    }
};
