import { useState } from 'react';
import { Save, Eye, Trash2, Edit, Star, Filter } from 'lucide-react';

interface SavedView {
    id: string;
    name: string;
    filters: any[];
    sortBy: string;
    isDefault: boolean;
    createdAt: string;
}

interface SavedViewsManagerProps {
    views: SavedView[];
    onSelectView: (view: SavedView) => void;
    onSaveView: (name: string, filters: any[], sortBy: string, isDefault: boolean) => void;
    onDeleteView: (id: string) => void;
    onSetDefault: (id: string) => void;
    currentFilters: any[];
    currentSort: string;
}

const SavedViewsManager = ({
    views,
    onSelectView,
    onSaveView,
    onDeleteView,
    onSetDefault,
    currentFilters,
    currentSort
}: SavedViewsManagerProps) => {
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [newViewName, setNewViewName] = useState('');
    const [setAsDefault, setSetAsDefault] = useState(false);

    const handleSaveCurrentView = () => {
        if (newViewName.trim()) {
            onSaveView(newViewName, currentFilters, currentSort, setAsDefault);
            setNewViewName('');
            setSetAsDefault(false);
            setShowSaveDialog(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Eye size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Saved Views</h3>
                        <p className="text-xs font-bold text-slate-500">Manage your custom views</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowSaveDialog(!showSaveDialog)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Save size={16} className="inline mr-2" />
                    Save Current View
                </button>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="mb-6 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                    <h4 className="text-sm font-black text-indigo-900 mb-3">Save Current View</h4>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={newViewName}
                            onChange={(e) => setNewViewName(e.target.value)}
                            placeholder="View name (e.g., 'My Active Contacts')"
                            className="w-full px-4 py-2 border border-indigo-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                        />
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={setAsDefault}
                                onChange={(e) => setSetAsDefault(e.target.checked)}
                                className="w-4 h-4 rounded border-indigo-300"
                            />
                            <span className="text-sm font-bold text-indigo-900">Set as default view</span>
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="flex-1 px-4 py-2 bg-white border border-indigo-300 rounded-lg font-bold text-sm text-indigo-700 hover:bg-indigo-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCurrentView}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all"
                            >
                                Save View
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Views List */}
            <div className="space-y-2">
                {views.length === 0 ? (
                    <div className="text-center py-12">
                        <Eye size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-500">No saved views yet</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">Create a view to save your filters and sorting</p>
                    </div>
                ) : (
                    views.map((view) => (
                        <div
                            key={view.id}
                            className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-all group"
                        >
                            {/* Default Star */}
                            <button
                                onClick={() => onSetDefault(view.id)}
                                className={`flex-shrink-0 ${view.isDefault ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-500'
                                    } transition-colors`}
                            >
                                <Star size={20} fill={view.isDefault ? 'currentColor' : 'none'} />
                            </button>

                            {/* View Info */}
                            <button
                                onClick={() => onSelectView(view)}
                                className="flex-1 text-left"
                            >
                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                    {view.name}
                                    {view.isDefault && (
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full uppercase">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs font-bold text-slate-500 mt-1">
                                    {view.filters.length} filter{view.filters.length !== 1 ? 's' : ''} • Sorted by {view.sortBy}
                                </div>
                            </button>

                            {/* Actions */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onSelectView(view)}
                                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                                    title="Apply View"
                                >
                                    <Eye size={16} className="text-indigo-600" />
                                </button>
                                <button
                                    onClick={() => onDeleteView(view.id)}
                                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all"
                                    title="Delete View"
                                >
                                    <Trash2 size={16} className="text-red-600" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Info */}
            {views.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Filter size={16} className="text-blue-600 mt-0.5" />
                        <div className="text-xs font-bold text-blue-800">
                            <strong>Tip:</strong> Click on a view to apply its filters and sorting. Star icon sets the default view.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedViewsManager;
export type { SavedView };
