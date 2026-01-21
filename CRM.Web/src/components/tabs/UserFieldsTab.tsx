import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { customFieldsApi } from '../../api/customFieldsApi';
import { CustomFieldRenderer, type CustomFieldDefinition, type CustomFieldValue } from '../common/CustomFieldRenderer';
import { toast } from 'react-hot-toast';

interface UserFieldsTabProps {
    entityId: number;
    entityType: string;
    customValues?: CustomFieldValue[];
    onUpdate?: (values: CustomFieldValue[]) => void;
}

const UserFieldsTab = ({ entityId, entityType, customValues, onUpdate }: UserFieldsTabProps) => {
    const [definitions, setDefinitions] = useState<CustomFieldDefinition[]>([]);
    const [values, setValues] = useState<CustomFieldValue[]>(customValues || []);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch field definitions
                const defs = await customFieldsApi.getAll(entityType);
                setDefinitions(defs);

                // Fetch current values for this entity
                try {
                    const vals = await customFieldsApi.getEntityValues(entityType, entityId);
                    setValues(vals);
                } catch (valError) {
                    console.log('No existing values for this entity');
                    setValues([]);
                }
            } catch (err) {
                console.error("Failed to load custom fields", err);
                toast.error('Failed to load custom fields');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [entityType, entityId]);

    // Sync values when props change
    useEffect(() => {
        if (customValues) setValues(customValues);
    }, [customValues]);

    const validateFields = (): boolean => {
        const errors: Record<string, string> = {};
        const missingFields: string[] = [];

        definitions.forEach(field => {
            if (field.isRequired) {
                const value = values.find(v => v.fieldName === field.fieldName)?.value;
                if (!value && value !== 0 && value !== false) {
                    errors[field.fieldName] = 'This field is required';
                    missingFields.push(field.displayName);
                }
            }
        });

        setValidationErrors(errors);

        if (missingFields.length > 0) {
            toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateFields()) {
            return;
        }

        setSaving(true);
        try {
            // Convert values array to Record<string, any> format expected by API
            const valuesMap: Record<string, any> = {};
            values.forEach(v => {
                valuesMap[v.fieldName] = v.value;
            });

            await customFieldsApi.saveEntityValues(entityType, entityId, { values: valuesMap });
            toast.success('Custom fields saved successfully!');
            setValidationErrors({});

            // Call parent update handler if provided
            if (onUpdate) {
                onUpdate(values);
            }
        } catch (error) {
            console.error('Error saving custom fields:', error);
            toast.error('Failed to save custom fields');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="text-xs font-bold uppercase tracking-widest">Loading Custom Fields...</div>
        </div>
    );

    if (definitions.length === 0) return (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <p className="text-slate-600 font-bold mb-2 text-sm">No custom fields defined</p>
            <p className="text-xs text-slate-400">Go to <span className="font-bold text-indigo-600">Administration → Custom Fields</span> to configure fields for {entityType}.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900 uppercase tracking-wide text-sm">Custom Details</h3>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <CustomFieldRenderer
                    fields={definitions}
                    values={values}
                    onChange={setValues}
                    mode="edit"
                    validationErrors={validationErrors}
                />
            </div>
        </div>
    );
};

export default UserFieldsTab;
