import { useNavigate } from 'react-router-dom';
import {
    Users, UserCheck, ShieldCheck, Settings, Mail,
    Download, Search, Copy, Activity, Trash2, RefreshCw, Printer,
    Database, Layout, FileText, Briefcase
} from 'lucide-react';

const ToolsPage = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Account Tools",
            items: [
                { icon: <Users size={24} />, name: "Manage Users", desc: "Add or edit user access", route: "/users" },
                { icon: <UserCheck size={24} />, name: "Manage Teams", desc: "Organize users into teams", route: "/tools/teams" },
                { icon: <Mail size={24} />, name: "Email Configuration", desc: "Configure SMTP settings", route: "/settings/email" },
                { icon: <ShieldCheck size={24} />, name: "Password Policy", desc: "Set security requirements", route: "/tools/password-policy" },
                { icon: <Settings size={24} />, name: "Admin Preferences", desc: "System-wide settings", route: "/tools/preferences" },
            ]
        },
        {
            title: "Database Tools",
            items: [
                { icon: <Download size={24} />, name: "Import", desc: "Bring data from CSV/Excel", route: "/tools/import" },
                { icon: <Search size={24} />, name: "Scan for Duplicates", desc: "Identify redundant records", route: "/tools/duplicates" },
                { icon: <Copy size={24} />, name: "Move Contact Data", desc: "Reassign records in bulk", route: "/tools/move-data" },
                { icon: <Activity size={24} />, name: "Check and Repair", desc: "Maintain data integrity", route: "/tools/repair" },
                { icon: <Trash2 size={24} />, name: "Remove Old Data", desc: "Cleanup outdated records", route: "/tools/cleanup" },
                { icon: <RefreshCw size={24} />, name: "Remote DB Sync", desc: "Sync with offline databases", route: "/tools/sync" },
                { icon: <Printer size={24} />, name: "Print", desc: "Print current data view", route: "/tools/print" },
            ]
        },
        {
            title: "Design Tools",
            items: [
                { icon: <Database size={24} />, name: "Define Fields", desc: "Create custom fields", route: "/tools/define-fields" },
                { icon: <Layout size={24} />, name: "Design Contact Layout", desc: "Customize contact pages", route: "/tools/layout-contact" },
                { icon: <FileText size={24} />, name: "Design Company Layout", desc: "Customize company pages", route: "/tools/layout-company" },
                { icon: <Users size={24} />, name: "Design Group Layout", desc: "Customize group pages", route: "/tools/layout-group" },
                { icon: <Briefcase size={24} />, name: "Design Opportunity Layout", desc: "Customize deal pages", route: "/tools/layout-opportunity" },
            ]
        }
    ];

    const handleItemClick = (item: any) => {
        if (item.route) {
            navigate(item.route);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-[24px] font-black text-slate-900 tracking-tight uppercase">Control Center</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Database architecture and system administration</p>
                </header>

                <div className="space-y-12">
                    {sections.map((section, idx) => (
                        <div key={idx} className="space-y-6">
                            <h2 className="text-xs font-black text-slate-400 pb-2 border-b border-slate-200 uppercase tracking-[0.3em]">
                                {section.title}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {section.items.map((item, itemIdx) => (
                                    <button
                                        key={itemIdx}
                                        onClick={() => handleItemClick(item)}
                                        className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all text-left group"
                                    >
                                        <div className="p-3 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors mb-5 border border-slate-100">
                                            {item.icon}
                                        </div>
                                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-tight mb-2">{item.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">{item.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ToolsPage;
