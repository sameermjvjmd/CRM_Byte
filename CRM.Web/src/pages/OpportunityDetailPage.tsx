import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
    ArrowLeft, DollarSign, TrendingUp, Calendar,
    FileText, Edit2, MoreVertical, Briefcase,
    History, CheckCircle, XCircle, Phone, Users, Mail, CheckSquare, Package, Trash2
} from 'lucide-react';
import type { Opportunity } from '../types/opportunity';
import UserFieldsTab from '../components/tabs/UserFieldsTab';
import DocumentsTab from '../components/DocumentsTab';
import CreateModal from '../components/CreateModal';
import CloseOpportunityModal from '../components/CloseOpportunityModal';
import CreateQuoteModal from '../components/CreateQuoteModal';

const OpportunityDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Overview' | 'Activities' | 'History' | 'Documents' | 'CustomFields' | 'Products'>('Overview');

    // Tab Data Stubs (would be real fetches in full implementation)
    const [activities, setActivities] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [historyItems, setHistoryItems] = useState<any[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [closeTarget, setCloseTarget] = useState<'Closed Won' | 'Closed Lost'>('Closed Won');

    useEffect(() => {
        const fetchOpportunity = async () => {
            try {
                const response = await api.get(`/opportunities/${id}`);
                setOpportunity(response.data);
            } catch (error) {
                console.error('Error fetching opportunity:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOpportunity();
    }, [id]);

    const fetchActivities = async () => {
        if (!id) return;
        try {
            const res = await api.get(`/opportunities/${id}/activities`);
            setActivities(res.data);
        } catch (err) {
            console.error('Failed to fetch activities', err);
        }
    };

    const fetchProducts = async () => {
        if (!id) return;
        try {
            const res = await api.get(`/opportunities/${id}/products`);
            setProducts(res.data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'Activities' && id) fetchActivities();
        if (activeTab === 'Products' && id) fetchProducts();
    }, [activeTab, id]);

    const handleDeleteProduct = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/opportunities/${id}/products/${productId}`);
            fetchProducts();
            // Refresh opportunity to update amount
            const res = await api.get(`/opportunities/${id}`);
            setOpportunity(res.data);
        } catch (error) {
            console.error('Error deleting product', error);
        }
    };

    if (loading) return (
        <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400 min-h-screen bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="font-bold text-sm tracking-widest uppercase">Loading Opportunity...</div>
        </div>
    );
    if (!opportunity) return <div className="p-8 text-red-500">Opportunity not found.</div>;

    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
    const formatCurrency = (val?: number) => val ? `$${val.toLocaleString()}` : '$0';

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/opportunities')} className="p-2.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">{opportunity.name}</h1>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${opportunity.stage === 'Closed Won' ? 'bg-green-50 text-green-600 border-green-200' :
                                opportunity.stage === 'Closed Lost' ? 'bg-red-50 text-red-600 border-red-200' :
                                    'bg-indigo-50 text-indigo-600 border-indigo-200'
                                }`}>
                                {opportunity.stage}
                            </span>
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {formatCurrency(opportunity.amount)} • {opportunity.probability}% Probability • Close: {formatDate(opportunity.expectedCloseDate)}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {opportunity.stage !== 'Closed Won' && opportunity.stage !== 'Closed Lost' && (
                        <>
                            <button
                                onClick={() => { setCloseTarget('Closed Won'); setIsCloseModalOpen(true); }}
                                className="px-4 py-2 bg-emerald-600 text-white rounded shadow-md text-xs font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <CheckCircle size={14} /> Won
                            </button>
                            <button
                                onClick={() => { setCloseTarget('Closed Lost'); setIsCloseModalOpen(true); }}
                                className="px-4 py-2 bg-red-600 text-white rounded shadow-md text-xs font-black uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <XCircle size={14} /> Lost
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setIsQuoteModalOpen(true)}
                        className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded shadow-sm text-xs font-black uppercase tracking-widest hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <FileText size={14} /> Create Quote
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded shadow-md text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2">
                        <Edit2 size={14} /> Edit
                    </button>
                    <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 transition-colors">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-y-auto custom-scrollbar">
                {/* Left Panel */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-100">
                                <DollarSign size={32} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <InfoRow label="Amount" value={formatCurrency(opportunity.amount)} />
                            {opportunity.actualCloseDate ? (
                                <InfoRow label="Actual Close" value={formatDate(opportunity.actualCloseDate)} />
                            ) : (
                                <InfoRow label="Expected Close" value={formatDate(opportunity.expectedCloseDate)} />
                            )}
                            <InfoRow label="Probability" value={`${opportunity.probability}%`} />
                            {opportunity.stage === 'Closed Won' && <InfoRow label="Win Reason" value={opportunity.winReason} />}
                            {opportunity.stage === 'Closed Lost' && <InfoRow label="Loss Reason" value={opportunity.lostReason} />}
                            <InfoRow label="Forecast Category" value={opportunity.forecastCategory} />
                            <InfoRow label="Owner" value={opportunity.owner} />
                        </div>

                        {opportunity.contact && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-3">Primary Contact</h4>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-bold text-slate-700">
                                    {opportunity.contact.firstName} {opportunity.contact.lastName}
                                </div>
                            </div>
                        )}
                        {opportunity.company && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-3">Company</h4>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-bold text-slate-700">
                                    {opportunity.company.name}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/50 overflow-x-auto no-scrollbar">
                            <TabItem id="Overview" icon={<Briefcase size={16} />} active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
                            <TabItem id="Products" icon={<Package size={16} />} active={activeTab === 'Products'} onClick={() => setActiveTab('Products')} />
                            <TabItem id="Activities" icon={<Calendar size={16} />} active={activeTab === 'Activities'} onClick={() => setActiveTab('Activities')} />
                            <TabItem id="History" icon={<History size={16} />} active={activeTab === 'History'} onClick={() => setActiveTab('History')} />
                            <TabItem id="Documents" icon={<FileText size={16} />} active={activeTab === 'Documents'} onClick={() => setActiveTab('Documents')} />
                            <TabItem id="CustomFields" icon={<FileText size={16} />} active={activeTab === 'CustomFields'} onClick={() => setActiveTab('CustomFields')} />
                        </div>

                        <div className="flex-1 p-0 overflow-y-auto custom-scrollbar">
                            {activeTab === 'Overview' && (
                                <div className="p-6 space-y-6">
                                    {/* Next Steps - Prominent Section */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100 p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                                                    <CheckSquare size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black uppercase text-indigo-900 tracking-widest">Next Action</h3>
                                                    <p className="text-xs text-indigo-600 font-medium">Keep the deal moving forward</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newAction = prompt('Next Action:', opportunity.nextAction || '');
                                                    if (newAction !== null) {
                                                        const newDate = prompt('Due Date (YYYY-MM-DD):', opportunity.nextActionDate ? new Date(opportunity.nextActionDate).toISOString().split('T')[0] : '');
                                                        const newOwner = prompt('Owner:', opportunity.nextActionOwner || '');

                                                        api.put(`/opportunities/${id}`, {
                                                            ...opportunity,
                                                            nextAction: newAction,
                                                            nextActionDate: newDate ? new Date(newDate).toISOString() : null,
                                                            nextActionOwner: newOwner
                                                        }).then(() => {
                                                            api.get(`/opportunities/${id}`).then(res => setOpportunity(res.data));
                                                        });
                                                    }
                                                }}
                                                className="px-4 py-2 bg-white text-indigo-600 border-2 border-indigo-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Edit2 size={14} className="inline mr-1" /> Edit
                                            </button>
                                        </div>

                                        {opportunity.nextAction ? (
                                            <div className="space-y-3">
                                                <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <p className="text-base font-bold text-slate-900 mb-2">{opportunity.nextAction}</p>
                                                            <div className="flex items-center gap-4 text-xs">
                                                                {opportunity.nextActionDate && (
                                                                    <div className={`flex items-center gap-1.5 ${new Date(opportunity.nextActionDate) < new Date()
                                                                            ? 'text-red-600 font-black'
                                                                            : 'text-slate-600 font-medium'
                                                                        }`}>
                                                                        <Calendar size={14} />
                                                                        <span>
                                                                            {new Date(opportunity.nextActionDate).toLocaleDateString()}
                                                                            {new Date(opportunity.nextActionDate) < new Date() && (
                                                                                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase">
                                                                                    OVERDUE
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {opportunity.nextActionOwner && (
                                                                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                                        <Users size={14} />
                                                                        <span>{opportunity.nextActionOwner}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {new Date(opportunity.nextActionDate || '') < new Date() && (
                                                            <div className="text-4xl">⚠️</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-lg p-6 border-2 border-dashed border-indigo-200 text-center">
                                                <p className="text-sm text-indigo-400 font-medium">No next action defined</p>
                                                <p className="text-xs text-indigo-300 mt-1">Click Edit to set the next step</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Deal Health */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Deal Health</h4>
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-2 ${opportunity.dealHealth === 'Hot' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                    opportunity.dealHealth === 'At Risk' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                        opportunity.dealHealth === 'Stalled' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                                                            'bg-green-100 text-green-700 border border-green-200'
                                                }`}>
                                                {opportunity.dealHealth === 'Hot' && '🔥'}
                                                {opportunity.dealHealth === 'At Risk' && '⚠️'}
                                                {opportunity.dealHealth === 'Stalled' && '⏸️'}
                                                {(!opportunity.dealHealth || opportunity.dealHealth === 'Healthy') && '✅'}
                                                {opportunity.dealHealth || 'Healthy'}
                                            </span>
                                        </div>
                                        {opportunity.dealScore !== undefined && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-xs mb-2">
                                                    <span className="font-medium text-slate-600">Score</span>
                                                    <span className="font-black text-slate-900">{opportunity.dealScore}/100</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${opportunity.dealScore >= 80 ? 'bg-green-500' :
                                                                opportunity.dealScore >= 60 ? 'bg-yellow-500' :
                                                                    opportunity.dealScore >= 40 ? 'bg-orange-500' :
                                                                        'bg-red-500'
                                                            }`}
                                                        style={{ width: `${opportunity.dealScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Description</h3>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {opportunity.description || "No description provided."}
                                        </p>
                                    </div>

                                    {opportunity.winLossNotes && (
                                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Closing Notes</h4>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 italic">
                                                "{opportunity.winLossNotes}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'CustomFields' && (
                                <UserFieldsTab
                                    entityId={Number(id)}
                                    entityType="Opportunity"
                                />
                            )}

                            {activeTab === 'Documents' && (
                                <DocumentsTab entityType="Opportunity" entityId={Number(id)} />
                            )}

                            {activeTab === 'Products' && (
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Line Items</h4>
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2"
                                        >
                                            <Package size={14} /> Add Product
                                        </button>
                                    </div>

                                    {products.length === 0 ? (
                                        <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-slate-300">No Products</p>
                                            <p className="text-xs text-slate-300">Add products to calculate opportunity value.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-lg border border-slate-200">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Qty</th>
                                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Price</th>
                                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Discount</th>
                                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                    {products.map((p) => (
                                                        <tr key={p.id} className="hover:bg-slate-50/50">
                                                            <td className="px-4 py-3">
                                                                <div className="font-bold text-slate-700">{p.productName}</div>
                                                                {p.productCode && <div className="text-[10px] text-slate-400">{p.productCode}</div>}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-medium text-slate-600">{p.quantity}</td>
                                                            <td className="px-4 py-3 text-right font-medium text-slate-600">{formatCurrency(p.unitPrice)}</td>
                                                            <td className="px-4 py-3 text-right font-medium text-slate-600">
                                                                {p.discount > 0 ? (
                                                                    <span className="text-red-500">
                                                                        -{p.discountType === 'Percentage' ? `${p.discount}%` : formatCurrency(p.discount)}
                                                                    </span>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(p.totalPrice)}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button onClick={() => handleDeleteProduct(p.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-slate-50 font-bold">
                                                        <td colSpan={4} className="px-4 py-3 text-right text-slate-500 uppercase tracking-widest text-[10px]">Total Value</td>
                                                        <td className="px-4 py-3 text-right text-indigo-600">
                                                            {formatCurrency(products.reduce((sum, p) => sum + p.totalPrice, 0))}
                                                        </td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Activities' && (
                                <div className="space-y-4 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Timeline</h4>
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                        >
                                            + Add Activity
                                        </button>
                                    </div>
                                    {activities.length === 0 ? (
                                        <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-slate-300">No Activities Yet</p>
                                            <p className="text-xs text-slate-300">Schedule a call or meeting to get started.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {activities.map((act) => (
                                                <div key={act.id} className="flex gap-4 p-4 rounded-lg border border-slate-100 bg-white hover:shadow-md transition-all cursor-pointer group">
                                                    <div className="p-2 h-fit bg-slate-50 rounded group-hover:bg-indigo-50 transition-all border border-slate-100">
                                                        {act.type === 'Call' ? <Phone className="text-blue-500" size={16} /> :
                                                            act.type === 'Meeting' ? <Users className="text-purple-500" size={16} /> :
                                                                act.type === 'Email' ? <Mail className="text-cyan-500" size={16} /> :
                                                                    <CheckSquare className="text-orange-500" size={16} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-black text-slate-900 text-xs uppercase tracking-tight">{act.subject}</div>
                                                        <div className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                                                            <span>{new Date(act.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                            <span>•</span>
                                                            <span className={act.isCompleted ? "text-emerald-500" : "text-amber-500"}>
                                                                {act.isCompleted ? 'Completed' : 'Pending'}
                                                            </span>
                                                        </div>
                                                        {act.outcome && <div className="mt-2 text-xs text-slate-600">{act.outcome}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'History' && (
                                <div className="p-6">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">Stage History</h4>
                                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100">
                                        {opportunity.stageHistory && opportunity.stageHistory.length > 0 ? (
                                            [...opportunity.stageHistory].sort((a, b) => new Date(b.changedAt || '').getTime() - new Date(a.changedAt || '').getTime()).map((hist, idx) => (
                                                <div key={idx} className="relative flex gap-4 items-start">
                                                    <div className="w-10 h-10 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center z-10 shrink-0">
                                                        <TrendingUp size={16} className="text-indigo-500" />
                                                    </div>
                                                    <div className="flex-1 pt-2">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="text-xs font-bold text-slate-900">
                                                                    Stage changed from <span className="text-slate-500">{hist.fromStage || 'Created'}</span> to <span className="text-indigo-600">{hist.toStage}</span>
                                                                </div>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                                    {new Date(hist.changedAt || '').toLocaleString()}
                                                                </div>
                                                            </div>
                                                            {hist.daysInPreviousStage !== undefined && hist.daysInPreviousStage > 0 && (
                                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                                                    {hist.daysInPreviousStage} Days
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-slate-400 text-xs uppercase tracking-widest">No history recorded</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    if (activeTab === 'Activities') fetchActivities();
                    if (activeTab === 'Products') {
                        fetchProducts();
                        // Also refresh main opportunity to get updated Amount
                        api.get(`/opportunities/${id}`).then(res => setOpportunity(res.data));
                    }
                    setIsCreateModalOpen(false);
                }}
                initialType={activeTab === 'Products' ? 'Product' as any : 'Activity'}
                templateData={{ opportunityId: id }}
            />

            <CloseOpportunityModal
                isOpen={isCloseModalOpen}
                onClose={() => setIsCloseModalOpen(false)}
                opportunityId={Number(id)}
                opportunityName={opportunity.name}
                targetStage={closeTarget}
                onSuccess={() => {
                    const fetchOpportunity = async () => {
                        const response = await api.get(`/opportunities/${id}`);
                        setOpportunity(response.data);
                    };
                    fetchOpportunity();
                }}
            />

            {isQuoteModalOpen && opportunity && (
                <CreateQuoteModal
                    onClose={() => setIsQuoteModalOpen(false)}
                    onSuccess={() => {
                        setIsQuoteModalOpen(false);
                        // Maybe switch to Activities tab to show new activity? Or navigate to Quotes?
                        // For now just close.
                        alert('Quote created successfully!');
                    }}
                    initialData={{
                        opportunityId: Number(id),
                        contactId: opportunity.contactId,
                        companyId: opportunity.companyId,
                        subject: `Quote for ${opportunity.name}`,
                        lineItems: products.map(p => ({
                            productId: p.productId,
                            name: p.productName,
                            quantity: p.quantity,
                            unitPrice: p.unitPrice,
                            discountPercent: p.discountType === 'Percentage' ? p.discount : 0,
                            isTaxable: true, // Default
                            taxRate: 0 // Default
                        }))
                    }}
                />
            )}
        </div>
    );
};

const InfoRow = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-slate-700 text-right truncate max-w-[60%]">{value || 'N/A'}</span>
    </div>
);

const TabItem = ({ id, icon, active, onClick }: { id: string, icon: any, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
    >
        {icon}
        {id}
        {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
    </button>
);

export default OpportunityDetailPage;
