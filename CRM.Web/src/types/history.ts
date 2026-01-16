import type { Contact } from './contact';

export interface HistoryItem {
    id?: number;
    type: string;
    result: string;
    regarding: string;
    date: string;
    durationMinutes?: number;
    details?: string;
    contactId?: number;
    contact?: Contact;
}
