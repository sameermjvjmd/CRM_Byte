import { useState } from 'react';
import { Database, Plus, Edit, Trash2, Type, Calendar, CheckSquare, Hash } from 'lucide-react';

const DefineFieldsPage = () => {
    const [fields] = useState([
        { id: 1, name: 'Customer ID', type: 'Text', entity: 'Contact', required: true },
        { id: 2, name: 'Renewal Date', type: 'Date', entity: 'Contact', required: false },
        { id: 3, name: 'Annual Revenue', type: 'Currency', entity: 'Company', required: false },
        { id: 4, name: 'Industry', type: 'Dropdown', entity: 'Company', required: true },
    ]);

    const fieldTypes = [
        { icon: <Type size={16} />, name: 'Text', color: 'blue' },
        { icon: <Hash size={16} />, name: 'Number', color: 'green' },
        { icon: <Calendar size={16} />, name: 'Date', color: 'purple' },
        { icon: <CheckSquare size={16} />, name: 'Checkbox', color: 'orange' },
        { icon: <Database size={16} />, name: 'Dropdown', color: 'indigo' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Define Custom Fields</h1>
                    <p className="text-sm text-slate-500 font-bold mt-1">Create custom fields for your records</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md">
                    <Plus size={18} />
                    New Field
                </button>
            </div>

            {/* Field Types */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Available Field Types</h3>
                <div className="grid grid-cols-5 gap-4">
                    {fieldTypes.map((type) => (
                        <div
                            key={type.name}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer group"
                        >
                            <div className={`text-${type.color}-500 group-hover:text-indigo-600 mb-2 flex justify-center`}>
                                {type.icon}
                            </div>
                            <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 uppercase">
                                {type.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Fields List */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Custom Fields</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Name</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Required</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field) => (
                                <tr key={field.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{field.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-600">
                                            {field.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{field.entity}</td>
                                    <td className="px-6 py-4">
                                        {field.required ? (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-600">
                                                Required
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                                                Optional
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                                                <Edit size={16} className="text-slate-400" />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={16} className="text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Field Usage Stats */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="text-2xl font-black text-indigo-600">{fields.length}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Custom Fields</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="text-2xl font-black text-emerald-600">{fields.filter(f => f.required).length}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Required Fields</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="text-2xl font-black text-orange-600">{new Set(fields.map(f => f.entity)).size}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Entities Extended</div>
                </div>
            </div>
        </div>
    );
};

export default DefineFieldsPage;
