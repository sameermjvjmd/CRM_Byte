import { Trash2, Mail, Tag, Archive, X, CheckCircle, Users } from 'lucide-react';

interface BulkActionsToolbarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onBulkDelete: () => void;
    onBulkEmail?: () => void;
    onBulkAddTag?: () => void;
    onBulkArchive?: () => void;
    onBulkComplete?: () => void;
    onBulkAssign?: () => void;
    recordType: 'contacts' | 'activities' | 'companies' | 'opportunities';
}

const BulkActionsToolbar = ({
    selectedCount,
    onClearSelection,
    onBulkDelete,
    onBulkEmail,
    onBulkAddTag,
    onBulkArchive,
    onBulkComplete,
    onBulkAssign,
    recordType
}: BulkActionsToolbarProps) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-4 flex items-center gap-4 min-w-[600px]">
                {/* Selection Count */}
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                        {selectedCount}
                    </div>
                    <span className="font-bold text-indigo-900">
                        {selectedCount} {recordType} selected
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-1">
                    {/* Email (for contacts) */}
                    {onBulkEmail && (
                        <button
                            onClick={onBulkEmail}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm hover:bg-blue-100 transition-all flex items-center gap-2"
                            title="Send Email"
                        >
                            <Mail size={16} />
                            Email
                        </button>
                    )}

                    {/* Add Tag */}
                    {onBulkAddTag && (
                        <button
                            onClick={onBulkAddTag}
                            className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-bold text-sm hover:bg-purple-100 transition-all flex items-center gap-2"
                            title="Add Tag"
                        >
                            <Tag size={16} />
                            Tag
                        </button>
                    )}

                    {/* Complete (for activities) */}
                    {onBulkComplete && (
                        <button
                            onClick={onBulkComplete}
                            className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold text-sm hover:bg-green-100 transition-all flex items-center gap-2"
                            title="Mark Complete"
                        >
                            <CheckCircle size={16} />
                            Complete
                        </button>
                    )}

                    {/* Assign */}
                    {onBulkAssign && (
                        <button
                            onClick={onBulkAssign}
                            className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-bold text-sm hover:bg-orange-100 transition-all flex items-center gap-2"
                            title="Assign to User"
                        >
                            <Users size={16} />
                            Assign
                        </button>
                    )}

                    {/* Archive */}
                    {onBulkArchive && (
                        <button
                            onClick={onBulkArchive}
                            className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold text-sm hover:bg-amber-100 transition-all flex items-center gap-2"
                            title="Archive"
                        >
                            <Archive size={16} />
                            Archive
                        </button>
                    )}

                    {/* Delete */}
                    <button
                        onClick={onBulkDelete}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>

                {/* Clear Selection */}
                <button
                    onClick={onClearSelection}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                    title="Clear Selection"
                >
                    <X size={20} className="text-slate-400" />
                </button>
            </div>
        </div>
    );
};

export default BulkActionsToolbar;
