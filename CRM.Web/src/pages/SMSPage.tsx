import { useState } from 'react';
import { MessageSquare, Send, Users, Calendar } from 'lucide-react';

const SMSPage = () => {
    const [smsData, setSmsData] = useState({
        to: '',
        message: '',
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">SMS Messaging</h1>
                    <p className="text-sm text-slate-500 font-bold mt-1">Send text messages to your contacts</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* SMS Composer */}
                <div className="col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                        {/* Recipients */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                To (Phone Numbers)
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={smsData.to}
                                    onChange={(e) => setSmsData({ ...smsData, to: e.target.value })}
                                    placeholder="+1234567890, +0987654321..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
                                    Message
                                </label>
                                <span className="text-xs font-bold text-slate-400">
                                    {smsData.message.length}/160
                                </span>
                            </div>
                            <textarea
                                value={smsData.message}
                                onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                                placeholder="Type your message here..."
                                rows={6}
                                maxLength={160}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-all" title="Schedule">
                                    <Calendar size={18} className="text-slate-400" />
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-200 transition-all">
                                    Clear
                                </button>
                                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2">
                                    <Send size={16} />
                                    Send SMS
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Message History */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Recent Messages</h3>
                        <div className="space-y-3">
                            {[
                                { to: '+1234567890', message: 'Meeting reminder for tomorrow at 10 AM', time: '2 hours ago' },
                                { to: '+0987654321', message: 'Thank you for your business!', time: '1 day ago' },
                            ].map((msg, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-700">{msg.to}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{msg.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-600">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Templates */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Quick Templates</h3>
                        <div className="space-y-2">
                            {[
                                'Meeting Reminder',
                                'Follow-up',
                                'Thank You',
                                'Appointment Confirmation',
                                'Payment Reminder',
                            ].map((template) => (
                                <button
                                    key={template}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                                >
                                    <MessageSquare size={16} className="text-slate-400 group-hover:text-indigo-600 mb-1" />
                                    <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 uppercase">
                                        {template}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">This Month</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="text-2xl font-black text-indigo-600">127</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Messages Sent</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-emerald-600">98%</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SMSPage;
