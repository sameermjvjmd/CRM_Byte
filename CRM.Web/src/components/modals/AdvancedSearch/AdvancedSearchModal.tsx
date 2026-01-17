import React, { useState } from 'react';
import { X, Plus, Trash2, Search, Filter, Bookmark, Save, DownloadCloud } from 'lucide-react';
import { advancedSearchApi, type AdvancedSearchRequest, type SearchCriteria, type SavedSearch } from '../../../api/advancedSearchApi';
import toast from 'react-hot-toast';

interface AdvancedSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResults: (entityType: string, results: any[]) => void;
}

const ENTITY_OPTIONS = [
    { value: 'Contacts', label: 'Contacts' },
    { value: 'Companies', label: 'Companies' },
    { value: 'Opportunities', label: 'Opportunities' }
];

const FIELD_OPTIONS: Record<string, string[]> = {
    'Contacts': ['FirstName', 'LastName', 'Email', 'Phone', 'Company', 'City', 'State', 'Status'],
    'Companies': ['Name', 'Industry', 'City', 'State', 'Phone', 'Website'],
    'Opportunities': ['Name', 'Stage', 'Amount', 'Probability', 'Company', 'Contact']
};

const OPERATOR_OPTIONS = [
    'Contains', 'Equals', 'Starts With', 'Greater Than', 'Less Than'
];

