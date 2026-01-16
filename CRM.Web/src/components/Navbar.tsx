import { useState } from 'react';
import { Search, Plus, Bell, User } from 'lucide-react';
import CreateModal from './CreateModal';

const Navbar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                <div className="flex items-center flex-1 max-w-xl">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search contacts, companies, opportunities..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Create New
                    </button>

                    <div className="h-6 w-[1px] bg-slate-200" />

                    <button className="text-slate-500 hover:text-indigo-600 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <User size={18} />
                        </div>
                        <span className="text-sm font-medium text-slate-700 hidden sm:block">Sameer MJ</span>
                    </div>
                </div>
            </div>

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    // Possible: trigger global refresh or just notify
                    window.location.reload(); // Quick way to refresh current view
                }}
            />
        </>
    );
};

export default Navbar;
