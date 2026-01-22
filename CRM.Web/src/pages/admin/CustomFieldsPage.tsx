import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Check, X, Move } from 'lucide-react';
import { type CustomFieldDefinition } from '../../components/common/CustomFieldRenderer';

const ENTITY_TYPES = ['Contact', 'Company', 'Opportunity', 'Activity'];
const FIELD_TYPES = [
    { value: 'Text', label: 'Text' },
    { value: 'Number', label: 'Number' },
    { value: 'Date', label: 'Date' },
    { value: 'Boolean', label: 'Yes/No' },
    { value: 'Select', label: 'Dropdown' },
    { value: 'MultiSelect', label: 'Multi-Select' },
    { value: 'URL', label: 'URL' },
    { value: 'Email', label: 'Email' },
    { value: 'Currency', label: 'Currency' }
];

export default function CustomFieldsPage() {
    const [activeTab, setActiveTab] = useState('Contact');
    const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        fieldName: '',
        fieldType: 'Text',
        isRequired: false,
        options: ''
    });

    useEffect(() => {
        fetchFields();
    }, [activeTab]);

    const fetchFields = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/CustomFields/${activeTab}`);
            setFields(data);
        } catch (error) {
            toast.error('Failed to load fields');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                entityType: activeTab,
                optionsJson: formData.options ? JSON.stringify(formData.options.split('\n').filter(o => o.trim())) : null,
                isActive: true
            };

            if (editingField) {
                await api.put(`/CustomFields/${editingField.id}`, { ...editingField, ...payload });
                toast.success('Field updated');
            } else {
                await api.post('/CustomFields', payload);
                toast.success('Field created');
            }

            setShowModal(false);
            setEditingField(null);
            setFormData({ fieldName: '', fieldType: 'Text', isRequired: false, options: '' });
            fetchFields();
        } catch (error) {
            toast.error('Failed to save field');
        }
    };

    const handleEdit = (field: CustomFieldDefinition) => {
        setEditingField(field);
        setFormData({
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            isRequired: field.isRequired,
            options: field.optionsJson ? JSON.parse(field.optionsJson as string).join('\n') : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this field?')) return;
        try {
            await api.delete(`/CustomFields/${id}`);
            toast.success('Field deleted');
            fetchFields();
        } catch (error) {
            toast.error('Failed to delete field');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Custom Fields</h1>
                    <p className="text-gray-500">Manage custom data fields for your entities</p>
                </div>
                <button
                    onClick={() => {
                        setEditingField(null);
                        setFormData({ fieldName: '', fieldType: 'Text', isRequired: false, options: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Field
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {ENTITY_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveTab(type)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === type
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {type} Fields
                        </button>
                    ))}
                </nav>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Label</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Internal Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                        ) : fields.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No custom fields defined for {activeTab}.</td></tr>
                        ) : (
                            fields.map(field => (
                                <tr key={field.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.fieldName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{field.fieldKey}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{field.fieldType}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {field.isRequired && <Check className="w-4 h-4 text-green-500 mx-auto" />}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end space-x-3">
                                            <button onClick={() => handleEdit(field)} className="text-gray-400 hover:text-indigo-600">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(field.id)} className="text-gray-400 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingField ? 'Edit Field' : 'New Custom Field'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fieldName}
                                    onChange={e => setFormData({ ...formData, fieldName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g. T-Shirt Size"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                                <select
                                    value={formData.fieldType}
                                    onChange={e => setFormData({ ...formData, fieldType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={!!editingField} // Don't ensure Type change to avoid data loss issues for now
                                >
                                    {FIELD_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {(formData.fieldType === 'Select' || formData.fieldType === 'MultiSelect') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Options <span className="text-gray-400 font-normal">(One per line)</span>
                                    </label>
                                    <textarea
                                        value={formData.options}
                                        onChange={e => setFormData({ ...formData, options: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 font-mono text-sm"
                                        placeholder="Option A&#10;Option B&#10;Option C"
                                    />
                                </div>
                            )}

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isRequired"
                                    checked={formData.isRequired}
                                    onChange={e => setFormData({ ...formData, isRequired: e.target.checked })}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                                    Required Field
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                                >
                                    {editingField ? 'Save Changes' : 'Create Field'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
