import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import type { Company } from '../types/company';
import { Building2, Globe, MapPin, Plus, MoreVertical, Filter, ChevronRight, Search, LayoutList, LayoutGrid } from 'lucide-react';
import CreateModal from '../components/CreateModal';
import BulkActionsToolbar from '../components/BulkActionsToolbar';
import SavedViewsManager from '../components/SavedViewsManager';
import type { SavedView } from '../components/SavedViewsManager';
import AdvancedSearch from '../components/AdvancedSearch';
import type { SearchScope } from '../components/AdvancedSearch';
import ColumnCustomizer from '../components/ColumnCustomizer';
import type { Column } from '../components/ColumnCustomizer';
import ExportMenu from '../components/common/ExportMenu';
import { exportToPdf, exportToExcel } from '../utils/exportUtils';
import { toast } from 'react-hot-toast';

const CompaniesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(
        (localStorage.getItem('act_company_view_mode') as any) || 'list'
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Search State
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    // Saved Views State
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [currentView, setCurrentView] = useState<SavedView | null>(null);

    // Column Customizer State
    const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
    const [columns, setColumns] = useState<Column[]>([
        { id: 'name', label: 'Company Name', visible: true, order: 0 },
        { id: 'industry', label: 'Industry & Sector', visible: true, order: 1 },
        { id: 'location', label: 'Location', visible: true, order: 2 },
        { id: 'web', label: 'Web Presence', visible: true, order: 3 },
        { id: 'created', label: 'Created', visible: true, order: 4 },
        { id: 'ticker', label: 'Ticker Symbol', visible: false, order: 5 },
        { id: 'revenue', label: 'Revenue', visible: false, order: 6 }
    ]);

    useEffect(() => {
        fetchCompanies();
        const loadedViews = JSON.parse(localStorage.getItem('act_company_views') || '[]');
        setSavedViews(loadedViews);
    }, [location.state]);

    useEffect(() => {
        localStorage.setItem('act_company_view_mode', viewMode);
    }, [viewMode]);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            if (location.state?.lookupActive && location.state?.lookupResults) {
                setCompanies(location.state.lookupResults);
            } else {
                const response = await api.get('/companies');
                setCompanies(response.data);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    // Selection Handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(companies.map(c => c.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // Feature Handlers
    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} companies?`)) {
            alert(`Deleted ${selectedIds.size} companies`);
            setSelectedIds(new Set());
        }
    };

    const handleSearch = (query: string, scope: SearchScope) => {
        console.log('Search:', query, scope);
        setShowAdvancedSearch(false);
    };

    // Export Handlers
    const handleExportPdf = async () => {
        try {
            await exportToPdf('/reports/export/companies/pdf', 'companies_report');
            toast.success('Companies exported to PDF successfully!');
        } catch (error) {
            toast.error('Failed to export companies to PDF');
            console.error('PDF export error:', error);
        }
    };

    const handleExportExcel = async () => {
        try {
            await exportToExcel('/reports/export/companies/excel', 'companies_report');
            toast.success('Companies exported to Excel successfully!');
        } catch (error) {
            toast.error('Failed to export companies to Excel');
            console.error('Excel export error:', error);
        }
    };

    // Saved Views Logic
    const handleSaveView = (name: string, filters: any[], sortBy: string, isDefault: boolean) => {
        const newView: SavedView = {
            id: Date.now().toString(),
            name,
            filters,
            sortBy,
            isDefault,
            createdAt: new Date().toISOString()
        };
        const updatedViews = [...savedViews, newView];
        setSavedViews(updatedViews);
        localStorage.setItem('act_company_views', JSON.stringify(updatedViews));
        setCurrentView(newView);
    };

    const handleDeleteView = (id: string) => {
        const updatedViews = savedViews.filter(v => v.id !== id);
        setSavedViews(updatedViews);
        localStorage.setItem('act_company_views', JSON.stringify(updatedViews));
        if (currentView?.id === id) setCurrentView(null);
    };

    const handleSetDefaultView = (id: string) => {
        const updatedViews = savedViews.map(v => ({
            ...v,
            isDefault: v.id === id
        }));
        setSavedViews(updatedViews);
        localStorage.setItem('act_company_views', JSON.stringify(updatedViews));
    };

    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

    return (
        <div className="p-6 bg-[#F8FAFC] min-h-full flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div className="flex-1 max-w-2xl">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Companies</h1>
                    <SavedViewsManager
                        views={savedViews}
                        onSelectView={setCurrentView}
                        onSaveView={handleSaveView}
                        onDeleteView={handleDeleteView}
                        onSetDefault={handleSetDefaultView}
                        currentFilters={[]}
                        currentSort="Name"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="List View"
                        >
                            <LayoutList size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Grid View (Cards)"
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowAdvancedSearch(true)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
                    >
                        <Search size={14} />
                        SEARCH
                    </button>
                    <button
                        onClick={() => setShowColumnCustomizer(true)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Filter size={14} />
                        COLUMNS
                    </button>
                    <ExportMenu
                        onExportPdf={handleExportPdf}
                        onExportExcel={handleExportExcel}
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Add Company
                    </button>
                </div>
            </div>

            {/* Modals & Toolbars */}
            <AdvancedSearch
                isOpen={showAdvancedSearch}
                onSearch={handleSearch}
                onClose={() => setShowAdvancedSearch(false)}
            />

            <ColumnCustomizer
                isOpen={showColumnCustomizer}
                columns={columns}
                onColumnsChange={setColumns}
                onClose={() => setShowColumnCustomizer(false)}
            />

            <BulkActionsToolbar
                selectedCount={selectedIds.size}
                onClearSelection={() => setSelectedIds(new Set())}
                onBulkDelete={handleBulkDelete}
                recordType="companies"
                onBulkAddTag={() => alert('Bulk Tag')}
                onBulkArchive={() => alert('Bulk Archive')}
            />

            {viewMode === 'list' ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse act-table">
                        <thead>
                            <tr>
                                <th className="w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                        onChange={handleSelectAll}
                                        checked={companies.length > 0 && selectedIds.size === companies.length}
                                    />
                                </th>
                                {sortedColumns.filter(c => c.visible).map(col => (
                                    <th key={col.id}>{col.label}</th>
                                ))}
                                <th className="w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={columns.filter(c => c.visible).length + 2} className="px-6 py-4 bg-white h-12"></td>
                                    </tr>
                                ))
                            ) : companies.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.filter(c => c.visible).length + 2} className="px-6 py-12 text-center text-slate-500 italic">No companies found.</td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <tr
                                        key={company.id}
                                        className={`hover:bg-slate-50 transition-all group cursor-pointer ${selectedIds.has(company.id) ? 'bg-indigo-50/50' : ''}`}
                                        onClick={() => navigate(`/companies/${company.id}`)}
                                    >
                                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                                checked={selectedIds.has(company.id)}
                                                onChange={() => handleSelectRow(company.id)}
                                            />
                                        </td>

                                        {sortedColumns.filter(c => c.visible).map(col => {
                                            if (col.id === 'name') return (
                                                <td key={col.id} className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                            <Building2 size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{company.name}</div>
                                                            <div className="text-[10px] font-medium text-slate-400 uppercase">{company.tickerSymbol || 'Private'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                            if (col.id === 'industry') return (
                                                <td key={col.id} className="px-6 py-4">
                                                    <span className="text-xs font-bold text-slate-600 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                                                        {company.industry || 'Unclassified'}
                                                    </span>
                                                </td>
                                            );
                                            if (col.id === 'location') return (
                                                <td key={col.id} className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <MapPin size={12} className="text-slate-300" />
                                                        {company.city ? `${company.city}, ${company.country}` : 'Unknown'}
                                                    </div>
                                                </td>
                                            );
                                            if (col.id === 'web') return (
                                                <td key={col.id} className="px-6 py-4">
                                                    {company.website ? (
                                                        <a href={company.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline">
                                                            <Globe size={12} />
                                                            Visit Site
                                                        </a>
                                                    ) : <span className="text-xs text-slate-300">No Website</span>}
                                                </td>
                                            );
                                            if (col.id === 'created') return (
                                                <td key={col.id} className="px-6 py-4">
                                                    <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                                        {new Date(company.createdAt!).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </td>
                                            );
                                            if (col.id === 'ticker') return <td key={col.id} className="px-6 py-4 text-xs">{company.tickerSymbol}</td>;
                                            if (col.id === 'revenue') return <td key={col.id} className="px-6 py-4 text-xs">{company.annualRevenue}</td>;
                                            return <td key={col.id}></td>;
                                        })}

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <MoreVertical size={14} />
                                                </button>
                                                <ChevronRight size={14} className="text-slate-300" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar p-1">
                    {companies.map(company => (
                        <div
                            key={company.id}
                            onClick={() => navigate(`/companies/${company.id}`)}
                            className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col relative ${selectedIds.has(company.id) ? 'ring-2 ring-indigo-500 bg-indigo-50/10' : ''}`}
                        >
                            <div className="absolute top-4 right-4 z-10" onClick={e => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]"
                                    checked={selectedIds.has(company.id)}
                                    onChange={() => handleSelectRow(company.id)}
                                />
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Building2 size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate text-base group-hover:text-indigo-600 transition-colors">
                                        {company.name}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide truncate">
                                        {company.tickerSymbol || 'Private'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4 flex-1">
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <MapPin size={12} className="text-slate-400 shrink-0" />
                                    <span className="truncate font-medium">{company.city ? `${company.city}, ${company.country}` : 'Unknown Location'}</span>
                                </div>
                                {company.website && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <Globe size={12} className="text-slate-400 shrink-0" />
                                        <a href={company.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="truncate hover:text-indigo-600 hover:underline">{company.website}</a>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
                                    {company.industry || 'Unclassified'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 px-2 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <div>Company Records: {companies.length}</div>
                <div>Selected: {selectedIds.size}</div>
                <div className="flex gap-4">
                    <span>Page 1 of 1</span>
                    <div className="flex gap-2">
                        <button className="hover:text-slate-600">Previous</button>
                        <button className="hover:text-slate-600">Next</button>
                    </div>
                </div>
            </div>

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchCompanies();
                }}
            />
        </div>
    );
};

export default CompaniesPage;
