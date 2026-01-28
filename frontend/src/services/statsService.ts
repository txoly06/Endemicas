import api from './api';

export interface DashboardStats {
    active_cases: number;
    recovered_cases: number;
    deceased_cases: number;
    total_cases: number;
    active_alerts: number;
    diseases_monitored: number;
}

export interface TimelineData {
    date: string;
    cases: number;
    recovered: number;
    deaths: number;
}

export const statsService = {
    getDashboardStats: async () => {
        const response = await api.get<DashboardStats>('/stats/dashboard');
        return response.data;
    },

    getTimeline: async (days: number = 30) => {
        const response = await api.get<TimelineData[]>(`/stats/timeline?days=${days}`);
        return response.data;
    },

    getCasesByDisease: async () => {
        const response = await api.get('/stats/diseases');
        return response.data;
    },

    getCasesByProvince: async () => {
        const response = await api.get('/stats/provinces');
        return response.data;
    }
};
