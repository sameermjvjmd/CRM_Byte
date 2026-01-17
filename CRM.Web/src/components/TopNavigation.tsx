import { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, HelpCircle, LogOut, User, Settings, Shield, Building, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchApi, type SearchResult } from '../api/searchApi';
import { Filter } from 'lucide-react';
import AdvancedSearchModal from './modals/AdvancedSearch/AdvancedSearchModal';

const TopNavigation = () => {
    const navigate = useNavigate();
    const { user, logout, hasRole } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Search State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Advanced Search State
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

    const handleAdvancedSearchResults = (entityType: string, results: any[]) => {
        // Navigate to the list page with the results in state
        const route = entityType === 'Contacts' ? '/contacts' :
            entityType === 'Companies' ? '/companies' :
                '/opportunities';

        navigate(route, { state: { lookupResults: results, lookupActive: true } });
        setIsAdvancedSearchOpen(false);
    };

    const handleSignOut = async () => {
        await logout();
        navigate('/login');
    };

    // Click outside to close search results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const data = await searchApi.globalSearch(query);
                    setResults(data);
                    setShowResults(true);
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleResultClick = (url: string) => {
        navigate(url);
        setShowResults(false);
        setQuery('');
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

    const getIcon = (type: string) => {
        switch (type) {
            case 'Contact': return <User size={16} className="text-blue-500" />;
            case 'Company': return <Building size={16} className="text-indigo-500" />;
            case 'Opportunity': return <TrendingUp size={16} className="text-emerald-500" />;
            default: return <Search size={16} className="text-slate-400" />;
        }
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
                <div className="relative group" ref={searchRef}>
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} size={16} />
                    <input
                        type="text"
                        placeholder="Search contacts, companies, opportunities..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => { if (query.length >= 2) setShowResults(true); }}
                        className="bg-[#2A4A6F] text-white placeholder:text-slate-400 pl-10 pr-4 py-2 rounded-lg text-xs font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-400 w-96 transition-all"
                    />

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                            {results.length > 0 ? (
                                <div className="py-2">
                                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Top Matches
                                    </div>
                                    {results.map((result) => (
                                        <div
                                            key={`${result.type}-${result.id}`}
                                            onClick={() => handleResultClick(result.url)}
                                            className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                                        >
                                            <div className="p-2 bg-slate-100 rounded-lg">
                                                {getIcon(result.type)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">{result.title}</div>
                                                <div className="text-xs text-slate-500">{result.subtitle}</div>
                                            </div>
                                            <span className="ml-auto text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                                                {result.type}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="px-4 py-2 bg-slate-50 text-center">
                                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                                            View All Results
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <p className="text-sm font-medium">No results found for "{query}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Advanced Search Button */}
                <button
                    onClick={() => setIsAdvancedSearchOpen(true)}
                    className="p-2 hover:bg-[#2A4A6F] rounded-lg transition-all text-indigo-300 hover:text-white"
                    title="Advanced Search / Lookup"
                >
                    <Filter size={18} />
                </button>

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

            <AdvancedSearchModal
                isOpen={isAdvancedSearchOpen}
                onClose={() => setIsAdvancedSearchOpen(false)}
                onResults={handleAdvancedSearchResults}
            />
        </div>
    );
};

export default TopNavigation;
