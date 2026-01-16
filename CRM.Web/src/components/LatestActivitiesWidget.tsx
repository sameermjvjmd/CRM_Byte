import { useEffect, useState } from 'react';
import { Mail, Phone, CheckCircle, Calendar, FileText, TrendingUp } from 'lucide-react';
import api from '../api/api';

interface ContactActivitySummary {
    contactId: number;
    totalActivities: number;
    emailCount: number;
    callAttemptCount: number;
    callReachedCount: number;
    meetingCount: number;
    letterSentCount: number;
    lastActivityDate?: string;
}

interface LatestActivitiesWidgetProps {
    contactId?: number;
    onActivityTypeClick?: (activityType: string) => void;
}

const LatestActivitiesWidget = ({ contactId, onActivityTypeClick }: LatestActivitiesWidgetProps) => {
    const [summary, setSummary] = useState<ContactActivitySummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivitySummary();
    }, [contactId]);

    const fetchActivitySummary = async () => {
        if (!contactId) return;

        try {
            const response = await api.get(`/activities/stats/contact/${contactId}`);
            setSummary(response.data);
        } catch (error) {
            console.error('Error fetching activity summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-16 bg-slate-200 rounded"></div>
                        <div className="h-16 bg-slate-200 rounded"></div>
                        <div className="h-16 bg-slate-200 rounded"></div>
                        <div className="h-16 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Use default values if no summary from API
    const displaySummary: ContactActivitySummary = summary || {
        contactId: contactId || 0,
        totalActivities: 0,
        emailCount: 0,
        callAttemptCount: 0,
        callReachedCount: 0,
        meetingCount: 0,
        letterSentCount: 0
    };

    const activityItems = [
        {
            label: 'Emails',
            count: displaySummary.emailCount,
            icon: Mail,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            type: 'Email'
        },
        {
            label: 'Call Attempts',
            count: displaySummary.callAttemptCount,
            icon: Phone,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            type: 'Call Attempt'
        },
        {
            label: 'Calls Reached',
            count: displaySummary.callReachedCount,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            type: 'Call Reached'
        },
        {
            label: 'Meetings',
            count: displaySummary.meetingCount,
            icon: Calendar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            type: 'Meeting'
        },
        {
            label: 'Letters',
            count: displaySummary.letterSentCount,
            icon: FileText,
            color: 'text-slate-600',
            bgColor: 'bg-slate-50',
            type: 'Letter'
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Latest Activities</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Activity summary for this contact</p>
                    </div>
                    <TrendingUp className="text-indigo-500" size={20} />
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {activityItems.map((item) => (
                        <button
                            key={item.type}
                            onClick={() => onActivityTypeClick?.(item.type)}
                            className={`${item.bgColor} ${item.color} rounded-lg p-4 text-left transition-all hover:shadow-md hover:scale-105 transform group`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="text-2xl font-black">{item.count}</span>
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wide opacity-80">
                                {item.label}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Total Activities:</span>
                    <span className="text-slate-900 font-black text-lg">{displaySummary.totalActivities}</span>
                </div>

                {displaySummary.lastActivityDate && (
                    <div className="mt-2 text-xs text-slate-500">
                        Last activity: {new Date(displaySummary.lastActivityDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LatestActivitiesWidget;
