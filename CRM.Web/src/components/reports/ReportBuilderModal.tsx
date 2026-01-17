import { useState, useEffect } from 'react';
import {
    X, ChevronRight, Check, Plus, Trash2, FileText,
    Filter as FilterIcon, Columns, ArrowUpDown, Save, Play
} from 'lucide-react';
import { REPORT_CATEGORIES } from '../../constants/reportFields';
import type { ReportFilter, ReportResult, ReportSorting, SavedReport } from '../../types/reporting';
import { reportsApi } from '../../api/reportsApi';
import toast from 'react-hot-toast';

interface ReportBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    initialReport?: SavedReport | null;
}

export default function ReportBuilderModal({ isOpen, onClose, onSaveSuccess, initialReport }: ReportBuilderModalProps) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(REPORT_CATEGORIES[0].category);

    // Configuration
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [filters, setFilters] = useState<ReportFilter[]>([]);
    const [sorting, setSorting] = useState<ReportSorting>({ field: 'CreatedAt', direction: 'desc' });

    // Results
    const [previewData, setPreviewData] = useState<ReportResult | null>(null);
    const [loading, setLoading] = useState(false);

    // Load initial report if provided
    useEffect(() => {
        if (initialReport && isOpen) {
            setName(initialReport.name);
            setDescription(initialReport.description || '');
            setCategory(initialReport.category);

            try {
                if (initialReport.columns) setSelectedColumns(JSON.parse(initialReport.columns));
                if (initialReport.filters) setFilters(JSON.parse(initialReport.filters));
                if (initialReport.sorting) setSorting(JSON.parse(initialReport.sorting));
            } catch (e) {
                console.error("Failed to parse report config", e);
            }
        } else if (!initialReport && isOpen) {
            // Reset if opening new
            setName('');
            setDescription('');
            setCategory(REPORT_CATEGORIES[0].category);
            setFilters([]);
            setPreviewData(null);
            setStep(1);
        }
    }, [initialReport, isOpen]);

    // Initial columns selection when category changes (only for new reports)
    useEffect(() => {
        if (category && !initialReport) {
            const cat = REPORT_CATEGORIES.find(c => c.category === category);
            if (cat) {
                // Select first 5 columns by default (excluding ID if any)
                setSelectedColumns(cat.fields.slice(0, 5).map(f => f.name));
            }
        }
    }, [category, initialReport]);

    const activeCategory = REPORT_CATEGORIES.find(c => c.category === category);

    const handleRunReport = async () => {
        setLoading(true);
        try {
            const request = {
                category,
                columns: selectedColumns,
                filters,
                sorting,
                page: 1,
                pageSize: 10
            };
            const data = await reportsApi.runCustomReport(request);
            setPreviewData(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to run report');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReport = async () => {
        if (!name) return toast.error('Please enter a report name');

        try {
            const payload = {
                name,
                description,
                category,
                reportType: 'Table',
                columns: JSON.stringify(selectedColumns),
                filters: JSON.stringify(filters),
                sorting: JSON.stringify(sorting),
                isPublic: false
            };
            await reportsApi.createSavedReport(payload);
            toast.success('Report saved successfully');
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save report');
        }
    };

    const renderStep1_Basics = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Q4 Sales Pipeline"
                    autoFocus
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Optional description"
                    rows={2}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Source (Category)</label>
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {REPORT_CATEGORIES.map(c => (
                        <option key={c.category} value={c.category}>{c.category}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    const renderStep2_Columns = () => (
        <div className="space-y-4">
            <p className="text-sm text-slate-500">Select columns to display in your report.</p>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {activeCategory?.fields.map(field => (
                    <label key={field.name} className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedColumns.includes(field.name)}
                            onChange={e => {
                                if (e.target.checked) {
                                    setSelectedColumns([...selectedColumns, field.name]);
                                } else {
                                    setSelectedColumns(selectedColumns.filter(c => c !== field.name));
                                }
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">{field.displayName}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderStep3_Filters = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">Add filters to refine your data.</p>
                <button
                    onClick={() => setFilters([...filters, { field: activeCategory?.fields[0].name || '', operator: 'equals', value: '' }])}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                    <Plus size={16} /> Add Filter
                </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
                {filters.length === 0 && (
                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        No filters added. Show all records.
                    </div>
                )}
                {filters.map((filter, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <select
                            value={filter.field}
                            onChange={e => {
                                const newFilters = [...filters];
                                newFilters[idx].field = e.target.value;
                                setFilters(newFilters);
                            }}
                            className="flex-1 text-sm border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {activeCategory?.fields.filter(f => f.isFilterable).map(f => (
                                <option key={f.name} value={f.name}>{f.displayName}</option>
                            ))}
                        </select>
                        <select
                            value={filter.operator}
                            onChange={e => {
                                const newFilters = [...filters];
                                newFilters[idx].operator = e.target.value;
                                setFilters(newFilters);
                            }}
                            className="w-32 text-sm border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="equals">Equals</option>
                            <option value="contains">Contains</option>
                            <option value="starts_with">Starts With</option>
                            <option value="greater_than">Greater Than</option>
                            <option value="less_than">Less Than</option>
                        </select>
                        <input
                            type="text"
                            value={filter.value || ''}
                            onChange={e => {
                                const newFilters = [...filters];
                                newFilters[idx].value = e.target.value;
                                setFilters(newFilters);
                            }}
                            className="flex-1 text-sm border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Value..."
                        />
                        <button
                            onClick={() => setFilters(filters.filter((_, i) => i !== idx))}
                            className="p-2 text-slate-400 hover:text-red-500"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPreview = () => {
        if (!previewData && !loading) return null;
        if (loading) return <div className="p-8 text-center text-slate-500">Generating preview...</div>;

        return (
            <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-slate-800">Preview Results ({previewData?.totalCount || 0})</h4>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-60">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {previewData?.columns.map(col => (
                                    <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                        {activeCategory?.fields.find(f => f.name === col)?.displayName || col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {previewData?.rows.map((row, i) => (
                                <tr key={i}>
                                    {previewData.columns.map(col => (
                                        <td key={col} className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
                                            {String(row[col] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Create Custom Report</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Sidebar Steps */}
                    <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-1">
                        {[
                            { id: 1, label: 'Basics', icon: FileText },
                            { id: 2, label: 'Columns', icon: Columns },
                            { id: 3, label: 'Filters', icon: FilterIcon },
                            { id: 4, label: 'Sorting', icon: ArrowUpDown },
                        ].map(s => (
                            <button
                                key={s.id}
                                onClick={() => setStep(s.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                                    ${step === s.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <s.icon size={18} />
                                {s.label}
                                {step > s.id && <Check size={16} className="ml-auto text-emerald-500" />}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {step === 1 && renderStep1_Basics()}
                        {step === 2 && renderStep2_Columns()}
                        {step === 3 && renderStep3_Filters()}
                        {step === 4 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
                                    <select
                                        value={sorting.field}
                                        onChange={e => setSorting({ ...sorting, field: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {activeCategory?.fields.filter(f => f.isSortable).map(f => (
                                            <option key={f.name} value={f.name}>{f.displayName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Direction</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="sortDir"
                                                value="asc"
                                                checked={sorting.direction === 'asc'}
                                                onChange={() => setSorting({ ...sorting, direction: 'asc' })}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-slate-700">Ascending</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="sortDir"
                                                value="desc"
                                                checked={sorting.direction === 'desc'}
                                                onChange={() => setSorting({ ...sorting, direction: 'desc' })}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-slate-700">Descending</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {renderPreview()}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-between bg-white rounded-b-xl">
                    <button
                        onClick={handleRunReport}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2"
                    >
                        <Play size={18} /> Run Preview
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveReport}
                            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
                        >
                            <Save size={18} /> Save Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
