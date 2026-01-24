import { useState } from 'react';
import { X, Check, AlertTriangle, ArrowRight, Merge } from 'lucide-react';
import type { Contact } from '../../types/contact';
import api from '../../api/api';
import toast from 'react-hot-toast';

interface MergeContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contacts: Contact[];
    onSuccess: () => void;
}

export default function MergeContactsModal({ isOpen, onClose, contacts, onSuccess }: MergeContactsModalProps) {
    const [targetId, setTargetId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleMerge = async () => {
        if (!targetId) {
            toast.error("Please select a master contact");
            return;
        }

        const sourceIds = contacts.filter(c => c.id !== targetId).map(c => c.id);
        if (sourceIds.length === 0) {
            toast.error("You must select at least 2 contacts to merge");
            return;
        }

        if (!confirm("This action cannot be undone. Are you sure you want to merge these contacts?")) return;

        setLoading(true);
        try {
            await api.post('/contacts/merge', {
                targetContactId: targetId,
                sourceContactIds: sourceIds
            });
            toast.success("Contacts merged successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to merge contacts");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Merge size={20} className="text-indigo-600" />
                        Merge Contacts
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
                        <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                        <div className="text-sm text-amber-800">
                            <p className="font-bold mb-1">Warning: Permanent Action</p>
                            Merge will move all Activities, Opportunities, and Emails to the <strong>Master Record</strong>. The other records will be permanently deleted.
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Select Master Record</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar border rounded-lg p-2">
                        {contacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setTargetId(contact.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${targetId === contact.id ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${targetId === contact.id ? 'border-indigo-600' : 'border-slate-300'}`}>
                                    {targetId === contact.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-900">{contact.firstName} {contact.lastName}</div>
                                    <div className="text-xs text-slate-500 flex gap-2">
                                        <span>{contact.email}</span>
                                        {contact.company && <span>• {typeof contact.company === 'string' ? contact.company : contact.company.name}</span>}
                                    </div>
                                </div>
                                {targetId === contact.id && (
                                    <div className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">MASTER</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {targetId && (
                        <div className="mt-6 flex items-center gap-4 text-sm">
                            <div className="flex-1 p-3 bg-red-50 rounded-lg border border-red-100 text-center">
                                <div className="font-bold text-red-700">{contacts.length - 1} Record(s)</div>
                                <div className="text-xs text-red-500">Will be deleted</div>
                            </div>
                            <ArrowRight className="text-slate-300" />
                            <div className="flex-1 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                                <div className="font-bold text-emerald-700">1 Master</div>
                                <div className="text-xs text-emerald-500">Will be kept</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleMerge}
                        disabled={!targetId || loading}
                        className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        {loading ? 'Merging...' : 'Merge Contacts'}
                    </button>
                </div>
            </div>
        </div>
    );
}
