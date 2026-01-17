import api from './api';

export interface DuplicateScanRequest {
    entityType: string;
    fields: string[];
    sensitivity: string;
}

export interface DuplicateRecord {
    id: number;
    name: string;
    attributes: Record<string, string>;
    createdAt: string;
}

export interface DuplicateGroup {
    groupId: number;
    matchScore: number;
    records: DuplicateRecord[];
}

export interface MergeRequest {
    entityType: string;
    masterRecordId: number;
    duplicateRecordIds: number[];
}

export const duplicateApi = {
    scan: async (req: DuplicateScanRequest): Promise<DuplicateGroup[]> => {
        const response = await api.post('/duplicate/scan', req);
        return response.data;
    },

    merge: async (req: MergeRequest): Promise<void> => {
        await api.post('/duplicate/merge', req);
    }
};
