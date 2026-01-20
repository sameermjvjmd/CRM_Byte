import api from './api';
import type { QuoteTemplate } from '../types/QuoteTemplate';

export const quoteTemplatesApi = {
    getAll: async () => {
        const response = await api.get<QuoteTemplate[]>('/quote-templates');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<QuoteTemplate>(`/quote-templates/${id}`);
        return response.data;
    },
    getDefault: async () => {
        const response = await api.get<QuoteTemplate>('/quote-templates/default');
        return response.data;
    },
    create: async (template: Omit<QuoteTemplate, 'id'>) => {
        const response = await api.post<QuoteTemplate>('/quote-templates', template);
        return response.data;
    },
    update: async (id: number, template: QuoteTemplate) => {
        await api.put(`/quote-templates/${id}`, template);
    },
    delete: async (id: number) => {
        await api.delete(`/quote-templates/${id}`);
    }
};
