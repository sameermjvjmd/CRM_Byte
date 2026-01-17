import { ACTIVITY_TYPES } from '../types/activity';

export const getActivityColor = (type: string) => {
    const activityType = ACTIVITY_TYPES.find(t => t.value === type);
    return activityType?.color || '#6366F1';
};

export const getActivityLightColor = (type: string) => {
    const color = getActivityColor(type);
    // Convert hex to semi-transparent or lighter version for backgrounds
    // Simplified: mapping known types to their specific light variants if needed, 
    // or just return a default light indigo
    const lightColors: Record<string, string> = {
        'Call': '#EFF6FF',
        'Meeting': '#F5F3FF',
        'To-Do': '#FFF7ED',
        'Email': '#ECFEFF',
        'Appointment': '#FDF2F8',
        'Event': '#F0FDFA',
        'Follow-up': '#FFFBEB',
        'Personal': '#F8FAFC',
        'Vacation': '#ECFDF5',
        'Letter': '#F7FEE7',
        'Fax': '#FAFAF9'
    };
    return lightColors[type] || '#EEF2FF';
};

export const getActivityBorderColor = (type: string) => {
    const color = getActivityColor(type);
    const borderColors: Record<string, string> = {
        'Call': '#3B82F6',
        'Meeting': '#8B5CF6',
        'To-Do': '#F97316',
        'Email': '#06B6D4',
        'Appointment': '#EC4899',
        'Event': '#14B8A6',
        'Follow-up': '#F59E0B',
        'Personal': '#64748B',
        'Vacation': '#10B981',
        'Letter': '#84CC16',
        'Fax': '#78716C'
    };
    return borderColors[type] || color;
};

export const getActivityTextColor = (type: string) => {
    const textColors: Record<string, string> = {
        'Call': '#1E40AF',
        'Meeting': '#5B21B6',
        'To-Do': '#9A3412',
        'Email': '#0891B2',
        'Appointment': '#9D174D',
        'Event': '#0F766E',
        'Follow-up': '#92400E',
        'Personal': '#334155',
        'Vacation': '#065F46',
        'Letter': '#3F6212',
        'Fax': '#44403C'
    };
    return textColors[type] || '#3730A3';
};
