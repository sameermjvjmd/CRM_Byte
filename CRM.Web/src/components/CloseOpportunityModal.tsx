import { useState } from 'react';
import { X, Trophy, Frown, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

interface CloseOpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    opportunityId: number;
    opportunityName: string;
    targetStage: 'Closed Won' | 'Closed Lost';
    onSuccess: () => void;
}

const CloseOpportunityModal = ({ isOpen, onClose, opportunityId, opportunityName, targetStage, onSuccess }: CloseOpportunityModalProps) => {
    const isWon = targetStage === 'Closed Won';
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [closeDate, setCloseDate] = useState(new Date().toISOString().split('T')[0]);

    const reasons = isWon
        ? ["Price", "Features", "Relationship", "Brand Trust", "Speed", "Support", "Customization", "Integration", "Other"]
        : ["Price Too High", "Lost to Competition", "No Budget", "Bad Timing", "No Decision", "Missing Features", "Poor Fit", "Champion Left", "Project Cancelled", "Other"];

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/opportunities/${opportunityId}/stage`, {
                stage: targetStage,
                reason: reason,
                notes: notes,
                actualCloseDate: closeDate
            });

            toast.success(`Opportunity marked as ${targetStage}`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error closing opportunity:', error);
            toast.error('Failed to close opportunity');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all";
    const labelStyle = "text-xs font-black uppercase text-slate-400 tracking-widest block mb-2";

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isWon ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {isWon ? <Trophy size={20} /> : <Frown size={20} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Close Opportunity</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight truncate max-w-[200px]">{opportunityName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className={labelStyle}>Close Date</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                required
                                value={closeDate}
                                onChange={(e) => setCloseDate(e.target.value)}
                                className={`${inputStyle} pl-12`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelStyle}>{isWon ? 'Primary Win Reason' : 'Primary Loss Reason'}</label>
                        <div className="relative">
                            <CheckSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                required
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className={`${inputStyle} pl-12 appearance-none`}
                            >
                                <option value="">Select a reason...</option>
                                {reasons.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelStyle}>Closing Notes</label>
                        <div className="relative">
                            <MessageSquare size={16} className="absolute left-4 top-4 text-slate-400" />
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className={`${inputStyle} pl-12 h-24 resize-none pt-3`}
                                placeholder="Details about why this deal was won or lost..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-4 py-3 text-white rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${isWon ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                isWon ? 'Won Deal' : 'Lost Deal'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CloseOpportunityModal;
