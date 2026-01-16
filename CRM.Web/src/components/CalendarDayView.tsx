import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Activity } from '../types/activity';

interface CalendarDayViewProps {
    activities: Activity[];
    onActivityClick?: (activity: Activity) => void;
    onTimeSlotClick?: (hour: number, minute: number) => void;
    currentDate?: Date;
}

const CalendarDayView = ({
    activities,
    onActivityClick,
    onTimeSlotClick,
    currentDate = new Date()
}: CalendarDayViewProps) => {
    const [selectedDate, setSelectedDate] = useState(currentDate);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const previousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const nextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const getActivitiesForHour = (hour: number): Activity[] => {
        return activities.filter(activity => {
            const activityDate = new Date(activity.startTime);
            return (
                activityDate.getFullYear() === selectedDate.getFullYear() &&
                activityDate.getMonth() === selectedDate.getMonth() &&
                activityDate.getDate() === selectedDate.getDate() &&
                activityDate.getHours() === hour
            );
        });
    };

    const formatHour = (hour: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    };

    const isToday = selectedDate.toDateString() === new Date().toDateString();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={previousDay}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                        </h2>
                        <p className="text-sm font-bold text-slate-500">
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={nextDay}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                <button
                    onClick={goToToday}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
                >
                    Today
                </button>
            </div>

            {/* Time Slots */}
            <div className="overflow-auto max-h-[700px]">
                {hours.map(hour => {
                    const hourActivities = getActivitiesForHour(hour);
                    const currentHour = new Date().getHours();
                    const isCurrentHour = isToday && hour === currentHour;

                    return (
                        <div
                            key={hour}
                            className={`flex border-b border-slate-200 ${isCurrentHour ? 'bg-indigo-50' : ''}`}
                        >
                            {/* Hour label */}
                            <div className="w-24 p-4 text-sm font-bold text-slate-500 text-right border-r border-slate-200 bg-slate-50">
                                {formatHour(hour)}
                            </div>

                            {/* Activity slot */}
                            <div
                                className="flex-1 p-4 min-h-[100px] hover:bg-slate-50 cursor-pointer transition-colors relative group"
                                onClick={() => onTimeSlotClick?.(hour, 0)}
                            >
                                {hourActivities.length === 0 ? (
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-full">
                                        <Plus size={20} className="text-slate-400" />
                                        <span className="ml-2 text-sm font-bold text-slate-400">Add activity</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {hourActivities.map(activity => (
                                            <div
                                                key={activity.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onActivityClick?.(activity);
                                                }}
                                                className="p-4 rounded-lg bg-gradient-to-r from-indigo-100 to-indigo-50 border-l-4 border-indigo-600 hover:shadow-lg transition-all cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-black text-slate-900">{activity.subject}</h3>
                                                    <span className="px-2 py-1 rounded-full bg-white text-xs font-bold text-indigo-600">
                                                        {new Date(activity.startTime).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-bold text-slate-600">
                                                    {activity.type}
                                                    {activity.durationMinutes && ` • ${activity.durationMinutes} min`}
                                                </div>
                                                {activity.location && (
                                                    <div className="text-xs font-bold text-slate-500 mt-1">
                                                        📍 {activity.location}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarDayView;
