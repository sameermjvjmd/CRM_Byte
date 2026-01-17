export interface ContactEmail {
    id: number;
    contactId: number;
    email: string;
    emailType: string;
    label?: string;
    isPrimary: boolean;
    allowMarketing: boolean;
    optedOut: boolean;
    isVerified: boolean;
    sortOrder: number;
}

export interface ContactAddress {
    id: number;
    contactId: number;
    addressType: string;
    label?: string;
    address1?: string;
    address2?: string;
    address3?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    county?: string;
    isPrimary: boolean;
    isVerified: boolean;
    latitude?: number;
    longitude?: number;
    sortOrder: number;
    formattedAddress?: string;
    singleLineAddress?: string;
}

// Custom Fields
export interface CustomFieldValue {
    id?: number;
    entityId?: number;
    entityType?: string;
    customFieldDefinitionId: number;
    value: string;
}

export interface Contact {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    mobilePhone?: string;
    fax?: string;
    phoneExtension?: string;
    jobTitle?: string;
    department?: string;
    salutation?: string;
    company?: string | Company;
    companyId?: number;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    status?: string;
    referredBy?: number;
    lastResult?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    website?: string;
    photoUrl?: string;
    contactSource?: string;
    leadSource?: string;
    // Multiple emails and addresses
    contactEmails?: ContactEmail[];
    contactAddresses?: ContactAddress[];
    // Custom Fields
    customValues?: CustomFieldValue[];
}

export interface Company {
    id: number;
    name: string;
}

// Type constants
export const EMAIL_TYPES = ['Work', 'Personal', 'Other', 'Assistant', 'Alternate'];
export const ADDRESS_TYPES = ['Business', 'Home', 'Shipping', 'Billing', 'Mailing', 'Other'];

