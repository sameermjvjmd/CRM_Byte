import { useState } from 'react';
import { CheckSquare, Plus, Filter, Calendar, User, Tag } from 'lucide-react';
import CreateModal from '../components/CreateModal';

const TasksPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks] = useState([
        { id: 1, title: 'Follow up with John Doe', priority: 'High', dueDate: '2024-01-15', assignedTo: 'Sameer MJ', status: 'In Progress' },
        { id: 2, title: 'Prepare Q1 Report', priority: 'Medium', dueDate: '2024-01-20', assignedTo: 'Admin', status: 'Not Started' },
        { id: 3, title: 'Review contract with ByteSymphony', priority: 'High', dueDate: '2024-01-12', assignedTo: 'Sameer MJ', status: 'Completed' },
    ]);

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
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md"
                >
                    <Plus size={18} />
                    New Task
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Filter size={14} />
                    Filter
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Tag size={14} />
                    Priority
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-all flex items-center gap-2">
                    <User size={14} />
                    Assigned
                </button>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 gap-4">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                                    }`}>
                                    {task.status === 'Completed' && <CheckSquare size={14} className="text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-sm font-black uppercase tracking-tight ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900'
                                        }`}>
                                        {task.title}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-500">{task.dueDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-500">{task.assignedTo}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'bg-red-100 text-red-600' :
                                        task.priority === 'Medium' ? 'bg-orange-100 text-orange-600' :
                                            'bg-slate-100 text-slate-600'
                                    }`}>
                                    {task.priority}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                                            'bg-slate-100 text-slate-600'
                                    }`}>
                                    {task.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => setIsModalOpen(false)}
                initialType="Activity"
            />
        </div>
    );
};

export default TasksPage;
