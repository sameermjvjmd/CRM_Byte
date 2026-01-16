import { useState } from 'react';
import { Mail, Clock, StickyNote, CheckSquare, Users, Phone, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateModal from './CreateModal';

const ActionToolbar = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'Activity' | 'Note' | 'Contact' | 'Company' | 'Opportunity' | 'Group'>('Activity');
    const [showCreateMenu, setShowCreateMenu] = useState(false);

    const handleQuickAction = (type: 'Activity' | 'Note') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCreateNew = (type: 'Contact' | 'Company' | 'Opportunity' | 'Group') => {
        setModalType(type);
        setIsModalOpen(true);
        setShowCreateMenu(false);
    };

    return (
        <>
            <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between shadow-sm z-40 relative">
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        <ActionButton
                            icon={<Mail size={16} />}
                            label="E-mail"
                            onClick={() => navigate('/write')}
                        />
                        <ActionButton
                            icon={<Clock size={16} />}
                            label="History"
                            onClick={() => navigate('/history')}
                        />
                        <ActionButton
                            icon={<StickyNote size={16} />}
                            label="Note"
                            onClick={() => handleQuickAction('Note')}
                        />
                        <div className="w-[1px] h-6 bg-slate-200 mx-2" />
                        <ActionButton
                            icon={<CheckSquare size={16} />}
                            label="To-Do"
                            onClick={() => handleQuickAction('Activity')}
                        />
                        <ActionButton
                            icon={<Users size={16} />}
                            label="Meeting"
                            onClick={() => handleQuickAction('Activity')}
                        />
                        <ActionButton
                            icon={<Phone size={16} />}
                            label="Call"
                            onClick={() => handleQuickAction('Activity')}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-widest">
                        Quick Actions
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowCreateMenu(!showCreateMenu)}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-[13px] font-bold rounded shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Create new
                            <ChevronDown size={14} className={`ml-1 opacity-70 transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showCreateMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                                <button
                                    onClick={() => handleCreateNew('Contact')}
                                    className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                >
                                    Contact
                                </button>
                                <button
                                    onClick={() => handleCreateNew('Company')}
                                    className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                >
                                    Company
                                </button>
                                <button
                                    onClick={() => handleCreateNew('Group')}
                                    className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                >
                                    Group
                                </button>
                                <button
                                    onClick={() => handleCreateNew('Opportunity')}
                                    className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                >
                                    Opportunity
                                </button>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button
                                    onClick={() => { handleQuickAction('Activity'); setShowCreateMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                >
                                    Activity
                                </button>
                                <button
                                    onClick={() => { handleQuickAction('Note'); setShowCreateMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                >
                                    Note
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    // Optionally refresh the current page data
                }}
                initialType={modalType}
            />
        </>
    );
};

const ActionButton = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 text-[#475569] hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all group"
    >
        <div className="group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
    </button>
);

export default ActionToolbar;
