import { useState } from 'react';
import { Calendar, Repeat, FileText, Grid, List } from 'lucide-react';
import ActivityTypeSelector from '../components/ActivityTypeSelector';
import RecurringActivityModal from '../components/RecurringActivityModal';
import CalendarWeekView from '../components/CalendarWeekView';
import CalendarDayView from '../components/CalendarDayView';
import ActivityTemplateSelector from '../components/ActivityTemplateSelector';
import type { RecurringPattern } from '../components/RecurringActivityModal';
import type { ActivityTemplate } from '../components/ActivityTemplateSelector';
import type { Activity } from '../types/activity';

const ActivityDemoPage = () => {
    const [activeTab, setActiveTab] = useState<'type' | 'recurring' | 'calendar' | 'templates'>('recurring');
    const [activityType, setActivityType] = useState('Call');
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [recurringPattern, setRecurringPattern] = useState<RecurringPattern | null>(null);
    const [calendarView, setCalendarView] = useState<'week' | 'day'>('week');

    // Sample activities for calendar
    const sampleActivities: Activity[] = [
        {
            id: 1,
            subject: 'Client Meeting with John',
            activityType: 'Meeting',
            startTime: new Date(new Date().setHours(10, 0, 0)).toISOString(),
            endTime: new Date(new Date().setHours(11, 0, 0)).toISOString(),
            duration: 60,
            priority: 'High',
            isCompleted: false,
            location: 'Conference Room A'
        },
        {
            id: 2,
            subject: 'Follow-up Call',
            activityType: 'Call',
            startTime: new Date(new Date().setHours(14, 30, 0)).toISOString(),
            endTime: new Date(new Date().setHours(15, 0, 0)).toISOString(),
            duration: 30,
            priority: 'Medium',
            isCompleted: false
        },
        {
            id: 3,
            subject: 'Send Proposal',
            activityType: 'To-Do',
            startTime: new Date(new Date().setHours(16, 0, 0)).toISOString(),
            duration: 30,
            priority: 'High',
            isCompleted: false
        }
    ];

    const handleSaveRecurrence = (pattern: RecurringPattern) => {
        setRecurringPattern(pattern);
        console.log('Recurrence Pattern Saved:', pattern);
    };

    const handleSelectTemplate = (template: ActivityTemplate) => {
        console.log('Template Selected:', template);
        alert(`Selected Template: ${template.name}\nType: ${template.type}\nDuration: ${template.duration} min`);
    };

    const handleActivityClick = (activity: Activity) => {
        console.log('Activity Clicked:', activity);
        alert(`Activity: ${activity.subject}\nType: ${activity.activityType}`);
    };

    const handleTimeSlotClick = (date: Date, hour: number) => {
        console.log('Time Slot Clicked:', date, hour);
        alert(`Create new activity at ${date.toLocaleDateString()} ${hour}:00`);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Activity Features Demo</h1>
                    <p className="text-lg font-bold text-slate-600">Test all Week 3-4 components</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('recurring')}
                            className={`flex-1 px-6 py-4 font-bold text-sm transition-all ${activeTab === 'recurring'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Repeat size={18} className="inline mr-2" />
                            Recurring Activities
                        </button>
                        <button
                            onClick={() => setActiveTab('type')}
                            className={`flex-1 px-6 py-4 font-bold text-sm transition-all ${activeTab === 'type'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Grid size={18} className="inline mr-2" />
                            Activity Types
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`flex-1 px-6 py-4 font-bold text-sm transition-all ${activeTab === 'calendar'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Calendar size={18} className="inline mr-2" />
                            Calendar Views
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`flex-1 px-6 py-4 font-bold text-sm transition-all ${activeTab === 'templates'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <FileText size={18} className="inline mr-2" />
                            Templates
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Recurring Activities Tab */}
                        {activeTab === 'recurring' && (
                            <div className="space-y-6">
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                                    <h3 className="text-lg font-black text-indigo-900 mb-2">Recurring Activity Builder</h3>
                                    <p className="text-sm font-bold text-indigo-700 mb-4">
                                        Create activities that repeat on a schedule (Daily, Weekly, Monthly, Yearly)
                                    </p>
                                    <button
                                        onClick={() => setIsRecurringModalOpen(true)}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                    >
                                        <Repeat size={18} className="inline mr-2" />
                                        Open Recurring Builder
                                    </button>
                                </div>

                                {recurringPattern && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                        <h4 className="text-sm font-black text-green-900 mb-3">✅ Current Recurrence Pattern:</h4>
                                        <div className="space-y-2 text-sm font-bold text-green-800">
                                            <p><strong>Frequency:</strong> Every {recurringPattern.interval} {recurringPattern.frequency}</p>
                                            {recurringPattern.daysOfWeek && recurringPattern.daysOfWeek.length > 0 && (
                                                <p><strong>Days:</strong> {recurringPattern.daysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</p>
                                            )}
                                            {recurringPattern.dayOfMonth && (
                                                <p><strong>Day of Month:</strong> {recurringPattern.dayOfMonth}</p>
                                            )}
                                            {recurringPattern.endDate && (
                                                <p><strong>Ends:</strong> {recurringPattern.endDate}</p>
                                            )}
                                            {recurringPattern.occurrences && (
                                                <p><strong>Occurrences:</strong> {recurringPattern.occurrences}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Activity Types Tab */}
                        {activeTab === 'type' && (
                            <div className="space-y-6">
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                                    <h3 className="text-lg font-black text-purple-900 mb-2">Activity Type Selector</h3>
                                    <p className="text-sm font-bold text-purple-700">
                                        Select from 9 activity types with color-coded icons
                                    </p>
                                </div>

                                <ActivityTypeSelector
                                    selectedType={activityType}
                                    onTypeChange={setActivityType}
                                    layout="grid"
                                />

                                <div className="bg-slate-100 rounded-lg p-4">
                                    <p className="text-sm font-bold text-slate-700">
                                        <strong>Selected Type:</strong> {activityType}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Calendar Views Tab */}
                        {activeTab === 'calendar' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex-1 mr-4">
                                        <h3 className="text-lg font-black text-orange-900 mb-2">Calendar Views</h3>
                                        <p className="text-sm font-bold text-orange-700">
                                            Week view (7 days) or Day view (24 hours)
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCalendarView('week')}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${calendarView === 'week'
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                }`}
                                        >
                                            Week View
                                        </button>
                                        <button
                                            onClick={() => setCalendarView('day')}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${calendarView === 'day'
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                }`}
                                        >
                                            Day View
                                        </button>
                                    </div>
                                </div>

                                {calendarView === 'week' ? (
                                    <CalendarWeekView
                                        activities={sampleActivities}
                                        onActivityClick={handleActivityClick}
                                        onTimeSlotClick={handleTimeSlotClick}
                                    />
                                ) : (
                                    <CalendarDayView
                                        activities={sampleActivities}
                                        onActivityClick={handleActivityClick}
                                        onTimeSlotClick={(hour) => handleTimeSlotClick(new Date(), hour)}
                                    />
                                )}
                            </div>
                        )}

                        {/* Templates Tab */}
                        {activeTab === 'templates' && (
                            <div className="space-y-6">
                                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
                                    <h3 className="text-lg font-black text-cyan-900 mb-2">Activity Templates</h3>
                                    <p className="text-sm font-bold text-cyan-700">
                                        Quick start with 6 pre-configured activity templates
                                    </p>
                                </div>

                                <ActivityTemplateSelector onSelectTemplate={handleSelectTemplate} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recurring Activity Modal */}
            <RecurringActivityModal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                onSave={handleSaveRecurrence}
                initialPattern={recurringPattern || undefined}
            />
        </div>
    );
};

export default ActivityDemoPage;
