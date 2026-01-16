import { useState } from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';

const LookupPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [field, setField] = useState('All');
    const [query, setQuery] = useState('');

    return (
        <div className="px-3 pb-4 border-b border-slate-700/50 mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider mb-2 transition-colors"
            >
                <span>Create Lookup</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                    <div className="relative">
                        <select
                            value={field}
                            onChange={(e) => setField(e.target.value)}
                            className="w-full bg-slate-800 text-slate-300 text-xs rounded p-2 border border-slate-700 focus:border-indigo-500 outline-none appearance-none"
                        >
                            <option>All Fields</option>
                            <option>Contact Name</option>
                            <option>Company</option>
                            <option>Email Address</option>
                            <option>City / State</option>
                            <option>Phone Number</option>
                        </select>
                        <Filter size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Contains..."
                            className="w-full bg-slate-800 text-white text-xs rounded p-2 pl-8 border border-slate-700 focus:border-indigo-500 outline-none placeholder:text-slate-600"
                        />
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>

                    <button className="w-full bg-slate-700 hover:bg-indigo-600 text-white text-xs font-bold py-2 rounded transition-colors">
                        Lookup
                    </button>

                    <button className="w-full text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors text-center">
                        Advanced Options
                    </button>
                </div>
            )}
        </div>
    );
};

export default LookupPanel;
