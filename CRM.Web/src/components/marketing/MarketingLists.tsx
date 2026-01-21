import React, { useState, useEffect } from 'react';
import { ListPlus, Users, UserPlus, X, Filter, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

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

const MarketingLists: React.FC = () => {
    const [lists, setLists] = useState<MarketingList[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedListId, setSelectedListId] = useState<number | null>(null);

    const [viewSubscribersModal, setViewSubscribersModal] = useState(false);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loadingSubscribers, setLoadingSubscribers] = useState(false);

    // Filter states
    const [filterType, setFilterType] = useState('All');

    // Forms
    const [newList, setNewList] = useState({ name: '', description: '', type: 'Static' });
    const [newMember, setNewMember] = useState({ email: '', firstName: '', lastName: '' });

    useEffect(() => {
        fetchLists();
    }, []);

    useEffect(() => {
        if (viewSubscribersModal && selectedListId) {
            fetchSubscribers(selectedListId);
        }
    }, [viewSubscribersModal, selectedListId]);

    const fetchSubscribers = async (listId: number) => {
        setLoadingSubscribers(true);
        try {
            const res = await api.get(`/marketing/lists/${listId}/members`);
            setSubscribers(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subscribers');
        } finally {
            setLoadingSubscribers(false);
        }
    };

    const fetchLists = async () => {
        try {
            const response = await api.get('/marketing/lists');
            setLists(response.data);
        } catch (error) {
            console.error('Failed to load lists:', error);
            toast.error('Failed to load marketing lists');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/marketing/lists', newList);
            toast.success('List created successfully');
            setShowCreateModal(false);
            setNewList({ name: '', description: '', type: 'Static' });
            fetchLists();
        } catch (error) {
            console.error('Failed to create list:', error);
            toast.error('Failed to create list');
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedListId) return;
        try {
            await api.post(`/marketing/lists/${selectedListId}/members`, newMember);
            toast.success('Subscriber added successfully');
            setShowAddMemberModal(false);
            setNewMember({ email: '', firstName: '', lastName: '' });
            fetchLists(); // Refresh counts
        } catch (error: any) {
            console.error('Failed to add member:', error);
            toast.error(error.response?.data || 'Failed to add subscriber');
        }
    };

    const handleDeleteList = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this list? This cannot be undone.')) return;
        try {
            await api.delete(`/marketing/lists/${id}`);
            toast.success('List deleted');
            fetchLists();
        } catch (error) {
            toast.error('Failed to delete list');
        }
    };

    const filteredLists = lists.filter(list => {
        if (filterType === 'All') return true;
        return list.type === filterType;
    });

    if (loading) return <div className="p-8 text-center text-slate-500">Loading lists...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setFilterType('All')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'All' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All Lists
                    </button>
                    <button
                        onClick={() => setFilterType('Static')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'Static' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Static
                    </button>
                    <button
                        onClick={() => setFilterType('Dynamic')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'Dynamic' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Dynamic
                    </button>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                    <ListPlus size={18} /> Create List
                </button>
            </div>

            {filteredLists.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No lists found</h3>
                    <p className="text-slate-500 mb-6">Create a marketing list to start collecting subscribers for your campaigns.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                        Create your first list &rarr;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLists.map(list => (
                        <div key={list.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group relative">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDeleteList(list.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                    title="Delete List"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${list.type === 'Dynamic' ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'
                                    }`}>
                                    <Users size={24} />
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${list.type === 'Dynamic' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-slate-50 text-slate-600 border border-slate-100'
                                    }`}>{list.type}</span>
                            </div>

                            <h3 className="font-bold text-slate-900 mb-1 text-lg truncate" title={list.name}>{list.name}</h3>
                            <p className="text-xs text-slate-500 mb-6 line-clamp-2 min-h-[2.5em]">{list.description || 'No description provided.'}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{list.subscribedCount}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Subscribers</div>
                                </div>
                                <button
                                    onClick={() => { setSelectedListId(list.id); setShowAddMemberModal(true); }}
                                    className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                >
                                    <UserPlus size={14} /> Add User
                                </button>
                            </div>
                            <button
                                onClick={() => { setSelectedListId(list.id); setViewSubscribersModal(true); }}
                                className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors"
                            >
                                View Subscribers
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Create List Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                            <h3 className="font-bold text-lg text-slate-800">New Marketing List</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateList} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">List Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newList.name}
                                    onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                                    placeholder="e.g. Newsletter Subscribers"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type</label>
                                <select
                                    value={newList.type}
                                    onChange={(e) => setNewList({ ...newList, type: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                >
                                    <option value="Static">Static (Manual)</option>
                                    <option value="Dynamic">Dynamic (Auto-update)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                                <textarea
                                    value={newList.description}
                                    onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                                    placeholder="What is this list for?"
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none transition-all"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all">Create List</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                            <h3 className="font-bold text-lg text-slate-800">Add Subscriber</h3>
                            <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    placeholder="subscriber@example.com"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={newMember.firstName}
                                        onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                                        placeholder="John"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={newMember.lastName}
                                        onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                                        placeholder="Doe"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddMemberModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all">Add Subscriber</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Subscribers Modal */}
            {viewSubscribersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">List Subscribers</h3>
                                <p className="text-xs text-slate-500">
                                    {lists.find(l => l.id === selectedListId)?.name}
                                </p>
                            </div>
                            <button onClick={() => setViewSubscribersModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <div className="p-0 overflow-y-auto flex-1">
                            {loadingSubscribers ? (
                                <div className="p-8 text-center text-slate-500">Loading subscribers...</div>
                            ) : subscribers.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <Users size={32} className="mx-auto text-slate-300 mb-2" />
                                    <p>No subscribers in this list yet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Joined</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {subscribers.map((sub: any) => (
                                            <tr key={sub.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-3 font-medium text-slate-900">{sub.email}</td>
                                                <td className="px-6 py-3 text-slate-600">{sub.firstName} {sub.lastName}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sub.status === 'Subscribed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-slate-400 text-xs">
                                                    {new Date(sub.subscribedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button onClick={async () => {
                                                        if (!window.confirm('Remove from list?')) return;
                                                        try {
                                                            await api.delete(`/marketing/lists/${selectedListId}/members/${sub.id}`);
                                                            fetchSubscribers(selectedListId!);
                                                            fetchLists();
                                                        } catch (e) { toast.error('Failed to remove'); }
                                                    }} className="text-red-400 hover:text-red-600">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-gray-50 flex justify-end">
                            <button onClick={() => setViewSubscribersModal(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 text-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketingLists;
