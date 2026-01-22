import { useState, useEffect } from 'react';
import { Filter, ChevronDown, Star, TrendingUp, Clock, Users } from 'lucide-react';
import api from '../../api/api';
import type { QueryDefinition } from './QueryBuilder';

interface FilterPreset {
    id?: number;
    name: string;
    description?: string;
    entityType: string;
    filter: QueryDefinition;
    isSystem: boolean;
}

interface FilterPresetsProps {
    entityType: 'Contact' | 'Company' | 'Opportunity' | 'Activity';
    onApplyPreset: (query: QueryDefinition) => void;
}

const FilterPresets = ({ entityType, onApplyPreset }: FilterPresetsProps) => {
    const [presets, setPresets] = useState<FilterPreset[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPresets();
    }, [entityType]);

    const fetchPresets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/search/presets', {
                params: { entityType }
            });
            setPresets(response.data || []);
        } catch (error) {
            console.error('Failed to fetch presets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyPreset = (preset: FilterPreset) => {
        onApplyPreset(preset.filter);
        setIsOpen(false);
    };

    const getPresetIcon = (name: string) => {
        if (name.includes('Hot') || name.includes('Favorite')) return <Star size={16} className="text-yellow-600" />;
        if (name.includes('High') || name.includes('Value')) return <TrendingUp size={16} className="text-green-600" />;
        if (name.includes('Recent') || name.includes('New')) return <Clock size={16} className="text-blue-600" />;
        if (name.includes('Active') || name.includes('Team')) return <Users size={16} className="text-indigo-600" />;
        return <Filter size={16} className="text-slate-600" />;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-lg hover:border-indigo-300 transition-colors"
            >
                <Filter size={18} className="text-slate-600" />
                <span className="font-medium text-slate-700">Quick Filters</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl border-2 border-slate-200 shadow-xl z-20">
                        <div className="p-3 border-b border-slate-200">
                            <h3 className="font-bold text-slate-900">Quick Filters</h3>
                            <p className="text-xs text-slate-500 mt-1">Apply predefined filters instantly</p>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            </div>
                        ) : presets.length === 0 ? (
                            <div className="p-8 text-center">
                                <Filter className="mx-auto text-slate-300 mb-2" size={32} />
                                <p className="text-sm text-slate-500">No presets available</p>
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                {presets.map((preset, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleApplyPreset(preset)}
                                        className="w-full flex items-start gap-3 p-4 hover:bg-indigo-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getPresetIcon(preset.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-slate-900 mb-1">
                                                {preset.name}
                                            </div>
                                            {preset.description && (
                                                <div className="text-xs text-slate-600">
                                                    {preset.description}
                                                </div>
                                            )}
                                            <div className="text-xs text-slate-500 mt-1">
                                                {preset.filter.conditions?.length || 0} condition(s)
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="p-3 border-t border-slate-200 bg-slate-50">
                            <p className="text-xs text-slate-500 text-center">
                                Click a filter to apply it to your search
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FilterPresets;
