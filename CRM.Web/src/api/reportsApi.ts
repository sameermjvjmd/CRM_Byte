import api from './api';
import type {
    RunReportRequest,
    ReportResult,
    SavedReport,
    CreateSavedReportRequest,
    DashboardSummary
} from '../types/reporting';

const BASE_URL = '/reports';

export const reportsApi = {
    // Pipeline Reports
    getPipelineReport: async () => {
        const response = await api.get<any>(`${BASE_URL}/pipeline`);
        return response.data;
    },

    getPipelineSummary: async () => {
        const response = await api.get<any>(`${BASE_URL}/pipeline/summary`);
        return response.data;
    },

    // Activity Reports
    getActivityReport: async () => {
        const response = await api.get<any>(`${BASE_URL}/activities`);
        return response.data;
    },

    getActivitySummary: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await api.get<any>(`${BASE_URL}/activities/summary?${params.toString()}`);
        return response.data;
    },

    // Contact Reports
    getContactsReport: async () => {
        const response = await api.get<any>(`${BASE_URL}/contacts`);
        return response.data;
    },

    getContactsGrowth: async (months: number = 6) => {
        const response = await api.get<any>(`${BASE_URL}/contacts/growth?months=${months}`);
        return response.data;
    },

    getContactsList: async (params: { status?: string, companyId?: number, sortBy?: string, sortOrder?: string }) => {
        const response = await api.get<any>(`${BASE_URL}/contacts/list`, { params });
        return response.data;
    },

    // Company Reports
    getCompaniesReport: async () => {
        const response = await api.get<any>(`${BASE_URL}/companies`);
        return response.data;
    },

    // Opportunity Reports
    getOpportunitiesReport: async () => {
        const response = await api.get<any>(`${BASE_URL}/opportunities`);
        return response.data;
    },

    getForecast: async () => {
        const response = await api.get<any>(`${BASE_URL}/opportunities/forecast`);
        return response.data;
    },

    // Marketing Reports
    getMarketingReport: async () => {
        const response = await api.get<any>(`${BASE_URL}/marketing`);
        return response.data;
    },

    // Exports
    exportContactsCsv: async () => {
        const response = await api.get(`${BASE_URL}/export/contacts/csv`, { responseType: 'blob' });
        return response.data;
    },

    exportCompaniesCsv: async () => {
        const response = await api.get(`${BASE_URL}/export/companies/csv`, { responseType: 'blob' });
        return response.data;
    },

    exportOpportunitiesCsv: async () => {
        const response = await api.get(`${BASE_URL}/export/opportunities/csv`, { responseType: 'blob' });
        return response.data;
    },

    exportActivitiesCsv: async () => {
        const response = await api.get(`${BASE_URL}/export/activities/csv`, { responseType: 'blob' });
        return response.data;
    },

    // Dashboard Summary
    getDashboardSummary: async () => {
        const response = await api.get<DashboardSummary>(`${BASE_URL}/dashboard`);
        return response.data;
    },

    // Custom Report Builder
    runCustomReport: async (request: RunReportRequest) => {
        const response = await api.post<ReportResult>(`${BASE_URL}/saved/run`, request);
        return response.data;
    },

    getSavedReports: async () => {
        const response = await api.get<SavedReport[]>(`${BASE_URL}/saved`);
        return response.data;
    },

    getSavedReport: async (id: number) => {
        const response = await api.get<SavedReport>(`${BASE_URL}/saved/${id}`);
        return response.data;
    },

    createSavedReport: async (data: CreateSavedReportRequest) => {
        const response = await api.post<SavedReport>(`${BASE_URL}/saved`, data);
        return response.data;
    },

    deleteSavedReport: async (id: number) => {
        await api.delete(`${BASE_URL}/saved/${id}`);
    }
};
