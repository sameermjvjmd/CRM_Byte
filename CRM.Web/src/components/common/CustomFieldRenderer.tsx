import React, { useState, useEffect } from 'react';

export interface CustomFieldDefinition {
    id: number;
    fieldName: string;
    fieldKey: string;
    fieldType: string;
    isRequired: boolean;
    optionsJson?: string;
    sortOrder: number;
    isActive?: boolean;
    entityType?: string;
}

export interface CustomFieldValue {
    customFieldDefinitionId: number;
    value: string;
}

interface CustomFieldRendererProps {
    fields: CustomFieldDefinition[];
    values: CustomFieldValue[];
    onChange: (values: CustomFieldValue[]) => void;
    mode?: 'edit' | 'view';
}

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
    fields,
    values,
    onChange,
    mode = 'edit'
}) => {

    // Helper to get current value for a field
    const getValue = (fieldId: number) => {
        const found = values.find(v => v.customFieldDefinitionId === fieldId);
        return found ? found.value : '';
    };

    // Helper to update value for a field
    const handleChange = (fieldId: number, newValue: string) => {
        const newValues = [...values];
        const index = newValues.findIndex(v => v.customFieldDefinitionId === fieldId);

        if (index >= 0) {
            newValues[index] = { ...newValues[index], value: newValue };
        } else {
            newValues.push({ customFieldDefinitionId: fieldId, value: newValue });
        }

        onChange(newValues);
    };

    if (fields.length === 0) return null;

    if (mode === 'view') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(field => {
                    const val = getValue(field.id);
                    if (!val) return null; // Don't show empty fields in view mode?

                    return (
                        <div key={field.id} className="p-3 bg-gray-50 rounded-lg">
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                {field.fieldName}
                            </dt>
                            <dd className="text-sm text-gray-900 font-medium">
                                {field.fieldType === 'Boolean'
                                    ? (val === 'true' ? 'Yes' : 'No')
                                    : (field.fieldType === 'URL' ? <a href={val} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{val}</a> : val)
                                }
                            </dd>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {fields.map(field => (
                <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.fieldName} {field.isRequired && <span className="text-red-500">*</span>}
                    </label>

                    {/* Text / URL / Email */}
                    {['Text', 'URL', 'Email', 'Currency'].includes(field.fieldType) && (
                        <input
                            type={field.fieldType === 'Text' ? 'text' : field.fieldType.toLowerCase()}
                            value={getValue(field.id)}
                            onChange={e => handleChange(field.id, e.target.value)}
                            required={field.isRequired}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    )}

                    {/* Number */}
                    {field.fieldType === 'Number' && (
                        <input
                            type="number"
                            value={getValue(field.id)}
                            onChange={e => handleChange(field.id, e.target.value)}
                            required={field.isRequired}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    )}

                    {/* Date */}
                    {field.fieldType === 'Date' && (
                        <input
                            type="date"
                            value={getValue(field.id)}
                            onChange={e => handleChange(field.id, e.target.value)}
                            required={field.isRequired}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    )}

                    {/* Boolean */}
                    {field.fieldType === 'Boolean' && (
                        <select
                            value={getValue(field.id)}
                            onChange={e => handleChange(field.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                            <option value="">- Select -</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    )}

                    {/* Select */}
                    {field.fieldType === 'Select' && (
                        <select
                            value={getValue(field.id)}
                            onChange={e => handleChange(field.id, e.target.value)}
                            required={field.isRequired}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                            <option value="">- Select -</option>
                            {field.optionsJson && JSON.parse(field.optionsJson).map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}

                    {/* MultiSelect - simplified as text area for now, or multiple select */}
                    {field.fieldType === 'MultiSelect' && (
                        <select
                            multiple
                            value={getValue(field.id).split(',').filter(Boolean)}
                            onChange={e => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                handleChange(field.id, selected.join(','));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm h-24"
                        >
                            {field.optionsJson && JSON.parse(field.optionsJson).map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}
                </div>
            ))}
        </div>
    );
};
