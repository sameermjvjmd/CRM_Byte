import React, { useState, useEffect } from 'react';
import { Mail, Plus, Clock, Filter, Trash2, Edit, Play, Pause, BarChart2 } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

interface Campaign {
    id: number;
    name: string;
    description?: string;
    type: string;
    status: string;
    subject?: string;
    sentCount: number;
    openCount: number;
    uniqueOpenCount: number;
    clickCount: number;
    openRate: number;
    clickRate: number;
    createdAt: string;
    marketingListName?: string;
}

const CampaignsList: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create form state
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        description: '',
        type: 'Email',
        subject: '',
        marketingListId: ''
    });

    const [lists, setLists] = useState<any[]>([]);

    useEffect(() => {
        fetchCampaigns();
        fetchLists();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await api.get('/marketing/campaigns');
            setCampaigns(response.data);
        } catch (error) {
            console.error('Failed to load campaigns:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const fetchLists = async () => {
        try {
            const response = await api.get('/marketing/lists');
            setLists(response.data);
        } catch (error) {
            console.error('Failed to load lists:', error);
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/marketing/campaigns', {
                ...newCampaign,
                marketingListId: newCampaign.marketingListId ? parseInt(newCampaign.marketingListId) : null
            });
            toast.success('Campaign created successfully');
            setShowCreateModal(false);
            setNewCampaign({ name: '', description: '', type: 'Email', subject: '', marketingListId: '' });
            fetchCampaigns();
        } catch (error) {
            console.error('Failed to create campaign:', error);
            toast.error('Failed to create campaign');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await api.delete(`/marketing/campaigns/${id}`);
            toast.success('Campaign deleted');
            setCampaigns(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    const filteredCampaigns = campaigns.filter(c => {
        if (statusFilter === 'All') return true;
        return c.status === statusFilter;
    });

    if (loading) return <div className="p-8 text-center text-slate-500">Loading campaigns...</div>;

    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all";
    const labelClass = "block text-xs font-bold text-slate-700 uppercase mb-1";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto max-w-full">
                    <button onClick={() => setStatusFilter('All')} className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${statusFilter === 'All' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
                    <button onClick={() => setStatusFilter('Draft')} className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${statusFilter === 'Draft' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Drafts</button>
                    <button onClick={() => setStatusFilter('Active')} className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${statusFilter === 'Active' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Active</button>
                    <button onClick={() => setStatusFilter('Sent')} className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${statusFilter === 'Sent' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Sent</button>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                    <Plus size={18} /> New Campaign
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                    {filteredCampaigns.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic">No campaigns found matching your filter.</div>
                    ) : (
                        filteredCampaigns.map(camp => (
                            <div key={camp.id} className="p-6 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                <div className="flex gap-4 items-start">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${camp.status === 'Sent' ? 'bg-emerald-50 text-emerald-600' :
                                            camp.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-slate-900 text-lg hover:text-indigo-600 cursor-pointer transition-colors">{camp.name}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${camp.status === 'Sent' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    camp.status === 'Active' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        camp.status === 'Draft' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                                            'bg-purple-50 text-purple-600 border-purple-100'
                                                }`}>
                                                {camp.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1 max-w-md">{camp.subject || 'No subject line set'}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(camp.createdAt).toLocaleDateString()}</span>
                                            {camp.marketingListName && <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">List: {camp.marketingListName}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 sm:gap-8 self-end sm:self-center">
                                    {camp.status !== 'Draft' && (
                                        <>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-slate-900">{camp.sentCount}</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold">Sent</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-slate-900">{camp.uniqueOpenCount}</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold">Opens</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-sm font-bold ${(camp.openRate || 0) > 20 ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                    {(camp.openRate || 0).toFixed(1)}%
                                                </div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold">Rate</div>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors" title="Edit">
                                            <Edit size={18} />
                                        </button>
                                        {camp.status === 'Draft' && (
                                            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors" title="Start">
                                                <Play size={18} />
                                            </button>
                                        )}
                                        {camp.status === 'Active' && (
                                            <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors" title="Pause">
                                                <Pause size={18} />
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(camp.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                            <h3 className="font-bold text-lg text-slate-800">New Campaign</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                            <div>
                                <label className={labelClass}>Campaign Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    placeholder="e.g. Summer Sale Announcement"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Subject Line</label>
                                <input
                                    type="text"
                                    value={newCampaign.subject}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                                    placeholder="e.g. Don't miss out on these deals!"
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Type</label>
                                    <select
                                        value={newCampaign.type}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option value="Email">Email</option>
                                        <option value="SMS">SMS</option>
                                        <option value="Social">Social</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Target List</label>
                                    <select
                                        value={newCampaign.marketingListId}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, marketingListId: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option value="">Select a list...</option>
                                        {lists.map(list => (
                                            <option key={list.id} value={list.id}>{list.name} ({list.subscribedCount})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea
                                    value={newCampaign.description}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                                    placeholder="Internal notes about this campaign..."
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignsList;
