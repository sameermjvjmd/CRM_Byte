import { useState } from 'react';
import { Users, Copy, AlertTriangle, Trash2 } from 'lucide-react';

const DuplicateScanPage = () => {
    const [scanType, setScanType] = useState('contacts');
    const [isScanning, setIsScanning] = useState(false);
    const [duplicates] = useState([
        {
            id: 1,
            record1: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
            record2: { name: 'John Doe', email: 'johndoe@example.com', phone: '1234567890' },
            matchScore: 95
        },
        {
            id: 2,
            record1: { name: 'Jane Smith', email: 'jane@company.com', phone: '0987654321' },
            record2: { name: 'Jane Smith', email: 'jane@company.com', phone: '0987654322' },
            matchScore: 88
        },
    ]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Duplicate Scanner</h1>
                    <p className="text-sm text-slate-500 font-bold mt-1">Find and merge duplicate records</p>
                </div>
                <button
                    onClick={() => setIsScanning(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md"
                >
                    {isScanning && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {isScanning ? 'Scanning...' : 'Start Scan'}
                </button>
            </div>

            {/* Scan Configuration */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Scan Configuration</h3>
                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                            Record Type
                        </label>
                        <select
                            value={scanType}
                            onChange={(e) => setScanType(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="contacts">Contacts</option>
                            <option value="companies">Companies</option>
                            <option value="groups">Groups</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                            Match Criteria
                        </label>
                        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option>Name + Email</option>
                            <option>Name + Phone</option>
                            <option>Email Only</option>
                            <option>Phone Only</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                            Sensitivity
                        </label>
                        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option>High (Exact match)</option>
                            <option>Medium (Similar)</option>
                            <option>Low (Fuzzy match)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Copy size={20} className="text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Found</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{duplicates.length}</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">Duplicate Sets</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Users size={20} className="text-indigo-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Scanned</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">1,247</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">Total Records</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle size={20} className="text-yellow-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Impact</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">0.16%</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">Duplicate Rate</div>
                </div>
            </div>

            {/* Duplicates List */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Potential Duplicates</h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase hover:bg-slate-200 transition-all">
                            Merge All
                        </button>
                        <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold uppercase hover:bg-red-200 transition-all flex items-center gap-2">
                            <Trash2 size={14} />
                            Delete All
                        </button>
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {duplicates.map((dup) => (
                        <div key={dup.id} className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-xs font-black ${dup.matchScore >= 90 ? 'bg-red-100 text-red-600' :
                                            dup.matchScore >= 75 ? 'bg-orange-100 text-orange-600' :
                                                'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {dup.matchScore}% Match
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold uppercase hover:bg-indigo-200 transition-all">
                                        Merge
                                    </button>
                                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase hover:bg-slate-200 transition-all">
                                        Keep Both
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-xs font-black text-slate-400 uppercase mb-2">Record #1</div>
                                    <div className="text-sm font-bold text-slate-900 mb-1">{dup.record1.name}</div>
                                    <div className="text-xs text-slate-600 font-bold">{dup.record1.email}</div>
                                    <div className="text-xs text-slate-600 font-bold">{dup.record1.phone}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-xs font-black text-slate-400 uppercase mb-2">Record #2</div>
                                    <div className="text-sm font-bold text-slate-900 mb-1">{dup.record2.name}</div>
                                    <div className="text-xs text-slate-600 font-bold">{dup.record2.email}</div>
                                    <div className="text-xs text-slate-600 font-bold">{dup.record2.phone}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DuplicateScanPage;
