import { useState, useEffect } from 'react';
import { Users, Briefcase, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';
import ActivitySummaryWidget from '../components/widgets/ActivitySummaryWidget';
import RecentContactsWidget from '../components/widgets/RecentContactsWidget';
import UpcomingActivitiesWidget from '../components/widgets/UpcomingActivitiesWidget';
import QuickActionsWidget from '../components/widgets/QuickActionsWidget';
import OverdueNextStepsWidget from '../components/widgets/OverdueNextStepsWidget';

const DashboardPage = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading insights...</div>;

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Welcome Back!</h1>
                <p className="text-slate-500 text-sm mt-1">Here's what's happening with your CRM today.</p>
            </header>

            {/* Quick Stats - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="text-blue-500" />}
                    label="Total Contacts"
                    value={stats?.totalContacts.toLocaleString() || "0"}
                    trend="Lifetime growth"
                />
                <StatCard
                    icon={<Briefcase className="text-purple-500" />}
                    label="Open Opps"
                    value={stats?.openOpportunities.toLocaleString() || "0"}
                    trend="Active pipeline"
                />
                <StatCard
                    icon={<DollarSign className="text-emerald-500" />}
                    label="Potential Value"
                    value={`$${stats?.potentialValue.toLocaleString() || "0"}`}
                    trend="Weighted pipeline"
                />
                <StatCard
                    icon={<TrendingUp className="text-orange-500" />}
                    label="Win Rate"
                    value={`${stats?.winRate || 0}%`}
                    trend="Closed/Won ratio"
                />
            </div>

            {/* Main Widget Grid - 3 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="space-y-6">
                    <OverdueNextStepsWidget />
                    <ActivitySummaryWidget />
                    <QuickActionsWidget />
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                    <UpcomingActivitiesWidget />

                    {/* Sales Funnel */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Sales Funnel</h3>
                        <div className="space-y-4">
                            {stats?.funnel.map((item: any, idx: number) => (
                                <FunnelBar
                                    key={item.label}
                                    label={item.label}
                                    value={item.percentage}
                                    color={idx === 0 ? "bg-blue-500" : idx === 1 ? "bg-indigo-500" : idx === 2 ? "bg-purple-500" : idx === 3 ? "bg-pink-500" : "bg-emerald-500"}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-6">
                    <RecentContactsWidget />

                    {/* Recent Activity Feed */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {stats?.recentActivities.map((activity: any) => (
                                <ActivityItem
                                    key={activity.id}
                                    icon={<Clock size={16} />}
                                    title={activity.title}
                                    time={new Date(activity.time).toLocaleDateString()}
                                    type={activity.type}
                                />
                            ))}
                            {stats?.recentActivities.length === 0 && (
                                <div className="text-center py-8 text-slate-400 text-sm">No recent activities.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
    >
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                {icon}
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
        <div className="text-xs font-semibold text-emerald-600">{trend}</div>
    </motion.div>
);

const FunnelBar = ({ label, value, color }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

const ActivityItem = ({ icon, title, time, type }: any) => (
    <div className="flex gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-900 truncate">{title}</div>
            <div className="text-xs text-slate-500">
                {time} • <span className="text-indigo-600 font-semibold">{type}</span>
            </div>
        </div>
    </div>
);

export default DashboardPage;

