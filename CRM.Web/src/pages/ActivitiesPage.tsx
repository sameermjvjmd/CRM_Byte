import { useState, useEffect } from 'react';
import api from '../api/api';
import type { Activity } from '../types/activity';
import { Plus, Filter, List, Calendar as CalendarIcon, Repeat, FileText, Grid } from 'lucide-react';
import CreateModal from '../components/CreateModal';
import CalendarWeekView from '../components/CalendarWeekView';
import CalendarDayView from '../components/CalendarDayView';
import CalendarMonthView from '../components/CalendarMonthView';
import ActivityTypeSelector from '../components/ActivityTypeSelector';
import RecurringActivityModal from '../components/RecurringActivityModal';
import ActivityTemplateSelector from '../components/ActivityTemplateSelector';
import EnhancedActivitiesTable from '../components/EnhancedActivitiesTable';
import ActivityDetailModal from '../components/ActivityDetailModal';
import type { RecurringPattern } from '../components/RecurringActivityModal';
import type { ActivityTemplate } from '../components/ActivityTemplateSelector';

const ActivitiesPage = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'week' | 'day' | 'month'>('week');
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [selectedType, setSelectedType] = useState('Call');
    const [recurringPattern, setRecurringPattern] = useState<RecurringPattern | null>(null);
    const [templateData, setTemplateData] = useState<any>(null);
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await api.get('/activities');
            setActivities(response.data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivityClick = (activity: Activity) => {
        setSelectedActivityId(activity.id);
        setIsDetailModalOpen(true);
    };

    const handleTimeSlotClick = (date: Date, hour: number) => {
        console.log('Time slot clicked:', date, hour);
        setTemplateData(null); // Clear template data
        setIsModalOpen(true);
    };

    const handleSaveRecurrence = (pattern: RecurringPattern) => {
        setRecurringPattern(pattern);
        console.log('Recurrence pattern saved:', pattern);
        // TODO: Send to backend
    };

    const handleSelectTemplate = (template: ActivityTemplate) => {
        console.log('Template selected:', template);
        // Pre-fill form data from template
        setTemplateData({
            subject: template.name,
            activityType: template.type,
            duration: template.duration,
            description: template.description
        });
        setShowTemplates(false);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Activities & Schedule</h1>
                    <p className="text-xs text-slate-500">Manage your calendar, tasks, and recurring activities</p>
                </div>
                <div className="flex gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <List size={14} />
                            LIST
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <CalendarIcon size={14} />
                            WEEK
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <CalendarIcon size={14} />
                            DAY
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <CalendarIcon size={14} />
                            MONTH
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <FileText size={18} />
                        Templates
                    </button>
                    <button
                        onClick={() => setIsRecurringModalOpen(true)}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <Repeat size={18} />
                        Recurring
                    </button>
                    <button
                        onClick={() => setShowTypeSelector(!showTypeSelector)}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <Grid size={18} />
                        Type
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        <Plus size={18} />
                        New Activity
                    </button>
                </div>
            </div>

            {/* Templates Panel */}
            {showTemplates && (
                <div className="p-6 bg-white border-b border-slate-200">
                    <ActivityTemplateSelector onSelectTemplate={handleSelectTemplate} />
                </div>
            )}

            {/* Type Selector Panel */}
            {showTypeSelector && (
                <div className="p-6 bg-white border-b border-slate-200">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-wide">
                            Activity Type
                        </h3>
                        <ActivityTypeSelector
                            selectedType={selectedType}
                            onTypeChange={setSelectedType}
                            layout="grid"
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-hidden p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-sm font-bold text-slate-500">Loading activities...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' && (
                            <EnhancedActivitiesTable
                                activities={activities}
                                onActivityClick={handleActivityClick}
                                onEdit={(activity) => {
                                    console.log('Edit:', activity);
                                    setIsModalOpen(true);
                                }}
                                onDelete={(id) => {
                                    console.log('Delete:', id);
                                    // TODO: Implement delete
                                }}
                            />
                        )}

                        {viewMode === 'week' && (
                            <CalendarWeekView
                                activities={activities}
                                onActivityClick={handleActivityClick}
                                onTimeSlotClick={handleTimeSlotClick}
                            />
                        )}

                        {viewMode === 'day' && (
                            <CalendarDayView
                                activities={activities}
                                onActivityClick={handleActivityClick}
                                onTimeSlotClick={(hour) => handleTimeSlotClick(new Date(), hour)}
                            />
                        )}

                        {viewMode === 'month' && (
                            <CalendarMonthView
                                activities={activities}
                                onActivityClick={handleActivityClick}
                                onTimeSlotClick={(date, hour) => handleTimeSlotClick(date, hour)}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Recurring Activity Modal */}
            <RecurringActivityModal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                onSave={handleSaveRecurrence}
                initialPattern={recurringPattern || undefined}
            />

            {/* Create Activity Modal */}
            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchActivities();
                }}
                initialType="Activity"
                templateData={templateData}
            />

            {/* Activity Detail Modal */}
            <ActivityDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                activityId={selectedActivityId}
                onUpdate={fetchActivities}
                onComplete={(followUpData) => {
                    setTemplateData(followUpData);
                    setIsModalOpen(true);
                }}
            />
        </div>
    );
};

export default ActivitiesPage;
