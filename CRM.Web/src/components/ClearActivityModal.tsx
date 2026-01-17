import { useState } from 'react';
import { X, CheckCircle2, MessageSquare, Calendar, ArrowRight, Clock } from 'lucide-react';
import type { Activity } from '../types/activity';
import { ACTIVITY_RESULTS } from '../types/activity';
import api from '../api/api';
import toast from 'react-hot-toast';

interface ClearActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    activity: Activity;
    onSuccess: (wasFollowUpRequested: boolean, followUpData?: any) => void;
}

const ClearActivityModal = ({ isOpen, onClose, activity, onSuccess }: ClearActivityModalProps) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('Completed');
    const [outcome, setOutcome] = useState('');
    const [scheduleFollowUp, setScheduleFollowUp] = useState(true);

    if (!isOpen) return null;

    const handleClear = async () => {
        setLoading(true);
        try {
            await api.put(`/activities/${activity.id}/complete`, {
                result: result,
                outcome: outcome
            });

            toast.success('Activity cleared to history');

            // Prepare follow-up data if requested
            const followUpData = scheduleFollowUp ? {
                subject: `Follow-up: ${activity.subject}`,
                activityType: activity.type,
                contactId: activity.contactId,
                companyId: activity.companyId,
                opportunityId: activity.opportunityId,
                priority: activity.priority,
                // Default follow-up to tomorrow same time
                startTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
            } : undefined;

            onSuccess(scheduleFollowUp, followUpData);
            onClose();
        } catch (error) {
            console.error('Error clearing activity:', error);
            toast.error('Failed to clear activity');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all";
    const labelStyle = "text-xs font-black uppercase text-slate-400 tracking-widest block mb-2";

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Clear Activity</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">{activity.subject}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Result Selection */}
                    <div>
                        <label className={labelStyle}>Result</label>
                        <select
                            value={result}
                            onChange={(e) => setResult(e.target.value)}
                            className={inputStyle}
                        >
                            {ACTIVITY_RESULTS.map(res => (
                                <option key={res.value} value={res.value}>{res.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Outcome Notes */}
                    <div>
                        <label className={labelStyle}>Outcome Notes</label>
                        <div className="relative">
                            <MessageSquare size={16} className="absolute left-4 top-4 text-slate-400" />
                            <textarea
                                value={outcome}
                                onChange={(e) => setOutcome(e.target.value)}
                                className={`${inputStyle} pl-12 h-32 resize-none pt-3`}
                                placeholder="Describe the outcome of this activity..."
                            />
                        </div>
                    </div>

                    {/* Follow-up Prompt */}
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-indigo-600" />
                                <span className="text-sm font-black text-slate-800">Schedule Follow-up</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={scheduleFollowUp}
                                    onChange={(e) => setScheduleFollowUp(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Automatically open a new activity form pre-filled with this contact's details once cleared.
                        </p>
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
                            onClick={handleClear}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {scheduleFollowUp ? 'Clear & Follow-up' : 'Clear Only'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClearActivityModal;
