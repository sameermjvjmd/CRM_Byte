import { useState } from 'react';
import { Search, Bell, ChevronDown, HelpCircle, LogOut, User, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopNavigation = () => {
    const navigate = useNavigate();
    const { user, logout, hasRole } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleSignOut = async () => {
        await logout();
        navigate('/login');
    };

    // Get user initials
    const getInitials = () => {
        if (!user?.fullName) return 'U';
        const names = user.fullName.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0].substring(0, 2).toUpperCase();
    };

    // Get display role
    const getDisplayRole = () => {
        if (hasRole('Admin')) return 'Administrator';
        if (hasRole('Manager')) return 'Manager';
        return 'User';
    };

    return (
        <div className="bg-[#1E3A5F] text-white px-6 py-3 flex items-center justify-between shadow-lg z-50">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="bg-[#6366F1] p-2 rounded-lg shadow-md">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                    </svg>
                </div>
                <span className="font-black text-lg tracking-tight">NEXUS</span>
                <span className="text-xs font-bold text-indigo-300 ml-1">CRM</span>
            </div>

            {/* Search & Utilities */}
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search contacts, companies, opportunities..."
                        className="bg-[#2A4A6F] text-white placeholder:text-slate-400 pl-10 pr-4 py-2 rounded-lg text-xs font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-400 w-96 transition-all"
                    />
                </div>

                {/* Help */}
                <button className="p-2 hover:bg-[#2A4A6F] rounded-lg transition-all" title="Help & Support">
                    <HelpCircle size={18} />
                </button>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-[#2A4A6F] rounded-lg transition-all" title="Notifications">
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                    <div
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-[#2A4A6F] rounded-lg cursor-pointer transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black">
                            {getInitials()}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-bold uppercase tracking-wide">{user?.fullName || 'User'}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">{getDisplayRole()}</span>
                        </div>
                        <ChevronDown size={14} className={`group-hover:rotate-180 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <>
                            {/* Backdrop to close menu */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowUserMenu(false)}
                            ></div>

                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                                {/* User Info */}
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-black text-white">
                                            {getInitials()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-900">{user?.fullName || 'User'}</div>
                                            <div className="text-xs text-slate-500">{user?.email || ''}</div>
                                        </div>
                                    </div>
                                    {/* Roles badges */}
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {user?.roles.map((role) => (
                                            <span
                                                key={role}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
                                            >
                                                <Shield size={10} />
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            navigate('/users');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-3"
                                    >
                                        <User size={16} />
                                        My Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/tools');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-3"
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                </div>

                                {/* Sign Out */}
                                <div className="border-t border-slate-100 pt-2">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 transition-all flex items-center gap-3"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopNavigation;
