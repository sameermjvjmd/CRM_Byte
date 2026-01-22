import { Trash2 } from 'lucide-react';
import type { FilterConditionData } from './QueryBuilder';

interface FilterConditionProps {
    entityType: 'Contact' | 'Company' | 'Opportunity' | 'Activity';
    condition: FilterConditionData;
    onUpdate: (updates: Partial<FilterConditionData>) => void;
    onRemove: () => void;
    canRemove: boolean;
}

const FilterCondition = ({ entityType, condition, onUpdate, onRemove, canRemove }: FilterConditionProps) => {
    const getFieldsForEntity = () => {
        switch (entityType) {
            case 'Contact':
                return [
                    { value: 'FirstName', label: 'First Name', type: 'string' },
                    { value: 'LastName', label: 'Last Name', type: 'string' },
                    { value: 'Email', label: 'Email', type: 'string' },
                    { value: 'Phone', label: 'Phone', type: 'string' },
                    { value: 'JobTitle', label: 'Job Title', type: 'string' },
                    { value: 'Status', label: 'Status', type: 'string' },
                    { value: 'LeadScore', label: 'Lead Score', type: 'number' },
                    { value: 'LeadSource', label: 'Lead Source', type: 'string' },
                    { value: 'Territory', label: 'Territory', type: 'string' },
                    { value: 'CreatedAt', label: 'Created Date', type: 'date' }
                ];
            case 'Company':
                return [
                    { value: 'Name', label: 'Company Name', type: 'string' },
                    { value: 'Industry', label: 'Industry', type: 'string' },
                    { value: 'Revenue', label: 'Revenue', type: 'number' },
                    { value: 'EmployeeCount', label: 'Employee Count', type: 'number' },
                    { value: 'Website', label: 'Website', type: 'string' },
                    { value: 'Phone', label: 'Phone', type: 'string' },
                    { value: 'CreatedAt', label: 'Created Date', type: 'date' }
                ];
            case 'Opportunity':
                return [
                    { value: 'Name', label: 'Opportunity Name', type: 'string' },
                    { value: 'Amount', label: 'Amount', type: 'number' },
                    { value: 'Stage', label: 'Stage', type: 'string' },
                    { value: 'Probability', label: 'Probability', type: 'number' },
                    { value: 'ExpectedCloseDate', label: 'Expected Close Date', type: 'date' },
                    { value: 'DealScore', label: 'Deal Score', type: 'number' },
                    { value: 'DealHealth', label: 'Deal Health', type: 'string' },
                    { value: 'CreatedAt', label: 'Created Date', type: 'date' }
                ];
            case 'Activity':
                return [
                    { value: 'Subject', label: 'Subject', type: 'string' },
                    { value: 'Type', label: 'Type', type: 'string' },
                    { value: 'Priority', label: 'Priority', type: 'string' },
                    { value: 'Status', label: 'Status', type: 'string' },
                    { value: 'StartTime', label: 'Start Time', type: 'date' },
                    { value: 'EndTime', label: 'End Time', type: 'date' },
                    { value: 'IsCompleted', label: 'Is Completed', type: 'boolean' }
                ];
            default:
                return [];
        }
    };

    const getOperatorsForType = (type: string) => {
        switch (type) {
            case 'string':
                return [
                    { value: 'equals', label: 'Equals' },
                    { value: 'notEquals', label: 'Not Equals' },
                    { value: 'contains', label: 'Contains' },
                    { value: 'startsWith', label: 'Starts With' },
                    { value: 'endsWith', label: 'Ends With' },
                    { value: 'isEmpty', label: 'Is Empty' },
                    { value: 'isNotEmpty', label: 'Is Not Empty' }
                ];
            case 'number':
                return [
                    { value: 'equals', label: 'Equals' },
                    { value: 'notEquals', label: 'Not Equals' },
                    { value: 'greaterThan', label: 'Greater Than' },
                    { value: 'lessThan', label: 'Less Than' },
                    { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
                    { value: 'lessThanOrEqual', label: 'Less Than or Equal' }
                ];
            case 'date':
                return [
                    { value: 'equals', label: 'Equals' },
                    { value: 'greaterThan', label: 'After' },
                    { value: 'lessThan', label: 'Before' },
                    { value: 'greaterThanOrEqual', label: 'On or After' },
                    { value: 'lessThanOrEqual', label: 'On or Before' }
                ];
            case 'boolean':
                return [
                    { value: 'equals', label: 'Is' }
                ];
            default:
                return [{ value: 'equals', label: 'Equals' }];
        }
    };

    const fields = getFieldsForEntity();
    const selectedField = fields.find(f => f.value === condition.field);
    const operators = selectedField ? getOperatorsForType(selectedField.type) : [];

    const needsValue = !['isEmpty', 'isNotEmpty'].includes(condition.operator);

    const renderValueInput = () => {
        if (!needsValue) return null;

        if (!selectedField) {
            return (
                <input
                    type="text"
                    placeholder="Select a field first"
                    disabled
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
            );
        }

        switch (selectedField.type) {
            case 'number':
                return (
                    <input
                        type="number"
                        value={condition.value || ''}
                        onChange={(e) => onUpdate({ value: e.target.value ? parseFloat(e.target.value) : '' })}
                        placeholder="Enter value"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={condition.value || ''}
                        onChange={(e) => onUpdate({ value: e.target.value })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                );
            case 'boolean':
                return (
                    <select
                        value={condition.value?.toString() || 'true'}
                        onChange={(e) => onUpdate({ value: e.target.value === 'true' })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                );
            default:
                return (
                    <input
                        type="text"
                        value={condition.value || ''}
                        onChange={(e) => onUpdate({ value: e.target.value })}
                        placeholder="Enter value"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                );
        }
    };

    return (
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {/* Field Selection */}
            <select
                value={condition.field}
                onChange={(e) => onUpdate({ field: e.target.value, operator: 'equals', value: '' })}
                className="w-48 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
                <option value="">Select Field</option>
                {fields.map(field => (
                    <option key={field.value} value={field.value}>
                        {field.label}
                    </option>
                ))}
            </select>

            {/* Operator Selection */}
            <select
                value={condition.operator}
                onChange={(e) => onUpdate({ operator: e.target.value })}
                disabled={!condition.field}
                className="w-48 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-slate-100"
            >
                {operators.map(op => (
                    <option key={op.value} value={op.value}>
                        {op.label}
                    </option>
                ))}
            </select>

            {/* Value Input */}
            {renderValueInput()}

            {/* Remove Button */}
            {canRemove && (
                <button
                    onClick={onRemove}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove condition"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    );
};

export default FilterCondition;
