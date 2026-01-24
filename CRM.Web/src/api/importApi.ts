import api from './api';

export interface ImportPreviewResponse {
    fileToken: string;
    headers: string[];
    previewRows: Record<string, string>[];
    totalRowsEstimate: number;
}

export interface ImportMappingRequest {
    fileToken: string;
    entityType: string; // 'Contact'
    fieldMapping: Record<string, string>; // Header -> PropertyName
    updateExisting: boolean;
}

export interface ImportResult {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors: string[];
    skipped: string[];
}

export const importApi = {
    uploadPreview: async (file: File): Promise<ImportPreviewResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ImportPreviewResponse>('/import/preview', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    executeImport: async (request: ImportMappingRequest): Promise<ImportResult> => {
        const response = await api.post<ImportResult>('/import/execute', request);
        return response.data;
    }
};

export const CONTACT_IMPORT_FIELDS = [
    { value: 'FirstName', label: 'First Name', required: true },
    { value: 'LastName', label: 'Last Name', required: true },
    { value: 'Email', label: 'Email' },
    { value: 'Phone', label: 'Phone' },
    { value: 'MobilePhone', label: 'Mobile Phone' },
    { value: 'Company', label: 'Company Name' },
    { value: 'JobTitle', label: 'Job Title' },
    { value: 'Address1', label: 'Address Line 1' },
    { value: 'City', label: 'City' },
    { value: 'State', label: 'State' },
    { value: 'Zip', label: 'Zip/Postal Code' },
    { value: 'Country', label: 'Country' },
    { value: 'Website', label: 'Website' },
    { value: 'Notes', label: 'Notes' },
    { value: 'LeadSource', label: 'Lead Source' },
];

export const COMPANY_IMPORT_FIELDS = [
    { value: 'Name', label: 'Company Name', required: true },
    { value: 'Industry', label: 'Industry' },
    { value: 'Website', label: 'Website' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Address', label: 'Address' },
    { value: 'City', label: 'City' },
    { value: 'State', label: 'State' },
    { value: 'ZipCode', label: 'Zip Code' },
    { value: 'Country', label: 'Country' },
    { value: 'Description', label: 'Description' },
    { value: 'TickerSymbol', label: 'Ticker Symbol' }
];
