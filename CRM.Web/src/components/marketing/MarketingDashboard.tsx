import React, { useEffect, useState } from 'react';
import { BarChart3, Clock, Eye, Mail, Send, Users, TrendingUp, UserPlus, MousePointer2 } from 'lucide-react';
import api from '../../api/api';
import { Link } from 'react-router-dom';

interface CampaignDto {
    id: number;
    name: string;
    type: string;
    status: string;
    sentCount: number;
    openCount: number;
    uniqueOpenCount: number;
    openRate: number;
    clickRate: number;
    createdAt: string;
    marketingListName?: string;
}

interface MarketingDashboardDto {
    totalCampaigns: number;
    activeCampaigns: number;
    scheduledCampaigns: number;
    totalSubscribers: number;
    newSubscribersThisMonth: number;
    totalEmailsSent: number;
    avgOpenRate: number;
    avgClickRate: number;
    avgBounceRate: number;
    totalBudget: number;
    totalRevenue: number;
    overallROI: number;
    recentCampaigns: CampaignDto[];
}

const MarketingDashboard: React.FC = () => {
    const [data, setData] = useState<MarketingDashboardDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/marketing/dashboard');
                setData(response.data);
            } catch (error) {
                console.error('Failed to load marketing dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-12 text-center text-slate-400 animate-pulse font-medium">Gathering insights...</div>;
    if (!data) return <div className="p-12 text-center text-slate-400">Dashboard data unavailable.</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Send size={20} className="text-white" />}
                    label="Total Emails Sent"
                    value={data.totalEmailsSent.toLocaleString()}
                    trend={null}
                    color="bg-indigo-500"
                />

                <StatCard
                    icon={<Eye size={20} className="text-white" />}
                    label="Avg. Open Rate"
                    value={`${data.avgOpenRate.toFixed(1)}%`}
                    trend={null}
                    color="bg-purple-500"
                />

                <StatCard
                    icon={<MousePointer2 size={20} className="text-white" />}
                    label="Avg. Click Rate"
                    value={`${data.avgClickRate.toFixed(1)}%`}
                    trend={null}
                    color="bg-pink-500"
                />

                <StatCard
                    icon={<Users size={20} className="text-white" />}
                    label="Total Subscribers"
                    value={data.totalSubscribers.toLocaleString()}
                    trend={`${data.newSubscribersThisMonth} new this month`}
                    color="bg-emerald-500"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text- slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Campaigns</div>
                        <div className="text-2xl font-black text-slate-900">{data.activeCampaigns}</div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <TrendingUp size={20} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Scheduled</div>
                        <div className="text-2xl font-black text-slate-900">{data.scheduledCampaigns}</div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Overall ROI</div>
                        <div className="text-2xl font-black text-slate-900">{data.overallROI.toFixed(0)}%</div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <BarChart3 size={20} />
                    </div>
                </div>
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="text-indigo-500" size={18} />
                        Recent Campaigns
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {data.recentCampaigns.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic">No campaigns found. Start your first one!</div>
                    ) : (
                        data.recentCampaigns.map(camp => (
                            <div key={camp.id} className="p-6 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg hover:text-indigo-600 transition-colors">{camp.name}</h4>
                                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${camp.status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    camp.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        camp.status === 'Scheduled' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-slate-100 text-slate-600 border-slate-200'
                                                } font-bold uppercase text-[10px]`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'Sent' ? 'bg-emerald-500' :
                                                        camp.status === 'Active' ? 'bg-blue-500' :
                                                            camp.status === 'Scheduled' ? 'bg-amber-500' :
                                                                'bg-slate-400'
                                                    }`}></span>
                                                {camp.status}
                                            </span>
                                            <span>{new Date(camp.createdAt).toLocaleDateString()}</span>
                                            <span className="text-slate-300">•</span>
                                            <span>{camp.type}</span>
                                            {camp.marketingListName && (
                                                <>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">List: {camp.marketingListName}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 md:gap-8 items-center self-start md:self-center">
                                    <StatItem value={camp.sentCount} label="Sent" />
                                    <StatItem value={camp.uniqueOpenCount || camp.openCount} label="Opens" />
                                    <StatItem value={`${(camp.openRate || 0).toFixed(1)}%`} label="Open Rate" highlight={(camp.openRate || 0) > 20} />
                                    <StatItem value={`${(camp.clickRate || 0).toFixed(1)}%`} label="Click Rate" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; trend: string | null; color: string }> = ({ icon, label, value, trend, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
        <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl ${color} opacity-10 group-hover:opacity-20 transition-opacity`}>
            {icon}
        </div>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} shadow-lg shadow-indigo-100`}>
                {icon}
            </div>
        </div>
        <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">{label}</div>
            {trend && (
                <div className="mt-3 text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md border border-emerald-100">
                    {trend}
                </div>
            )}
        </div>
    </div>
);

const StatItem: React.FC<{ value: string | number; label: string; highlight?: boolean }> = ({ value, label, highlight }) => (
    <div className="text-center min-w-[60px]">
        <div className={`text-sm font-bold ${highlight ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</div>
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</div>
    </div>
);

export default MarketingDashboard;
