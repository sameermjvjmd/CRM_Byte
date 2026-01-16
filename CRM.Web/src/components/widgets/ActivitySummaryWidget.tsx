import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/api';

interface ActivityStats {
    totalActivities: number;
    completedActivities: number;
    pendingActivities: number;
    overdueActivities: number;
}

const ActivitySummaryWidget = () => {
    const [stats, setStats] = useState<ActivityStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/activities/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching activity stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-12 bg-slate-200 rounded"></div>
                    <div className="h-12 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    const statItems = [
        {
            label: 'Total Activities',
            value: stats.totalActivities,
            icon: Activity,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Completed',
            value: stats.completedActivities,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Pending',
            value: stats.pendingActivities,
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            label: 'Overdue',
            value: stats.overdueActivities,
            icon: AlertCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Activity Overview</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your activity summary</p>
            </div>

            <div className="p-6 space-y-3">
                {statItems.map((item) => (
                    <div key={item.label} className={`${item.bgColor} rounded-lg p-4 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            <item.icon className={item.color} size={24} />
                            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                        </div>
                        <span className={`text-2xl font-black ${item.color}`}>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivitySummaryWidget;
