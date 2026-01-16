import { useState } from 'react';
import { Calendar, Clock, Flag, Users, Building2, UserCircle, Tag, MoreVertical } from 'lucide-react';
import type { Activity } from '../types/activity';

interface EnhancedActivitiesTableProps {
    activities: Activity[];
    onActivityClick?: (activity: Activity) => void;
    onEdit?: (activity: Activity) => void;
    onDelete?: (activityId: number) => void;
}

const EnhancedActivitiesTable = ({
    activities,
    onActivityClick,
    onEdit,
    onDelete
}: EnhancedActivitiesTableProps) => {
    const [selectedActivities, setSelectedActivities] = useState<number[]>([]);

    const toggleSelectActivity = (id: number) => {
        setSelectedActivities(prev =>
            prev.includes(id)
                ? prev.filter(actId => actId !== id)
                : [...prev, id]
        );
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'text-red-600 bg-red-50';
            case 'medium':
                return 'text-orange-600 bg-orange-50';
            case 'low':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-slate-600 bg-slate-50';
        }
    };

    if (activities.length === 0) {
        return (
            <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-500">No activities found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left">
                            <input
                                type="checkbox"
                                checked={selectedActivities.length === activities.length}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedActivities(activities.map(a => a.id));
                                    } else {
                                        setSelectedActivities([]);
                                    }
                                }}
                                className="rounded border-slate-300"
                            />
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-500 tracking-wide">Type</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-500 tracking-wide">Date</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-500 tracking-wide">Time</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-500 tracking-wide">Priority</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-500 tracking-wide">Title</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-500 tracking-wide">Duration</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-500 tracking-wide">Associated</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-500 tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map((activity) => (
                        <tr
                            key={activity.id}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => onActivityClick?.(activity)}
                        >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={selectedActivities.includes(activity.id)}
                                    onChange={() => toggleSelectActivity(activity.id)}
                                    className="rounded border-slate-300"
                                />
                            </td>
                            <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 text-xs font-bold text-slate-700">
                                    <Calendar size={12} />
                                    {activity.activityType}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-slate-900">
                                {formatDate(activity.startTime)}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-slate-600">
                                {formatTime(activity.startTime)}
                            </td>
                            <td className="px-4 py-3">
                                {activity.priority && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${getPriorityColor(activity.priority)}`}>
                                        <Flag size={12} />
                                        {activity.priority}
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <div className="font-bold text-sm text-slate-900">{activity.subject}</div>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-slate-600">
                                {activity.duration ? `${activity.duration} min` : '-'}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                    {activity.associatedCompany && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                                            <Building2 size={12} />
                                            Company
                                        </span>
                                    )}
                                    {activity.associatedContact && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                                            <UserCircle size={12} />
                                            Contact
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <button className="p-1 hover:bg-slate-200 rounded transition-all">
                                    <MoreVertical size={16} className="text-slate-400" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EnhancedActivitiesTable;
