import { useState } from 'react';
import { Mail, Send, Paperclip, Users, FileText } from 'lucide-react';

const WritePage = () => {
    const [emailData, setEmailData] = useState({
        to: '',
        cc: '',
        subject: '',
        body: '',
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Compose Email</h1>
                    <p className="text-sm text-slate-500 font-bold mt-1">Send emails to your contacts</p>
                </div>
            </div>

            {/* Email Form */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 space-y-4">
                    {/* Recipients */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                            To
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={emailData.to}
                                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                                placeholder="Enter email addresses..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* CC */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                            CC (Optional)
                        </label>
                        <input
                            type="text"
                            value={emailData.cc}
                            onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
                            placeholder="Carbon copy recipients..."
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={emailData.subject}
                            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                            placeholder="Email subject..."
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                            Message
                        </label>
                        <textarea
                            value={emailData.body}
                            onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                            placeholder="Type your message here..."
                            rows={12}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-all" title="Attach File">
                                <Paperclip size={18} className="text-slate-400" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-all" title="Insert Template">
                                <FileText size={18} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-200 transition-all">
                                Save Draft
                            </button>
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2">
                                <Send size={16} />
                                Send Email
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Templates Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Email Templates</h3>
                <div className="grid grid-cols-3 gap-4">
                    {['Welcome Email', 'Follow-up', 'Meeting Request', 'Thank You', 'Proposal', 'Invoice'].map((template) => (
                        <button
                            key={template}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                        >
                            <Mail size={20} className="text-slate-400 group-hover:text-indigo-600 mb-2" />
                            <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 uppercase">
                                {template}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WritePage;
