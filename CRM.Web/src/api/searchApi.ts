import api from './api';

export interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    type: string;
    url: string;
    icon?: string;
}

export const searchApi = {
    globalSearch: async (query: string): Promise<SearchResult[]> => {
        if (!query || query.length < 2) return [];
        const response = await api.get<SearchResult[]>('/search', { params: { query } });
        return response.data;
    }
};
