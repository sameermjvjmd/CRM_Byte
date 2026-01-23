import { useState } from 'react';
import { Calendar, Plus, Trash2, Edit2, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ContactReminder {
    id: number;
    contactId: number;
    reminderType: string;
    eventDate: string; // DateTime
    daysBefore: number;
    title?: string;
    notes?: string;
    isActive: boolean;
    isRecurring: boolean;
    lastTriggered?: string;
}

interface ContactRemindersTabProps {
    reminders: ContactReminder[];
    onAdd: (reminder: Omit<ContactReminder, 'id'>) => Promise<void>;
    onEdit: (id: number, reminder: Partial<ContactReminder>) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const ContactRemindersTab = ({ reminders, onAdd, onEdit, onDelete }: ContactRemindersTabProps) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<ContactReminder>>({
        reminderType: 'Birthday',
        eventDate: new Date().toISOString().split('T')[0],
        daysBefore: 7,
        title: '',
        notes: '',
        isActive: true,
        isRecurring: true
    });

    const resetForm = () => {
        setFormData({
            reminderType: 'Birthday',
            eventDate: new Date().toISOString().split('T')[0],
            daysBefore: 7,
            title: '',
            notes: '',
            isActive: true,
            isRecurring: true
        });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleEditStart = (rem: ContactReminder) => {
        setFormData({
            ...rem,
            eventDate: new Date(rem.eventDate).toISOString().split('T')[0]
        });
        setEditingId(rem.id);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await onEdit(editingId, formData);
                toast.success('Reminder updated');
            } else {
                // @ts-ignore
                await onAdd(formData);
                toast.success('Reminder added');
            }
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save reminder');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Reminders</h3>
                    <p className="text-sm font-bold text-slate-500">
                        {reminders.length} active reminder{reminders.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Plus size={16} />
                    Add Reminder
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6 animate-in slide-in-from-top-4">
                    <h4 className="text-sm font-black text-slate-900 mb-4 uppercase">
                        {editingId ? 'Edit Reminder' : 'New Reminder'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                                <select
                                    value={formData.reminderType}
                                    onChange={e => setFormData({ ...formData, reminderType: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Birthday">Birthday</option>
                                    <option value="Anniversary">Anniversary</option>
                                    <option value="Contract Renewal">Contract Renewal</option>
                                    <option value="Review">Periodic Review</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Event Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.eventDate}
                                    onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Title / Description</label>
                            <input
                                type="text"
                                placeholder="e.g. Discuss renewal terms"
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Days Before</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.daysBefore}
                                    onChange={e => setFormData({ ...formData, daysBefore: parseInt(e.target.value) })}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isRecurring}
                                        onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Recurring (Yearly)</span>
                                </label>
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Active</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20"
                                placeholder="Additional details..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200"
                            >
                                {editingId ? 'Update Reminder' : 'Add Reminder'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {reminders.map((rem) => (
                    <div key={rem.id} className={`flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition-all group ${rem.isActive ? 'border-indigo-100' : 'border-slate-200 opacity-75'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-sm ${rem.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Calendar size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    {rem.reminderType}
                                    {rem.title && <span className="font-normal text-slate-500">- {rem.title}</span>}
                                </h4>
                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${rem.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {rem.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-indigo-400" />
                                    {new Date(rem.eventDate).toLocaleDateString()}
                                </span>
                                {rem.isRecurring && (
                                    <span className="flex items-center gap-1.5 text-indigo-600">
                                        <CheckCircle size={14} />
                                        Recurring
                                    </span>
                                )}
                                <span className="text-slate-400">
                                    Notify {rem.daysBefore} days before
                                </span>
                            </div>
                            {rem.notes && <p className="text-xs text-slate-400 mt-2 line-clamp-1">{rem.notes}</p>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEditStart(rem)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this reminder?')) {
                                        onDelete(rem.id);
                                    }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {reminders.length === 0 && !isFormOpen && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                        <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-500">No active reminders</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">Set up birthday or anniversary alerts</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactRemindersTab;
export type { ContactReminder };
