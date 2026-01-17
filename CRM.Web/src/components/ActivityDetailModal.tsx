import { useState, useEffect } from 'react';
import {
    X, Clock, Calendar as CalendarIcon, MapPin,
    FileText, User, Building2, Briefcase,
    Flag, Trash2, CheckCircle2, AlertCircle,
    Repeat, Bell, ExternalLink
} from 'lucide-react';
import type { Activity } from '../types/activity';
import api from '../api/api';
import toast from 'react-hot-toast';
import ClearActivityModal from './ClearActivityModal';

interface ActivityDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    activityId: number | null;
    onUpdate?: () => void;
    onComplete?: (followUpData?: any) => void;
}

const ActivityDetailModal = ({ isOpen, onClose, activityId, onUpdate, onComplete }: ActivityDetailModalProps) => {
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Activity>>({});
    const [completing, setCompleting] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && activityId) {
            fetchActivity();
        }
    }, [isOpen, activityId]);

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const response = await api.get<Activity>(`/activities/${activityId}`);
            setActivity(response.data);
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching activity:', error);
            toast.error('Failed to load activity details');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!activity || !formData) return;
        try {
            await api.put(`/activities/${activity.id}`, formData);
            toast.success('Activity updated');
            setIsEditing(false);
            fetchActivity();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating activity:', error);
            toast.error('Failed to update activity');
        }
    };

    const handleComplete = async () => {
        if (!activity) return;
        setIsClearModalOpen(true);
    };

    const onClearSuccess = (wasFollowUpRequested: boolean, followUpData?: any) => {
        if (onUpdate) onUpdate();
        if (wasFollowUpRequested && onComplete) {
            onComplete(followUpData);
        }
        onClose();
    };

    const handleDelete = async (deleteSeries: boolean = false) => {
        if (!activity) return;
        const confirmMsg = deleteSeries
            ? 'Are you sure you want to delete the ENTIRE series?'
            : 'Are you sure you want to delete this activity?';

        if (!window.confirm(confirmMsg)) return;

        try {
            await api.delete(`/activities/${activity.id}?deleteSeries=${deleteSeries}`);
            toast.success(deleteSeries ? 'Series deleted' : 'Activity deleted');
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error('Error deleting activity:', error);
            toast.error('Failed to delete activity');
        }
    };

    if (!isOpen) return null;

    const labelStyle = "text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1";
    const valueStyle = "text-sm font-bold text-slate-900";
    const inputStyle = "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : activity && (
                    <>
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${activity.isCompleted ? 'bg-emerald-500 shadow-emerald-200' : 'bg-indigo-600 shadow-indigo-200'
                                    }`}>
                                    {activity.isCompleted ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                                        {isEditing ? (
                                            <input
                                                className="bg-slate-50 border-none p-0 focus:ring-0 w-full"
                                                value={formData.subject}
                                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                            />
                                        ) : activity.subject}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black uppercase text-slate-500">
                                            {activity.type}
                                        </span>
                                        {activity.priority && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${activity.priority === 'High' ? 'bg-red-50 text-red-600' :
                                                activity.priority === 'Normal' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                                                }`}>
                                                {activity.priority} Priority
                                            </span>
                                        )}
                                        {activity.isRecurring && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase">
                                                <Repeat size={10} /> Recurring
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                {/* Left Column: Timing & Details */}
                                <div className="space-y-6">
                                    <section>
                                        <label className={labelStyle}>When</label>
                                        <div className="flex items-start gap-3 mt-1">
                                            <CalendarIcon className="text-slate-400 shrink-0" size={18} />
                                            <div>
                                                <p className={valueStyle}>
                                                    {new Date(activity.startTime).toLocaleDateString('en-US', {
                                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </p>
                                                {!activity.isAllDay && (
                                                    <p className="text-sm text-slate-500 font-medium">
                                                        {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {activity.durationMinutes && ` (${activity.durationMinutes} min)`}
                                                    </p>
                                                )}
                                                {activity.isAllDay && <p className="text-xs font-bold text-indigo-600 uppercase mt-0.5">All Day Event</p>}
                                            </div>
                                        </div>
                                    </section>

                                    {activity.location && (
                                        <section>
                                            <label className={labelStyle}>Location</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin className="text-slate-400" size={16} />
                                                <p className={valueStyle}>{activity.location}</p>
                                            </div>
                                        </section>
                                    )}

                                    <section>
                                        <label className={labelStyle}>Reminders</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Bell className={activity.hasReminder ? "text-indigo-600" : "text-slate-300"} size={16} />
                                            <p className={valueStyle}>
                                                {activity.hasReminder
                                                    ? `${activity.reminderMinutesBefore || 15} minutes before`
                                                    : 'No reminder set'}
                                            </p>
                                        </div>
                                    </section>

                                    <section>
                                        <label className={labelStyle}>Notes</label>
                                        <div className="mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 whitespace-pre-wrap min-h-[100px]">
                                            {activity.notes || "No notes added."}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: Associations */}
                                <div className="space-y-6">
                                    <section>
                                        <label className={labelStyle}>Related To</label>
                                        <div className="space-y-3 mt-2">
                                            {activity.contact && (
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 shadow-sm rounded-xl">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <User size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate">{activity.contact.firstName} {activity.contact.lastName}</p>
                                                        <p className="text-xs text-slate-500 truncate">{activity.contact.email}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {activity.company && (
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 shadow-sm rounded-xl">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                        <Building2 size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate">{activity.company.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{activity.company.industry || 'No industry set'}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {activity.opportunity && (
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 shadow-sm rounded-xl">
                                                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                                        <Briefcase size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate">{activity.opportunity.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{activity.opportunity.stage}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {!activity.contact && !activity.company && !activity.opportunity && (
                                                <p className="text-sm text-slate-400 italic">No associations.</p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Attendees Display */}
                                    {activity.attendees && (
                                        <section>
                                            <label className={labelStyle}>Attendees / Invitees</label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {(() => {
                                                    try {
                                                        const attendeesList = JSON.parse(activity.attendees);
                                                        if (!Array.isArray(attendeesList) || attendeesList.length === 0) return <p className="text-xs text-slate-400 italic">None</p>;
                                                        return attendeesList.map((a: any) => (
                                                            <div key={a.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-black border border-slate-100 shadow-sm">
                                                                <User size={12} className="text-indigo-400" />
                                                                {a.name}
                                                            </div>
                                                        ));
                                                    } catch (e) {
                                                        return <p className="text-xs text-slate-400 italic">Error parsing attendees</p>;
                                                    }
                                                })()}
                                            </div>
                                        </section>
                                    )}

                                    {activity.meetingLink && (
                                        <section className="pt-2">
                                            <label className={labelStyle}>Meeting Link</label>
                                            <a
                                                href={activity.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm bg-indigo-50 p-3 rounded-2xl border border-indigo-100 transition-all group"
                                            >
                                                <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                Join Meeting
                                            </a>
                                        </section>
                                    )}

                                    {activity.isRecurring && (
                                        <section className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Repeat className="text-indigo-600" size={16} />
                                                <label className="text-xs font-black uppercase text-indigo-600 tracking-widest">Recurrence Policy</label>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">
                                                {activity.recurrencePattern} pattern
                                                {(activity.recurrenceInterval ?? 1) > 1 ? `, every ${activity.recurrenceInterval} units` : ''}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                This is one instance of a series. Updating this instance will not affect others.
                                            </p>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(false)}
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Delete
                                </button>
                                {activity.isRecurring && (
                                    <button
                                        onClick={() => handleDelete(true)}
                                        className="px-4 py-2 text-red-700 hover:bg-red-100 rounded-xl text-xs font-black uppercase transition-all"
                                    >
                                        Delete Series
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-white transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            disabled={completing || activity.isCompleted}
                                            onClick={handleComplete}
                                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg ${activity.isCompleted
                                                ? 'bg-emerald-50 text-emerald-600 shadow-none'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
                                                }`}
                                        >
                                            {activity.isCompleted ? (
                                                <>
                                                    <CheckCircle2 size={18} />
                                                    Completed
                                                </>
                                            ) : completing ? 'Completing...' : (
                                                <>
                                                    <CheckCircle2 size={18} />
                                                    Complete Activity
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                                        >
                                            Edit Details
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {activity && (
                            <ClearActivityModal
                                isOpen={isClearModalOpen}
                                onClose={() => setIsClearModalOpen(false)}
                                activity={activity}
                                onSuccess={onClearSuccess}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ActivityDetailModal;
