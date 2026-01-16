import type { Contact } from './contact';

export interface Group {
    id: number;
    name: string;
    description?: string;

    // Hierarchy
    parentGroupId?: number;
    parentGroup?: Group;
    subGroups?: Group[];

    // Dynamic group support
    isDynamic: boolean;
    dynamicQuery?: string;

    // Category for organization
    category?: string;

    // Timestamps
    createdAt?: string;
    updatedAt?: string;

    // Members
    contacts?: Contact[];
}

// Dynamic query definition for smart groups
export interface DynamicQueryDefinition {
    filters: QueryFilter[];
}

export interface QueryFilter {
    field: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
    value: string;
}

// Available fields for dynamic filtering
export const FILTERABLE_FIELDS = [
    { value: 'city', label: 'City', type: 'text' },
    { value: 'state', label: 'State', type: 'text' },
    { value: 'company', label: 'Company', type: 'text' },
    { value: 'jobTitle', label: 'Job Title', type: 'text' },
    { value: 'leadSource', label: 'Lead Source', type: 'select' },
    { value: 'status', label: 'Status', type: 'select' },
];

// Group categories
export const GROUP_CATEGORIES = [
    'Marketing',
    'Sales',
    'Support',
    'Events',
    'Partners',
    'Vendors',
    'Internal',
    'Other'
];
