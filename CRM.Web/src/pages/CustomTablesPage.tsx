import { useState } from 'react';
import { Table, Plus, Edit, Trash2, Database } from 'lucide-react';

const CustomTablesPage = () => {
    const [tables] = useState([
        { id: 1, name: 'Products', records: 156, fields: 12, lastModified: '2024-01-10' },
        { id: 2, name: 'Services', records: 89, fields: 8, lastModified: '2024-01-09' },
        { id: 3, name: 'Vendors', records: 34, fields: 10, lastModified: '2024-01-08' },
    ]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Custom Tables</h1>
                    <p className="text-sm text-slate-500 font-bold mt-1">Manage custom data structures</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md">
                    <Plus size={18} />
                    New Table
                </button>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 gap-4">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <Database size={24} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{table.name}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs text-slate-500 font-bold">
                                            {table.records} Records
                                        </span>
                                        <span className="text-xs text-slate-500 font-bold">
                                            {table.fields} Fields
                                        </span>
                                        <span className="text-xs text-slate-400 font-bold">
                                            Modified: {table.lastModified}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-all" title="Edit Table">
                                    <Edit size={18} className="text-slate-400" />
                                </button>
                                <button className="p-2 hover:bg-red-50 rounded-lg transition-all" title="Delete Table">
                                    <Trash2 size={18} className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create New Table Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-8">
                <div className="text-center">
                    <Table size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Create Custom Tables</h3>
                    <p className="text-xs text-slate-400 mb-6">
                        Extend your CRM with custom data structures tailored to your business
                    </p>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomTablesPage;
