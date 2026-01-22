import { useState } from 'react';
import { Plus, Search, Save, X } from 'lucide-react';
import FilterCondition from './FilterCondition';

interface QueryBuilderProps {
    entityType: 'Contact' | 'Company' | 'Opportunity' | 'Activity';
    onSearch: (query: QueryDefinition) => void;
    onSave?: (query: QueryDefinition) => void;
}

export interface FilterConditionData {
    id: string;
    field: string;
    operator: string;
    value: any;
    value2?: any;
    logic: 'AND' | 'OR';
}

export interface QueryDefinition {
    entityType: string;
    conditions: FilterConditionData[];
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    page: number;
    pageSize: number;
}

const QueryBuilder = ({ entityType, onSearch, onSave }: QueryBuilderProps) => {
    const [conditions, setConditions] = useState<FilterConditionData[]>([
        {
            id: crypto.randomUUID(),
            field: '',
            operator: 'equals',
            value: '',
            logic: 'AND'
        }
    ]);

    const addCondition = () => {
        setConditions([
            ...conditions,
            {
                id: crypto.randomUUID(),
                field: '',
                operator: 'equals',
                value: '',
                logic: 'AND'
            }
        ]);
    };

    const removeCondition = (id: string) => {
        if (conditions.length > 1) {
            setConditions(conditions.filter(c => c.id !== id));
        }
    };

    const updateCondition = (id: string, updates: Partial<FilterConditionData>) => {
        setConditions(conditions.map(c =>
            c.id === id ? { ...c, ...updates } : c
        ));
    };

    const handleSearch = () => {
        const query: QueryDefinition = {
            entityType,
            conditions: conditions.filter(c => c.field && c.value !== ''),
            page: 1,
            pageSize: 50
        };
        onSearch(query);
    };

    const handleSave = () => {
        if (onSave) {
            const query: QueryDefinition = {
                entityType,
                conditions: conditions.filter(c => c.field && c.value !== ''),
                page: 1,
                pageSize: 50
            };
            onSave(query);
        }
    };

    const handleClear = () => {
        setConditions([
            {
                id: crypto.randomUUID(),
                field: '',
                operator: 'equals',
                value: '',
                logic: 'AND'
            }
        ]);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Advanced Search</h3>
                <button
                    onClick={handleClear}
                    className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                    <X size={16} />
                    Clear All
                </button>
            </div>

            <div className="space-y-3">
                {conditions.map((condition, index) => (
                    <div key={condition.id}>
                        {index > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                                <select
                                    value={condition.logic}
                                    onChange={(e) => updateCondition(condition.id, { logic: e.target.value as 'AND' | 'OR' })}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium bg-slate-50"
                                >
                                    <option value="AND">AND</option>
                                    <option value="OR">OR</option>
                                </select>
                                <div className="flex-1 h-px bg-slate-200"></div>
                            </div>
                        )}
                        <FilterCondition
                            entityType={entityType}
                            condition={condition}
                            onUpdate={(updates) => updateCondition(condition.id, updates)}
                            onRemove={() => removeCondition(condition.id)}
                            canRemove={conditions.length > 1}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
                <button
                    onClick={addCondition}
                    className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Add Condition
                </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                    {conditions.filter(c => c.field && c.value !== '').length} condition(s) defined
                </div>
                <div className="flex items-center gap-3">
                    {onSave && (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Save size={18} />
                            Save Search
                        </button>
                    )}
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Search size={18} />
                        Search
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QueryBuilder;
