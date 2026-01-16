import { Plus, UserPlus, Building2, Briefcase, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import CreateModal from '../CreateModal';

const QuickActionsWidget = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialType, setInitialType] = useState<'Contact' | 'Company' | 'Opportunity' | 'Activity'>('Contact');

    const openModal = (type: 'Contact' | 'Company' | 'Opportunity' | 'Activity') => {
        setInitialType(type);
        setIsModalOpen(true);
    };

    const quickActions = [
        {
            label: 'New Contact',
            icon: UserPlus,
            color: 'from-blue-500 to-blue-600',
            type: 'Contact' as const,
            description: 'Add a contact'
        },
        {
            label: 'New Company',
            icon: Building2,
            color: 'from-purple-500 to-purple-600',
            type: 'Company' as const,
            description: 'Add a company'
        },
        {
            label: 'New Opportunity',
            icon: Briefcase,
            color: 'from-green-500 to-green-600',
            type: 'Opportunity' as const,
            description: 'Create an opportunity'
        },
        {
            label: 'New Activity',
            icon: CalendarIcon,
            color: 'from-orange-500 to-orange-600',
            type: 'Activity' as const,
            description: 'Schedule an activity'
        }
    ];

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Create new records instantly</p>
                        </div>
                        <Plus className="text-indigo-500" size={20} />
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                            <button
                                key={action.type}
                                onClick={() => openModal(action.type)}
                                className={`bg-gradient-to-br ${action.color} p-4 rounded-xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all group`}
                            >
                                <action.icon size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <p className="text-sm font-bold">{action.label}</p>
                                    <p className="text-xs opacity-80 mt-0.5">{action.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => setIsModalOpen(false)}
                initialType={initialType}
            />
        </>
    );
};

export default QuickActionsWidget;
