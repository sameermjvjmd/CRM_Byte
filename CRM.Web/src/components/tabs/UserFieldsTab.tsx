import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../../api/api';

interface CustomFieldDefinition {
    id: number;
    entityType: string;
    fieldName: string;
    fieldKey: string;
    fieldType: string;
    isRequired: boolean;
    optionsJson?: string;
}

interface CustomFieldValue {
    customFieldDefinitionId: number;
    value: string;
}

interface UserFieldsTabProps {
    entityId: number;
    entityType: string;
    customValues: CustomFieldValue[]; // Values from the entity
    onUpdate: (values: CustomFieldValue[]) => void;
}

const UserFieldsTab = ({ entityId, entityType, customValues, onUpdate }: UserFieldsTabProps) => {
    const [definitions, setDefinitions] = useState<CustomFieldDefinition[]>([]);
    const [values, setValues] = useState<CustomFieldValue[]>(customValues || []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDefinitions = async () => {
            try {
                const res = await api.get(`/customfields/${entityType}`);
                setDefinitions(res.data);
            } catch (err) {
                console.error("Failed to load field definitions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDefinitions();
    }, []);

    // Sync values when props change
    useEffect(() => {
        if (customValues) setValues(customValues);
    }, [customValues]);

    const handleChange = (defId: number, newVal: string) => {
        setValues(prev => {
            const existing = prev.find(v => v.customFieldDefinitionId === defId);
            if (existing) {
                return prev.map(v => v.customFieldDefinitionId === defId ? { ...v, value: newVal } : v);
            } else {
                return [...prev, { customFieldDefinitionId: defId, value: newVal }];
            }
        });
    };

    const handleSave = () => {
        onUpdate(values);
    };

    const getValue = (defId: number) => values.find(v => v.customFieldDefinitionId === defId)?.value || '';

    if (loading) return <div className="p-8 text-center text-slate-400">Loading schema...</div>;

    if (definitions.length === 0) return (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500 font-bold mb-2">No custom fields defined</p>
            <p className="text-xs text-slate-400">Go to Tools &gt; Custom Fields to configure fields for Contacts.</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-900 uppercase tracking-wide text-sm">Custom Details</h3>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-indigo-700 transition-all shadow-sm"
                >
                    <Save size={14} /> Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {definitions.map(def => (
                    <div key={def.id}>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {def.fieldName} {def.isRequired && <span className="text-red-500">*</span>}
                        </label>

                        {def.fieldType === 'Text' && (
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                value={getValue(def.id)}
                                onChange={e => handleChange(def.id, e.target.value)}
                            />
                        )}

                        {def.fieldType === 'URL' && (
                            <input
                                type="url"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                value={getValue(def.id)}
                                onChange={e => handleChange(def.id, e.target.value)}
                            />
                        )}

                        {def.fieldType === 'Email' && (
                            <input
                                type="email"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                value={getValue(def.id)}
                                onChange={e => handleChange(def.id, e.target.value)}
                            />
                        )}

                        {def.fieldType === 'Currency' && (
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input
                                    type="number"
                                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                    value={getValue(def.id)}
                                    onChange={e => handleChange(def.id, e.target.value)}
                                />
                            </div>
                        )}

                        {def.fieldType === 'Number' && (
                            <input
                                type="number"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                value={getValue(def.id)}
                                onChange={e => handleChange(def.id, e.target.value)}
                            />
                        )}

                        {def.fieldType === 'Date' && (
                            <input
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                value={getValue(def.id)}
                                onChange={e => handleChange(def.id, e.target.value)}
                            />
                        )}

                        {(def.fieldType === 'Select' || def.fieldType === 'MultiSelect') && (
                            <select
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                value={getValue(def.id)}
                                onChange={e => handleChange(def.id, e.target.value)}
                                multiple={def.fieldType === 'MultiSelect'}
                            >
                                <option value="">Select...</option>
                                {def.optionsJson && JSON.parse(def.optionsJson).map((opt: string) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        )}

                        {def.fieldType === 'Bool' && (
                            <div className="flex items-center gap-3 mt-2">
                                <input
                                    type="checkbox"
                                    id={`field-${def.id}`}
                                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                    checked={getValue(def.id) === 'true'}
                                    onChange={e => handleChange(def.id, e.target.checked ? 'true' : 'false')}
                                />
                                <label htmlFor={`field-${def.id}`} className="text-sm font-medium text-slate-700">Yes</label>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserFieldsTab;
