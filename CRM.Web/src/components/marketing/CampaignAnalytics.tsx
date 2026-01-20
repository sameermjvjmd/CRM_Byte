import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Mail, Clock, MousePointer2, Eye, UserPlus, AlertCircle, TrendingUp, ArrowLeft, Layers } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

interface Props {
    campaignId: number;
    onBack: () => void;
}

interface AnalyticsData {
    campaignName: string;
    totalRecipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
    deliveryRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    opensOverTime: Array<{ timestamp: string; count: number }>;
    clicksOverTime: Array<{ timestamp: string; count: number }>;
    topLinks: Array<{ url: string; clickCount: number; uniqueClicks: number }>;
    stepAnalytics?: Array<{
        stepId: number;
        stepName: string;
        orderIndex: number;
        subject: string;
        sent: number;
        opened: number;
        clicked: number;
        openRate: number;
        clickRate: number;
    }>;
}

const CampaignAnalytics: React.FC<Props> = ({ campaignId, onBack }) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [campaignId]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get(`/marketing/campaigns/${campaignId}/analytics`);
            setData(response.data);
        } catch (error) {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-400 animate-pulse font-medium">Calculating campaign impact...</div>;
    if (!data) return <div className="p-12 text-center text-slate-400">Campaign data not found.</div>;

    const funnelData = [
        { name: 'Sent', value: data.sent, fill: '#6366f1' },
        { name: 'Opened', value: data.opened, fill: '#8b5cf6' },
        { name: 'Clicked', value: data.clicked, fill: '#ec4899' },
    ];

    const timelineData = data.opensOverTime.map(point => ({
        date: new Date(point.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        opens: point.count,
        clicks: data.clicksOverTime.find(c => c.timestamp === point.timestamp)?.count || 0
    }));

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{data.campaignName}</h2>
                        <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                            Performance Insights • ID: <span className="text-indigo-600">{campaignId}</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchAnalytics} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200">
                        Refresh Stats
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Sent"
                    value={data.sent}
                    icon={<Mail className="text-indigo-600" size={20} />}
                    subtext={`${data.totalRecipients} Total Recipients`}
                    color="bg-indigo-50"
                />
                <StatCard
                    label="Open Rate"
                    value={`${data.openRate.toFixed(1)}%`}
                    icon={<Eye className="text-purple-600" size={20} />}
                    subtext={`${data.opened} Unique Opens`}
                    color="bg-purple-50"
                />
                <StatCard
                    label="Click Rate"
                    value={`${data.clickRate.toFixed(1)}%`}
                    icon={<MousePointer2 className="text-pink-600" size={20} />}
                    subtext={`${data.clicked} Total Clicks`}
                    color="bg-pink-50"
                />
                <StatCard
                    label="Delivery"
                    value={`${data.deliveryRate.toFixed(1)}%`}
                    icon={<TrendingUp className="text-emerald-600" size={20} />}
                    subtext={`${data.bounced} Bounces`}
                    color="bg-emerald-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Engagement Timeline */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <Clock size={18} className="text-indigo-500" />
                        Engagement over Time
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="opens" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="clicks" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-500" />
                        Campaign Funnel
                    </h3>
                    <div className="h-[300px] w-full flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={funnelData} margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Other Metrics */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <UserPlus size={18} className="text-indigo-500" />
                        Secondary Metrics
                    </h3>
                    <SecondaryMetric label="Click-to-Open (CTOR)" value={`${data.clickToOpenRate.toFixed(1)}%`} progress={data.clickToOpenRate} color="bg-indigo-500" />
                    <SecondaryMetric label="Unsubscribe Rate" value={`${data.unsubscribeRate.toFixed(1)}%`} progress={data.unsubscribeRate * 10} color="bg-slate-400" />
                    <SecondaryMetric label="Bounce Rate" value={`${data.bounceRate.toFixed(1)}%`} progress={data.bounceRate * 10} color="bg-rose-400" />
                </div>

                {/* Top Links */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Most Clicked Links</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Link URL</th>
                                    <th className="px-6 py-3 text-center">Total Clicks</th>
                                    <th className="px-6 py-3 text-center">Unique</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.topLinks.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No link engagement tracked yet.</td></tr>
                                ) : (
                                    data.topLinks.map((link, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-indigo-600 truncate max-w-md">{link.url}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-mono font-bold text-slate-700">{link.clickCount}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-mono font-bold text-slate-700">{link.uniqueClicks}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Drip Campaign Step Analytics */}
            {data.stepAnalytics && data.stepAnalytics.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Layers className="text-purple-600" size={18} />
                            Drip Journey Performance
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 w-16 text-center">Step</th>
                                    <th className="px-6 py-3">Email Subject</th>
                                    <th className="px-6 py-3 text-center">Sent</th>
                                    <th className="px-6 py-3 text-center">Opens</th>
                                    <th className="px-6 py-3 text-center">Rate</th>
                                    <th className="px-6 py-3 text-center">Clicks</th>
                                    <th className="px-6 py-3 text-center">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.stepAnalytics.map((step) => (
                                    <tr key={step.stepId} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center mx-auto text-xs border border-slate-200 group-hover:bg-purple-100 group-hover:text-purple-600 group-hover:border-purple-200 transition-colors">
                                                {step.orderIndex}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-800">{step.stepName}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{step.subject || '(No subject)'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">{step.sent}</td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">{step.opened}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${step.openRate > 20 ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500'}`}>
                                                {step.openRate.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">{step.clicked}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${step.clickRate > 5 ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}>
                                                {step.clickRate.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; subtext: string; color: string }> = ({ label, value, icon, subtext, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live</div>
        </div>
        <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
        <div className="text-sm font-bold text-slate-500 mb-3">{label}</div>
        <div className="pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
            {subtext}
        </div>
    </div>
);

const SecondaryMetric: React.FC<{ label: string; value: string; progress: number; color: string }> = ({ label, value, progress, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-500">{label}</span>
            <span className="font-bold text-slate-900">{value}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} transition-all duration-1000`}
                style={{ width: `${Math.min(100, progress)}%` }}
            />
        </div>
    </div>
);

export default CampaignAnalytics;
