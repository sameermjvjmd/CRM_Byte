import React, { useState } from 'react';
import type { CustomField, CustomFieldValue as CFValue } from '../../types/CustomField.js';
import { ExternalLink, Mail, Phone as PhoneIcon, ChevronDown, ChevronRight } from 'lucide-react';

// Re-export for backward compatibility
export interface CustomFieldDefinition extends CustomField { }

export interface CustomFieldValue {
    customFieldId?: number;
    fieldName: string;
    displayName?: string;
    fieldType?: string | number;
    value: any;
}

// Helper to map numeric field types to string types
const getFieldTypeString = (fieldType: number | string): string => {
    // Handle specific string aliases that might differ from switch cases
    if (String(fieldType) === 'Dropdown') return 'Select';

    let numericType = -1;

    if (typeof fieldType === 'number') {
        numericType = fieldType;
    } else if (typeof fieldType === 'string' && !isNaN(Number(fieldType)) && fieldType.trim() !== '') {
        numericType = Number(fieldType);
    } else {
        return String(fieldType);
    }

    const typeMap: Record<number, string> = {
        0: 'Text',
        1: 'TextArea',
        2: 'Number',
        3: 'Decimal',
        4: 'Date',
        5: 'DateTime',
        6: 'Select',
        7: 'MultiSelect',
        8: 'Checkbox',
        9: 'URL',
        10: 'Email',
        11: 'Phone',
        12: 'Currency',
        13: 'Percentage'
    };

    return typeMap[numericType] || 'Text';
};

