export type CustomFieldType =
    | 'Text'
    | 'Number'
    | 'Date'
    | 'Boolean'
    | 'Select'
    | 'MultiSelect'
    | 'TextArea'
    | 'Decimal'
    | 'DateTime'
    | 'Checkbox'
    | 'URL'
    | 'Email'
    | 'Phone'
    | 'Currency'
    | 'Percentage';

export interface ValidationRule {
    ruleType: string;
    value: string;
    errorMessage: string;
}

export interface FieldOption {
    label: string;
    value: string;
    isDefault: boolean;
}

export interface CustomField {
    id: number;
    entityType: string;
    fieldName: string;
    displayName: string;
    fieldType: CustomFieldType;
    isRequired: boolean;
    isActive: boolean;
    defaultValue?: string;
    validationRules?: ValidationRule[];
    options?: FieldOption[];
    displayOrder: number;
    sectionName?: string;
    helpText?: string;
    fieldKey?: string;
    optionsJson?: string;
}

export interface CreateCustomFieldDto {
    entityType: string;
    fieldName: string;
    displayName: string;
    fieldType: string;
    isRequired: boolean;
    defaultValue?: string;
    validationRules?: ValidationRule[];
    options?: FieldOption[];
    sectionName?: string;
    helpText?: string;
}

export interface UpdateCustomFieldDto {
    displayName: string;
    isRequired: boolean;
    isActive: boolean;
    defaultValue?: string;
    validationRules?: ValidationRule[];
    options?: FieldOption[];
    displayOrder: number;
    sectionName?: string;
    helpText?: string;
}

export interface CustomFieldValue {
    customFieldId: number;
    fieldName: string;
    displayName: string;
    fieldType: string;
    value: any;
}

export interface SaveCustomFieldValuesDto {
    values: Record<string, any>;
}
