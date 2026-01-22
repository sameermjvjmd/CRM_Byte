import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { importApi, CONTACT_IMPORT_FIELDS, type ImportPreviewResponse, type ImportResult } from '../../api/importApi';
import toast from 'react-hot-toast';

const ImportDataPage = () => {
    const [step, setStep] = useState(1);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importType, setImportType] = useState('Contact');

    // Preview Data
    const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    // Mapping Data
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [updateExisting, setUpdateExisting] = useState(false);

    // Import Execution
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Auto-upload for preview
            setIsLoadingPreview(true);
            try {
                const data = await importApi.uploadPreview(file);
                setPreviewData(data);

                // Intelligent auto-mapping
                const newMapping: Record<string, string> = {};
                data.headers.forEach(header => {
                    // Try to find a match in CONTACT_IMPORT_FIELDS (case-insensitive)
                    const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const match = CONTACT_IMPORT_FIELDS.find(f =>
                        f.label.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedHeader ||
                        f.value.toLowerCase() === normalizedHeader
                    );

                    if (match) {
                        newMapping[header] = match.value;
                    }
                });
                setMapping(newMapping);
                setStep(1); // Stay on step 1 visually until they click next, but data is ready
            } catch (error) {
                console.error(error);
                toast.error('Failed to parse file. Please check format.');
                setSelectedFile(null);
            } finally {
                setIsLoadingPreview(false);
            }
        }
    };

    const handleExecuteImport = async () => {
        if (!previewData) return;

        setIsImporting(true);
        try {
            const result = await importApi.executeImport({
                fileToken: previewData.fileToken,
                entityType: importType,
                fieldMapping: mapping,
                updateExisting: updateExisting
            });
            setImportResult(result);
            setStep(3);
            if (result.errorCount === 0) toast.success(`Successfully imported ${result.successCount} records!`);
            else toast.success(`Import completed with warnings.`);
        } catch (error) {
            console.error(error);
            toast.error('Import execution failed.');
        } finally {
            setIsImporting(false);
        }
    };

    const resetImport = () => {
        setStep(1);
        setSelectedFile(null);
        setPreviewData(null);
        setMapping({});
        setImportResult(null);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Import Data</h1>
                    <p className="text-slate-500 font-bold mt-2">Bulk import data from CSV or Excel files.</p>
                </div>
                {step === 3 && (
                    <button onClick={resetImport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
                        <RefreshCw size={14} /> Import Another File
                    </button>
                )}
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step >= 1 ? 'bg-indigo-100' : 'bg-slate-100'}`}>1</div>
                    <span className="font-bold text-sm uppercase">Upload</span>
                </div>
                <div className="w-12 h-0.5 bg-slate-200"></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step >= 2 ? 'bg-indigo-100' : 'bg-slate-100'}`}>2</div>
                    <span className="font-bold text-sm uppercase">Map Fields</span>
                </div>
                <div className="w-12 h-0.5 bg-slate-200"></div>
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step >= 3 ? 'bg-indigo-100' : 'bg-slate-100'}`}>3</div>
                    <span className="font-bold text-sm uppercase">Results</span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="col-span-12 lg:col-span-8 space-y-6">

                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">File Selection</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Target Entity</label>
                                    <select
                                        value={importType}
                                        onChange={(e) => setImportType(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                    >
                                        <option value="Contact">Contacts</option>
                                        <option value="Company" disabled>Companies (Coming Soon)</option>
                                        <option value="Group" disabled>Groups (Coming Soon)</option>
                                    </select>
                                </div>

                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-slate-50/50 transition-all group cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isLoadingPreview}
                                    />
                                    {isLoadingPreview ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 size={48} className="text-indigo-600 animate-spin" />
                                            <div className="font-bold text-slate-600">Analyzing file...</div>
                                        </div>
                                    ) : selectedFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-2">
                                                <FileText size={32} />
                                            </div>
                                            <div className="text-lg font-bold text-slate-900">{selectedFile.name}</div>
                                            <div className="text-sm font-medium text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                                            <div className="mt-4 px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest">
                                                Analysis Complete
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                <Upload size={32} />
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-700 mb-2">Drop your file here, or browse</h4>
                                            <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">Supports CSV and Excel files. Maximum 10MB.</p>
                                        </>
                                    )}
                                </div>

                                {selectedFile && previewData && (
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                                        >
                                            Next: Map Fields <ArrowRight size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Mapping */}
                    {step === 2 && previewData && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Map Columns</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1">Match your file columns to CRM fields.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">File</div>
                                    <div className="font-bold text-slate-700">{selectedFile?.name}</div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-1">
                                <div className="grid grid-cols-12 gap-4 pb-2 border-b-2 border-slate-100 mb-2 px-2">
                                    <div className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">File Header</div>
                                    <div className="col-span-1 flex justify-center text-slate-300"><ArrowRight size={12} /></div>
                                    <div className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">CRM Field</div>
                                    <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Sample Data</div>
                                </div>

                                {previewData.headers.map((header) => (
                                    <div key={header} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg border transition-all ${mapping[header] ? 'bg-indigo-50/30 border-indigo-100' : 'bg-white border-slate-100'}`}>
                                        <div className="col-span-4">
                                            <div className="font-bold text-sm text-slate-700 truncate" title={header}>{header}</div>
                                        </div>
                                        <div className="col-span-1 flex justify-center text-slate-300">
                                            <ArrowRight size={14} />
                                        </div>
                                        <div className="col-span-4">
                                            <select
                                                value={mapping[header] || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setMapping(prev => {
                                                        const next = { ...prev };
                                                        if (val) next[header] = val;
                                                        else delete next[header];
                                                        return next;
                                                    });
                                                }}
                                                className={`w-full px-3 py-2 border rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${mapping[header] ? 'border-indigo-300 text-indigo-700 bg-indigo-50' : 'border-slate-200 text-slate-500'}`}
                                            >
                                                <option value="">-- Ignore Column --</option>
                                                {CONTACT_IMPORT_FIELDS.map(f => (
                                                    <option key={f.value} value={f.value}>{f.label} {f.required ? '*' : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="text-xs text-slate-500 truncate italic bg-slate-50 px-2 py-1 rounded">
                                                {previewData.previewRows[0]?.[header] || '-'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 border-t border-slate-200 bg-slate-50/50 rounded-b-xl flex justify-between items-center">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-2 text-slate-500 font-bold text-sm hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={updateExisting}
                                            onChange={(e) => setUpdateExisting(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-bold text-slate-600">Update existing records</span>
                                    </label>
                                    <button
                                        onClick={handleExecuteImport}
                                        disabled={Object.keys(mapping).length === 0 || isImporting}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isImporting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                        {isImporting ? 'Processing...' : 'Run Import'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Result */}
                    {step === 3 && importResult && (
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
                            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${importResult.errorCount === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Import Completed</h2>
                            <p className="text-slate-500 font-medium mb-8">Your data has been processed.</p>

                            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-3xl font-black text-slate-900">{importResult.totalProcessed}</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Processed</div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="text-3xl font-black text-emerald-600">{importResult.successCount}</div>
                                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">Success</div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                    <div className="text-3xl font-black text-red-600">{importResult.errorCount}</div>
                                    <div className="text-xs font-bold text-red-400 uppercase tracking-widest mt-1">Errors</div>
                                </div>
                            </div>

                            {importResult.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-left mb-8 max-h-48 overflow-y-auto custom-scrollbar">
                                    <h4 className="flex items-center gap-2 text-red-800 font-bold mb-2">
                                        <AlertCircle size={16} /> Error Log
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {importResult.errors.map((err, i) => (
                                            <li key={i} className="text-xs text-red-600 font-medium">{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-center gap-4">
                                <button className="px-6 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50" onClick={() => window.location.href = '/contacts'}>
                                    View Contacts
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Sidebar Info */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Tips & Requirements</h3>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm text-slate-600">
                                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>File must be <strong>.CSV</strong> or <strong>.XLSX</strong></span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600">
                                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>First row should contain <strong>headers</strong></span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600">
                                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span><strong>Email</strong> is recommended for duplicate checking</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600">
                                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span><strong>Company</strong> column will auto-create or link companies</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ImportDataPage;
