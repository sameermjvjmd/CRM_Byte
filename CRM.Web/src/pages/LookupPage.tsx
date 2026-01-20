import { useState, useEffect } from 'react';
import { Search, Filter, Building2, Users, Briefcase, MapPin, Calendar, ArrowRight, Plus, X, Bookmark, Save } from 'lucide-react';
import { advancedSearchApi, type AdvancedSearchRequest, type SearchCriteria, type SavedSearch } from '../api/advancedSearchApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LookupPage = () => {
    const navigate = useNavigate();
    const [entityType, setEntityType] = useState<'All' | 'Contacts' | 'Companies' | 'Groups' | 'Opportunities'>('Contacts');
    const [searchQuery, setSearchQuery] = useState('');
    const [criteriaList, setCriteriaList] = useState<SearchCriteria[]>([{ field: 'Name', operator: 'Contains', value: '' }]);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Saved Search State
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [showSaveInput, setShowSaveInput] = useState(false);
    const [saveName, setSaveName] = useState('');

    useEffect(() => {
        loadSavedSearches();
    }, []);

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
        if (entityType === 'All' || entityType === 'Groups') {
            toast.error("Cannot save global/group searches yet");
            return;
        }

        try {
            await advancedSearchApi.saveSearch({
                name: saveName,
                entityType: entityType, // safe cast as we checked above
                description: '',
                isPublic: false,
                criteria: criteriaList.filter(c => c.value.trim() !== ''),
                matchType: 'All', // or 'Any' if we add support
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
            setCriteriaList(search.criteria);
            // Optionally clear basic search query
            setSearchQuery('');
        }
    };

    const handleAddCriteria = () => {
        setCriteriaList([...criteriaList, { field: 'Name', operator: 'Contains', value: '' }]);
    };

    const removeCriteria = (index: number) => {
        if (criteriaList.length > 1) {
            setCriteriaList(criteriaList.filter((_, i) => i !== index));
        }
    };

    const updateCriteria = (index: number, key: keyof SearchCriteria, value: string) => {
        const newCriteria = [...criteriaList];
        newCriteria[index] = { ...newCriteria[index], [key]: value };
        setCriteriaList(newCriteria);
    };

    const handleSearch = async () => {
        setLoading(true);
        setHasSearched(true);
        try {
            if (entityType === 'All' || entityType === 'Groups') {
                toast("Global and Group search coming soon!", { icon: '🚧' });
                setLoading(false);
                return;
            }

            // Filter out empty values
            const criteria = criteriaList.filter(c => c.value.trim() !== '' || c.operator === 'Is Empty' || c.operator === 'Is Not Empty');

            // If no criteria, add a default one for search query if present, or error
            if (criteria.length === 0) {
                if (searchQuery.trim()) {
                    const nameField = entityType === 'Companies' || entityType === 'Opportunities' ? 'Name' : 'FirstName';
                    criteria.push({ field: nameField, operator: 'Contains', value: searchQuery });
                } else {
                    // Allow empty search? maybe not
                }
            }

            const request: AdvancedSearchRequest = {
                entityType: ((entityType as string) === 'All' || (entityType as string) === 'Groups') ? 'Contacts' : (entityType as 'Contacts' | 'Companies' | 'Opportunities'),
                criteria,
                matchType: 'All'
            };

            let data: any[] = [];
            switch (entityType) {
                case 'Contacts':
                    data = await advancedSearchApi.searchContacts(request);
                    break;
                case 'Companies':
                    data = await advancedSearchApi.searchCompanies(request);
                    break;
                case 'Opportunities':
                    data = await advancedSearchApi.searchOpportunities(request);
                    break;
            }
            setResults(data);
            if (data.length === 0) toast('No results found', { icon: '🔍' });
            else toast.success(`Found ${data.length} records`);

        } catch (error) {
            console.error(error);
            toast.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (id: number) => {
        const path = entityType.toLowerCase();
        navigate(`/${path}/${id}`);
    };

    const fieldMapping: Record<string, string> = {
        'Name': entityType === 'Contacts' ? 'FirstName' : 'Name',
        'Email': 'Email',
        'Phone': 'Phone',
        'Company': 'Company.Name',
        'City': 'City',
        'State': 'State'
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Advanced Lookup</h1>
                    <p className="text-sm text-slate-500 font-bold mt-1">Search across all CRM records</p>
                </div>
                {/* Saved Search Dropdown */}
                <div className="relative">
                    <select
                        className="pl-9 pr-4 py-2 text-xs font-bold border border-slate-200 rounded-lg bg-white text-slate-600 focus:ring-indigo-500 w-64 shadow-sm"
                        onChange={handleLoadSearch}
                        value=""
                    >
                        <option value="" disabled>Load Saved Query...</option>
                        {savedSearches.filter(s => entityType === 'All' || s.entityType === entityType).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <Bookmark size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                </div>
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <div className="space-y-6">
                    {/* Entity Type */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                            Search In
                        </label>
                        <div className="flex gap-2">
                            {['All', 'Contacts', 'Companies', 'Groups', 'Opportunities'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => { setEntityType(type as any); setResults([]); setHasSearched(false); }}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${entityType === type
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Input */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                            Search Query
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={`Search ${entityType}...`}
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Advanced Criteria Builder */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
                                Filter Criteria
                            </label>
                            <button
                                onClick={handleAddCriteria}
                                className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                            >
                                <Plus size={14} strokeWidth={3} />
                                Add Criteria
                            </button>
                        </div>

                        <div className="space-y-3">
                            {criteriaList.map((criteria, index) => (
                                <div key={index} className="flex gap-2 items-center animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="w-1/3">
                                        <select
                                            value={criteria.field}
                                            onChange={(e) => updateCriteria(index, 'field', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Any">Any Field</option>
                                            <option value="Name">Name</option>
                                            <option value="Email">Email</option>
                                            <option value="Phone">Phone</option>
                                            <option value="City">City</option>
                                            <option value="State">State</option>
                                            <option value="Status">Status</option>
                                        </select>
                                    </div>
                                    <div className="w-1/4">
                                        <select
                                            value={criteria.operator}
                                            onChange={(e) => updateCriteria(index, 'operator', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Contains">Contains</option>
                                            <option value="Equals">Equals</option>
                                            <option value="Starts With">Starts With</option>
                                            <option value="Ends With">Ends With</option>
                                            <option value="Does Not Contain">Does Not Contain</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={criteria.value}
                                            onChange={(e) => updateCriteria(index, 'value', e.target.value)}
                                            placeholder="Value..."
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {criteriaList.length > 1 && (
                                            <button
                                                onClick={() => removeCriteria(index)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Remove"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">

                        <div className="flex items-center gap-2">
                            {showSaveInput ? (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                    <input
                                        type="text"
                                        placeholder="Name your search..."
                                        className="text-sm border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 w-64"
                                        value={saveName}
                                        onChange={(e) => setSaveName(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
                                    />
                                    <button onClick={handleSaveSearch} className="px-3 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors"><Save size={16} /></button>
                                    <button onClick={() => setShowSaveInput(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={18} /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowSaveInput(true)}
                                    className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-all"
                                >
                                    <Save size={16} />
                                    Save This Search
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setSearchQuery(''); setCriteriaList([{ field: 'Name', operator: 'Contains', value: '' }]); setResults([]); setHasSearched(false); }}
                                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-200 transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent" /> : <Search size={16} />}
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {hasSearched && results.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center animate-in fade-in zoom-in duration-300">
                    <div className="text-slate-300 mb-4 bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Search size={32} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">No Match Found</h3>
                    <p className="text-xs text-slate-400 mt-2">Try adjusting your search terms or filters.</p>
                </div>
            ) : results.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                            Results ({results.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {results.map((item) => (
                            <div key={item.id} className="p-6 hover:bg-indigo-50/30 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => handleNavigate(item.id)}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                                        ${entityType === 'Contacts' ? 'bg-indigo-500' :
                                            entityType === 'Companies' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                        {entityType === 'Contacts' && <Users size={18} />}
                                        {entityType === 'Companies' && <Building2 size={18} />}
                                        {entityType === 'Opportunities' && <Briefcase size={18} />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">
                                            {entityType === 'Contacts' ? `${item.firstName} ${item.lastName}` : item.name}
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                            {item.email && <span>{item.email}</span>}
                                            {item.phone && <span>• {item.phone}</span>}
                                            {item.city && <span>• {item.city}</span>}
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LookupPage;
