import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle2, User } from 'lucide-react';
import api from '../../api/api';

interface Activity {
    id: number;
    subject: string;
    type: string;
    startTime: string;
    isCompleted: boolean;
    contact?: {
        firstName: string;
        lastName: string;
    };
}

const UpcomingActivitiesWidget = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUpcomingActivities();
    }, []);

    const fetchUpcomingActivities = async () => {
        try {
            const response = await api.get('/activities');
            const now = new Date();
            // Get upcoming (future) and incomplete activities, limit to 5
            const upcoming = response.data
                .filter((a: Activity) => !a.isCompleted && new Date(a.startTime) >= now)
                .sort((a: Activity, b: Activity) =>
                    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                )
                .slice(0, 5);
            setActivities(upcoming);
        } catch (error) {
            console.error('Error fetching upcoming activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type: string) => {
        // Return appropriate icon based on activity type
        return Calendar;
    };

    const getActivityColor = (type: string) => {
        const colorMap: { [key: string]: string } = {
            'Call': 'text-blue-600 bg-blue-50',
            'Meeting': 'text-purple-600 bg-purple-50',
            'Email': 'text-green-600 bg-green-50',
            'To-Do': 'text-orange-600 bg-orange-50',
            'Event': 'text-pink-600 bg-pink-50'
        };
        return colorMap[type] || 'text-slate-600 bg-slate-50';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Upcoming Activities</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Your next scheduled tasks</p>
                    </div>
                    <Clock className="text-purple-500" size={20} />
                </div>
            </div>

            <div className="p-6">
                {activities.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <CheckCircle2 className="mx-auto mb-2 opacity-20" size={40} />
                        <p className="text-sm font-semibold">All caught up!</p>
                        <p className="text-xs mt-1">No upcoming activities</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                                        {React.createElement(getActivityIcon(activity.type), { size: 16 })}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {activity.subject}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                <Calendar size={12} />
                                                {new Date(activity.startTime).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {activity.contact && (
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                    <User size={12} />
                                                    {activity.contact.firstName} {activity.contact.lastName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingActivitiesWidget;
