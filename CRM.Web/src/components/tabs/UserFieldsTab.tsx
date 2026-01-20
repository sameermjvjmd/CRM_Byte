import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../../api/api';
import { CustomFieldRenderer, type CustomFieldDefinition, type CustomFieldValue } from '../common/CustomFieldRenderer';

interface UserFieldsTabProps {
    entityId: number;
    entityType: string;
    customValues: CustomFieldValue[];
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
    }, [entityType]);

    // Sync values when props change
    useEffect(() => {
        if (customValues) setValues(customValues);
    }, [customValues]);

    const handleSave = () => {
        onUpdate(values);
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading schema...</div>;

    if (definitions.length === 0) return (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500 font-bold mb-2">No custom fields defined</p>
            <p className="text-xs text-slate-400">Go to Tools &gt; Custom Fields to configure fields for {entityType}.</p>
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
                {/* 
                    CustomFieldRenderer handles rendering inputs. 
                    We wrap it to ensure grid layout if needed, but CustomFieldRenderer already has internal grid for view mode.
                    For edit mode, it uses space-y-4.
                    We might want to override its layout or accept it.
                    Actually CustomFieldRenderer uses space-y-4. If we want grid, we might need to adjust CustomFieldRenderer or just let it specific.
                    However, UserFieldsTab previously used a 2-column grid.
                    CustomFieldRenderer doesn't support 2-col grid for inputs currently (it loops and divs).
                    Wait, looking at CustomFieldRenderer.tsx (step 7908), line 80: <div className="space-y-4">
                    It stacks fields vertically. The previous UserFieldsTab used 2 columns.
                    If I want 2 columns, I should update CustomFieldRenderer to support it or accept vertical stack.
                    Vertical stack is fine for now, or I can update CustomFieldRenderer later.
                    Let's stick to CustomFieldRenderer as is for consistency.
                 */}
                <div className="md:col-span-2">
                    <CustomFieldRenderer
                        fields={definitions}
                        values={values}
                        onChange={setValues}
                        mode="edit"
                    />
                </div>
            </div>
        </div>
    );
};

export default UserFieldsTab;
