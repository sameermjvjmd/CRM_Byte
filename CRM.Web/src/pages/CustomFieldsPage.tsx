import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast'; // Ensure react-hot-toast is installed
import api from '../api/api';
import { customFieldsApi } from '../api/customFieldsApi';
import type { CustomField, CustomFieldType, CreateCustomFieldDto, UpdateCustomFieldDto, FieldOption } from '../types/CustomField.js';
import { Plus, Trash2, Edit, Save, X, GripVertical } from 'lucide-react';

const fieldTypes: { value: CustomFieldType; label: string }[] = [
    { value: 'Text', label: 'Single Line Text' },
    { value: 'TextArea', label: 'Multi Line Text' },
    { value: 'Number', label: 'Number' },
    { value: 'Decimal', label: 'Decimal' },
    { value: 'Currency', label: 'Currency ($)' },
    { value: 'Percentage', label: 'Percentage (%)' },
    { value: 'Date', label: 'Date' },
    { value: 'DateTime', label: 'Date & Time' },
    { value: 'Email', label: 'Email Address' },
    { value: 'Phone', label: 'Phone Number' },
    { value: 'URL', label: 'Website URL' },
    { value: 'Checkbox', label: 'Yes/No (Checkbox)' },
    { value: 'Select', label: 'Dropdown List' },
    { value: 'MultiSelect', label: 'Multi-Select List' },
];

const entityTypes = ['Contact', 'Company', 'Opportunity'];

