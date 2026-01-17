import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Activity } from '../types/activity';
import { getActivityLightColor, getActivityTextColor, getActivityBorderColor } from '../utils/activityStyles';

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

    const getAllDayActivities = (date: Date): Activity[] => {
        return activities.filter(activity => {
            const activityDate = new Date(activity.startTime);
            return activity.isAllDay &&
                activityDate.getFullYear() === date.getFullYear() &&
                activityDate.getMonth() === date.getMonth() &&
                activityDate.getDate() === date.getDate();
        });
    };

    const getTimedActivitiesForDay = (date: Date, hour: number): Activity[] => {
        return activities.filter(activity => {
            const activityDate = new Date(activity.startTime);
            return !activity.isAllDay &&
                activityDate.getFullYear() === date.getFullYear() &&
                activityDate.getMonth() === date.getMonth() &&
                activityDate.getDate() === date.getDate() &&
                activityDate.getHours() === hour
        });
    };

    const formatDateHeader = (date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const isToday = date.toDateString() === new Date().toDateString();
        return (
            <div className={`text-center py-4 ${isToday ? 'bg-indigo-50/50' : ''}`}>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{days[date.getDay()]}</div>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={previousWeek} className="p-2 hover:bg-slate-200 rounded-lg transition-all text-slate-600">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-black text-slate-900 min-w-[180px] text-center">
                        {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={nextWeek} className="p-2 hover:bg-slate-200 rounded-lg transition-all text-slate-600">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <button onClick={goToToday} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Today
                </button>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="grid grid-cols-8 min-w-[900px]">
                    {/* Top Corner & Day Headers */}
                    <div className="border-r border-b border-slate-200 bg-slate-50/50"></div>
                    {weekDays.map((date, i) => (
                        <div key={i} className="border-b border-slate-200">
                            {formatDateHeader(date)}
                        </div>
                    ))}

                    {/* All Day Row */}
                    <div className="border-r border-b border-slate-200 p-2 bg-slate-50 flex items-center justify-end sticky left-0 z-20">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">All Day</span>
                    </div>
                    {weekDays.map((date, i) => {
                        const allDayActs = getAllDayActivities(date);
                        return (
                            <div key={i} className="border-b border-slate-200 bg-slate-50/30 p-1.5 min-h-[50px] space-y-1">
                                {allDayActs.map(act => (
                                    <div
                                        key={act.id}
                                        onClick={(e) => { e.stopPropagation(); onActivityClick?.(act); }}
                                        style={{
                                            backgroundColor: getActivityLightColor(act.type),
                                            color: getActivityTextColor(act.type),
                                            borderLeftColor: getActivityBorderColor(act.type)
                                        }}
                                        className="px-2 py-1 rounded text-[10px] font-bold truncate border-l-4 shadow-sm cursor-pointer hover:brightness-95 transition-all"
                                    >
                                        {act.subject}
                                    </div>
                                ))}
                            </div>
                        );
                    })}

                    {/* Hourly Slots */}
                    {hours.map(hour => (
                        <div key={hour} className="contents">
                            <div className="border-r border-b border-slate-100 p-2 text-[10px] font-black text-slate-400 text-right bg-slate-50 sticky left-0 z-20 w-20 h-[80px]">
                                {formatHour(hour)}
                            </div>
                            {weekDays.map((date, dayIndex) => {
                                const dayActivities = getTimedActivitiesForDay(date, hour);
                                return (
                                    <div
                                        key={`${hour}-${dayIndex}`}
                                        className="border-l border-b border-slate-100 p-1.5 hover:bg-slate-50/50 cursor-pointer transition-colors relative group"
                                        onClick={() => onTimeSlotClick?.(date, hour)}
                                    >
                                        {dayActivities.map(activity => (
                                            <div
                                                key={activity.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onActivityClick?.(activity);
                                                }}
                                                style={{
                                                    backgroundColor: getActivityLightColor(activity.type),
                                                    color: getActivityTextColor(activity.type),
                                                    borderLeftColor: getActivityBorderColor(activity.type)
                                                }}
                                                className="mb-1 p-2 rounded text-[10px] font-bold border-l-4 shadow-sm hover:brightness-95 transition-all"
                                            >
                                                <div className="truncate mb-0.5">{activity.subject}</div>
                                                <div className="opacity-60 text-[8px]">
                                                    {new Date(activity.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ))}
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

export default CalendarWeekView;
