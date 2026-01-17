import { useState } from 'react';
import { Users, Copy, AlertTriangle, Trash2, CheckCircle, ArrowRight } from 'lucide-react';
import { duplicateApi, type DuplicateGroup, type DuplicateRecord } from '../../api/duplicateApi';
import toast from 'react-hot-toast';

const DuplicateScanPage = () => {
    const [scanType, setScanType] = useState('Contact');
    const [matchCriteria, setMatchCriteria] = useState('Email');
    const [isScanning, setIsScanning] = useState(false);

    const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);

    // Stats (calculated from duplicates)
    const duplicateCount = duplicates.length;
    const totalImpacted = duplicates.reduce((sum, g) => sum + g.records.length, 0);

    const handleScan = async () => {
        setIsScanning(true);
        try {
            const results = await duplicateApi.scan({
                entityType: scanType,
                fields: [matchCriteria], // Allow single selection for now
                sensitivity: 'High'
            });
            setDuplicates(results);
            if (results.length === 0) toast.success('No duplicates found!');
            else toast.success(`Found ${results.length} sets of duplicates.`);
        } catch (error) {
            console.error(error);
            toast.error('Scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    const handleMerge = async (group: DuplicateGroup, masterId: number) => {
        if (!confirm("Are you sure? This will merge other records into the selected one and delete them.")) return;

        try {
            await duplicateApi.merge({
                entityType: scanType,
                masterRecordId: masterId,
                duplicateRecordIds: group.records.filter(r => r.id !== masterId).map(r => r.id)
            });

            toast.success('Merged successfully');
            // Remove this group from UI
            setDuplicates(prev => prev.filter(g => g.groupId !== group.groupId));
        } catch (error) {
            console.error(error);
            toast.error('Merge failed');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Duplicate Scanner</h1>
                    <p className="text-slate-500 font-bold mt-2">Find and merge duplicate records to clean your data.</p>
                </div>
                <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                    {isScanning && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {isScanning ? 'Scanning...' : 'Start Scan'}
                </button>
            </div>

            {/* Scan Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Scan Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Record Type
                        </label>
                        <select
                            value={scanType}
                            onChange={(e) => setScanType(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Contact">Contacts</option>
                            <option value="Company">Companies</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Match Criteria
                        </label>
                        <select
                            value={matchCriteria}
                            onChange={(e) => setMatchCriteria(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Email">Email Address</option>
                            <option value="Name">Name (First + Last)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Sensitivity
                        </label>
                        <div className="px-4 py-3 border border-slate-200 rounded-lg font-bold text-slate-400 bg-slate-100 cursor-not-allowed">
                            High (Exact Match Only)
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            {duplicates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Found Issues</div>
                            <div className="text-3xl font-black text-slate-900">{duplicateCount}</div>
                            <div className="text-xs font-bold text-slate-400 mt-1">Duplicate Sets</div>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                            <Copy size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Records</div>
                            <div className="text-3xl font-black text-slate-900">{totalImpacted}</div>
                            <div className="text-xs font-bold text-slate-400 mt-1">Impacted Records</div>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Status</div>
                            <div className="text-lg font-black text-red-600">Action Required</div>
                            <div className="text-xs font-bold text-slate-400 mt-1">Review matches</div>
                        </div>
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicates List */}
            {duplicates.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Detected Duplicates</h3>
                        {/* Bulk actions could go here */}
                    </div>
                    <div className="divide-y divide-slate-100">
                        {duplicates.map((group) => (
                            <div key={group.groupId} className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${group.matchScore === 100 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                            {group.matchScore}% Match
                                        </div>
                                        <span className="text-sm font-bold text-slate-400">Group ID: #{group.groupId}</span>
                                    </div>
                                    <div className="text-xs font-medium text-slate-400 italic">Select a record to keep as master</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {group.records.map((record) => (
                                        <div key={record.id} className="relative group/card">
                                            <div className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-indigo-400 transition-all h-full flex flex-col">
                                                <div className="mb-4">
                                                    <div className="text-lg font-black text-slate-900">{record.name}</div>
                                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                        Created: {new Date(record.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                <div className="space-y-3 flex-1 mb-6">
                                                    {Object.entries(record.attributes).map(([key, value]) => (
                                                        <div key={key} className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase text-slate-400">{key}</span>
                                                            <span className="text-sm font-medium text-slate-700 truncate" title={value}>{value || '-'}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => handleMerge(group, record.id)}
                                                    className="w-full py-3 rounded-lg border-2 border-indigo-600 text-indigo-600 font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle size={14} /> Keep This Record
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DuplicateScanPage;
