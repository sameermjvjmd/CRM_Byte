import { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdvancedLookupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdvancedLookupModal = ({ isOpen, onClose }: AdvancedLookupModalProps) => {
    const navigate = useNavigate();
    const [entityType, setEntityType] = useState('Contact');
    const [criteria, setCriteria] = useState([
        { field: 'Company', operator: 'Contains', value: '' }
    ]);

    if (!isOpen) return null;

    const handleAddCriterion = () => {
        setCriteria([...criteria, { field: 'FirstName', operator: 'Starts With', value: '' }]);
    };

    const handleRemoveCriterion = (index: number) => {
        setCriteria(criteria.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, key: string, val: string) => {
        const newCriteria = [...criteria];
        (newCriteria[index] as any)[key] = val;
        setCriteria(newCriteria);
    };

    const handleSearch = () => {
        onClose();
        const searchPath = entityType === 'Contact' ? '/contacts' :
            entityType === 'Company' ? '/companies' :
                entityType === 'Group' ? '/groups' :
                    entityType === 'Opportunity' ? '/opportunities' : '/contacts';

        navigate(searchPath, {
            state: {
                advancedSearch: true,
                entityType,
                criteria
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 bg-[#003B6F] text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <Search size={20} />
                        <h2 className="text-lg font-bold">Lookup {entityType}s</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">

                    {/* Entity Selector */}
                    <div className="mb-6 flex items-center gap-4">
                        <label className="text-sm font-bold text-slate-700">Look for:</label>
                        <select
                            value={entityType}
                            onChange={(e) => setEntityType(e.target.value)}
                            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-md focus:ring-[#003B6F] focus:border-[#003B6F] block p-2"
                        >
                            <option value="Contact">Contacts</option>
                            <option value="Company">Companies</option>
                            <option value="Group">Groups</option>
                            <option value="Opportunity">Opportunities</option>
                            <option value="Activity">Activities</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        {criteria.map((criterion, index) => (
                            <div key={index} className="flex gap-3 items-end p-4 bg-slate-50 rounded border border-slate-100 relative group">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Field</label>
                                    <select
                                        value={criterion.field}
                                        onChange={(e) => handleChange(index, 'field', e.target.value)}
                                        className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded focus:ring-primary focus:border-primary p-2"
                                    >
                                        <option>Company</option>
                                        <option>Contact</option>
                                        <option>City</option>
                                        <option>State</option>
                                        <option>Zip Code</option>
                                        <option>Phone</option>
                                        <option>Email</option>
                                        <option>ID/Status</option>
                                    </select>
                                </div>

                                <div className="w-1/4 space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Operator</label>
                                    <select
                                        value={criterion.operator}
                                        onChange={(e) => handleChange(index, 'operator', e.target.value)}
                                        className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded focus:ring-primary focus:border-primary p-2"
                                    >
                                        <option>Contains</option>
                                        <option>Starts With</option>
                                        <option>Equal To</option>
                                        <option>Not Equal To</option>
                                        <option>Is Empty</option>
                                    </select>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Value</label>
                                    <input
                                        type="text"
                                        value={criterion.value}
                                        onChange={(e) => handleChange(index, 'value', e.target.value)}
                                        className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded focus:ring-primary focus:border-primary p-2"
                                    />
                                </div>

                                {criteria.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveCriterion(index)}
                                        className="mb-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddCriterion}
                        className="mt-4 flex items-center gap-2 text-sm font-bold text-[#003B6F] hover:underline"
                    >
                        <Plus size={16} /> Add Criteria
                    </button>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-bold rounded shadow-sm transition-colors flex items-center gap-2"
                    >
                        <Search size={16} /> Lookup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedLookupModal;
