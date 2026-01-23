import { useState, useEffect } from 'react';
import {
    Plus, Edit2, Trash2, GripVertical, Save, X, Eye, EyeOff,
    Type, Hash, Calendar, CheckSquare, List, AlignLeft
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

interface CustomFieldDefinition {
    id: number;
    entityType: string;
    fieldName: string;
    fieldKey: string;
    fieldType: string;
    isRequired: boolean;
    optionsJson?: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
}

const CustomFieldsAdminPage = () => {
    const [selectedTab, setSelectedTab] = useState<'Contact' | 'Company' | 'Opportunity'>('Contact');
    const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
    const [formData, setFormData] = useState({
        fieldName: '',
        fieldType: 'Text',
        isRequired: false,
        options: ''
    });

    useEffect(() => {
        loadFields();
    }, [selectedTab]);

    const loadFields = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/customfields/definitions?entityType=${selectedTab}`);
            setFields(response.data);
        } catch (error) {
            console.error('Error loading custom fields:', error);
            toast.error('Failed to load custom fields');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingField(null);
        setFormData({
            fieldName: '',
            fieldType: 'Text',
            isRequired: false,
            options: ''
        });
        setShowModal(true);
    };

    const handleEdit = (field: CustomFieldDefinition) => {
        setEditingField(field);
        setFormData({
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            isRequired: field.isRequired,
            options: field.optionsJson || ''
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                entityType: selectedTab,
                fieldName: formData.fieldName,
                fieldKey: formData.fieldName.toLowerCase().replace(/ /g, '_'),
                fieldType: formData.fieldType,
                isRequired: formData.isRequired,
                optionsJson: formData.fieldType === 'Select' || formData.fieldType === 'MultiSelect'
                    ? formData.options
                    : null,
                sortOrder: editingField?.sortOrder || fields.length,
                isActive: true
            };

            if (editingField) {
                await api.put(`/customfields/definitions/${editingField.id}`, { ...payload, id: editingField.id });
                toast.success('Field updated successfully');
            } else {
                await api.post('/customfields/definitions', payload);
                toast.success('Field created successfully');
            }

            setShowModal(false);
            loadFields();
        } catch (error: any) {
            console.error('Error saving field:', error);
            toast.error(error.response?.data?.error || 'Failed to save field');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this field? This will also delete all values for this field.')) {
            return;
        }

        try {
            await api.delete(`/customfields/definitions/${id}`);
            toast.success('Field deleted successfully');
            loadFields();
        } catch (error) {
            console.error('Error deleting field:', error);
            toast.error('Failed to delete field');
        }
    };

    const getFieldTypeIcon = (type: string) => {
        switch (type) {
            case 'Text': return <Type size={18} />;
            case 'Number': return <Hash size={18} />;
            case 'Date': return <Calendar size={18} />;
            case 'Checkbox': return <CheckSquare size={18} />;
            case 'Select':
            case 'MultiSelect': return <List size={18} />;
            default: return <AlignLeft size={18} />;
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Custom Fields</h1>
                <p className="text-gray-600 mt-1">Define custom fields for your CRM entities</p>
            </div>

            {/* Entity Type Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                    {['Contact', 'Company', 'Opportunity'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab as any)}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${selectedTab === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab}s
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="text-gray-600">
                    {fields.length} custom field{fields.length !== 1 ? 's' : ''}
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Custom Field</span>
                </button>
            </div>

            {/* Fields List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading fields...</p>
                </div>
            ) : fields.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <AlignLeft size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg font-medium">No custom fields yet</p>
                    <p className="text-gray-500 mt-2">Create your first custom field to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Field Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Required
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {fields.map((field) => (
                                <tr key={field.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <GripVertical size={16} className="text-gray-400 cursor-move" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{field.fieldName}</div>
                                                <div className="text-sm text-gray-500">{field.fieldKey}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {getFieldTypeIcon(field.fieldType)}
                                            <span className="text-sm text-gray-900">{field.fieldType}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {field.isRequired ? (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                Required
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Optional
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {field.isActive ? (
                                            <div className="flex items-center space-x-1 text-green-600">
                                                <Eye size={16} />
                                                <span className="text-sm">Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-1 text-gray-400">
                                                <EyeOff size={16} />
                                                <span className="text-sm">Inactive</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(field)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(field.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Field Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Field Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fieldName}
                                        onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Customer Source"
                                    />
                                </div>

                                {/* Field Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Field Type *
                                    </label>
                                    <select
                                        value={formData.fieldType}
                                        onChange={(e) => setFormData({ ...formData, fieldType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Text">Text</option>
                                        <option value="Number">Number</option>
                                        <option value="Date">Date</option>
                                        <option value="Checkbox">Checkbox (Yes/No)</option>
                                        <option value="Select">Dropdown (Single Select)</option>
                                        <option value="MultiSelect">Multi-Select</option>
                                        <option value="URL">URL</option>
                                        <option value="Email">Email</option>
                                        <option value="Currency">Currency</option>
                                    </select>
                                </div>

                                {/* Options (for Select/MultiSelect) */}
                                {(formData.fieldType === 'Select' || formData.fieldType === 'MultiSelect') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Options (one per line) *
                                        </label>
                                        <textarea
                                            value={formData.options}
                                            onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={5}
                                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter each option on a new line
                                        </p>
                                    </div>
                                )}

                                {/* Is Required */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isRequired"
                                        checked={formData.isRequired}
                                        onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                                        Make this field required
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Save size={18} />
                                    <span>{editingField ? 'Update' : 'Create'} Field</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomFieldsAdminPage;
