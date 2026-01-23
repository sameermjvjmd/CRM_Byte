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
    fieldType: number; // 0=Text, 1=Textarea, 2=Number, 3=Decimal, 4=Date, 5=DateTime, 6=Dropdown, 7=MultiSelect, 8=Checkbox, 9=URL, 10=Email, 11=Phone, 12=Currency, 13=Percentage
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