interface CustomFieldRendererProps {
    fields: CustomField[];
    values: CustomFieldValue[];
    onChange: (values: CustomFieldValue[]) => void;
    mode?: 'edit' | 'view';
    validationErrors?: Record<string, string>;
}

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
    fields,
    values,
    onChange,
    mode = 'edit',
    validationErrors = {}
}) => {
    // State for collapsed sections
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

    // Helper to get current value for a field, with default value fallback
    const getValue = (field: CustomField) => {
        const found = values.find(v => v.fieldName === field.fieldName);
        if (found && (found.value !== null && found.value !== undefined && found.value !== '')) {
            return found.value;
        }
        // Apply default value if no value exists
        return field.defaultValue || '';
    };

    // Helper to format currency
    const formatCurrency = (value: any) => {
        if (!value && value !== 0) return '';
        const num = parseFloat(value);
        return isNaN(num) ? value : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Helper to format percentage
    const formatPercentage = (value: any) => {
        if (!value && value !== 0) return '';
        return `${value}%`;
    };

    // Helper to update value for a field
    const handleChange = (field: CustomField, newValue: any) => {
        const newValues = [...values];
        const index = newValues.findIndex(v => v.fieldName === field.fieldName);

        const valueObj: CustomFieldValue = {
            customFieldId: field.id,
            fieldName: field.fieldName,
            displayName: field.displayName,
            fieldType: field.fieldType,
            value: newValue
        };

        if (index >= 0) {
            newValues[index] = valueObj;
        } else {
            newValues.push(valueObj);
        }

        onChange(newValues);
    };

    // Toggle section collapse
    const toggleSection = (sectionName: string) => {
        const newCollapsed = new Set(collapsedSections);
        if (newCollapsed.has(sectionName)) {
            newCollapsed.delete(sectionName);
        } else {
            newCollapsed.add(sectionName);
        }
        setCollapsedSections(newCollapsed);
    };

    if (fields.length === 0) return null;

    // Filter only active fields and sort by sortOrder
    const activeFields = fields
        .filter(f => f.isActive !== false)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Group fields by section
    const fieldsBySection = activeFields.reduce((acc, field) => {
        const section = field.sectionName || 'General';
        if (!acc[section]) {
            acc[section] = [];
        }
        acc[section].push(field);
        return acc;
    }, {} as Record<string, CustomField[]>);

    const sections = Object.keys(fieldsBySection).sort();

    if (mode === 'view') {
        return (
            <div className="space-y-6">
                {sections.map(sectionName => {
                    const sectionFields = fieldsBySection[sectionName];
                    const isCollapsed = collapsedSections.has(sectionName);

                    // Filter out empty fields
                    const fieldsWithValues = sectionFields.filter(field => {
                        const val = getValue(field);
                        return val || val === 0 || val === false;
                    });

                    if (fieldsWithValues.length === 0) return null;

                    return (
                        <div key={sectionName} className="border border-slate-200 rounded-lg overflow-hidden">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(sectionName)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150 flex items-center justify-between transition-colors group"
                            >
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                    {isCollapsed ? <ChevronRight size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                    {sectionName}
                                    <span className="text-xs font-normal text-slate-500 normal-case">({fieldsWithValues.length} {fieldsWithValues.length === 1 ? 'field' : 'fields'})</span>
                                </h3>
                            </button>

                            {/* Section Content */}
                            {!isCollapsed && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white">
                                    {fieldsWithValues.map(field => {
                                        const val = getValue(field);

                                        return (
                                            <div key={field.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                                <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                    {field.displayName}
                                                </dt>
                                                <dd className="text-sm text-slate-900 font-medium">
                                                    {(() => {
                                                        const fieldTypeStr = getFieldTypeString(field.fieldType);
                                                        if (fieldTypeStr === 'Checkbox' || fieldTypeStr === 'Boolean') {
                                                            return val ? 'Yes' : 'No';
                                                        } else if (fieldTypeStr === 'URL') {
                                                            return (
                                                                <a href={val} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                                                                    {val} <ExternalLink size={12} />
                                                                </a>
                                                            );
                                                        } else if (fieldTypeStr === 'Email') {
                                                            return (
                                                                <a href={`mailto:${val}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                                                                    {val} <Mail size={12} />
                                                                </a>
                                                            );
                                                        } else if (fieldTypeStr === 'Phone') {
                                                            return (
                                                                <a href={`tel:${val}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                                                                    {val} <PhoneIcon size={12} />
                                                                </a>
                                                            );
                                                        } else if (fieldTypeStr === 'Currency') {
                                                            return formatCurrency(val);
                                                        } else if (fieldTypeStr === 'Percentage') {
                                                            return formatPercentage(val);
                                                        } else {
                                                            return String(val);
                                                        }
                                                    })()}
                                                </dd>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Helper to get input class names with error styling
    const getInputClassName = (fieldName: string) => {
        const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm transition-colors";
        const hasError = validationErrors[fieldName];
        return `${baseClass} ${hasError ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'}`;
    };

    // Render a single field input
    const renderFieldInput = (field: CustomField) => {
        const fieldTypeStr = getFieldTypeString(field.fieldType);
        switch (fieldTypeStr) {
            case 'Text':
                return (
                    <input
                        type="text"
                        value={getValue(field)}
                        onChange={e => handleChange(field, e.target.value)}
                        required={field.isRequired}
                        className={getInputClassName(field.fieldName)}
                    />
                );

            case 'TextArea':
                return (
                    <textarea
                        value={getValue(field)}
                        onChange={e => handleChange(field, e.target.value)}
                        required={field.isRequired}
                        rows={3}
                        className={getInputClassName(field.fieldName)}
                    />
                );

            case 'Number':
                return (
                    <input
                        type="number"
                        value={getValue(field)}
                        onChange={e => handleChange(field, e.target.value)}
                        required={field.isRequired}
                        className={getInputClassName(field.fieldName)}
                    />
                );

            case 'Decimal':
                return (
                    <input
                        type="number"
                        step="0.01"
                        value={getValue(field)}
                        onChange={e => handleChange(field, e.target.value)}
                        required={field.isRequired}
                        className={getInputClassName(field.fieldName)}
                    />
                );

            case 'Date':
                return (
                    <input
                        type="date"
                        value={getValue(field)}
                        onChange={e => handleChange(field, e.target.value)}
                        required={field.isRequired}
                        className={getInputClassName(field.fieldName)}
                    />
                );

            case 'DateTime':
                return (
                    <input
                        type="datetime-local"
                        value={getValue(field)}
                        onChange={e => handleChange(field, e.target.value)}
                        required={field.isRequired}
                        className={getInputClassName(field.fieldName)}
                    />
                );

            case 'Checkbox':
            case 'Boolean':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={!!getValue(field)}
                            onChange={e => handleChange(field, e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-slate-600">
                            {field.helpText || 'Enable this option'}
                        </span>
                    </div>
                );

            case 'Select':
                return (
                    <select
                        value={getValue(field)}
                        onChange={e => handleChange(field, e.target.value)}
                        required={field.isRequired}
                        className={getInputClassName(field.fieldName)}
                    >
                        <option value="">- Select -</option>
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                );

            case 'MultiSelect':
                return (
                    <select
                        multiple
                        value={getValue(field)?.split(',').filter(Boolean) || []}
                        onChange={e => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            handleChange(field, selected.join(','));
                        }}
                        className={`${getInputClassName(field.fieldName)} h-32`}
                    >
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                );

            case 'URL':
                return (
                    <div className="relative">
                        <input
                            type="url"
                            value={getValue(field)}
                            onChange={e => handleChange(field, e.target.value)}
                            required={field.isRequired}
                            placeholder="https://example.com"
                            className={`${getInputClassName(field.fieldName)} pr-10`}
                        />
                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                );

            case 'Email':
                return (
                    <div className="relative">
                        <input
                            type="email"
                            value={getValue(field)}
                            onChange={e => handleChange(field, e.target.value)}
                            required={field.isRequired}
                            placeholder="email@example.com"
                            className={`${getInputClassName(field.fieldName)} pr-10`}
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                );

            case 'Phone':
                return (
                    <div className="relative">
                        <input
                            type="tel"
                            value={getValue(field)}
                            onChange={e => handleChange(field, e.target.value)}
                            required={field.isRequired}
                            placeholder="+1 (555) 123-4567"
                            className={`${getInputClassName(field.fieldName)} pr-10`}
                        />
                        <PhoneIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                );

            case 'Currency':
                return (
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={getValue(field)}
                            onChange={e => handleChange(field, e.target.value)}
                            required={field.isRequired}
                            placeholder="0.00"
                            className={`${getInputClassName(field.fieldName)} pl-8`}
                        />
                    </div>
                );

            case 'Percentage':
                return (
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={getValue(field)}
                            onChange={e => handleChange(field, e.target.value)}
                            required={field.isRequired}
                            placeholder="0"
                            className={`${getInputClassName(field.fieldName)} pr-8`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">%</span>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {sections.map(sectionName => {
                const sectionFields = fieldsBySection[sectionName];
                const isCollapsed = collapsedSections.has(sectionName);

                return (
                    <div key={sectionName} className="border border-slate-200 rounded-lg overflow-hidden">
                        {/* Section Header */}
                        <button
                            type="button"
                            onClick={() => toggleSection(sectionName)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-150 flex items-center justify-between transition-colors group"
                        >
                            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-2">
                                {isCollapsed ? <ChevronRight size={16} className="text-indigo-600" /> : <ChevronDown size={16} className="text-indigo-600" />}
                                {sectionName}
                                <span className="text-xs font-normal text-indigo-600 normal-case">({sectionFields.length} {sectionFields.length === 1 ? 'field' : 'fields'})</span>
                            </h3>
                        </button>

                        {/* Section Content */}
                        {!isCollapsed && (
                            <div className="p-4 bg-white space-y-4">
                                {sectionFields.map(field => (
                                    <div key={field.id}>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            {field.displayName} {field.isRequired && <span className="text-red-500">*</span>}
                                        </label>
                                        {field.helpText && (
                                            <p className="text-xs text-slate-500 mb-2">{field.helpText}</p>
                                        )}

                                        {renderFieldInput(field)}

                                        {/* Validation Error Message */}
                                        {validationErrors[field.fieldName] && (
                                            <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                                                <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                                                {validationErrors[field.fieldName]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
