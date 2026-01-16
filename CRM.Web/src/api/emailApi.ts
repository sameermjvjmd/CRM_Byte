import api from './api';

export interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    category: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateEmailTemplateDto {
    name: string;
    subject: string;
    body: string;
    category: string;
}

export interface UpdateEmailTemplateDto extends CreateEmailTemplateDto {
    isActive: boolean;
}

export interface SendEmailRequest {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
    templateId?: number;
    placeholders?: Record<string, string>;
    contactId?: number;
}

export interface SentEmail {
    id: number;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    status: string;
    sentAt: string;
    contactId?: number;
    templateId?: number;
    templateName?: string;
    openCount: number;
    clickCount: number;
}

export const emailApi = {
    // Templates
    getTemplates: async (): Promise<EmailTemplate[]> => {
        const response = await api.get('/EmailTemplates');
        return response.data;
    },

    getTemplate: async (id: number): Promise<EmailTemplate> => {
        const response = await api.get(`/EmailTemplates/${id}`);
        return response.data;
    },

    createTemplate: async (data: CreateEmailTemplateDto): Promise<EmailTemplate> => {
        const response = await api.post('/EmailTemplates', data);
        return response.data;
    },

    updateTemplate: async (id: number, data: UpdateEmailTemplateDto): Promise<void> => {
        await api.put(`/EmailTemplates/${id}`, data);
    },

    deleteTemplate: async (id: number): Promise<void> => {
        await api.delete(`/EmailTemplates/${id}`);
    },

    // Sending
    sendEmail: async (data: SendEmailRequest): Promise<SentEmail> => {
        const response = await api.post('/Emails/send', data);
        return response.data;
    },

    // History
    getSentEmails: async (contactId?: number): Promise<SentEmail[]> => {
        const response = await api.get('/Emails/sent', { params: { contactId } });
        return response.data;
    },

    // Signatures
    getSignatures: async (): Promise<EmailSignature[]> => {
        const response = await api.get('/EmailSignatures');
        return response.data;
    },

    getSignature: async (id: number): Promise<EmailSignature> => {
        const response = await api.get(`/EmailSignatures/${id}`);
        return response.data;
    },

    getDefaultSignature: async (): Promise<EmailSignature | null> => {
        try {
            const response = await api.get('/EmailSignatures/default');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    createSignature: async (data: CreateEmailSignatureDto): Promise<EmailSignature> => {
        const response = await api.post('/EmailSignatures', data);
        return response.data;
    },

    updateSignature: async (id: number, data: UpdateEmailSignatureDto): Promise<void> => {
        await api.put(`/EmailSignatures/${id}`, data);
    },

    setDefaultSignature: async (id: number): Promise<void> => {
        await api.put(`/EmailSignatures/${id}/set-default`);
    },

    deleteSignature: async (id: number): Promise<void> => {
        await api.delete(`/EmailSignatures/${id}`);
    }
};

export interface EmailSignature {
    id: number;
    name: string;
    content: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateEmailSignatureDto {
    name: string;
    content: string;
    isDefault: boolean;
}

export interface UpdateEmailSignatureDto extends CreateEmailSignatureDto {
}
