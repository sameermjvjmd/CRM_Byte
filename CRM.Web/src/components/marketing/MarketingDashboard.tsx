import React, { useEffect, useState } from 'react';
import { BarChart3, Clock, Eye, Mail, Send, Users } from 'lucide-react';
import api from '../../api/api';
import { Link } from 'react-router-dom';

interface Campaign {
    id: number;
    name: string;
    type: string;
    status: string;
    sentCount: number;
    openCount: number;
    uniqueOpenCount: number;
    openRate: number;
    createdAt: string;
    marketingListName?: string;
}

interface Stats {
    totalCampaigns: number;
    totalLists: number;
    totalSent: number;
    avgOpenRate: number;
}

const MarketingDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, campaignsRes] = await Promise.all([
                    api.get('/marketing/stats'),
                    api.get('/marketing/campaigns?page=1&pageSize=5') // Assuming API supports this or returns all
                ]);
                setStats(statsRes.data);
                setRecentCampaigns(campaignsRes.data.slice(0, 5));
            } catch (error) {
                console.error('Failed to load marketing dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
                        <Send size={16} /> Total Sent
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{stats?.totalSent.toLocaleString() || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
                        <Eye size={16} /> Avg. Open Rate
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{(stats?.avgOpenRate || 0).toFixed(1)}%</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
                        <BarChart3 size={16} /> Campaigns
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{stats?.totalCampaigns || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
                        <Users size={16} /> Total Lists
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{stats?.totalLists || 0}</div>
                </div>
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="text-indigo-500" size={18} />
                        Recent Campaigns
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentCampaigns.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic">No campaigns found. Start your first one!</div>
                    ) : (
                        recentCampaigns.map(camp => (
                            <div key={camp.id} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{camp.name}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <span className={`inline-block w-2 h-2 rounded-full ${camp.status === 'Sent' ? 'bg-emerald-500' :
                                                    camp.status === 'Active' ? 'bg-blue-500' :
                                                        camp.status === 'Scheduled' ? 'bg-purple-500' : 'bg-slate-400'
                                                }`}></span>
                                            {new Date(camp.createdAt).toLocaleDateString()} • {camp.type}
                                            {camp.marketingListName && <span className="ml-2 text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">To: {camp.marketingListName}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-8 items-center">
                                    <div className="text-center min-w-[60px]">
                                        <div className="text-sm font-bold text-slate-900">{camp.sentCount}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Sent</div>
                                    </div>
                                    <div className="text-center min-w-[60px]">
                                        <div className="text-sm font-bold text-slate-900">{camp.uniqueOpenCount || camp.openCount}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Opens</div>
                                    </div>
                                    <div className="text-center min-w-[60px]">
                                        <div className={`text-sm font-bold ${(camp.openRate || 0) > 20 ? 'text-emerald-600' : 'text-slate-700'}`}>
                                            {(camp.openRate || 0).toFixed(1)}%
                                        </div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Rate</div>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase ${camp.status === 'Sent' || camp.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                camp.status === 'Active' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    camp.status === 'Scheduled' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                                        'bg-slate-50 text-slate-600 border border-slate-200'
                                            }`}>
                                            {camp.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketingDashboard;
