import { useState } from 'react';
import { Search, X, Filter, Calendar, Users, Building2 } from 'lucide-react';

interface SearchScope {
    contacts: boolean;
    companies: boolean;
    activities: boolean;
    opportunities: boolean;
}

interface AdvancedSearchProps {
    onSearch: (query: string, scope: SearchScope) => void;
    isOpen: boolean;
    onClose: () => void;
}

const AdvancedSearch = ({ onSearch, isOpen, onClose }: AdvancedSearchProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchScope, setSearchScope] = useState<SearchScope>({
        contacts: true,
        companies: true,
        activities: true,
        opportunities: true
    });

    const handleSearch = () => {
        onSearch(searchQuery, searchScope);
    };

    const toggleScope = (key: keyof SearchScope) => {
        setSearchScope(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

            {/* Search Panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Search size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Advanced Search</h2>
                            <p className="text-sm font-bold text-slate-500">Search across all records</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-6 border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search for contacts, companies, activities..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Search Scope */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-wide mb-4">Search In</h3>
                    <div className="space-y-3">
                        {/* Contacts */}
                        <label className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                            <input
                                type="checkbox"
                                checked={searchScope.contacts}
                                onChange={() => toggleScope('contacts')}
                                className="w-5 h-5 rounded border-slate-300"
                            />
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">Contacts</div>
                                    <div className="text-xs font-bold text-slate-500">Search in all contacts</div>
                                </div>
                            </div>
                        </label>

                        {/* Companies */}
                        <label className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                            <input
                                type="checkbox"
                                checked={searchScope.companies}
                                onChange={() => toggleScope('companies')}
                                className="w-5 h-5 rounded border-slate-300"
                            />
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">Companies</div>
                                    <div className="text-xs font-bold text-slate-500">Search in all companies</div>
                                </div>
                            </div>
                        </label>

                        {/* Activities */}
                        <label className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                            <input
                                type="checkbox"
                                checked={searchScope.activities}
                                onChange={() => toggleScope('activities')}
                                className="w-5 h-5 rounded border-slate-300"
                            />
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">Activities</div>
                                    <div className="text-xs font-bold text-slate-500">Search in all activities</div>
                                </div>
                            </div>
                        </label>

                        {/* Opportunities */}
                        <label className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                            <input
                                type="checkbox"
                                checked={searchScope.opportunities}
                                onChange={() => toggleScope('opportunities')}
                                className="w-5 h-5 rounded border-slate-300"
                            />
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Filter size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">Opportunities</div>
                                    <div className="text-xs font-bold text-slate-500">Search in all opportunities</div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-white border border-slate-200 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSearch}
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        <Search size={18} className="inline mr-2" />
                        Search
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdvancedSearch;
export type { SearchScope };
