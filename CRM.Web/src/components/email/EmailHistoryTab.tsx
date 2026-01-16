import React, { useState, useEffect } from 'react';
import { Mail, Calendar, ExternalLink, TrendingUp, FileText } from 'lucide-react';
import type { SentEmail } from '../../api/emailApi';
import { emailApi } from '../../api/emailApi';

interface EmailHistoryTabProps {
    contactId: number;
}

const EmailHistoryTab: React.FC<EmailHistoryTabProps> = ({ contactId }) => {
    const [emails, setEmails] = useState<SentEmail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);

    useEffect(() => {
        fetchEmails();
    }, [contactId]);

    const fetchEmails = async () => {
        try {
            setIsLoading(true);
            const data = await emailApi.getSentEmails(contactId);
            setEmails(data);
        } catch (error) {
            console.error('Failed to load email history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { bg: string; text: string; border: string }> = {
            Sent: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
            Delivered: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
            Opened: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
            Failed: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
            Pending: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
        };

        const style = statusMap[status] || statusMap.Sent;
        return (
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${style.bg} ${style.text} ${style.border}`}>
                {status}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (emails.length === 0) {
        return (
            <div className="py-16 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">
                <Mail className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                No email correspondence yet
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                    Email Correspondence
                </h4>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                    {emails.length} Emails
                </div>
            </div>

            <div className="space-y-3">
                {emails.map((email) => (
                    <div
                        key={email.id}
                        className="p-4 rounded-lg border border-slate-100 bg-white hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => setSelectedEmail(email)}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                                <Mail className="w-4 h-4 text-indigo-500" />
                                <div className="flex-1">
                                    <div className="font-black text-slate-900 text-xs uppercase tracking-tight">{email.subject}</div>
                                    {email.templateName && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <FileText size={10} className="text-indigo-400" />
                                            <span className="text-[9px] font-bold text-indigo-600 uppercase">{email.templateName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {getStatusBadge(email.status)}
                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                                    <Calendar size={10} />
                                    {new Date(email.sentAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                            <div className="flex items-center gap-1">
                                <TrendingUp size={12} className="text-purple-400" />
                                <span className="text-xs font-black text-purple-600">{email.openCount}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Opens</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ExternalLink size={12} className="text-blue-400" />
                                <span className="text-xs font-black text-blue-600">{email.clickCount}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Clicks</span>
                            </div>
                            {email.cc && (
                                <div className="text-[9px] font-bold text-slate-400 uppercase ml-auto">
                                    CC: {email.cc}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Email Detail Modal */}
            {selectedEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-indigo-600">
                            <div className="flex items-center gap-3">
                                <Mail className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-bold text-white">Email Details</h2>
                            </div>
                            <button
                                onClick={() => setSelectedEmail(null)}
                                className="text-white/80 hover:text-white transition-colors text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                                <div className="text-sm font-bold text-slate-900 mt-1">{selectedEmail.subject}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">To</label>
                                    <div className="text-sm font-bold text-slate-900 mt-1">{selectedEmail.to}</div>
                                </div>
                                {selectedEmail.cc && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">CC</label>
                                        <div className="text-sm font-bold text-slate-900 mt-1">{selectedEmail.cc}</div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Opens</label>
                                    <div className="text-sm font-black text-purple-600 mt-1">{selectedEmail.openCount}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clicks</label>
                                    <div className="text-sm font-black text-blue-600 mt-1">{selectedEmail.clickCount}</div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sent At</label>
                                <div className="text-sm font-bold text-slate-900 mt-1">
                                    {new Date(selectedEmail.sentAt).toLocaleString()}
                                </div>
                            </div>

                            {selectedEmail.templateName && (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Template Used</label>
                                    <div className="text-sm font-bold text-indigo-600 mt-1">{selectedEmail.templateName}</div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => setSelectedEmail(null)}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailHistoryTab;
