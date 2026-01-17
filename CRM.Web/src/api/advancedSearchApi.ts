import api from './api';


export interface SearchCriteria {
    field: string;
    operator: string;
    value: string;
}

export interface AdvancedSearchRequest {
    entityType: 'Contacts' | 'Companies' | 'Opportunities';
    criteria: SearchCriteria[];
    matchType: 'All' | 'Any';
}

export interface SavedSearch {
    id: number;
    name: string;
    entityType: string;
    description: string;
    isPublic: boolean;
    criteria: SearchCriteria[];
    matchType: 'All' | 'Any';
    createdAt: string;
}

export const advancedSearchApi = {
    searchContacts: async (request: AdvancedSearchRequest) => {
        const response = await api.post('/contacts/search', request);
        return response.data;
    },
    searchCompanies: async (request: AdvancedSearchRequest) => {
        const response = await api.post('/companies/search', request);
        return response.data;
    },
    searchOpportunities: async (request: AdvancedSearchRequest) => {
        const response = await api.post('/opportunities/search', request);
        return response.data;
    },

    // Saved Searches
    getSavedSearches: async () => {
        const response = await api.get('/search/saved');
        return response.data as SavedSearch[];
    },
    saveSearch: async (search: Omit<SavedSearch, 'id' | 'createdAt'>) => {
        const response = await api.post('/search/saved', search);
        return response.data as SavedSearch;
    },
    deleteSavedSearch: async (id: number) => {
        await api.delete(`/search/saved/${id}`);
    }
};

