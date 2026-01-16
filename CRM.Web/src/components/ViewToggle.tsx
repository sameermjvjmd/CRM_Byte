import { List, Eye } from 'lucide-react';

interface ViewToggleProps {
    currentView: 'list' | 'detail';
    onViewChange: (view: 'list' | 'detail') => void;
}

const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
    return (
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
                onClick={() => onViewChange('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-black uppercase tracking-wide transition-all ${currentView === 'list'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
            >
                <List size={14} />
                List View
            </button>
            <button
                onClick={() => onViewChange('detail')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-black uppercase tracking-wide transition-all ${currentView === 'detail'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
            >
                <Eye size={14} />
                Detail View
            </button>
        </div>
    );
};

export default ViewToggle;
