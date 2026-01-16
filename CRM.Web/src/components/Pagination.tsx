import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
    onPageChange: (page: number) => void;
    onRecordsPerPageChange: (recordsPerPage: number) => void;
}

const Pagination = ({
    currentPage,
    totalPages,
    totalRecords,
    recordsPerPage,
    onPageChange,
    onRecordsPerPageChange
}: PaginationProps) => {
    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
    const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

    const handleFirst = () => {
        if (currentPage > 1) onPageChange(1);
    };

    const handlePrevious = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const handleLast = () => {
        if (currentPage < totalPages) onPageChange(totalPages);
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            {/* Left side - Navigation */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleFirst}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="First page"
                >
                    <ChevronsLeft size={16} className="text-slate-600" />
                </button>
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Previous page"
                >
                    <ChevronLeft size={16} className="text-slate-600" />
                </button>

                {/* Page indicator */}
                <div className="px-4 py-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-sm font-bold text-slate-900">
                        {startRecord}-{endRecord}
                    </span>
                    <span className="text-sm font-bold text-slate-400 mx-1">of</span>
                    <span className="text-sm font-bold text-slate-900">{totalRecords}</span>
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Next page"
                >
                    <ChevronRight size={16} className="text-slate-600" />
                </button>
                <button
                    onClick={handleLast}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Last page"
                >
                    <ChevronsRight size={16} className="text-slate-600" />
                </button>
            </div>

            {/* Right side - Records per page */}
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Records per page</span>
                <select
                    value={recordsPerPage}
                    onChange={(e) => onRecordsPerPageChange(Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </div>
    );
};

export default Pagination;
