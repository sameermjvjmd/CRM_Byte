import { useState, useEffect } from 'react';
import api from '../api/api';
import { Mail, Send, Eye, Plus, BarChart3, Clock, LayoutTemplate, Globe, X, Users, ListPlus, UserPlus } from 'lucide-react';

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
    marketingListId?: number;
    marketingListName?: string;
}

interface MarketingList {
    id: number;
    name: string;
    description?: string;
    type: string;
    status: string;
    memberCount: number;
    subscribedCount: number;
    createdAt: string;
}

interface Stats {
    totalCampaigns: number;
    totalLists: number;
    totalSent: number;
    totalOpened: number;
    avgOpenRate: number;
    avgClickRate: number;
}

const MarketingPage = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [lists, setLists] = useState<MarketingList[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'Dashboard' | 'Lists' | 'Templates' | 'LandingPages'>('Dashboard');

    // Modal states
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [showListModal, setShowListModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [selectedListId, setSelectedListId] = useState<number | null>(null);

    // Form states
    const [campaignForm, setCampaignForm] = useState({
        name: '',
        description: '',
        type: 'Email',
        subject: '',
        marketingListId: ''
    });
    const [listForm, setListForm] = useState({
        name: '',
        description: '',
        type: 'Static'
    });
    const [memberForm, setMemberForm] = useState({
        email: '',
        firstName: '',
        lastName: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [campRes, statsRes, listsRes] = await Promise.all([
                api.get('/marketing/campaigns'),
                api.get('/marketing/stats'),
                api.get('/marketing/lists')
            ]);
            setCampaigns(campRes.data);
            setStats(statsRes.data);
            setLists(listsRes.data);
        } catch (error) {
            console.error('Error fetching marketing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/marketing/campaigns', {
                ...campaignForm,
                marketingListId: campaignForm.marketingListId ? parseInt(campaignForm.marketingListId) : null
            });
            setShowCampaignModal(false);
            setCampaignForm({ name: '', description: '', type: 'Email', subject: '', marketingListId: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating campaign:', error);
        }
    };

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/marketing/lists', listForm);
            setShowListModal(false);
            setListForm({ name: '', description: '', type: 'Static' });
            fetchData();
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedListId) return;
        try {
            await api.post(`/marketing/lists/${selectedListId}/members`, memberForm);
            setShowMemberModal(false);
            setMemberForm({ email: '', firstName: '', lastName: '' });
            fetchData();
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading marketing campaigns...</div>;

    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm";
    const labelClass = "block text-xs font-bold text-slate-700 uppercase mb-1";

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketing Automation</h1>
                    <p className="text-slate-500 text-sm">Create, send, and track automated email campaigns.</p>
                </div>
                <button
                    onClick={() => setShowCampaignModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
                >
                    <Plus size={18} />
                    New Campaign
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-start mb-8">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setActiveView('Dashboard')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'Dashboard' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Dashboard</button>
                    <button onClick={() => setActiveView('Lists')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'Lists' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Users size={14} /> Lists
                    </button>
                    <button onClick={() => setActiveView('Templates')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'Templates' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Templates</button>
                    <button onClick={() => setActiveView('LandingPages')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'LandingPages' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Landing Pages</button>
                </div>
            </div>

            {/* Dashboard View */}
            {activeView === 'Dashboard' && (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
                                <Send size={16} /> Total Sent
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{stats?.totalSent || 0}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
                                <Eye size={16} /> Avg. Open Rate
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{(stats?.avgOpenRate || 0).toFixed(1)}%</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
                                <BarChart3 size={16} /> Campaigns
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{stats?.totalCampaigns || 0}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">
                                <Users size={16} /> Total Lists
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{stats?.totalLists || 0}</div>
                        </div>
                    </div>

                    {/* Recent Campaigns */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Recent Campaigns</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {campaigns.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 italic">No campaigns found. Start your first one!</div>
                            ) : (
                                campaigns.map(camp => (
                                    <div key={camp.id} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <Mail size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{camp.name}</h4>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                    <Clock size={12} /> {new Date(camp.createdAt).toLocaleDateString()} • {camp.type}
                                                    {camp.marketingListName && <span className="ml-2 text-indigo-600">→ {camp.marketingListName}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-8 items-center">
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-slate-900">{camp.sentCount}</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Sent</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-slate-900">{camp.uniqueOpenCount || camp.openCount}</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Opens</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-emerald-600">{(camp.openRate || 0).toFixed(1)}%</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Rate</div>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase ${camp.status === 'Sent' || camp.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                        camp.status === 'Active' ? 'bg-blue-50 text-blue-600' :
                                                            camp.status === 'Scheduled' ? 'bg-purple-50 text-purple-600' :
                                                                'bg-slate-50 text-slate-600'
                                                    }`}>
                                                    {camp.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Lists View */}
            {activeView === 'Lists' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">Marketing Lists</h2>
                        <button
                            onClick={() => setShowListModal(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all"
                        >
                            <ListPlus size={18} /> New List
                        </button>
                    </div>

                    {lists.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                            <Users size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500">No marketing lists yet. Create one to start collecting subscribers.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lists.map(list => (
                                <div key={list.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <Users size={24} />
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${list.type === 'Dynamic' ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-600'
                                            }`}>{list.type}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">{list.name}</h3>
                                    <p className="text-xs text-slate-500 mb-4">{list.description || 'No description'}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div>
                                            <div className="text-2xl font-bold text-slate-900">{list.subscribedCount || list.memberCount}</div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold">Subscribers</div>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedListId(list.id); setShowMemberModal(true); }}
                                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                                        >
                                            <UserPlus size={16} /> Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Templates View */}
            {activeView === 'Templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                            <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-indigo-300">
                                    <LayoutTemplate size={48} />
                                </div>
                                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-colors">Preview</button>
                                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-colors">Use</button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 mb-1">Newsletter Template {i}</h3>
                                <p className="text-xs text-slate-500">Professional {i % 2 === 0 ? 'Dark' : 'Light'} Theme</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Landing Pages View */}
            {activeView === 'LandingPages' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Webinar Registration Page</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-xs text-slate-500">Published • Last edit 2 days ago</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 text-center">
                            <div>
                                <div className="text-lg font-bold text-slate-900">1,240</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Visits</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-emerald-600">18%</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Conv.</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 opacity-75">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Q1 Product Launch</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    <span className="text-xs text-slate-500">Draft • Last edit 5 mins ago</span>
                                </div>
                            </div>
                        </div>
                        <button className="text-sm font-bold text-indigo-600">Edit Page</button>
                    </div>
                </div>
            )}

            {/* New Campaign Modal */}
            {showCampaignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                            <h3 className="font-bold text-lg text-slate-800">New Campaign</h3>
                            <button onClick={() => setShowCampaignModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                            <div>
                                <label className={labelClass}>Campaign Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={campaignForm.name}
                                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                                    placeholder="e.g. Q1 Newsletter"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Subject Line</label>
                                <input
                                    type="text"
                                    value={campaignForm.subject}
                                    onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                                    placeholder="e.g. Exciting updates from our team!"
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Type</label>
                                    <select
                                        value={campaignForm.type}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })}
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
                                        value={campaignForm.marketingListId}
                                        onChange={(e) => setCampaignForm({ ...campaignForm, marketingListId: e.target.value })}
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
                                    value={campaignForm.description}
                                    onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                                    placeholder="Brief description of this campaign..."
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCampaignModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg">Create Campaign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New List Modal */}
            {showListModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                            <h3 className="font-bold text-lg text-slate-800">New Marketing List</h3>
                            <button onClick={() => setShowListModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateList} className="p-6 space-y-4">
                            <div>
                                <label className={labelClass}>List Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={listForm.name}
                                    onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                                    placeholder="e.g. Newsletter Subscribers"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Type</label>
                                <select
                                    value={listForm.type}
                                    onChange={(e) => setListForm({ ...listForm, type: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="Static">Static (Manual)</option>
                                    <option value="Dynamic">Dynamic (Auto-update)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea
                                    value={listForm.description}
                                    onChange={(e) => setListForm({ ...listForm, description: e.target.value })}
                                    placeholder="What is this list for?"
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowListModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg">Create List</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showMemberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                            <h3 className="font-bold text-lg text-slate-800">Add Subscriber</h3>
                            <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className="p-6 space-y-4">
                            <div>
                                <label className={labelClass}>Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={memberForm.email}
                                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                                    placeholder="subscriber@example.com"
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>First Name</label>
                                    <input
                                        type="text"
                                        value={memberForm.firstName}
                                        onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                                        placeholder="John"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name</label>
                                    <input
                                        type="text"
                                        value={memberForm.lastName}
                                        onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                                        placeholder="Doe"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg">Add Subscriber</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketingPage;
