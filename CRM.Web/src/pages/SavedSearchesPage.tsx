import { useState, useEffect } from 'react';
import { Search, Star, Share2, Trash2, Edit, Play, Clock } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

interface SavedSearch {
    id: number;
    name: string;
    description?: string;
    entityType: string;
    query: any;
    isShared: boolean;
    isDefault: boolean;
    isFavorite: boolean;
    useCount?: number;
    lastUsedAt?: string;
}

const SavedSearchesPage = () => {
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'favorites' | 'shared'>('all');

    useEffect(() => {
        fetchSavedSearches();
    }, []);

    const fetchSavedSearches = async () => {
        try {
            const response = await api.get('/search/saved');
            setSearches(response.data || []);
        } catch (error) {
            console.error('Failed to fetch saved searches:', error);
            toast.error('Failed to load saved searches');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this saved search?')) return;

        try {
            await api.delete(`/search/saved/${id}`);
            toast.success('Search deleted successfully');
            fetchSavedSearches();
        } catch (error) {
            toast.error('Failed to delete search');
            console.error(error);
        }
    };

    const handleExecute = (search: SavedSearch) => {
        // Navigate to appropriate page with query
        const entityRoutes: Record<string, string> = {
            'Contact': '/contacts',
            'Company': '/companies',
            'Opportunity': '/opportunities',
            'Activity': '/schedule'
        };

        const route = entityRoutes[search.entityType] || '/contacts';
        window.location.href = `${route}?savedSearch=${search.id}`;
    };

    const toggleFavorite = async (search: SavedSearch) => {
        try {
            await api.put(`/search/saved/${search.id}`, {
                ...search,
                isFavorite: !search.isFavorite
            });
            toast.success(search.isFavorite ? 'Removed from favorites' : 'Added to favorites');
            fetchSavedSearches();
        } catch (error) {
            toast.error('Failed to update search');
            console.error(error);
        }
    };

    const filteredSearches = searches.filter(s => {
        if (filter === 'favorites') return s.isFavorite;
        if (filter === 'shared') return s.isShared;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading saved searches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Saved Searches</h1>
                <p className="text-slate-500">Manage and execute your saved search queries</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    All Searches ({searches.length})
                </button>
                <button
                    onClick={() => setFilter('favorites')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'favorites'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    <Star size={16} className="inline mr-1" />
                    Favorites ({searches.filter(s => s.isFavorite).length})
                </button>
                <button
                    onClick={() => setFilter('shared')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'shared'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    <Share2 size={16} className="inline mr-1" />
                    Shared ({searches.filter(s => s.isShared).length})
                </button>
            </div>

            {/* Searches List */}
            {filteredSearches.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <Search className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Saved Searches</h3>
                    <p className="text-slate-500 mb-4">
                        {filter === 'all'
                            ? 'Create your first saved search to quickly access common queries'
                            : `No ${filter} searches found`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSearches.map((search) => (
                        <div
                            key={search.id}
                            className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-indigo-200 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">{search.name}</h3>
                                        {search.isFavorite && (
                                            <Star size={18} className="text-yellow-500 fill-yellow-500" />
                                        )}
                                        {search.isShared && (
                                            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded">
                                                Shared
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded">
                                            {search.entityType}
                                        </span>
                                    </div>

                                    {search.description && (
                                        <p className="text-sm text-slate-600 mb-3">{search.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        {search.useCount !== undefined && search.useCount > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Play size={14} />
                                                Used {search.useCount} time{search.useCount !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {search.lastUsedAt && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                Last used {new Date(search.lastUsedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                        <span>
                                            {search.query?.conditions?.length || 0} condition(s)
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => toggleFavorite(search)}
                                        className={`p-2 rounded-lg transition-colors ${search.isFavorite
                                            ? 'text-yellow-600 hover:bg-yellow-50'
                                            : 'text-slate-400 hover:bg-slate-100'
                                            }`}
                                        title={search.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        <Star size={18} className={search.isFavorite ? 'fill-yellow-500' : ''} />
                                    </button>
                                    <button
                                        onClick={() => handleExecute(search)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                    >
                                        Execute
                                    </button>
                                    <button
                                        onClick={() => handleDelete(search.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete search"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedSearchesPage;
