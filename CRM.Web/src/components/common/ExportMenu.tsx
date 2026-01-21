import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

interface ExportMenuProps {
    onExportPdf: () => Promise<void>;
    onExportExcel: () => Promise<void>;
    disabled?: boolean;
}

export default function ExportMenu({ onExportPdf, onExportExcel, disabled = false }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleExport = async (exportFn: () => Promise<void>, format: string) => {
        setIsExporting(true);
        setIsOpen(false);

        try {
            await exportFn();
            // Success toast will be shown by parent component
        } catch (error) {
            console.error(`${format} export failed:`, error);
            // Error toast will be shown by parent component
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled || isExporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Download className="w-4 h-4" />
                <span className="font-medium text-gray-700">
                    {isExporting ? 'Exporting...' : 'Export'}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                        onClick={() => handleExport(onExportPdf, 'PDF')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
                            <FileText className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">Export to PDF</div>
                            <div className="text-xs text-gray-500">Download as PDF document</div>
                        </div>
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                        onClick={() => handleExport(onExportExcel, 'Excel')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">Export to Excel</div>
                            <div className="text-xs text-gray-500">Download as Excel spreadsheet</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
