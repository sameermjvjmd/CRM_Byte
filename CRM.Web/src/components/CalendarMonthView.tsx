import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Activity } from '../types/activity';
import { getActivityLightColor, getActivityTextColor, getActivityBorderColor } from '../utils/activityStyles';

interface CalendarMonthViewProps {
    activities: Activity[];
    onActivityClick?: (activity: Activity) => void;
    onTimeSlotClick?: (date: Date, hour: number) => void;
    currentDate?: Date;
}

const CalendarMonthView = ({
    activities,
    onActivityClick,
    onTimeSlotClick,
    currentDate = new Date()
}: CalendarMonthViewProps) => {
    // State for the currently displayed month
    const [displayedMonth, setDisplayedMonth] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

    function getMonthDays(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);

        // Start from the Sunday before the first day
        const startDate = new Date(firstDay);
        startDate.setDate(firstDay.getDate() - firstDay.getDay());

        const days = [];
        // Generate 42 days (6 weeks) to cover all possibilities (some months span 6 weeks)
        const current = new Date(startDate);
        for (let i = 0; i < 42; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return days;
    }

    const days = getMonthDays(displayedMonth);

    const previousMonth = () => {
        setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const now = new Date();
        setDisplayedMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    };

    const getActivitiesForDay = (date: Date): Activity[] => {
        return activities.filter(activity => {
            const activityDate = new Date(activity.startTime);
            return (
                activityDate.getFullYear() === date.getFullYear() &&
                activityDate.getMonth() === date.getMonth() &&
                activityDate.getDate() === date.getDate()
            );
        }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === displayedMonth.getMonth();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={previousMonth} className="p-2 hover:bg-slate-200 rounded-lg transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-black text-slate-900 min-w-[200px] text-center">
                        {displayedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-200 rounded-lg transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <button onClick={goToToday} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all">
                    Today
                </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 shrink-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr">
                {days.map((date, i) => {
                    const dayActivities = getActivitiesForDay(date);
                    const currentMonth = isCurrentMonth(date);
                    const today = isToday(date);

                    return (
                        <div
                            key={i}
                            className={`border-r border-b border-slate-200 p-2 min-h-[0px] relative transition-colors cursor-pointer group
                                ${currentMonth ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 text-slate-400 hover:bg-slate-100'}
                                ${today ? 'bg-indigo-50/30' : ''}
                            `}
                            onClick={() => onTimeSlotClick?.(date, 9)} // Default to 9 AM
                        >
                            <div className="flex justify-between items-start mb-1 h-7">
                                <span className={`text-sm font-bold h-7 w-7 flex items-center justify-center rounded-full
                                    ${today ? 'bg-indigo-600 text-white shadow-sm' : ''}
                                    ${!currentMonth ? 'text-slate-400' : 'text-slate-700'}
                                `}>
                                    {date.getDate()}
                                </span>
                            </div>

                            <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                {dayActivities.slice(0, 4).map(activity => (
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
                                        className="px-1.5 py-0.5 rounded text-[10px] font-bold truncate border-l-2 mb-0.5 cursor-pointer shadow-sm hover:brightness-95 transition-all"
                                        title={`${activity.subject} (${new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                                    >
                                        <span className="mr-1 opacity-60 text-[8px]">
                                            {activity.isAllDay ? 'ALL' : new Date(activity.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(':00', '').replace(' ', '')}
                                        </span>
                                        {activity.subject}
                                    </div>
                                ))}
                                {dayActivities.length > 4 && (
                                    <div className="text-[10px] text-slate-500 font-bold pl-1">
                                        +{dayActivities.length - 4} more
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

export default CalendarMonthView;
