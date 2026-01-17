import { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, MapPin, Clock } from 'lucide-react';
import type { Activity } from '../types/activity';
import { getActivityLightColor, getActivityTextColor, getActivityBorderColor } from '../utils/activityStyles';

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

    const getAllDayActivities = (): Activity[] => {
        return activities.filter(activity => {
            const activityDate = new Date(activity.startTime);
            return activity.isAllDay &&
                activityDate.getFullYear() === selectedDate.getFullYear() &&
                activityDate.getMonth() === selectedDate.getMonth() &&
                activityDate.getDate() === selectedDate.getDate();
        });
    };

    const getTimedActivitiesForHour = (hour: number): Activity[] => {
        return activities.filter(activity => {
            const activityDate = new Date(activity.startTime);
            return !activity.isAllDay &&
                activityDate.getFullYear() === selectedDate.getFullYear() &&
                activityDate.getMonth() === selectedDate.getMonth() &&
                activityDate.getDate() === selectedDate.getDate() &&
                activityDate.getHours() === hour;
        });
    };

    const formatHour = (hour: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    };

    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const allDayActivities = getAllDayActivities();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                <div className="flex items-center gap-6">
                    <button onClick={previousDay} className="p-2.5 hover:bg-slate-200 rounded-xl transition-all text-slate-600">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                        </h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={nextDay} className="p-2.5 hover:bg-slate-200 rounded-xl transition-all text-slate-600">
                        <ChevronRight size={24} />
                    </button>
                </div>
                <button onClick={goToToday} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Today
                </button>
            </div>

            {/* All Day Section */}
            {allDayActivities.length > 0 && (
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">All Day Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allDayActivities.map(activity => (
                            <div
                                key={activity.id}
                                onClick={() => onActivityClick?.(activity)}
                                style={{
                                    backgroundColor: getActivityLightColor(activity.type),
                                    color: getActivityTextColor(activity.type),
                                    borderLeftColor: getActivityBorderColor(activity.type)
                                }}
                                className="p-3 rounded-xl border-l-4 shadow-sm cursor-pointer hover:brightness-95 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
                                        <Bell size={16} />
                                    </div>
                                    <span className="font-bold text-sm">{activity.subject}</span>
                                </div>
                                <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">{activity.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Time Slots */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                {hours.map(hour => {
                    const hourActivities = getTimedActivitiesForHour(hour);
                    const isCurrentHour = isToday && hour === new Date().getHours();

                    return (
                        <div key={hour} className={`flex border-b border-slate-100 min-h-[100px] ${isCurrentHour ? 'bg-indigo-50/30' : ''}`}>
                            {/* Hour Column */}
                            <div className="w-24 p-4 text-xs font-black text-slate-400 text-right bg-slate-50/50 border-r border-slate-100 sticky left-0 z-10 shrink-0">
                                {formatHour(hour)}
                            </div>

                            {/* Activities Area */}
                            <div
                                className="flex-1 p-3 cursor-pointer group hover:bg-slate-50/30 transition-all relative"
                                onClick={() => onTimeSlotClick?.(hour, 0)}
                            >
                                <div className="grid grid-cols-1 gap-3">
                                    {hourActivities.map(activity => (
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
                                            className="p-4 rounded-2xl border-l-4 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group/card"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-black text-base leading-tight mb-1">{activity.subject}</h3>
                                                    <div className="flex items-center gap-3 text-xs opacity-70 font-bold">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {new Date(activity.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                            {activity.durationMinutes && ` (${activity.durationMinutes} min)`}
                                                        </span>
                                                        {activity.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={12} />
                                                                {activity.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="px-2.5 py-1 bg-white/50 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                                    {activity.type}
                                                </div>
                                            </div>
                                            {activity.notes && (
                                                <p className="text-xs line-clamp-2 opacity-60 font-medium mt-2 leading-relaxed italic">
                                                    {activity.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarDayView;
