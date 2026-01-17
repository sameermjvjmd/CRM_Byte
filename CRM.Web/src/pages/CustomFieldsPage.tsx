import { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Trash2, Edit, Save, X, GripVertical, Check } from 'lucide-react';

// Models
interface CustomFieldDefinition {
    id: number;
    entityType: string;
    fieldName: string;
    fieldKey: string;
    fieldType: string; // Text, Number, Date, Bool, Select, MultiSelect
    isRequired: boolean;
    optionsJson?: string;
    sortOrder: number;
    isActive: boolean;
}

const fieldTypes = [
    { value: 'Text', label: 'Text' },
    { value: 'Number', label: 'Number' },
    { value: 'Date', label: 'Date' },
    { value: 'Bool', label: 'Yes/No (Checkbox)' },
    { value: 'Select', label: 'Dropdown' },
    { value: 'MultiSelect', label: 'Multi-Select List' },
    { value: 'URL', label: 'URL / Link' },
    { value: 'Email', label: 'Email Address' },
    { value: 'Currency', label: 'Currency' },
];

const entityTypes = ['Contact', 'Company', 'Opportunity'];

const CustomFieldsPage = () => {
    const [activeEntity, setActiveEntity] = useState('Contact');
    const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);

    useEffect(() => {
        fetchFields();
    }, [activeEntity]);

    const fetchFields = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/customfields/${activeEntity}`);
            setFields(response.data);
        } catch (error) {
            console.error('Error fetching fields:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this field? Data stored in this field will be hidden.')) return;
        try {
            await api.delete(`/customfields/${id}`);
            fetchFields();
        } catch (error) {
            console.error(error);
            alert('Failed to delete field');
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Custom Fields</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Customize data layout for your records
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingField(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} />
                    ADD FIELD
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                {entityTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => setActiveEntity(type)}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeEntity === type
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        {type} Fields
                    </button>
                ))}
            </div>

            {/* Field List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase">Label</th>
                            <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase">Type</th>
                            <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase">Details</th>
                            <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading...</td></tr>
                        ) : fields.length === 0 ? (
                            <tr><td colSpan={4} className="p-16 text-center text-slate-500">No custom fields defined for {activeEntity}.</td></tr>
                        ) : (
                            fields.map(field => (
                                <tr key={field.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{field.fieldName}</div>
                                        <div className="text-xs font-mono text-slate-400">{field.fieldKey}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                                            {field.fieldType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {field.isRequired && <span className="text-red-500 font-bold mr-2">Required</span>}
                                        {field.optionsJson && (
                                            <span title={field.optionsJson}>
                                                Options: {JSON.parse(field.optionsJson).length} items
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingField(field);
                                                    setShowModal(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(field.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <FieldModal
                    field={editingField}
                    entityType={activeEntity}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchFields();
                    }}
                />
            )}
        </div>
    );
};

const FieldModal = ({ field, entityType, onClose, onSuccess }: any) => {
    const [formData, setFormData] = useState({
        fieldName: field?.fieldName || '',
        fieldType: field?.fieldType || 'Text',
        isRequired: field?.isRequired || false,
        optionsText: field?.optionsJson ? JSON.parse(field?.optionsJson).join('\n') : '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                entityType: entityType,
                fieldKey: field?.fieldKey || formData.fieldName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
                optionsJson: (formData.fieldType === 'Select' || formData.fieldType === 'MultiSelect')
                    ? JSON.stringify(formData.optionsText.split('\n').filter((o: string) => o.trim()))
                    : null
            };

            if (field) {
                await api.put(`/customfields/${field.id}`, { ...payload, id: field.id });
            } else {
                await api.post('/customfields', payload);
            }
            onSuccess();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(', ')
                : (error.response?.data?.title || error.message);
            alert(`Error saving field: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">
                        {field ? 'Edit Field' : 'New Custom Field'}
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Field Label</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                            value={formData.fieldName}
                            onChange={e => setFormData({ ...formData, fieldName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Data Type</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                            value={formData.fieldType}
                            onChange={e => setFormData({ ...formData, fieldType: e.target.value })}
                        >
                            {fieldTypes.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {(formData.fieldType === 'Select' || formData.fieldType === 'MultiSelect') && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                                Options (One per line)
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                                rows={5}
                                value={formData.optionsText}
                                onChange={e => setFormData({ ...formData, optionsText: e.target.value })}
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isRequired"
                            className="w-4 h-4 text-indigo-600 rounded"
                            checked={formData.isRequired}
                            onChange={e => setFormData({ ...formData, isRequired: e.target.checked })}
                        />
                        <label htmlFor="isRequired" className="text-sm font-medium text-slate-700">Required Field</label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Field'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomFieldsPage;
