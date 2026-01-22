import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, User, Building, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import toast from 'react-hot-toast';

interface GlobalSearchResult {
    entityType: string;
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    metadata: Record<string, string>;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GlobalSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            loadRecentSearches();
        } else {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.length >= 2) {
            const debounce = setTimeout(() => {
                performSearch();
            }, 300);
            return () => clearTimeout(debounce);
        } else {
            setResults([]);
        }
    }, [query]);

    const loadRecentSearches = () => {
        const stored = localStorage.getItem('recentSearches');
        if (stored) {
            setRecentSearches(JSON.parse(stored));
        }
    };

    const saveRecentSearch = (searchQuery: string) => {
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await api.get('/search/global', {
                params: { q: query, maxResults: 20 }
            });
            setResults(response.data || []);
            setSelectedIndex(0);
        } catch (error) {
            console.error('Search failed:', error);
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results.length > 0) {
            e.preventDefault();
            handleSelectResult(results[selectedIndex]);
        }
    };

    const handleSelectResult = (result: GlobalSearchResult) => {
        saveRecentSearch(query);

        const routes: Record<string, string> = {
            'Contact': `/contacts/${result.id}`,
            'Company': `/companies/${result.id}`,
            'Opportunity': `/opportunities/${result.id}`,
            'Activity': `/schedule`
        };

        const route = routes[result.entityType];
        if (route) {
            navigate(route);
            onClose();
        }
    };

    const handleRecentSearchClick = (searchQuery: string) => {
        setQuery(searchQuery);
    };

    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case 'Contact':
                return <User size={18} className="text-indigo-600" />;
            case 'Company':
                return <Building size={18} className="text-blue-600" />;
            case 'Opportunity':
                return <TrendingUp size={18} className="text-green-600" />;
            case 'Activity':
                return <Calendar size={18} className="text-purple-600" />;
            default:
                return <Search size={18} className="text-slate-600" />;
        }
    };

    const groupedResults = results.reduce((acc, result) => {
        if (!acc[result.entityType]) {
            acc[result.entityType] = [];
        }
        acc[result.entityType].push(result);
        return acc;
    }, {} as Record<string, GlobalSearchResult[]>);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
                {/* Search Input */}
                <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Search className="text-slate-400" size={20} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search contacts, companies, opportunities..."
                            className="flex-1 text-lg outline-none"
                        />
                        {loading && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                    {query.length < 2 && recentSearches.length > 0 && (
                        <div className="p-4">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-3">Recent Searches</div>
                            <div className="space-y-1">
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleRecentSearchClick(search)}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                                    >
                                        <Clock size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{search}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {query.length >= 2 && results.length === 0 && !loading && (
                        <div className="p-12 text-center">
                            <Search className="mx-auto text-slate-300 mb-4" size={48} />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No Results Found</h3>
                            <p className="text-slate-500">Try a different search term</p>
                        </div>
                    )}

                    {Object.entries(groupedResults).map(([entityType, entityResults]) => (
                        <div key={entityType} className="p-4 border-b border-slate-100 last:border-b-0">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-3">
                                {entityType}s ({entityResults.length})
                            </div>
                            <div className="space-y-1">
                                {entityResults.map((result, index) => {
                                    const globalIndex = results.indexOf(result);
                                    const isSelected = globalIndex === selectedIndex;

                                    return (
                                        <button
                                            key={result.id}
                                            onClick={() => handleSelectResult(result)}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left ${isSelected
                                                    ? 'bg-indigo-50 border-2 border-indigo-200'
                                                    : 'hover:bg-slate-50 border-2 border-transparent'
                                                }`}
                                        >
                                            <div className="flex-shrink-0">
                                                {getEntityIcon(result.entityType)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-900 truncate">
                                                    {result.title}
                                                </div>
                                                {result.subtitle && (
                                                    <div className="text-sm text-slate-600 truncate">
                                                        {result.subtitle}
                                                    </div>
                                                )}
                                                {result.description && (
                                                    <div className="text-xs text-slate-500 truncate">
                                                        {result.description}
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <ArrowRight size={16} className="text-indigo-600 flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                {results.length > 0 && (
                    <div className="p-3 border-t border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-4">
                                <span>↑↓ Navigate</span>
                                <span>↵ Select</span>
                                <span>Esc Close</span>
                            </div>
                            <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalSearch;
