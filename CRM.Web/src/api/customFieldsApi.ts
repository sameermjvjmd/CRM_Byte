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
        const response = await api.get<any[]>(`/customfields/${entityType}`);
        // Map raw response to typed objects, handling parsing
        return response.data.map(field => {
            let parsedOptions: any[] = [];

            // Handle Options parsing (stored as JSON string ["Opt1", "Opt2"])
            // Backend property might be 'Options' or 'options' depending on serialization
            const rawOptions = field.options || field.Options;

            if (rawOptions && typeof rawOptions === 'string') {
                try {
                    const parsed = JSON.parse(rawOptions);
                    if (Array.isArray(parsed)) {
                        // Convert string array to FieldOption objects
                        parsedOptions = parsed.map(opt => ({
                            label: opt,
                            value: opt,
                            isDefault: false
                        }));
                    }
                } catch (e) {
                    console.warn('Failed to parse options for field', field.fieldName, e);
                }
            }

            return {
                ...field,
                options: parsedOptions
            } as CustomField;
        });
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

    saveEntityValues: async (entityType: string, entityId: number, data: any) => {
        await api.post(`/customfields/${entityType}/${entityId}/values`, data);
    }
};
