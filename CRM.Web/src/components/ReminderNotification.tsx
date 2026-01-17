import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell, Check, Clock } from 'lucide-react';
import api from '../api/api';
import type { Activity } from '../types/activity';

const ReminderNotification = () => {
    useEffect(() => {
        const checkReminders = async () => {
            try {
                const response = await api.get<Activity[]>('/activities/reminders');
                const reminders = response.data;

                if (reminders.length > 0) {
                    reminders.forEach(activity => {
                        showReminderToast(activity);
                        // Mark as sent immediately to prevent duplicate toasts
                        // In a real app, you might wait for user acknowledgement
                        api.put(`/activities/${activity.id}/reminder-sent`);
                    });
                }
            } catch (error) {
                console.error('Error checking reminders:', error);
            }
        };

        // Check every minute
        const intervalId = setInterval(checkReminders, 60000);

        // Initial check
        checkReminders();

        return () => clearInterval(intervalId);
    }, []);

    const showReminderToast = (activity: Activity) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Bell className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Upcoming: {activity.subject}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {activity.type}
                            </p>
                            {activity.location && (
                                <p className="mt-1 text-xs text-gray-400">
                                    📍 {activity.location}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        ), {
            duration: 10000, // Show for 10 seconds
            position: 'top-right'
        });
    };

    return null; // This component doesn't render anything itself
};

export default ReminderNotification;
