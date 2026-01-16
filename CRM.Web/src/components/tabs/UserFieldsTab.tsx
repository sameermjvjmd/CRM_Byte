import { useState } from 'react';
import { Sliders, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface CustomField {
    id: string;
    label: string;
    value: string;
    type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
    options?: string[]; // For dropdown
}

interface UserFieldsTabProps {
    contactId: number;
    customFields: CustomField[];
    onUpdate: (fields: CustomField[]) => void;
}

const UserFieldsTab = ({ contactId, customFields, onUpdate }: UserFieldsTabProps) => {
    const [fields, setFields] = useState<CustomField[]>(customFields);
    const [isAdding, setIsAdding] = useState(false);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<CustomField['type']>('text');

    const handleAddField = () => {
        if (newFieldLabel.trim()) {
            const newField: CustomField = {
                id: Date.now().toString(),
                label: newFieldLabel,
                value: '',
                type: newFieldType
            };
            setFields(prev => [...prev, newField]);
            setNewFieldLabel('');
            setNewFieldType('text');
            setIsAdding(false);
        }
    };

    const handleUpdateField = (id: string, value: string) => {
        setFields(prev => prev.map(field =>
            field.id === id ? { ...field, value } : field
        ));
    };

    const handleDeleteField = (id: string) => {
        setFields(prev => prev.filter(field => field.id !== id));
    };

    const handleSave = () => {
        onUpdate(fields);
    };

    const renderFieldInput = (field: CustomField) => {
        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleUpdateField(field.id, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter value..."
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={field.value}
                        onChange={(e) => handleUpdateField(field.id, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter number..."
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={field.value}
                        onChange={(e) => handleUpdateField(field.id, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                );
            case 'checkbox':
                return (
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={field.value === 'true'}
                            onChange={(e) => handleUpdateField(field.id, e.target.checked.toString())}
                            className="w-5 h-5 rounded border-slate-300"
                        />
                        <span className="font-bold text-slate-700">Enabled</span>
                    </label>
                );
            default:
                return (
                    <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleUpdateField(field.id, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                );
        }
    };

    const getFieldTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            text: '📝',
            number: '🔢',
            date: '📅',
            dropdown: '▼',
            checkbox: '☑️'
        };
        return icons[type] || '📝';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Custom Fields</h3>
                    <p className="text-sm font-bold text-slate-500">
                        {fields.length} custom field{fields.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Field
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <Save size={16} />
                        Save All
                    </button>
                </div>
            </div>

            {/* Add Field Form */}
            {isAdding && (
                <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                    <h4 className="text-sm font-black text-indigo-900 mb-4">Add Custom Field</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-indigo-700 uppercase mb-1 block">Field Label</label>
                            <input
                                type="text"
                                value={newFieldLabel}
                                onChange={(e) => setNewFieldLabel(e.target.value)}
                                placeholder="e.g., Customer ID"
                                className="w-full px-4 py-2 border border-indigo-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-indigo-700 uppercase mb-1 block">Field Type</label>
                            <select
                                value={newFieldType}
                                onChange={(e) => setNewFieldType(e.target.value as CustomField['type'])}
                                className="w-full px-4 py-2 border border-indigo-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="checkbox">Checkbox</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="flex-1 px-4 py-2 bg-white border border-indigo-300 rounded-lg font-bold text-sm text-indigo-700 hover:bg-indigo-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddField}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all"
                        >
                            Add Field
                        </button>
                    </div>
                </div>
            )}

            {/* Fields List */}
            <div className="space-y-4">
                {fields.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                        <Sliders size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-500">No custom fields</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">Add custom fields to track additional information</p>
                    </div>
                ) : (
                    fields.map((field) => (
                        <div
                            key={field.id}
                            className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">{getFieldTypeIcon(field.type)}</span>
                                <div className="flex-1">
                                    <label className="text-sm font-black text-slate-900">{field.label}</label>
                                    <div className="text-xs font-bold text-slate-400 uppercase">{field.type}</div>
                                </div>
                                <button
                                    onClick={() => handleDeleteField(field.id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete field"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            {renderFieldInput(field)}
                        </div>
                    ))
                )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Sliders size={16} className="text-blue-600 mt-0.5" />
                    <div className="text-xs font-bold text-blue-800">
                        <strong>Custom Fields:</strong> Use custom fields to track any additional information specific to your business needs. Changes are saved when you click "Save All".
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserFieldsTab;
export type { CustomField };
