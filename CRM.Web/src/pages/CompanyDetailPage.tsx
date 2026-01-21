import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
    ArrowLeft, Building2, Globe, Mail, Phone, Users, History,
    Calendar, Briefcase, Plus, FileText, Edit2,
    MapPin, MoreVertical, Search, DollarSign, TrendingUp, Building, Link2
} from 'lucide-react';
import type { Contact } from '../types/contact';
import type { Opportunity } from '../types/opportunity';
import type { Company } from '../types/company';
import DocumentsTab from '../components/DocumentsTab';
import CreateModal from '../components/CreateModal';
import EditCompanyModal from '../components/modals/EditCompanyModal'; // Import
import UserFieldsTab from '../components/tabs/UserFieldsTab';

// ... (interfaces remain same)

interface Activity {
    id: number;
    subject: string;
    type: string;
    startTime: string;
    endTime: string;
    isCompleted: boolean;
    priority?: string;
}

interface HistoryItem {
    id: number;
    type: string;
    regarding: string;
    date: string;
    durationMinutes: number;
    details?: string;
}

const CompanyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Overview' | 'Contacts' | 'Activities' | 'History' | 'Opportunities' | 'Documents' | 'Subsidiaries' | 'CustomFields'>('Overview');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'Activity' | 'Note' | 'Contact' | 'Company' | 'Opportunity' | 'Group'>('Activity');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Tab-specific data
    const [activities, setActivities] = useState<Activity[]>([]);
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [subsidiaries, setSubsidiaries] = useState<Company[]>([]);
    const [tabLoading, setTabLoading] = useState(false);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await api.get(`/companies/${id}`);
                setCompany(response.data);
                setContacts(response.data.contacts || []);
                setSubsidiaries(response.data.subsidiaries || []);
            } catch (error) {
                console.error('Error fetching company:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [id]);

    // Fetch tab-specific data when tab changes
    useEffect(() => {
        const fetchTabData = async () => {
            if (!id) return;
            setTabLoading(true);
            try {
                if (activeTab === 'Activities') {
                    const res = await api.get(`/companies/${id}/activities`);
                    setActivities(res.data);
                } else if (activeTab === 'History') {
                    const res = await api.get(`/companies/${id}/history`);
                    setHistoryItems(res.data);
                } else if (activeTab === 'Opportunities') {
                    const res = await api.get(`/companies/${id}/opportunities`);
                    setOpportunities(res.data);
                } else if (activeTab === 'Contacts') {
                    const res = await api.get(`/companies/${id}/contacts`);
                    setContacts(res.data);
                } else if (activeTab === 'Subsidiaries') {
                    const res = await api.get(`/companies/${id}/subsidiaries`);
                    setSubsidiaries(res.data);
                }
            } catch (error) {
                console.error(`Error fetching ${activeTab}:`, error);
            } finally {
                setTabLoading(false);
            }
        };
        fetchTabData();
    }, [activeTab, id]);

    if (loading) return (
        <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400 min-h-screen bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="font-bold text-sm tracking-widest uppercase">Loading Company Record...</div>
        </div>
    );
    if (!company) return <div className="p-8 text-red-500">Company not found.</div>;

    const formatCurrency = (value?: number) => value ? `$${value.toLocaleString()}` : 'Not specified';
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
    const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Context Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/companies')} className="p-2.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">{company.name}</h1>
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black uppercase tracking-widest">
                                    {company.industry || 'General'}
                                </span>
                                {company.parentCompany && (
                                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Link2 size={10} /> Subsidiary
                                    </span>
                                )}
                            </div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {company.city || 'HQ'} • {contacts.length} Contacts • {opportunities.length || company.opportunities?.length || 0} Opportunities
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setModalType('Contact');
                            setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded border border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Add Contact
                    </button>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded shadow-md text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Edit2 size={14} />
                        Edit Company
                    </button>
                    <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 transition-colors">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-y-auto custom-scrollbar">
                {/* Left Info Panel */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <div className="flex flex-col items-center mb-8">
                            {company.logoUrl ? (
                                <img src={company.logoUrl} alt={company.name} className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-inner mb-4" />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl font-black mb-4 shadow-inner border border-indigo-100">
                                    <Building2 size={40} />
                                </div>
                            )}
                            <h2 className="text-lg font-black text-slate-900 text-center">{company.name}</h2>
                            <a href={company.website} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-500 hover:underline uppercase tracking-widest mt-1">
                                {company.website || 'No Website'}
                            </a>
                        </div>

                        <div className="space-y-2">
                            <InfoRow icon={<Phone size={14} />} label="Main Phone" value={company.phone} />
                            <InfoRow icon={<Mail size={14} />} label="Email" value={company.email} />
                            <InfoRow icon={<Globe size={14} />} label="Website" value={company.website} />
                            <InfoRow icon={<MapPin size={14} />} label="Address" value={[company.address, company.city, company.state, company.country].filter(Boolean).join(', ')} />
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h4 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-3">Business Metrics</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <MetricCard icon={<DollarSign size={16} />} label="Revenue" value={formatCurrency(company.annualRevenue)} />
                                <MetricCard icon={<Users size={16} />} label="Employees" value={company.employeeCount?.toLocaleString() || 'N/A'} />
                                <MetricCard icon={<TrendingUp size={16} />} label="SIC Code" value={company.sicCode || 'N/A'} />
                                <MetricCard icon={<Building size={16} />} label="Type" value={company.companyType || 'N/A'} />
                            </div>
                        </div>

                        {company.parentCompany && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-3">Parent Company</h4>
                                <button
                                    onClick={() => navigate(`/companies/${company.parentCompanyId}`)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
                                >
                                    <Building2 size={20} className="text-slate-400 group-hover:text-indigo-600" />
                                    <span className="font-bold text-slate-700 group-hover:text-indigo-600">{company.parentCompany.name}</span>
                                </button>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h4 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-3">Description</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                {company.description || "No company description available."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/50 overflow-x-auto no-scrollbar">
                            <TabItem id="Overview" icon={<Building2 size={16} />} active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
                            <TabItem id="Contacts" icon={<Users size={16} />} active={activeTab === 'Contacts'} onClick={() => setActiveTab('Contacts')} count={contacts.length} />
                            <TabItem id="Opportunities" icon={<Briefcase size={16} />} active={activeTab === 'Opportunities'} onClick={() => setActiveTab('Opportunities')} />
                            <TabItem id="Activities" icon={<Calendar size={16} />} active={activeTab === 'Activities'} onClick={() => setActiveTab('Activities')} />
                            <TabItem id="History" icon={<History size={16} />} active={activeTab === 'History'} onClick={() => setActiveTab('History')} />
                            <TabItem id="Documents" icon={<FileText size={16} />} active={activeTab === 'Documents'} onClick={() => setActiveTab('Documents')} />
                            <TabItem id="CustomFields" icon={<FileText size={16} />} active={activeTab === 'CustomFields'} onClick={() => setActiveTab('CustomFields')} />
                            {(subsidiaries.length > 0 || company.parentCompanyId) && (
                                <TabItem id="Subsidiaries" icon={<Building size={16} />} active={activeTab === 'Subsidiaries'} onClick={() => setActiveTab('Subsidiaries')} count={subsidiaries.length} />
                            )}
                        </div>

                        <div className="flex-1 p-0 overflow-y-auto custom-scrollbar">
                            {tabLoading ? (
                                <div className="p-12 flex justify-center">
                                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'Overview' && (
                                        <div className="p-6 space-y-6">
                                            <div className="grid grid-cols-3 gap-4">
                                                <StatCard label="Total Contacts" value={contacts.length} icon={<Users size={20} />} color="blue" />
                                                <StatCard label="Total Opportunities" value={opportunities.length || company.opportunities?.length || 0} icon={<Briefcase size={20} />} color="green" />
                                                <StatCard label="Subsidiaries" value={subsidiaries.length} icon={<Building size={20} />} color="purple" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Industry Classification</h4>
                                                    <div className="space-y-2">
                                                        <InfoRow icon={<Building size={14} />} label="Industry" value={company.industry} />
                                                        <InfoRow icon={<TrendingUp size={14} />} label="SIC Code" value={company.sicCode} />
                                                        <InfoRow icon={<TrendingUp size={14} />} label="NAICS Code" value={company.naicsCode} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Financial Info</h4>
                                                    <div className="space-y-2">
                                                        <InfoRow icon={<DollarSign size={14} />} label="Annual Revenue" value={formatCurrency(company.annualRevenue)} />
                                                        <InfoRow icon={<TrendingUp size={14} />} label="Ticker Symbol" value={company.tickerSymbol} />
                                                        <InfoRow icon={<Building size={14} />} label="Stock Exchange" value={company.stockExchange} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Contacts' && (
                                        <div className="flex flex-col h-full">
                                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                                <div className="relative group w-64">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={14} />
                                                    <input
                                                        type="text"
                                                        placeholder="SEARCH CONTACTS..."
                                                        className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 uppercase tracking-widest transition-all"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => { setModalType('Contact'); setIsModalOpen(true); }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                                                >
                                                    <Plus size={14} /> Add Contact
                                                </button>
                                            </div>
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {contacts.length > 0 ? contacts.map((contact: Contact) => (
                                                    <div key={contact.id} onClick={() => navigate(`/contacts/${contact.id}`)} className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group">
                                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                            {contact.firstName[0]}{contact.lastName[0]}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">{contact.firstName} {contact.lastName}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{contact.jobTitle || 'No Title'}</div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="col-span-2 py-12 text-center text-slate-400 italic">No contacts linked to this company.</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Opportunities' && (
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Pipeline Deals</h4>
                                                <button
                                                    onClick={() => { setModalType('Opportunity'); setIsModalOpen(true); }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                                                >
                                                    <Plus size={14} /> Add Opportunity
                                                </button>
                                            </div>
                                            {opportunities.length > 0 ? opportunities.map((op: Opportunity) => (
                                                <div key={op.id} className="flex items-center justify-between p-5 rounded-lg border border-slate-100 bg-white hover:shadow-lg transition-all">
                                                    <div>
                                                        <div className="font-black text-slate-900 text-sm">{op.name}</div>
                                                        <div className="text-[10px] font-black text-indigo-400 mt-1 uppercase tracking-[0.1em]">{op.stage} • {op.probability}%</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-emerald-600 text-lg">${op.amount?.toLocaleString() || 0}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Close: {formatDate(op.expectedCloseDate)}</div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="py-12 text-center text-slate-400 italic">No opportunities for this company.</div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'Activities' && (
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Recent Activities</h4>
                                                <button
                                                    onClick={() => { setModalType('Activity'); setIsModalOpen(true); }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                                                >
                                                    <Plus size={14} /> Add Activity
                                                </button>
                                            </div>
                                            {activities.length > 0 ? activities.map((activity) => (
                                                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-white hover:shadow-md transition-all">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.isCompleted ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-slate-900 text-sm">{activity.subject}</span>
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${activity.isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                {activity.isCompleted ? 'Completed' : activity.type}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">{formatDate(activity.startTime)} at {formatTime(activity.startTime)}</div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="py-12 text-center text-slate-400 italic">No activities found for contacts at this company.</div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'History' && (
                                        <div className="p-6 space-y-4">
                                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">History Log</h4>
                                            {historyItems.length > 0 ? historyItems.map((item) => (
                                                <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-white hover:shadow-md transition-all">
                                                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                        <History size={18} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-slate-900 text-sm">{item.regarding}</span>
                                                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-600 text-[9px] font-black uppercase">{item.type}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">{formatDate(item.date)} • {item.durationMinutes} min</div>
                                                        {item.details && <p className="text-xs text-slate-400 mt-2">{item.details}</p>}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="py-12 text-center text-slate-400 italic">No history found for contacts at this company.</div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'Documents' && (
                                        <DocumentsTab entityType="Company" entityId={Number(id)} />
                                    )}

                                    {activeTab === 'CustomFields' && (
                                        <UserFieldsTab
                                            entityId={Number(id)}
                                            entityType="Company"
                                        />
                                    )}

                                    {activeTab === 'Subsidiaries' && (
                                        <div className="p-6 space-y-4">
                                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Subsidiary Companies</h4>
                                            {subsidiaries.length > 0 ? subsidiaries.map((sub) => (
                                                <div
                                                    key={sub.id}
                                                    onClick={() => navigate(`/companies/${sub.id}`)}
                                                    className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                                                >
                                                    <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                        <Building size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-black text-slate-900 group-hover:text-purple-600 transition-colors">{sub.name}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sub.industry || 'No Industry'} • {sub.city || 'Unknown Location'}</div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="py-12 text-center text-slate-400 italic">No subsidiary companies.</div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    // Trigger refetch of current tab
                    if (activeTab === 'Contacts') {
                        api.get(`/companies/${id}/contacts`).then(res => setContacts(res.data));
                    }
                }}
                initialType={modalType}
            />

            {company && (
                <EditCompanyModal
                    isOpen={isEditModalOpen}
                    company={company}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        api.get(`/companies/${id}`).then(res => setCompany(res.data));
                    }}
                />
            )}
        </div>
    );
};

const InfoRow = ({ icon, label, value }: { icon: any, label: string, value?: string }) => (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 group">
        <div className="text-slate-300 group-hover:text-indigo-600 transition-colors">{icon}</div>
        <div className="flex-1 min-w-0">
            <div className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em]">{label}</div>
            <div className="text-xs font-bold text-slate-700 truncate mt-0.5">{value || 'N/A'}</div>
        </div>
    </div>
);

const MetricCard = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
        <div className="flex items-center gap-2 text-slate-400 mb-1">{icon}<span className="text-[9px] font-black uppercase tracking-wider">{label}</span></div>
        <div className="text-sm font-black text-slate-900">{value}</div>
    </div>
);

const StatCard = ({ label, value, icon, color }: { label: string, value: number, icon: any, color: 'blue' | 'green' | 'purple' }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100'
    };
    return (
        <div className={`p-4 rounded-xl border ${colors[color]}`}>
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[10px] font-black uppercase tracking-wider">{label}</span></div>
            <div className="text-2xl font-black">{value}</div>
        </div>
    );
};

const TabItem = ({ id, icon, active, onClick, count }: { id: string, icon: any, active: boolean, onClick: () => void, count?: number }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
        {icon}
        {id}
        {count !== undefined && count > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
        )}
        {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
    </button>
);

export default CompanyDetailPage;
