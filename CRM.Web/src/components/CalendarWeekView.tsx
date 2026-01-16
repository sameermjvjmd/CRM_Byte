import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Activity } from '../types/activity';

interface CalendarWeekViewProps {
    activities: Activity[];
    onActivityClick?: (activity: Activity) => void;
    onTimeSlotClick?: (date: Date, hour: number) => void;
    currentDate?: Date;
}

const CalendarWeekView = ({
    activities,
    onActivityClick,
    onTimeSlotClick,
    currentDate = new Date()
}: CalendarWeekViewProps) => {
    const [weekStart, setWeekStart] = useState(getWeekStart(currentDate));

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        return date;
    });

    function getWeekStart(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    const previousWeek = () => {
        const newStart = new Date(weekStart);
        newStart.setDate(weekStart.getDate() - 7);
        setWeekStart(newStart);
    };

    const nextWeek = () => {
        const newStart = new Date(weekStart);
        newStart.setDate(weekStart.getDate() + 7);
        setWeekStart(newStart);
    };

    const goToToday = () => {
        setWeekStart(getWeekStart(new Date()));
    };

    const getActivitiesForDay = (date: Date, hour: number): Activity[] => {
        return activities.filter(activity => {
            const activityDate = new Date(activity.startTime);
            return (
                activityDate.getFullYear() === date.getFullYear() &&
                activityDate.getMonth() === date.getMonth() &&
                activityDate.getDate() === date.getDate() &&
                activityDate.getHours() === hour
            );
        });
    };

    const formatDateHeader = (date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const isToday = date.toDateString() === new Date().toDateString();
        return (
            <div className={`text-center py-4 border-b border-slate-200 ${isToday ? 'bg-indigo-50' : ''}`}>
                <div className="text-xs font-bold text-slate-500 uppercase">{days[date.getDay()]}</div>
                <div className={`text-2xl font-black mt-1 ${isToday ? 'text-indigo-600' : 'text-slate-900'}`}>
                    {date.getDate()}
                </div>
            </div>
        );
    };

    const formatHour = (hour: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour} ${period}`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={previousWeek}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-black text-slate-900">
                        {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                        onClick={nextWeek}
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

            {/* Calendar Grid */}
            <div className="overflow-auto max-h-[600px]">
                <div className="grid grid-cols-8 min-w-[800px]">
                    {/* Time column header */}
                    <div className="border-r border-slate-200"></div>

                    {/* Day headers */}
                    {weekDays.map((date, i) => (
                        <div key={i}>
                            {formatDateHeader(date)}
                        </div>
                    ))}

                    {/* Time slots */}
                    {hours.map(hour => (
                        <div key={hour} className="contents">
                            {/* Hour label */}
                            <div className="border-r border-t border-slate-200 p-2 text-xs font-bold text-slate-500 text-right bg-slate-50">
                                {formatHour(hour)}
                            </div>

                            {/* Day cells */}
                            {weekDays.map((date, dayIndex) => {
                                const dayActivities = getActivitiesForDay(date, hour);
                                return (
                                    <div
                                        key={`${hour}-${dayIndex}`}
                                        className="border-l border-t border-slate-200 p-1 min-h-[80px] hover:bg-slate-50 cursor-pointer transition-colors relative group"
                                        onClick={() => onTimeSlotClick?.(date, hour)}
                                    >
                                        {dayActivities.map(activity => (
                                            <div
                                                key={activity.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onActivityClick?.(activity);
                                                }}
                                                className="mb-1 p-2 rounded bg-indigo-100 border-l-4 border-indigo-600 hover:bg-indigo-200 cursor-pointer"
                                            >
                                                <div className="text-xs font-bold text-indigo-900 truncate">
                                                    {activity.subject}
                                                </div>
                                                <div className="text-[10px] font-bold text-indigo-600">
                                                    {new Date(activity.startTime).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/5">
                                            <Plus size={16} className="text-slate-400" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

export default CalendarWeekView;
