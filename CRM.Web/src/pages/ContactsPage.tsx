import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import type { Contact } from '../types/contact';
import { MoreVertical, Mail, Building2, Filter, ChevronRight, Search, Plus, LayoutList, Columns, X } from 'lucide-react';
import ContactDetailView from '../components/views/ContactDetailView';
import CreateModal from '../components/CreateModal';
import BulkActionsToolbar from '../components/BulkActionsToolbar';
import SavedViewsManager from '../components/SavedViewsManager';
import type { SavedView } from '../components/SavedViewsManager';
import AdvancedSearch from '../components/AdvancedSearch';
import type { SearchScope } from '../components/AdvancedSearch';
import ColumnCustomizer from '../components/ColumnCustomizer';
import type { Column } from '../components/ColumnCustomizer';

const ContactsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [activeContactId, setActiveContactId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Search State
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [activeSearchQuery, setActiveSearchQuery] = useState<string | null>(null);

    // Saved Views State
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [currentView, setCurrentView] = useState<SavedView | null>(null);

    // Column Customizer State
    const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
    const [columns, setColumns] = useState<Column[]>([
        { id: 'name', label: 'Contact Name', visible: true, order: 0 },
        { id: 'company', label: 'Company & Info', visible: true, order: 1 },
        { id: 'status', label: 'Status', visible: true, order: 2 },
        { id: 'leadSource', label: 'Lead Source', visible: true, order: 3 },
        { id: 'created', label: 'Created', visible: true, order: 4 },
        { id: 'email', label: 'Email', visible: false, order: 5 },
        { id: 'phone', label: 'Phone', visible: false, order: 6 }
    ]);

    useEffect(() => {
        fetchContacts();
        // Load saved views from localStorage mock
        const loadedViews = JSON.parse(localStorage.getItem('act_contact_views') || '[]');
        setSavedViews(loadedViews);
    }, [location.state]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            // Apply advanced search if passed from nav state
            if (location.state?.advancedSearch) {
                // In a real implementation this would call a specific search endpoint
                // For now, we fetch all and filter client side if needed, or assume backend handles it
                const response = await api.get('/contacts');
                setContacts(response.data);
            } else {
                const response = await api.get('/contacts');
                setContacts(response.data);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Selection Handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(contacts.map(c => c.id)));
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
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} contacts?`)) {
            // API call would go here
            alert(`Deleted ${selectedIds.size} contacts`);
            setSelectedIds(new Set());
        }
    };

    const handleSearch = async (query: string, scope: SearchScope) => {
        if (!scope.contacts) {
            alert('Search scope must include Contacts');
            return;
        }

        setLoading(true);
        setShowAdvancedSearch(false);
        setActiveContactId(null); // Clear selection

        try {
            const response = await api.get(`/contacts?search=${encodeURIComponent(query)}`);
            setContacts(response.data);
            setActiveSearchQuery(query);
            setCurrentView(null); // Clear any saved view since we are in search mode
        } catch (error) {
            console.error('Search failed:', error);
            alert('An error occurred while searching.');
            fetchContacts(); // Revert on error
        } finally {
            setLoading(false);
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
        localStorage.setItem('act_contact_views', JSON.stringify(updatedViews));
        setCurrentView(newView);
    };

    const handleDeleteView = (id: string) => {
        const updatedViews = savedViews.filter(v => v.id !== id);
        setSavedViews(updatedViews);
        localStorage.setItem('act_contact_views', JSON.stringify(updatedViews));
        if (currentView?.id === id) setCurrentView(null);
    };

    const handleSetDefaultView = (id: string) => {
        const updatedViews = savedViews.map(v => ({
            ...v,
            isDefault: v.id === id
        }));
        setSavedViews(updatedViews);
        localStorage.setItem('act_contact_views', JSON.stringify(updatedViews));
    };

    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

    return (
        <div className="p-6 bg-[#F8FAFC] min-h-full flex flex-col gap-6">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div className="flex-1 max-w-2xl">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Contacts</h1>
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
                <div className="flex gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="List View"
                        >
                            <LayoutList size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('detail')}
                            className={`p-1.5 rounded transition-all ${viewMode === 'detail' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Split View"
                        >
                            <Columns size={16} />
                        </button>
                    </div>
                    {activeSearchQuery && (
                        <button
                            onClick={() => {
                                setActiveSearchQuery(null);
                                fetchContacts();
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-xs font-bold text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                            title="Clear Search Results"
                        >
                            <X size={14} />
                            CLEAR "{activeSearchQuery}"
                        </button>
                    )}
                    <button
                        onClick={() => setShowAdvancedSearch(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
                    >
                        <Search size={14} />
                        ADVANCED SEARCH
                    </button>
                    <button
                        onClick={() => setShowColumnCustomizer(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Filter size={14} />
                        COLUMNS
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        <Plus size={16} />
                        NEW CONTACT
                    </button>
                </div>
            </div>

            {/* Modals */}
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
                recordType="contacts"
                onBulkEmail={() => alert('Bulk Email')}
                onBulkAddTag={() => alert('Bulk Tag')}
            />

            {/* Main Content Area */}
            {viewMode === 'list' ? (
                <>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse act-table">
                            <thead>
                                <tr>
                                    <th className="w-12 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]"
                                            onChange={handleSelectAll}
                                            checked={contacts.length > 0 && selectedIds.size === contacts.length}
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
                                ) : contacts.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.filter(c => c.visible).length + 2} className="px-6 py-12 text-center text-slate-500 italic">
                                            No contacts found.
                                        </td>
                                    </tr>
                                ) : (
                                    contacts.map((contact) => (
                                        <tr
                                            key={contact.id}
                                            className={`hover:bg-slate-50 transition-all group cursor-pointer ${selectedIds.has(contact.id) ? 'bg-indigo-50/50' : ''}`}
                                            onClick={() => navigate(`/contacts/${contact.id}`, { state: { contactIds: contacts.map(c => c.id) } })}
                                        >
                                            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]"
                                                    checked={selectedIds.has(contact.id)}
                                                    onChange={() => handleSelectRow(contact.id)}
                                                />
                                            </td>

                                            {sortedColumns.filter(c => c.visible).map(col => {
                                                if (col.id === 'name') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px] group-hover:bg-[#6366F115] group-hover:text-[#6366F1] transition-colors">
                                                                {contact.firstName[0]}{contact.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900 group-hover:text-[#6366F1] transition-colors leading-tight">
                                                                    {contact.firstName} {contact.lastName}
                                                                </div>
                                                                <div className="text-[10px] font-medium text-slate-400 uppercase">{contact.jobTitle || 'No Title'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                                if (col.id === 'company') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                                <Building2 size={12} className="text-slate-300" />
                                                                {typeof contact.company === 'string' ? contact.company : contact.company?.name || 'Private'}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                                <Mail size={12} className="text-slate-300" />
                                                                {contact.email}
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                                if (col.id === 'status') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${contact.status === 'Active'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            : 'bg-slate-50 text-slate-500 border-slate-100'
                                                            }`}>
                                                            {contact.status}
                                                        </span>
                                                    </td>
                                                );
                                                if (col.id === 'leadSource') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        <span className="text-xs font-bold text-slate-600">
                                                            {contact.leadSource || 'None'}
                                                        </span>
                                                    </td>
                                                );
                                                if (col.id === 'created') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                                            {new Date(contact.createdAt!).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                );
                                                if (col.id === 'email') return <td key={col.id} className="px-6 py-4 text-xs">{contact.email}</td>;
                                                if (col.id === 'phone') return <td key={col.id} className="px-6 py-4 text-xs">{contact.phone}</td>;
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

                    {/* Bottom Info Bar */}
                    <div className="mt-4 px-2 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <div>Contacts Count: {contacts.length}</div>
                        <div>Selected: {selectedIds.size}</div>
                        <div className="flex gap-4">
                            <span>Page 1 of 1</span>
                            <div className="flex gap-2">
                                <button className="hover:text-slate-600">Previous</button>
                                <button className="hover:text-slate-600">Next</button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex gap-6 h-[calc(100vh-180px)] overflow-hidden">
                    {/* Left Pane: Compact List */}
                    <div className="w-1/3 min-w-[320px] bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
                            <span>Records ({contacts.length})</span>
                            <div className="flex gap-2">
                                <button className="hover:text-indigo-600"><Filter size={12} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            {contacts.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => setActiveContactId(c.id)}
                                    className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-all ${activeContactId === c.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="font-bold text-slate-900 text-sm">{c.firstName} {c.lastName}</div>
                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                        <Building2 size={10} />
                                        {typeof c.company === 'string' ? c.company : c.company?.name || 'No Company'}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">{c.jobTitle}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Pane: Detail View */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
                        {activeContactId ? (
                            <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                                <ContactDetailView contactId={activeContactId} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                <Columns size={48} className="mb-4 opacity-50" />
                                <div className="text-sm font-bold uppercase tracking-widest">Select a record to view details</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Create Modal */}
            <CreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    fetchContacts();
                    // Optional: Show success toast
                }}
                initialType="Contact"
            />
        </div>
    );
};

export default ContactsPage;
