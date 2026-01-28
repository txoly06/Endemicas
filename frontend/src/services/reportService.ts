import api from './api';

export const reportService = {
    downloadCasesPdf: async (filters?: any) => {
        const response = await api.get('/reports/cases/pdf', {
            params: filters,
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio_casos_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    downloadCasesCsv: async (filters?: any) => {
        const response = await api.get('/reports/cases/csv', {
            params: filters,
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `casos_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    downloadPatientCard: async (caseId: number, patientName: string) => {
        const response = await api.get(`/reports/patient-card/${caseId}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ficha_paciente_${patientName.replace(/\s+/g, '_')}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
