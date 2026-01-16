import { useState } from 'react';
import {
    Mail, Plus, Trash2, Edit2, Star, Check, X,
    AlertCircle, Loader2, MailWarning
} from 'lucide-react';
import api from '../../api/api';
import type { ContactEmail } from '../../types/contact';
import { EMAIL_TYPES } from '../../types/contact';

interface ContactEmailsTabProps {
    contactId: number;
    emails: ContactEmail[];
    onUpdate: () => void;
}

const ContactEmailsTab = ({ contactId, emails, onUpdate }: ContactEmailsTabProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [newEmail, setNewEmail] = useState({
        email: '',
        emailType: 'Work',
        label: '',
        isPrimary: false,
        allowMarketing: true
    });

    const [editEmail, setEditEmail] = useState({
        email: '',
        emailType: '',
        label: '',
        isPrimary: false,
        allowMarketing: true
    });

    const handleAdd = async () => {
        if (!newEmail.email) {
            setError('Email address is required');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await api.post(`/contacts/${contactId}/emails`, newEmail);
            setNewEmail({ email: '', emailType: 'Work', label: '', isPrimary: false, allowMarketing: true });
            setIsAdding(false);
            onUpdate();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add email');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (email: ContactEmail) => {
        setEditingId(email.id);
        setEditEmail({
            email: email.email,
            emailType: email.emailType,
            label: email.label || '',
            isPrimary: email.isPrimary,
            allowMarketing: email.allowMarketing
        });
    };

    const handleUpdate = async () => {
        if (!editEmail.email) {
            setError('Email address is required');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await api.put(`/contacts/${contactId}/emails/${editingId}`, editEmail);
            setEditingId(null);
            onUpdate();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update email');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (emailId: number) => {
        if (!confirm('Are you sure you want to delete this email?')) return;

        try {
            await api.delete(`/contacts/${contactId}/emails/${emailId}`);
            onUpdate();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete email');
        }
    };

    const handleSetPrimary = async (emailId: number) => {
        try {
            await api.post(`/contacts/${contactId}/emails/${emailId}/set-primary`);
            onUpdate();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to set primary');
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Email Addresses
                </h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Email
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Add new email form */}
            {isAdding && (
                <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <input
                            type="email"
                            placeholder="Email address *"
                            value={newEmail.email}
                            onChange={e => setNewEmail({ ...newEmail, email: e.target.value })}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                        <select
                            value={newEmail.emailType}
                            onChange={e => setNewEmail({ ...newEmail, emailType: e.target.value })}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                        >
                            {EMAIL_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Label (optional)"
                            value={newEmail.label}
                            onChange={e => setNewEmail({ ...newEmail, label: e.target.value })}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={newEmail.isPrimary}
                                onChange={e => setNewEmail({ ...newEmail, isPrimary: e.target.checked })}
                                className="w-4 h-4 rounded text-indigo-600"
                            />
                            Primary email
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={newEmail.allowMarketing}
                                onChange={e => setNewEmail({ ...newEmail, allowMarketing: e.target.checked })}
                                className="w-4 h-4 rounded text-indigo-600"
                            />
                            Allow marketing
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAdd}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Email list */}
            {emails.length === 0 && !isAdding ? (
                <div className="text-center py-8 text-slate-400">
                    <Mail className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No email addresses added yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {emails.map(email => (
                        <div
                            key={email.id}
                            className={`p-4 border rounded-xl transition-all ${email.isPrimary
                                    ? 'bg-indigo-50 border-indigo-200'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {editingId === email.id ? (
                                // Edit mode
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                        <input
                                            type="email"
                                            value={editEmail.email}
                                            onChange={e => setEditEmail({ ...editEmail, email: e.target.value })}
                                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                        />
                                        <select
                                            value={editEmail.emailType}
                                            onChange={e => setEditEmail({ ...editEmail, emailType: e.target.value })}
                                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                        >
                                            {EMAIL_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Label"
                                            value={editEmail.label}
                                            onChange={e => setEditEmail({ ...editEmail, label: e.target.value })}
                                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={editEmail.allowMarketing}
                                                onChange={e => setEditEmail({ ...editEmail, allowMarketing: e.target.checked })}
                                                className="w-4 h-4 rounded text-indigo-600"
                                            />
                                            Allow marketing
                                        </label>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdate}
                                            disabled={saving}
                                            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View mode
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Mail className={`w-5 h-5 ${email.isPrimary ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <a href={`mailto:${email.email}`} className="font-medium text-slate-800 hover:text-indigo-600">
                                                    {email.email}
                                                </a>
                                                {email.isPrimary && (
                                                    <span className="px-2 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-100 rounded-full">
                                                        PRIMARY
                                                    </span>
                                                )}
                                                {email.optedOut && (
                                                    <span className="px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-full flex items-center gap-1">
                                                        <MailWarning className="w-3 h-3" />
                                                        OPTED OUT
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded">{email.emailType}</span>
                                                {email.label && <span>• {email.label}</span>}
                                                {!email.allowMarketing && <span className="text-amber-600">• No marketing</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!email.isPrimary && (
                                            <button
                                                onClick={() => handleSetPrimary(email.id)}
                                                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Set as primary"
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(email)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(email.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContactEmailsTab;
