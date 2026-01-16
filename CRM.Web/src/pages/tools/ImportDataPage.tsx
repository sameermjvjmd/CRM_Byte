import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

const ImportDataPage = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importType, setImportType] = useState('contacts');
    const [mapping, setMapping] = useState<any>({});

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Import Data</h1>
                <p className="text-sm text-slate-500 font-bold mt-1">Import contacts, companies, or other data from CSV/Excel files</p>
            </div>

            {/* Import Steps */}
            <div className="grid grid-cols-3 gap-6">
                {/* Step 1: Select File */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">
                            1
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Select File</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                Import Type
                            </label>
                            <select
                                value={importType}
                                onChange={(e) => setImportType(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="contacts">Contacts</option>
                                <option value="companies">Companies</option>
                                <option value="groups">Groups</option>
                                <option value="opportunities">Opportunities</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                Upload File
                            </label>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-indigo-300 transition-all cursor-pointer">
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload size={32} className="mx-auto text-slate-300 mb-2" />
                                    {selectedFile ? (
                                        <div className="text-sm font-bold text-indigo-600">{selectedFile.name}</div>
                                    ) : (
                                        <>
                                            <div className="text-sm font-bold text-slate-700 mb-1">Click to upload</div>
                                            <div className="text-xs text-slate-400">CSV, XLSX, or XLS</div>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Map Fields */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-black text-sm">
                            2
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-400">Map Fields</h3>
                    </div>

                    <div className="space-y-3">
                        {['First Name', 'Last Name', 'Email', 'Phone', 'Company'].map((field) => (
                            <div key={field} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-700">{field}</div>
                                </div>
                                <div className="text-slate-300">→</div>
                                <select className="flex-1 px-3 py-1 border border-slate-200 rounded text-xs font-bold">
                                    <option>Auto-detect</option>
                                    <option>Column A</option>
                                    <option>Column B</option>
                                    <option>Column C</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 3: Import */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-black text-sm">
                            3
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-400">Import</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle size={16} className="text-emerald-500" />
                                <div className="text-xs font-bold text-slate-700">Ready to Import</div>
                            </div>
                            <div className="text-xs text-slate-400">
                                {selectedFile ? `${selectedFile.name} selected` : 'No file selected'}
                            </div>
                        </div>

                        <button
                            disabled={!selectedFile}
                            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Import
                        </button>
                    </div>
                </div>
            </div>

            {/* Import Template */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Download Templates</h3>
                <div className="grid grid-cols-4 gap-4">
                    {['Contacts', 'Companies', 'Groups', 'Opportunities'].map((template) => (
                        <button
                            key={template}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                        >
                            <FileText size={20} className="text-slate-400 group-hover:text-indigo-600 mb-2" />
                            <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 uppercase">
                                {template} Template
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                <Download size={12} className="text-slate-400" />
                                <span className="text-[10px] text-slate-400 font-bold">CSV</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Import History */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Imports</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { type: 'Contacts', records: 250, date: '2024-01-10', status: 'Completed' },
                        { type: 'Companies', records: 45, date: '2024-01-09', status: 'Completed' },
                        { type: 'Contacts', records: 12, date: '2024-01-08', status: 'Failed' },
                    ].map((item, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center gap-4">
                                <FileText size={18} className="text-slate-400" />
                                <div>
                                    <div className="text-sm font-bold text-slate-700">{item.type} Import</div>
                                    <div className="text-xs text-slate-400 font-bold">{item.records} records • {item.date}</div>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImportDataPage;
