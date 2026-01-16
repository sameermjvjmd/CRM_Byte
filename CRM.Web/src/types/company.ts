import type { Contact } from './contact';
import type { Opportunity } from './opportunity';

export interface Company {
    id: number;
    name: string;

    // Company Hierarchy
    parentCompanyId?: number;
    parentCompany?: Company;
    subsidiaries?: Company[];

    // Industry Classification
    industry?: string;
    sicCode?: string;
    naicsCode?: string;

    // Business Metrics
    annualRevenue?: number;
    employeeCount?: number;
    fiscalYearEnd?: string;

    // Contact Information
    website?: string;
    phone?: string;
    fax?: string;
    email?: string;

    // Primary Address
    address?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;

    // Financial & Stock Info
    tickerSymbol?: string;
    stockExchange?: string;

    // Company Details
    description?: string;
    logoUrl?: string;
    companyType?: string;
    yearFounded?: number;

    // Timestamps
    createdAt?: string;
    lastModifiedAt?: string;

    // Relationships
    contacts?: Contact[];
    opportunities?: Opportunity[];

    // Computed
    formattedAddress?: string;
    formattedRevenue?: string;
    contactCount?: number;
    opportunityCount?: number;
}

// Company type options
export const COMPANY_TYPES = [
    'Corporation',
    'LLC',
    'Partnership',
    'Sole Proprietorship',
    'Non-Profit',
    'Government',
    'Other'
];

// Common industries
export const INDUSTRIES = [
    'Agriculture',
    'Automotive',
    'Banking & Finance',
    'Construction',
    'Consulting',
    'Education',
    'Energy & Utilities',
    'Entertainment',
    'Government',
    'Healthcare',
    'Hospitality',
    'Insurance',
    'Legal',
    'Manufacturing',
    'Media & Publishing',
    'Non-Profit',
    'Real Estate',
    'Retail',
    'Technology',
    'Telecommunications',
    'Transportation',
    'Other'
];

// Stock exchanges
export const STOCK_EXCHANGES = [
    'NYSE',
    'NASDAQ',
    'LSE',
    'TSE',
    'HKEX',
    'Euronext',
    'SSE',
    'Other'
];