export default function AdvancedSearchModal({ isOpen, onClose, onResults }: AdvancedSearchModalProps) {
    const [entityType, setEntityType] = useState<'Contacts' | 'Companies' | 'Opportunities'>('Contacts');
    const [matchType, setMatchType] = useState<'All' | 'Any'>('All');
    const [criteria, setCriteria] = useState<SearchCriteria[]>([
        { field: FIELD_OPTIONS['Contacts'][0], operator: 'Contains', value: '' }
    ]);
    const [loading, setLoading] = useState(false);

    // Saved Search State
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [showSaveInput, setShowSaveInput] = useState(false);
    const [saveName, setSaveName] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            loadSavedSearches();
        }
    }, [isOpen]);

    const loadSavedSearches = async () => {
        try {
            const data = await advancedSearchApi.getSavedSearches();
            setSavedSearches(data);
        } catch (error) {
            console.error("Failed to load saved searches", error);
        }
    };

    const handleSaveSearch = async () => {
        if (!saveName.trim()) {
            toast.error("Please enter a name");
            return;
        }
        try {
            await advancedSearchApi.saveSearch({
                name: saveName,
                entityType: entityType,
                description: '',
                isPublic: false,
                criteria: criteria.filter(c => c.value.trim() !== ''),
                matchType: matchType,
            });
            toast.success("Search saved!");
            setSaveName('');
            setShowSaveInput(false);
            loadSavedSearches();
        } catch (error) {
            toast.error("Failed to save");
        }
    };

    const handleLoadSearch = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        const search = savedSearches.find(s => s.id === id);
        if (search) {
            setEntityType(search.entityType as any);
            setMatchType(search.matchType);
            setCriteria(search.criteria);
        }
    };

    const handleDeleteSavedSearch = async (id: number) => {
        if (!window.confirm("Delete this saved search?")) return;
        try {
            await advancedSearchApi.deleteSavedSearch(id);
            toast.success("Deleted");
            loadSavedSearches();
        } catch (e) { toast.error("Failed to delete"); }
    };

    if (!isOpen) return null;

    const handleAddCriteria = () => {
        setCriteria([...criteria, { field: FIELD_OPTIONS[entityType][0], operator: 'Contains', value: '' }]);
    };

    const handleRemoveCriteria = (index: number) => {
        if (criteria.length > 1) {
            setCriteria(criteria.filter((_, i) => i !== index));
        }
    };

    const updateCriteria = (index: number, key: keyof SearchCriteria, value: string) => {
        const newCriteria = [...criteria];
        newCriteria[index] = { ...newCriteria[index], [key]: value };
        setCriteria(newCriteria);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const request: AdvancedSearchRequest = {
                entityType,
                criteria: criteria.filter(c => c.value.trim() !== ''),
                matchType
            };

            let results: any[] = [];
            switch (entityType) {
                case 'Contacts':
                    results = await advancedSearchApi.searchContacts(request);
                    break;
                case 'Companies':
                    results = await advancedSearchApi.searchCompanies(request);
                    break;
                case 'Opportunities':
                    results = await advancedSearchApi.searchOpportunities(request);
                    break;
            }

            onResults(entityType, results);
            toast.success(`Found ${results.length} records`);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Filter size={20} className="text-indigo-600" />
                        Advanced Search / Lookup
                    </h2>
                    <div className="flex gap-2">
                        {/* Saved Search Dropdown */}
                        <div className="relative">
                            <select
                                className="pl-8 pr-4 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white text-slate-600 focus:ring-indigo-500 w-48"
                                onChange={handleLoadSearch}
                                value=""
                            >
                                <option value="" disabled>Load Saved Query...</option>
                                {savedSearches.filter(s => s.entityType === entityType).map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <Bookmark size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Entity Selection */}
                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Look for</label>
                            <select
                                value={entityType}
                                onChange={(e) => {
                                    setEntityType(e.target.value as any);
                                    setCriteria([{ field: FIELD_OPTIONS[e.target.value as any][0], operator: 'Contains', value: '' }]);
                                }}
                                className="w-full text-sm font-bold text-slate-700 bg-slate-50 border-slate-200 rounded-lg focus:ring-indigo-500"
                            >
                                {ENTITY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-1/3">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Match Type</label>
                            <select
                                value={matchType}
                                onChange={(e) => setMatchType(e.target.value as any)}
                                className="w-full text-sm font-bold text-slate-700 bg-slate-50 border-slate-200 rounded-lg focus:ring-indigo-500"
                            >
                                <option value="All">Match All Criteria (AND)</option>
                                <option value="Any">Match Any Criteria (OR)</option>
                            </select>
                        </div>
                    </div>

                    {/* Criteria Builder */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Criteria</label>
                        {criteria.map((c, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <select
                                    value={c.field}
                                    onChange={(e) => updateCriteria(index, 'field', e.target.value)}
                                    className="flex-1 text-sm border-slate-200 rounded-lg focus:ring-indigo-500"
                                >
                                    {FIELD_OPTIONS[entityType].map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                                <select
                                    value={c.operator}
                                    onChange={(e) => updateCriteria(index, 'operator', e.target.value)}
                                    className="w-1/4 text-sm border-slate-200 rounded-lg focus:ring-indigo-500"
                                >
                                    {OPERATOR_OPTIONS.map(op => (
                                        <option key={op} value={op}>{op}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={c.value}
                                    onChange={(e) => updateCriteria(index, 'value', e.target.value)}
                                    placeholder="Value..."
                                    className="flex-1 text-sm border-slate-200 rounded-lg focus:ring-indigo-500"
                                />
                                <button
                                    onClick={() => handleRemoveCriteria(index)}
                                    disabled={criteria.length === 1}
                                    className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={handleAddCriteria}
                            className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline mt-2"
                        >
                            <Plus size={14} /> Add Criteria
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3 items-center">
                    <div className="flex items-center gap-2">
                        {showSaveInput ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                <input
                                    type="text"
                                    placeholder="Query Name..."
                                    className="text-xs border-slate-300 rounded-lg px-2 py-1.5 focus:ring-indigo-500 w-40"
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={handleSaveSearch} className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600"><Save size={14} /></button>
                                <button onClick={() => setShowSaveInput(false)} className="p-1.5 text-slate-400 hover:text-slate-600"><X size={14} /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowSaveInput(true)}
                                className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 px-2 py-1.5 hover:bg-white rounded-lg transition-all"
                            >
                                <Save size={14} />
                                Save Query
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            {loading ? 'Searching...' : (
                                <>
                                    <Search size={16} />
                                    Run Lookup
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
