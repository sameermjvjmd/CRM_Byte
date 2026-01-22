import { useState } from 'react';
import { Download, FileText, CheckSquare, Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const CONTACT_FIELDS = [
    { value: 'FirstName', label: 'First Name', default: true },
    { value: 'LastName', label: 'Last Name', default: true },
    { value: 'Email', label: 'Email', default: true },
    { value: 'Phone', label: 'Phone', default: true },
    { value: 'MobilePhone', label: 'Mobile Phone', default: false },
    { value: 'Company', label: 'Company', default: true },
    { value: 'JobTitle', label: 'Job Title', default: true },
    { value: 'Department', label: 'Department', default: false },
    { value: 'LeadSource', label: 'Lead Source', default: false },
    { value: 'Status', label: 'Status', default: true },
    { value: 'Address1', label: 'Address', default: false },
    { value: 'City', label: 'City', default: false },
    { value: 'State', label: 'State', default: false },
    { value: 'Zip', label: 'Zip Code', default: false },
    { value: 'Country', label: 'Country', default: false },
    { value: 'Website', label: 'Website', default: false },
    { value: 'Salutation', label: 'Salutation', default: false },
    { value: 'Fax', label: 'Fax', default: false },
    { value: 'Notes', label: 'Notes', default: false },
    { value: 'CreatedAt', label: 'Created Date', default: false },
];

const COMPANY_FIELDS = [
    { value: 'Name', label: 'Company Name', default: true },
    { value: 'Industry', label: 'Industry', default: true },
    { value: 'Website', label: 'Website', default: true },
    { value: 'Phone', label: 'Phone', default: true },
    { value: 'Email', label: 'Email', default: true },
    { value: 'Address', label: 'Address', default: false },
    { value: 'City', label: 'City', default: false },
    { value: 'State', label: 'State', default: false },
    { value: 'ZipCode', label: 'Zip Code', default: false },
    { value: 'Country', label: 'Country', default: false },
    { value: 'Description', label: 'Description', default: false },
    { value: 'EmployeeCount', label: 'Employee Count', default: false },
    { value: 'AnnualRevenue', label: 'Annual Revenue', default: false },
    { value: 'CreatedAt', label: 'Created Date', default: false },
];

const ExportDataPage = () => {
    const [entityType, setEntityType] = useState('Contact');
    const [format, setFormat] = useState('csv');
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    const availableFields = entityType === 'Contact' ? CONTACT_FIELDS : COMPANY_FIELDS;

    // Initialize with default fields when entity type changes
    useState(() => {
        const defaults = availableFields.filter(f => f.default).map(f => f.value);
        setSelectedFields(defaults);
    });

    const handleEntityChange = (newType: string) => {
        setEntityType(newType);
        const fields = newType === 'Contact' ? CONTACT_FIELDS : COMPANY_FIELDS;
        const defaults = fields.filter(f => f.default).map(f => f.value);
        setSelectedFields(defaults);
    };

    const toggleField = (fieldValue: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldValue)
                ? prev.filter(f => f !== fieldValue)
                : [...prev, fieldValue]
        );
    };

    const selectAll = () => {
        setSelectedFields(availableFields.map(f => f.value));
    };

    const selectNone = () => {
        setSelectedFields([]);
    };

    const handleExport = async () => {
        if (selectedFields.length === 0) {
            toast.error('Please select at least one field to export');
            return;
        }

        setIsExporting(true);
        try {
            const endpoint = entityType === 'Contact'
                ? `/Export/contacts/${format}`
                : `/Export/companies/${format}`;

            const response = await api.post(endpoint, {
                fields: selectedFields,
                ids: null // Export all records
            }, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const extension = format === 'csv' ? 'csv' : 'xlsx';
            const timestamp = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `${entityType.toLowerCase()}_export_${timestamp}.${extension}`);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`${entityType}s exported successfully!`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Export Data</h1>
                <p className="text-slate-500 font-bold mt-2">Export your data to CSV or Excel files</p>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Entity & Format Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Export Settings</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    What to Export
                                </label>
                                <select
                                    value={entityType}
                                    onChange={(e) => handleEntityChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                >
                                    <option value="Contact">Contacts</option>
                                    <option value="Company">Companies</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    Export Format
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setFormat('csv')}
                                        className={`p-4 border-2 rounded-lg transition-all ${format === 'csv'
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <FileText className={`mx-auto mb-2 ${format === 'csv' ? 'text-indigo-600' : 'text-slate-400'}`} size={32} />
                                        <div className="font-bold text-sm">CSV File</div>
                                        <div className="text-xs text-slate-500 mt-1">Universal format</div>
                                    </button>
                                    <button
                                        onClick={() => setFormat('excel')}
                                        className={`p-4 border-2 rounded-lg transition-all ${format === 'excel'
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <FileSpreadsheet className={`mx-auto mb-2 ${format === 'excel' ? 'text-indigo-600' : 'text-slate-400'}`} size={32} />
                                        <div className="font-bold text-sm">Excel File</div>
                                        <div className="text-xs text-slate-500 mt-1">Formatted spreadsheet</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Field Selection */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Select Fields</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={selectAll}
                                    className="px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors uppercase tracking-wider"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={selectNone}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors uppercase tracking-wider"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {availableFields.map((field) => (
                                <label
                                    key={field.value}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedFields.includes(field.value)
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFields.includes(field.value)}
                                        onChange={() => toggleField(field.value)}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-bold text-slate-700">{field.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Summary */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 sticky top-8">
                        <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 mb-4">Export Summary</h3>

                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Entity Type</div>
                                <div className="text-lg font-black text-slate-900">{entityType}s</div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Format</div>
                                <div className="text-lg font-black text-slate-900">{format.toUpperCase()}</div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Selected Fields</div>
                                <div className="text-lg font-black text-indigo-600">{selectedFields.length} of {availableFields.length}</div>
                            </div>

                            <div className="pt-4 border-t border-indigo-200">
                                <button
                                    onClick={handleExport}
                                    disabled={isExporting || selectedFields.length === 0}
                                    className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isExporting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={20} />
                                            Export Now
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="text-xs text-slate-600 italic">
                                All records will be exported with the selected fields.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportDataPage;
