import { useState } from 'react';
import { Search, Filter, Building2, Users, Briefcase, MapPin } from 'lucide-react';

const LookupPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [entityType, setEntityType] = useState('All');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Advanced Lookup</h1>
                    <p className="text-sm text-slate-500 font-bold mt-1">Search across all CRM records</p>
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
                                    onClick={() => setEntityType(type)}
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
                                placeholder="Enter search keywords..."
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                Field
                            </label>
                            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option>Any Field</option>
                                <option>Name</option>
                                <option>Email</option>
                                <option>Phone</option>
                                <option>Company</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                Operator
                            </label>
                            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option>Contains</option>
                                <option>Equals</option>
                                <option>Starts With</option>
                                <option>Ends With</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                Date Range
                            </label>
                            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option>Any Time</option>
                                <option>Today</option>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>This Year</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2">
                            <Search size={16} />
                            Search
                        </button>
                        <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-200 transition-all">
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section (Placeholder) */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <div className="text-slate-300 mb-3">
                    <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">No Search Results</h3>
                <p className="text-xs text-slate-400 mt-2">Enter a search query to find records</p>
            </div>
        </div>
    );
};

export default LookupPage;
