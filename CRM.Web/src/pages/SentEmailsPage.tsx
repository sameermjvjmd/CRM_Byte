import React, { useState, useEffect } from 'react';
import { Search, Mail, ExternalLink, Calendar, User, FileText, TrendingUp } from 'lucide-react';
import type { SentEmail } from '../api/emailApi';
import { emailApi } from '../api/emailApi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SentEmailsPage: React.FC = () => {
    const navigate = useNavigate();
    const [emails, setEmails] = useState<SentEmail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);

    const fetchEmails = async () => {
        try {
            setIsLoading(true);
            const data = await emailApi.getSentEmails();
            setEmails(data);
        } catch (error) {
            toast.error('Failed to load sent emails');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const filteredEmails = emails.filter(e =>
        e.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.templateName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Context Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-30">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Sent Emails</h1>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-widest">
                            History
                        </span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        View all sent email communications
                    </div>
                </div>
                <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {emails.length} Total Emails
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-auto">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="relative group w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={14} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filter emails..."
                                className="w-full bg-white border border-slate-200 text-xs font-bold rounded py-1.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 uppercase tracking-widest"
                            />
                        </div>
                        <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {filteredEmails.length} Emails Found
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse act-table">
                        <thead>
                            <tr>
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Template</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Engagement</th>
                                <th className="px-6 py-4">Sent Date</th>
                                <th className="w-32 text-right px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-6 bg-white h-16"></td>
                                    </tr>
                                ))
                            ) : filteredEmails.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                        <div className="flex flex-col items-center justify-center">
                                            <Mail className="w-12 h-12 text-slate-300 mb-2" />
                                            <p>{searchTerm ? 'No emails match your search' : 'No emails sent yet'}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredEmails.map((email) => (
                                    <tr key={email.id} className="hover:bg-slate-50 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                <div>
                                                    <div className="font-black text-slate-900 text-xs uppercase tracking-tight">{email.to}</div>
                                                    {email.cc && (
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase">CC: {email.cc}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700 text-xs max-w-xs truncate">{email.subject}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {email.templateName ? (
                                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-indigo-50 text-indigo-600 border-indigo-100 flex items-center gap-1 w-fit">
                                                    <FileText size={10} />
                                                    {email.templateName}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">No Template</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(email.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp size={12} className="text-purple-500" />
                                                    <span className="text-xs font-black text-purple-600">{email.openCount}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase">Opens</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ExternalLink size={12} className="text-blue-500" />
                                                    <span className="text-xs font-black text-blue-600">{email.clickCount}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase">Clicks</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                <Calendar size={12} className="text-slate-400" />
                                                {new Date(email.sentAt).toLocaleDateString()} {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {email.contactId && (
                                                    <button
                                                        onClick={() => navigate(`/contacts/${email.contactId}`)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                        title="View Contact"
                                                    >
                                                        <User size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedEmail(email)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="View Details"
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Email Detail Modal */}
            {selectedEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-indigo-600">
                            <div className="flex items-center gap-3">
                                <Mail className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-bold text-white">Email Details</h2>
                            </div>
                            <button
                                onClick={() => setSelectedEmail(null)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                ×
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">To</label>
                                    <div className="text-sm font-bold text-slate-900">{selectedEmail.to}</div>
                                </div>
                                {selectedEmail.cc && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">CC</label>
                                        <div className="text-sm font-bold text-slate-900">{selectedEmail.cc}</div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                                <div className="text-sm font-bold text-slate-900">{selectedEmail.subject}</div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Opens</label>
                                    <div className="text-sm font-black text-purple-600">{selectedEmail.openCount}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clicks</label>
                                    <div className="text-sm font-black text-blue-600">{selectedEmail.clickCount}</div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sent At</label>
                                <div className="text-sm font-bold text-slate-900">
                                    {new Date(selectedEmail.sentAt).toLocaleString()}
                                </div>
                            </div>

                            {selectedEmail.templateName && (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Template Used</label>
                                    <div className="text-sm font-bold text-indigo-600">{selectedEmail.templateName}</div>
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

export default SentEmailsPage;
