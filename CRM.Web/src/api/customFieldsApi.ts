import api from './api';
import type {
    CustomField,
    CreateCustomFieldDto,
    UpdateCustomFieldDto,
    CustomFieldValue,
    SaveCustomFieldValuesDto
} from '../types/CustomField.js';

export const customFieldsApi = {
    getAll: async (entityType: string) => {
        const response = await api.get<CustomField[]>(`/customfields/${entityType}`);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<CustomField>(`/customfields/field/${id}`);
        return response.data;
    },

    create: async (data: CreateCustomFieldDto) => {
        const response = await api.post<CustomField>('/customfields', data);
        return response.data;
    },

    update: async (id: number, data: UpdateCustomFieldDto) => {
        const response = await api.put<CustomField>(`/customfields/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/customfields/${id}`);
    },

    getEntityValues: async (entityType: string, entityId: number) => {
        const response = await api.get<CustomFieldValue[]>(`/customfields/${entityType}/${entityId}/values`);
        return response.data;
    },

    saveEntityValues: async (entityType: string, entityId: number, data: SaveCustomFieldValuesDto) => {
        await api.post(`/customfields/${entityType}/${entityId}/values`, data);
    }
};
