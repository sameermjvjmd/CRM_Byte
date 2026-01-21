import React, { useState, useEffect } from 'react';
import { X, Send, Users, FileText, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { emailApi, type EmailTemplate } from '../../api/emailApi';
import { toast } from 'react-hot-toast';
import api from '../../api/api';

interface Contact {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
}

interface BulkEmailComposerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedContacts: Contact[];
    onSent?: () => void;
}

interface BulkEmailResult {
    contactId: number;
    contactName: string;
    emailAddress: string;
    success: boolean;
    errorMessage?: string;
}

const BulkEmailComposer: React.FC<BulkEmailComposerProps> = ({
    isOpen,
    onClose,
    selectedContacts,
    onSent,
}) => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendResults, setSendResults] = useState<BulkEmailResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [scheduledFor, setScheduledFor] = useState<string>('');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        sent: 0,
        failed: 0,
        scheduled: 0
    });

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            setStats({
                total: selectedContacts.length,
                sent: 0,
                failed: 0,
                scheduled: 0
            });
        }
    }, [isOpen, selectedContacts]);

    const fetchTemplates = async () => {
        try {
            const data = await emailApi.getTemplates();
            setTemplates(data.filter(t => t.isActive));
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    };

    const handleTemplateChange = (templateId: number) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplateId(templateId);
            setSubject(template.subject);
            setBody(template.body);
        }
    };

    const handleSend = async () => {
        if (!subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }

        if (!body.trim()) {
            toast.error('Please enter a message body');
            return;
        }

        if (selectedContacts.length === 0) {
            toast.error('No contacts selected');
            return;
        }

        // Count contacts without email
        const contactsWithoutEmail = selectedContacts.filter(c => !c.email);
        if (contactsWithoutEmail.length > 0) {
            const proceed = window.confirm(
                `${contactsWithoutEmail.length} contact(s) don't have email addresses and will be skipped. Continue?`
            );
            if (!proceed) return;
        }

        setIsSending(true);
        setSendResults([]);
        setShowResults(true);

        try {
            const request = {
                contactIds: selectedContacts.map(c => c.id),
                templateId: selectedTemplateId || undefined,
                subject,
                body,
                scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined
            };

            const response = await api.post('/emails/bulk', request);
            const data = response.data;

            setSendResults(data.results || []);
            setStats({
                total: data.totalAttempted || 0,
                sent: data.successfullySent || 0,
                failed: data.failed || 0,
                scheduled: data.scheduled || 0
            });

            if (data.successfullySent > 0 || data.scheduled > 0) {
                toast.success(
                    data.scheduled > 0
                        ? `${data.scheduled} email(s) scheduled successfully!`
                        : `${data.successfullySent} email(s) sent successfully!`
                );
                onSent?.();
            }

            if (data.failed > 0) {
                toast.error(`${data.failed} email(s) failed to send`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send bulk emails');
        } finally {
            setIsSending(false);
        }
    };

    const resetForm = () => {
        setSelectedTemplateId(null);
        setSubject('');
        setBody('');
        setSendResults([]);
        setShowResults(false);
        setScheduledFor('');
        setStats({ total: 0, sent: 0, failed: 0, scheduled: 0 });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-white" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Bulk Email / Mail Merge</h2>
                            <p className="text-sm text-white/80">
                                Sending to {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!showResults ? (
                        <div className="space-y-4">
                            {/* Recipients Preview */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Selected Recipients ({selectedContacts.length})
                                </h3>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {selectedContacts.slice(0, 10).map(contact => (
                                        <div key={contact.id} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <span className="font-medium">
                                                {contact.firstName} {contact.lastName}
                                            </span>
                                            {contact.email ? (
                                                <span className="text-gray-500">({contact.email})</span>
                                            ) : (
                                                <span className="text-red-500">(No email)</span>
                                            )}
                                        </div>
                                    ))}
                                    {selectedContacts.length > 10 && (
                                        <p className="text-xs text-gray-500 italic">
                                            ...and {selectedContacts.length - 10} more
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Template Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <FileText className="inline w-4 h-4 mr-1" />
                                    Use Template (Optional)
                                </label>
                                <select
                                    value={selectedTemplateId || ''}
                                    onChange={(e) => handleTemplateChange(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">-- Select a template --</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} - {t.subject}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Placeholders Info */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                <p className="text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">
                                    💡 Available Placeholders (will be replaced for each contact):
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-amber-800 dark:text-amber-400">
                                    <code>{'{{ContactName}}'}</code>
                                    <code>{'{{FirstName}}'}</code>
                                    <code>{'{{LastName}}'}</code>
                                    <code>{'{{Email}}'}</code>
                                    <code>{'{{CompanyName}}'}</code>
                                    <code>{'{{JobTitle}}'}</code>
                                    <code>{'{{Phone}}'}</code>
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="e.g., Hello {{FirstName}}, special offer for you!"
                                />
                            </div>

                            {/* Body */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={10}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                                    placeholder="Dear {{ContactName}},&#10;&#10;We hope this email finds you well...&#10;&#10;(HTML supported)"
                                />
                            </div>

                            {/* Schedule Option */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    <Clock className="inline w-4 h-4 mr-1" />
                                    Schedule for Later (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduledFor}
                                    onChange={(e) => setScheduledFor(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Results View */
                        <div className="space-y-4">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{stats.total}</div>
                                    <div className="text-xs text-gray-500">Total</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.sent}</div>
                                    <div className="text-xs text-green-600 dark:text-green-500">Sent</div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.failed}</div>
                                    <div className="text-xs text-red-600 dark:text-red-500">Failed</div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.scheduled}</div>
                                    <div className="text-xs text-blue-600 dark:text-blue-500">Scheduled</div>
                                </div>
                            </div>

                            {/* Results List */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                        Detailed Results
                                    </h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {sendResults.map((result, index) => (
                                        <div
                                            key={index}
                                            className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between ${result.success
                                                    ? 'bg-white dark:bg-gray-800'
                                                    : 'bg-red-50 dark:bg-red-900/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {result.success ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {result.contactName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {result.emailAddress}
                                                    </div>
                                                </div>
                                            </div>
                                            {result.errorMessage && (
                                                <div className="text-xs text-red-600 dark:text-red-400">
                                                    {result.errorMessage}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between bg-gray-50 dark:bg-gray-800/50">
                    {showResults ? (
                        <>
                            <button
                                onClick={() => setShowResults(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                Back to Compose
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700"
                            >
                                Close
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={isSending}
                                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                                {isSending ? 'Sending...' : scheduledFor ? 'Schedule Emails' : 'Send to All'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkEmailComposer;
