import type { Contact } from './contact';
import type { Company } from './company';
import type { Opportunity } from './opportunity';

export interface Activity {
    id: number;
    subject: string;
    type: string;
    category?: string;

    // Timing
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    durationMinutes?: number;

    // Status & Outcome
    isCompleted: boolean;
    completedAt?: string;
    result?: string;
    outcome?: string;

    // Recurring
    isRecurring: boolean;
    recurrencePattern?: string;
    recurrenceInterval?: number;
    recurrenceEndDate?: string;
    recurrenceCount?: number;
    recurrenceDays?: string;
    seriesId?: number;

    // Reminder
    hasReminder: boolean;
    reminderMinutesBefore?: number;
    reminderSent?: boolean;

    // Associations
    contactId?: number;
    contact?: Contact;
    companyId?: number;
    company?: Company;
    opportunityId?: number;
    opportunity?: Opportunity;

    // Priority & Visibility
    priority?: string;
    isPrivate?: boolean;

    // Details
    location?: string;
    notes?: string;
    meetingLink?: string;
    attendees?: string;

    // Color
    color?: string;

    // Timestamps
    createdAt?: string;
    lastModifiedAt?: string;
}

export interface CalendarEvent {
    id: number;
    subject: string;
    type: string;
    start: string;
    end: string;
    isAllDay: boolean;
    isCompleted: boolean;
    priority?: string;
    isRecurring: boolean;
    color: string;
    contactName?: string;
    contactId?: number;
    location?: string;
}

export interface ActivityStats {
    totalActivities: number;
    completedActivities: number;
    pendingActivities: number;
    overdueActivities: number;
    recurringActivities: number;
    allDayEvents: number;
    countsByType: Record<string, number>;
    countsByPriority: Record<string, number>;
    completionRate: number;
}

// Activity Types
export const ACTIVITY_TYPES = [
    { value: 'Call', label: 'Call', color: '#3B82F6', icon: 'Phone' },
    { value: 'CallAttempt', label: 'Call Attempt', color: '#6366F1', icon: 'PhoneMissed' },
    { value: 'CallReached', label: 'Call Reached', color: '#22C55E', icon: 'PhoneForwarded' },
    { value: 'CallLeftMessage', label: 'Left Message', color: '#EAB308', icon: 'MessageSquare' },
    { value: 'Meeting', label: 'Meeting', color: '#8B5CF6', icon: 'Users' },
    { value: 'To-Do', label: 'To-Do', color: '#F97316', icon: 'CheckSquare' },
    { value: 'Email', label: 'Email', color: '#06B6D4', icon: 'Mail' },
    { value: 'Appointment', label: 'Appointment', color: '#EC4899', icon: 'Calendar' },
    { value: 'Event', label: 'Event', color: '#14B8A6', icon: 'Star' },
    { value: 'Follow-up', label: 'Follow-up', color: '#F59E0B', icon: 'RefreshCw' },
    { value: 'Personal', label: 'Personal', color: '#64748B', icon: 'User' },
    { value: 'Vacation', label: 'Vacation', color: '#10B981', icon: 'Sun' },
    { value: 'Letter', label: 'Letter', color: '#84CC16', icon: 'FileText' },
    { value: 'Fax', label: 'Fax', color: '#78716C', icon: 'Printer' },
];

// Activity Results
export const ACTIVITY_RESULTS = [
    { value: 'Completed', label: 'Completed' },
    { value: 'Attempted', label: 'Attempted' },
    { value: 'LeftMessage', label: 'Left Message' },
    { value: 'NoAnswer', label: 'No Answer' },
    { value: 'Busy', label: 'Busy' },
    { value: 'Rescheduled', label: 'Rescheduled' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'NotReached', label: 'Not Reached' },
];

// Recurrence Patterns
export const RECURRENCE_PATTERNS = [
    { value: 'Daily', label: 'Daily' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'BiWeekly', label: 'Every Two Weeks' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Yearly', label: 'Yearly' },
];

// Reminder Options
export const REMINDER_OPTIONS = [
    { value: 0, label: 'At time of event' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 120, label: '2 hours before' },
    { value: 1440, label: '1 day before' },
    { value: 2880, label: '2 days before' },
];

// Priority Levels
export const PRIORITY_LEVELS = [
    { value: 'High', label: 'High', color: '#EF4444' },
    { value: 'Normal', label: 'Normal', color: '#3B82F6' },
    { value: 'Low', label: 'Low', color: '#6B7280' },
];
