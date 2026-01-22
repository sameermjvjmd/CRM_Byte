import { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { QueryDefinition } from './QueryBuilder';

interface SaveSearchModalProps {
    query: QueryDefinition;
    onSave: (name: string, description: string, isShared: boolean, isFavorite: boolean) => void;
    onClose: () => void;
}

const SaveSearchModal = ({ query, onSave, onClose }: SaveSearchModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isShared, setIsShared] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const handleSave = () => {
        if (!name.trim()) {
            alert('Please enter a name for this search');
            return;
        }
        onSave(name, description, isShared, isFavorite);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Save Search</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Search Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Hot Leads in California"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this search is for..."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>

                    {/* Query Summary */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-sm font-medium text-slate-700 mb-2">Query Summary</div>
                        <div className="text-sm text-slate-600">
                            <div className="mb-1">
                                <span className="font-medium">Entity:</span> {query.entityType}
                            </div>
                            <div>
                                <span className="font-medium">Conditions:</span> {query.conditions.length} condition(s)
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isShared}
                                onChange={(e) => setIsShared(e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                                <div className="text-sm font-medium text-slate-900">Share with team</div>
                                <div className="text-xs text-slate-500">Allow other team members to use this search</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isFavorite}
                                onChange={(e) => setIsFavorite(e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                                <div className="text-sm font-medium text-slate-900">Add to favorites</div>
                                <div className="text-xs text-slate-500">Quick access from sidebar</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Save size={18} />
                        Save Search
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveSearchModal;
