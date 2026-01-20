import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Plus, Filter, Calendar, User, Tag, Trash2, Loader2, Square } from 'lucide-react';
import CreateModal from '../components/CreateModal';
import api from '../api/api';
import { toast } from 'react-hot-toast';

interface Task {
    id: number;
    subject: string;
    priority: string;
    startTime: string;
    contact?: {
        firstName: string;
        lastName: string;
    };
    isCompleted: boolean;
    type: string;
}

const TasksPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            // We fetch all "To-Do" type activities
            const res = await api.get('/activities?type=To-Do');
            setTasks(res.data);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleToggleComplete = async (task: Task) => {
        try {
            if (!task.isCompleted) {
                // If marking as complete, we use the specialized endpoint
                await api.put(`/activities/${task.id}/complete`, {
                    result: 'Completed',
                    outcome: 'Marked complete from task list'
                });
            } else {
                // If unmarking (re-opening), we use the general PUT
                await api.put(`/activities/${task.id}`, {
                    ...task,
                    isCompleted: false,
                    completedAt: null
                });
            }
            toast.success(task.isCompleted ? 'Task re-opened' : 'Task completed');
            fetchTasks(); // Refresh list
        } catch (error) {
            console.error('Failed to update task', error);
            toast.error('Failed to update task status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/activities/${id}`);
            toast.success('Task deleted');
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) {
            console.error('Failed to delete task', error);
            toast.error('Failed to delete task');
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Task List</h1>
                    <p className="text-sm text-slate-500 font-bold mt-1">Manage your tasks and to-dos</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    New Task
                </button>
            </div>

            {/* Filters (UI Only for now) */}
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-all flex items-center gap-2 text-slate-600">
                    <Filter size={14} />
                    All Tasks
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-all flex items-center gap-2 text-slate-600">
                    <Tag size={14} />
                    High Priority
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-all flex items-center gap-2 text-slate-600">
                    <User size={14} />
                    My Tasks
                </button>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 gap-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                        <Loader2 size={32} className="text-indigo-600 animate-spin mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <CheckSquare size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-bold">No tasks found</h3>
                        <p className="text-slate-500 text-xs mt-1">You're all caught up! Create a new task to get started.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 text-indigo-600 font-bold text-xs uppercase hover:underline"
                        >
                            + Create First Task
                        </button>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`bg-white rounded-xl border transition-all hover:shadow-md ${task.isCompleted ? 'border-slate-100 opacity-75' : 'border-slate-200'
                                }`}
                        >
                            <div className="p-4 flex items-center gap-4">
                                <button
                                    onClick={() => handleToggleComplete(task)}
                                    className={`shrink-0 w-6 h-6 rounded flex items-center justify-center transition-all ${task.isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : 'border-2 border-slate-200 hover:border-indigo-500 text-transparent'
                                        }`}
                                >
                                    {task.isCompleted ? <CheckSquare size={16} /> : <Square size={16} />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-sm font-bold truncate ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                                            }`}>
                                            {task.subject}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shrink-0 ${task.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            task.priority === 'Normal' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                'bg-slate-50 text-slate-500 border border-slate-100'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-bold">
                                                {new Date(task.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        {task.contact && (
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <User size={12} />
                                                <span className="text-[10px] font-bold">
                                                    {task.contact.firstName} {task.contact.lastName}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchTasks();
                }}
                title="Create New To-Do"
                initialType="Activity"
                hideTabs={true}
                templateData={{ activityType: 'To-Do' }}
            />
        </div>
    );
};

export default TasksPage;
