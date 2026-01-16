import { TrendingUp, Users, DollarSign, Activity, Calendar, Target } from 'lucide-react';

const InsightPage = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Business Insights</h1>
                <p className="text-sm text-slate-500 font-bold mt-1">Analytics and intelligence dashboard</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp size={24} />
                        <span className="text-xs font-black uppercase tracking-widest opacity-80">Revenue</span>
                    </div>
                    <div className="text-3xl font-black">$847K</div>
                    <div className="text-xs font-bold opacity-80 mt-2">+12.5% from last month</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <Users size={24} />
                        <span className="text-xs font-black uppercase tracking-widest opacity-80">Contacts</span>
                    </div>
                    <div className="text-3xl font-black">1,247</div>
                    <div className="text-xs font-bold opacity-80 mt-2">+8.2% growth</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign size={24} />
                        <span className="text-xs font-black uppercase tracking-widest opacity-80">Pipeline</span>
                    </div>
                    <div className="text-3xl font-black">$2.1M</div>
                    <div className="text-xs font-bold opacity-80 mt-2">34 active deals</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <Target size={24} />
                        <span className="text-xs font-black uppercase tracking-widest opacity-80">Win Rate</span>
                    </div>
                    <div className="text-3xl font-black">68%</div>
                    <div className="text-xs font-bold opacity-80 mt-2">Above target (65%)</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Revenue Trend</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[45, 52, 48, 65, 72, 68, 85, 78, 92, 88, 95, 100].map((height, idx) => (
                            <div key={idx} className="flex-1 bg-indigo-100 rounded-t-lg hover:bg-indigo-200 transition-all relative group" style={{ height: `${height}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-xs px-2 py-1 rounded font-bold transition-opacity">
                                    ${(height * 10).toFixed(0)}K
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase">
                        <span>Jan</span>
                        <span>Dec</span>
                    </div>
                </div>

                {/* Activity Distribution */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Activity Distribution</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Calls', value: 45, color: 'bg-blue-500', percentage: '45%' },
                            { label: 'Meetings', value: 30, color: 'bg-indigo-500', percentage: '30%' },
                            { label: 'Emails', value: 20, color: 'bg-purple-500', percentage: '20%' },
                            { label: 'Tasks', value: 5, color: 'bg-pink-500', percentage: '5%' },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-700 uppercase">{item.label}</span>
                                    <span className="text-xs font-black text-slate-900">{item.percentage}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className={`${item.color} h-2 rounded-full`} style={{ width: item.percentage }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Top Performing Contacts</h3>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { name: 'ByteSymphony Inc.', revenue: '$125K', deals: 8 },
                        { name: 'TechCorp Solutions', revenue: '$98K', deals: 5 },
                        { name: 'Digital Dynamics', revenue: '$87K', deals: 6 },
                    ].map((contact) => (
                        <div key={contact.name} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-sm font-black text-slate-900 mb-2 uppercase">{contact.name}</div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-lg font-black text-emerald-600">{contact.revenue}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">{contact.deals} Deals</div>
                                </div>
                                <Activity size={20} className="text-slate-300" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InsightPage;
