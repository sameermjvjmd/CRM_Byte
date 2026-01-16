import { useState } from 'react';
import { X, Filter, Calendar, User, Tag } from 'lucide-react';

interface FilterConfig {
    field: string;
    operator: string;
    value: string;
}

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: FilterConfig[]) => void;
    fields: { name: string; label: string; type: 'text' | 'date' | 'select'; options?: string[] }[];
}

const FilterPanel = ({ isOpen, onClose, onApplyFilters, fields }: FilterPanelProps) => {
    const [filters, setFilters] = useState<FilterConfig[]>([
        { field: '', operator: 'equals', value: '' }
    ]);

    const operators = [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
        { value: 'greaterThan', label: 'Greater than' },
        { value: 'lessThan', label: 'Less than' },
    ];

    const addFilter = () => {
        setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
    };

    const removeFilter = (index: number) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const updateFilter = (index: number, key: keyof FilterConfig, value: string) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], [key]: value };
        setFilters(newFilters);
    };

    const handleApply = () => {
        const validFilters = filters.filter(f => f.field && f.value);
        onApplyFilters(validFilters);
        onClose();
    };

    const handleClear = () => {
        setFilters([{ field: '', operator: 'equals', value: '' }]);
        onApplyFilters([]);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Advanced Filters</h2>
                            <p className="text-xs font-bold text-slate-400">Refine your search criteria</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Filter List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {filters.map((filter, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                            {/* Filter header */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase text-slate-400 tracking-wide">
                                    Filter {index + 1}
                                </span>
                                {filters.length > 1 && (
                                    <button
                                        onClick={() => removeFilter(index)}
                                        className="text-xs font-bold text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {/* Field selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Field</label>
                                <select
                                    value={filter.field}
                                    onChange={(e) => updateFilter(index, 'field', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select field...</option>
                                    {fields.map(field => (
                                        <option key={field.name} value={field.name}>{field.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Operator selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Operator</label>
                                <select
                                    value={filter.operator}
                                    onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {operators.map(op => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Value input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Value</label>
                                {filter.field && fields.find(f => f.name === filter.field)?.type === 'select' ? (
                                    <select
                                        value={filter.value}
                                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select value...</option>
                                        {fields.find(f => f.name === filter.field)?.options?.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={filter.field && fields.find(f => f.name === filter.field)?.type === 'date' ? 'date' : 'text'}
                                        value={filter.value}
                                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                                        placeholder="Enter value..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add filter button */}
                    <button
                        onClick={addFilter}
                        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                    >
                        + Add Another Filter
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 flex gap-3">
                    <button
                        onClick={handleClear}
                        className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-200 transition-all"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default FilterPanel;
