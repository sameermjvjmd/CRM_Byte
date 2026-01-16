import { useState } from 'react';
import { X, Trophy, XCircle, AlertCircle } from 'lucide-react';

interface CloseReasonModalProps {
    isOpen: boolean;
    isWin: boolean;
    opportunityName: string;
    onClose: () => void;
    onConfirm: (reason: string, notes: string) => void;
}

const WIN_REASONS = [
    'Price', 'Features', 'Relationship', 'Brand Trust', 'Speed',
    'Support', 'Customization', 'Integration', 'Other'
];

const LOSS_REASONS = [
    'Price Too High', 'Lost to Competition', 'No Budget', 'Bad Timing',
    'No Decision', 'Missing Features', 'Poor Fit', 'Champion Left',
    'Project Cancelled', 'Other'
];

export default function CloseReasonModal({
    isOpen,
    isWin,
    opportunityName,
    onClose,
    onConfirm
}: CloseReasonModalProps) {
    const [selectedReason, setSelectedReason] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const reasons = isWin ? WIN_REASONS : LOSS_REASONS;
    const headerColor = isWin ? 'bg-emerald-500' : 'bg-red-500';
    const Icon = isWin ? Trophy : XCircle;

    const handleConfirm = () => {
        if (!selectedReason) return;
        onConfirm(selectedReason, notes);
        setSelectedReason('');
        setNotes('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`${headerColor} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Icon size={24} />
                            <div>
                                <h2 className="font-bold text-lg">
                                    {isWin ? 'Congratulations! 🎉' : 'Sorry to hear that'}
                                </h2>
                                <p className="text-sm text-white/80">
                                    {isWin ? 'Mark this deal as Won' : 'Mark this deal as Lost'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-slate-600 text-sm mb-4">
                        Deal: <span className="font-bold text-slate-800">{opportunityName}</span>
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {isWin ? 'Why did we win?' : 'Why did we lose?'} <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {reasons.map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => setSelectedReason(reason)}
                                    className={`
                                        px-3 py-2 text-sm rounded-lg border transition-all text-left
                                        ${selectedReason === reason
                                            ? isWin
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                                                : 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                        }
                                    `}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Additional Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder={isWin ? "What worked well? Any learnings for future deals?" : "What could we have done differently?"}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            rows={3}
                        />
                    </div>

                    {!selectedReason && (
                        <div className="flex items-center gap-2 text-amber-600 text-sm mb-4">
                            <AlertCircle size={16} />
                            <span>Please select a reason to continue</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedReason}
                        className={`
                            px-4 py-2 text-sm font-bold rounded-lg transition-all
                            ${selectedReason
                                ? isWin
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }
                        `}
                    >
                        {isWin ? 'Mark as Won' : 'Mark as Lost'}
                    </button>
                </div>
            </div>
        </div>
    );
}
