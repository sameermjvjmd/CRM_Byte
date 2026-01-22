import { useNavigate } from 'react-router-dom';
import {
    Users, UserCheck, ShieldCheck, Settings, Mail,
    Download, Upload, Search, Copy, Activity, Trash2, RefreshCw, Printer,
    Database, Layout, FileText, Briefcase
} from 'lucide-react';

const ToolsPage = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Account Tools",
            items: [
                { icon: <Users size={24} />, name: "Manage Users", desc: "Add or edit user access", route: "/users" },
                { icon: <ShieldCheck size={24} />, name: "Manage Roles", desc: "Configure role permissions", route: "/settings/roles" },
                { icon: <Mail size={24} />, name: "Email Configuration", desc: "Configure SMTP settings", route: "/settings/email" },
            ]
        },
        {
            title: "Database Tools",
            items: [
                { icon: <Download size={24} />, name: "Import Data", desc: "Import from CSV/Excel", route: "/tools/import" },
                { icon: <Upload size={24} />, name: "Export Data", desc: "Export to CSV/Excel", route: "/tools/export" },
                { icon: <Search size={24} />, name: "Scan for Duplicates", desc: "Find and merge duplicates", route: "/tools/duplicates" },
            ]
        },
        {
            title: "Customization",
            items: [
                { icon: <Database size={24} />, name: "Custom Fields", desc: "Define custom fields", route: "/admin/custom-fields" },
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
