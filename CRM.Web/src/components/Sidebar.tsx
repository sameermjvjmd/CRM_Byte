import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home, Users, Building2, UsersRound, Briefcase, CheckSquare, History,
    BarChart3, Megaphone, Lightbulb, TrendingUp, Calendar, Search, Mail,
    Settings, Table, MessageSquare, Calculator, FileText, Cloud, Package, Zap, Layout, BookOpen
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const workspaceItems = [
        { path: '/', icon: Home, label: 'Home' },
    ];

    const entityItems = [
        { path: '/contacts', icon: Users, label: 'Contacts' },
        { path: '/companies', icon: Building2, label: 'Companies' },
        { path: '/groups', icon: UsersRound, label: 'Groups' },
        { path: '/opportunities', icon: Briefcase, label: 'Opportunities' },
        { path: '/opportunities/analytics', icon: BarChart3, label: 'Pipeline Analytics' },
        { path: '/opportunities/forecast', icon: TrendingUp, label: 'Sales Forecast' },
        { path: '/products', icon: Package, label: 'Products' },
        { path: '/quotes', icon: FileText, label: 'Quotes' },
        { path: '/workflows', icon: Zap, label: 'Workflows' },
    ];

    const activityItems = [
        { path: '/schedule', icon: Calendar, label: 'Schedule' },
        { path: '/tasks', icon: CheckSquare, label: 'Task List' },
        { path: '/history', icon: History, label: 'History' },
    ];

    const toolItems = [
        { path: '/lookup', icon: Search, label: 'Lookup' },
        { path: '/write', icon: Mail, label: 'Write' },
        { path: '/sms', icon: MessageSquare, label: 'SMS' },
    ];

    const insightItems = [
        { path: '/reports', icon: BarChart3, label: 'Reports' },
        { path: '/marketing', icon: Megaphone, label: 'Marketing' },
        { path: '/templates', icon: FileText, label: 'Templates' },
        { path: '/signatures', icon: FileText, label: 'Signatures' },
        { path: '/sent-emails', icon: Mail, label: 'Sent Emails' },
        { path: '/insight', icon: Lightbulb, label: 'Insight' },
    ];

    const adminItems = [
        { path: '/tools', icon: Settings, label: 'Tools' },
        { path: '/custom-tables', icon: Table, label: 'Custom Tables' },
        { path: '/admin/custom-fields', icon: Layout, label: 'Custom Fields' },
        { path: '/admin/quote-templates', icon: FileText, label: 'Quote Templates' },
        { path: '/accounting', icon: Calculator, label: 'Accounting' },
    ];

    const helpItems = [
        { path: '/user-guide', icon: BookOpen, label: 'User Guide' },
    ];

    return (
        <div className="w-64 bg-[#2C3E50] text-white h-screen flex flex-col shadow-2xl overflow-y-auto custom-scrollbar">
            {/* Workspace Section */}
            <div className="p-4 border-b border-[#34495E]">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                    Workspace
                </div>
                <div className="space-y-1">
                    {workspaceItems.map((item) => (
                        <MenuItem key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => navigate(item.path)} />
                    ))}
                </div>
            </div>

            {/* Entities Section */}
            <div className="p-4 border-b border-[#34495E]">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                    Sales & Tasks
                </div>
                <div className="space-y-1">
                    {entityItems.map((item) => (
                        <MenuItem key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => navigate(item.path)} />
                    ))}
                </div>
            </div>

            {/* Activities Section */}
            <div className="p-4 border-b border-[#34495E]">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                    Activities
                </div>
                <div className="space-y-1">
                    {activityItems.map((item) => (
                        <MenuItem key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => navigate(item.path)} />
                    ))}
                </div>
            </div>

            {/* Tools Section */}
            <div className="p-4 border-b border-[#34495E]">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                    Tools
                </div>
                <div className="space-y-1">
                    {toolItems.map((item) => (
                        <MenuItem key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => navigate(item.path)} />
                    ))}
                </div>
            </div>

            {/* Insights Section */}
            <div className="p-4 border-b border-[#34495E]">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                    Insights
                </div>
                <div className="space-y-1">
                    {insightItems.map((item) => (
                        <MenuItem key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => navigate(item.path)} />
                    ))}
                </div>
            </div>

            {/* Admin Section */}
            <div className="p-4 border-b border-[#34495E]">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                    Administration
                </div>
                <div className="space-y-1">
                    {adminItems.map((item) => (
                        <MenuItem key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => navigate(item.path)} />
                    ))}
                </div>
            </div>

            {/* Help & Support Section */}
            <div className="p-4 border-b border-[#34495E]">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                    Help & Support
                </div>
                <div className="space-y-1">
                    {helpItems.map((item) => (
                        <MenuItem key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => navigate(item.path)} />
                    ))}
                </div>
            </div>

            {/* Nexus Cloud */}
            <div className="p-4 mt-auto border-t border-[#34495E]">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a252f] hover:bg-[#253340] transition-all cursor-pointer group">
                    <Cloud size={18} className="text-blue-400" />
                    <div className="flex-1">
                        <div className="text-xs font-black text-white">Nexus Cloud</div>
                        <div className="text-[9px] font-bold text-slate-400">User: Sameer MJ</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MenuItem = ({ item, isActive, onClick }: any) => {
    const Icon = item.icon;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${isActive
                ? 'bg-[#6366F1] text-white shadow-lg shadow-indigo-900/50'
                : 'text-slate-300 hover:bg-[#34495E] hover:text-white'
                }`}
        >
            <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors`} />
            <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
            {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-lg"></div>
            )}
        </button>
    );
};

export default Sidebar;