const CustomFieldsPage = () => {
    const [activeEntity, setActiveEntity] = useState('Contact');
    const [fields, setFields] = useState<CustomField[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingField, setEditingField] = useState<CustomField | null>(null);

    useEffect(() => {
        fetchFields();
    }, [activeEntity]);

    const fetchFields = async () => {
        setLoading(true);
        try {
            const data = await customFieldsApi.getAll(activeEntity);
            setFields(data);
        } catch (error) {
            console.error('Error fetching fields:', error);
            toast.error('Failed to load custom fields');
        } finally {
            setLoading(false);
        }
    };

    const getFieldTypeLabel = (typeId: number) => {
        switch (typeId) {
            case 0: return 'Single Line Text';
            case 1: return 'Multi Line Text';
            case 2: return 'Number';
            case 3: return 'Decimal';
            case 4: return 'Date';
            case 5: return 'Date & Time';
            case 6: return 'Dropdown List';
            case 7: return 'Multi-Select List';
            case 8: return 'Yes/No (Checkbox)';
            case 9: return 'Website URL';
            case 10: return 'Email Address';
            case 11: return 'Phone Number';
            case 12: return 'Currency ($)';
            case 13: return 'Percentage (%)';
            default: return String(typeId);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this field? Data stored in this field will be lost.')) return;
        try {
            await customFieldsApi.delete(id);
            toast.success('Field deleted successfully');
            fetchFields();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete field');
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
                            <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase">Label / Key</th>
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
                                        <div className="font-bold text-slate-900">{field.displayName}</div>
                                        <div className="text-xs font-mono text-slate-400">{field.fieldName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                                            {getFieldTypeLabel(field.fieldType)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="flex flex-col gap-1">
                                            {field.isRequired && <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded w-fit">Required</span>}
                                            {field.isActive ? (
                                                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded w-fit">Active</span>
                                            ) : (
                                                <span className="text-slate-500 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded w-fit">Inactive</span>
                                            )}
                                            {field.options && field.options.length > 0 && (
                                                <span className="text-slate-500 text-xs">
                                                    {field.options.length} Options
                                                </span>
                                            )}
                                        </div>
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

interface FieldModalProps {
    field: CustomField | null;
    entityType: string;
    onClose: () => void;
    onSuccess: () => void;
}

const FieldModal = ({ field, entityType, onClose, onSuccess }: FieldModalProps) => {
    const [formData, setFormData] = useState({
        displayName: field?.displayName || '',
        fieldName: field?.fieldName || '',
        fieldType: field?.fieldType || 'Text',
        isRequired: field?.isRequired || false,
        isActive: field?.isActive !== undefined ? field.isActive : true,
        optionsText: field?.options ? field.options.map(o => o.label).join('\n') : '',
        sectionName: field?.sectionName || '',
        helpText: field?.helpText || '',
        defaultValue: field?.defaultValue || ''
    });
    const [loading, setLoading] = useState(false);

    // Auto-generate key from label on creation
    useEffect(() => {
        if (!field && formData.displayName && !formData.fieldName) {
            const genKey = formData.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
            setFormData(prev => ({ ...prev, fieldName: genKey }));
        }
    }, [formData.displayName, field]);

    // Helper to convert field type string to enum number
    const fieldTypeToNumber = (fieldType: string | number): number => {
        if (fieldType === null || fieldType === undefined) return 0;
        if (typeof fieldType === 'number') return fieldType;
        const found = fieldTypes.find(t => t.value === fieldType);
        // Map string types to enum integers based on index or explicit mapping if needed
        // Since the backend enum matches the order of some types, we need to be careful.
        // Let's use a explicit map based on the backend enum:
        /*
        Text = 0, Textarea = 1, Number = 2, Decimal = 3, Date = 4, DateTime = 5,
        Dropdown = 6, MultiSelect = 7, Checkbox = 8, URL = 9, Email = 10, Phone = 11,
        Currency = 12, Percentage = 13
        */
        switch (fieldType) {
            case 'Text': return 0;
            case 'TextArea': return 1;
            case 'Number': return 2;
            case 'Decimal': return 3;
            case 'Date': return 4;
            case 'DateTime': return 5;
            case 'Select': return 6;
            case 'MultiSelect': return 7;
            case 'Checkbox': return 8;
            case 'URL': return 9;
            case 'Email': return 10;
            case 'Phone': return 11;
            case 'Currency': return 12;
            case 'Percentage': return 13;
            default: return 0;
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get user ID
            let userId = 1;
            try {
                const nexusUserStr = localStorage.getItem('nexus_user');
                const userStr = localStorage.getItem('user');
                if (nexusUserStr) userId = JSON.parse(nexusUserStr).id;
                else if (userStr) userId = JSON.parse(userStr).id;
            } catch (e) { console.warn('User ID parse failed', e); }

            // Parse options
            let optionsJson: string | null = null;
            if (formData.fieldType === 'Select' || formData.fieldType === 'MultiSelect') {
                const opts = formData.optionsText.split('\n')
                    .filter(o => o.trim())
                    .map(label => label.trim());
                if (opts.length > 0) optionsJson = JSON.stringify(opts);
            }

            const payload = {
                DisplayName: formData.displayName,
                FieldName: formData.fieldName,
                FieldType: fieldTypeToNumber(formData.fieldType),
                EntityType: entityType,
                Options: optionsJson,
                IsRequired: formData.isRequired,
                IsActive: formData.isActive,
                SectionName: formData.sectionName,
                HelpText: formData.helpText,
                DefaultValue: formData.defaultValue,
                CreatedBy: Number(userId) || 1,
                DisplayOrder: field ? field.displayOrder : 0
            };

            console.log('📤 Sending payload:', payload);

            if (field) {
                // Update
                await api.put(`/CustomFields/${field.id}`, { ...field, ...payload });
                toast.success('Field updated successfully');
            } else {
                // Create
                await api.post('/CustomFields', payload);
                toast.success('Field created successfully');
            }
            onSuccess();
        } catch (error: any) {
            console.error('❌ Error saving field:', error);
            console.error('❌ Error response:', error.response?.data);
            const msg = error.response?.data?.detail || error.response?.data?.title || error.message || 'Unknown error';
            toast.error(`Error saving field: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-900">
                        {field ? 'Edit Field' : 'New Custom Field'}
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Field Label (Display Name)</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.displayName}
                                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                placeholder="e.g. Favorite Color"
                            />
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Field Key (Internal)</label>
                            <input
                                type="text"
                                required
                                disabled={!!field} // Disabled on Edit
                                className={`w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm ${field ? 'bg-slate-100 text-slate-500' : 'bg-white font-medium'}`}
                                value={formData.fieldName}
                                onChange={e => setFormData({ ...formData, fieldName: e.target.value })}
                                placeholder="e.g. favorite_color"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Unique key for API and database.</p>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Data Type</label>
                            <select
                                className={`w-full px-3 py-2 border border-slate-200 rounded-lg font-medium ${field ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                                value={formData.fieldType}
                                disabled={!!field} // Disabled on Edit
                                onChange={e => setFormData({ ...formData, fieldType: e.target.value as CustomFieldType })}
                            >
                                {fieldTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(formData.fieldType === 'Select' || formData.fieldType === 'MultiSelect') && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                                Options (One per line)
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium min-h-[100px]"
                                value={formData.optionsText}
                                onChange={e => setFormData({ ...formData, optionsText: e.target.value })}
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Section Name (Optional)</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                                value={formData.sectionName}
                                onChange={e => setFormData({ ...formData, sectionName: e.target.value })}
                                placeholder="e.g. General Info"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Help Text (Optional)</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                                value={formData.helpText}
                                onChange={e => setFormData({ ...formData, helpText: e.target.value })}
                                placeholder="Tooltip text for users"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Default Value (Optional)</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                            value={formData.defaultValue}
                            onChange={e => setFormData({ ...formData, defaultValue: e.target.value })}
                            placeholder="Default value for new records"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">This value will be pre-filled for new records.</p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2 bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isRequired"
                                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                checked={formData.isRequired}
                                onChange={e => setFormData({ ...formData, isRequired: e.target.checked })}
                            />
                            <label htmlFor="isRequired" className="text-sm font-bold text-slate-700 cursor-pointer">Required Field</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                className="w-4 h-4 text-green-600 rounded cursor-pointer"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">Field is Active</label>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : <><Save size={18} /> Save Field</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomFieldsPage;
