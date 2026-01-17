import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import type { Group } from '../types/group';
import {
    ArrowLeft, Users, Filter, Plus, Mail, Phone, MoreVertical,
    Settings, Layout, Calendar, History, FileText, Share2,
    Search, Trash2, ChevronDown
} from 'lucide-react';
import DocumentsTab from '../components/DocumentsTab';

const GroupDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Contacts' | 'Activities' | 'History' | 'Subgroups' | 'Notes' | 'Documents'>('Contacts');
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [availableContacts, setAvailableContacts] = useState<any[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const response = await api.get(`/groups/${id}`);
                const groupData = response.data;

                if (groupData.isDynamic) {
                    try {
                        const dynamicResponse = await api.get(`/groups/${id}/dynamic-members`);
                        groupData.contacts = dynamicResponse.data;
                    } catch (err) {
                        console.error('Error fetching dynamic members:', err);
                    }
                }

                setGroup(groupData);
            } catch (error) {
                console.error('Error fetching group:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGroup();
    }, [id]);

    const handleOpenAddMemberModal = async () => {
        if (group?.isDynamic) return; // Prevent for dynamic groups
        try {
            // Fetch all contacts
            const response = await api.get('/contacts');
            // Filter out contacts already in the group
            const groupContactIds = new Set(group?.contacts?.map((c: any) => c.id || c.contact?.id) || []);
            const filteredContacts = response.data.filter((c: any) => !groupContactIds.has(c.id));
            setAvailableContacts(filteredContacts);
            setIsAddMemberModalOpen(true);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const handleAddMembers = async () => {
        if (group?.isDynamic) return;
        try {
            // Use bulk add endpoint for efficiency
            const response = await api.post(`/groups/${id}/members/bulk`, { contactIds: selectedContacts });
            console.log(`Added ${response.data.addedCount} members, skipped ${response.data.skippedCount}`);

            // Refresh group data
            const groupResponse = await api.get(`/groups/${id}`);
            const updatedGroup = groupResponse.data;
            // Re-fetch dynamic members if needed (unlikely if we just added static, but safe)
            // actually for static groups no need to worry about dynamic logic here
            setGroup(updatedGroup);
            setIsAddMemberModalOpen(false);
            setSelectedContacts([]);
        } catch (error) {
            console.error('Error adding members:', error);
            alert('Failed to add members to group.');
        }
    };

    if (loading) return (
        <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400 min-h-screen bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="font-bold text-sm tracking-widest uppercase">Loading Group Data...</div>
        </div>
    );
    if (!group) return <div className="p-8 text-red-500">Group not found.</div>;

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Context Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/groups')} className="p-2.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-1.5 rounded text-indigo-600">
                                <Users size={16} />
                            </div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">{group.name}</h1>
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-widest ${group.isDynamic
                                ? 'bg-purple-50 text-purple-600 border-purple-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                {group.isDynamic ? 'Dynamic Group' : 'Static Group'}
                            </span>
                            {group.parentGroup && (
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-black uppercase tracking-widest">
                                    Subgroup of: {group.parentGroup.name}
                                </span>
                            )}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5 ml-10">
                            {group.contacts?.length || 0} Members • Created {new Date(group.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                        <Mail size={14} />
                        Email Group
                    </button>
                    <button
                        onClick={handleOpenAddMemberModal}
                        disabled={group.isDynamic}
                        title={group.isDynamic ? "Dynamic groups are managed automatically based on criteria." : "Add members manually"}
                        className={`px-4 py-2 rounded shadow-md text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${group.isDynamic
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                            }`}
                    >
                        <Plus size={14} strokeWidth={3} />
                        Add Member
                    </button>
                    <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 transition-colors">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-y-auto custom-scrollbar">

                {/* Information Sidebar */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Group Definition</h3>

                        <div className="space-y-4">
                            <div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</div>
                                <div className="text-xs text-slate-600 font-medium leading-relaxed">
                                    {group.description || 'No description provided for this group.'}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Access Control</div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                    <Share2 size={14} className="text-indigo-400" />
                                    Public - Read/Write
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Record Manager</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                                        SM
                                    </div>
                                    <div className="text-xs font-bold text-slate-600">Sameer MJ</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg p-6 text-white text-center">
                        <div className="text-4xl font-black mb-1">{group.contacts?.length || 0}</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-75">Active Members</div>
                    </div>
                </div>

                {/* Tabbed Content Area */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/50 overflow-x-auto no-scrollbar">
                            <TabItem id="Contacts" icon={<Users size={16} />} active={activeTab === 'Contacts'} onClick={() => setActiveTab('Contacts')} />
                            <TabItem id="Activities" icon={<Calendar size={16} />} active={activeTab === 'Activities'} onClick={() => setActiveTab('Activities')} />
                            <TabItem id="History" icon={<History size={16} />} active={activeTab === 'History'} onClick={() => setActiveTab('History')} />
                            <TabItem id="Subgroups" icon={<Layout size={16} />} active={activeTab === 'Subgroups'} onClick={() => setActiveTab('Subgroups')} />
                            <TabItem id="Documents" icon={<FileText size={16} />} active={activeTab === 'Documents'} onClick={() => setActiveTab('Documents')} />
                        </div>

                        <div className="flex-1 p-0 overflow-y-auto custom-scrollbar">

                            {activeTab === 'Contacts' && (
                                <div className="flex flex-col h-full">
                                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                        <div className="relative group w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={14} />
                                            <input
                                                type="text"
                                                placeholder="FILTER MEMBERS..."
                                                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 uppercase tracking-widest transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 rounded text-[10px] font-black uppercase tracking-widest text-slate-500 border border-transparent hover:border-slate-200 transition-all">
                                                <Filter size={12} />
                                                Run Query
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse act-table">
                                            <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm">
                                                <tr>
                                                    <th className="px-6 py-3 w-10">
                                                        <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                                    </th>
                                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Contact Name</th>
                                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Company</th>
                                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Email / Phone</th>
                                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Location</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {group.contacts && group.contacts.length > 0 ? group.contacts.map((contactWrapper: any) => {
                                                    // Handle both API structures (direct contact or wrapper)
                                                    const contact = contactWrapper.contact || contactWrapper;
                                                    if (!contact) return null;

                                                    return (
                                                        <tr key={contact.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => navigate(`/contacts/${contact.id}`)}>
                                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-black group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                                        {contact.firstName?.[0]}{contact.lastName?.[0]}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                                                                            {contact.firstName} {contact.lastName}
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-slate-400 uppercase">{contact.jobTitle}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                                    {contact.company?.name || '-'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                                        <Mail size={12} className="text-slate-300" /> {contact.email}
                                                                    </div>
                                                                    {contact.phone && (
                                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                            <Phone size={12} className="text-slate-300" /> {contact.phone}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-xs text-slate-500 font-medium">
                                                                    {[contact.city, contact.state].filter(Boolean).join(', ') || '-'}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                }) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-20 text-center">
                                                            <div className="flex flex-col items-center gap-4">
                                                                <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                                                                    <Users size={32} />
                                                                </div>
                                                                <div className="text-slate-400 font-bold uppercase text-xs tracking-widest">No members found in this group</div>
                                                                <button
                                                                    onClick={handleOpenAddMemberModal}
                                                                    className="text-indigo-600 font-black text-xs uppercase hover:underline"
                                                                >
                                                                    Add Contacts
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Documents' && (
                                <DocumentsTab entityType="Group" entityId={Number(id)} />
                            )}

                            {activeTab !== 'Contacts' && activeTab !== 'Documents' && (
                                <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="p-6 bg-slate-50 rounded-2xl text-slate-300">
                                        {activeTab === 'Activities' && <Calendar size={48} strokeWidth={1} />}
                                        {activeTab === 'History' && <History size={48} strokeWidth={1} />}
                                        {activeTab === 'Subgroups' && <Layout size={48} strokeWidth={1} />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">
                                            No {activeTab} Found
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                                            There are no {activeTab.toLowerCase()} currently associated with this group context.
                                        </p>
                                    </div>
                                    <button className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all">
                                        Create New {activeTab.slice(0, -1)}
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddMemberModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Add Members to Group</h2>
                            <p className="text-sm text-slate-500 mt-1 font-bold">Select contacts to add to "{group?.name}"</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {availableContacts.length > 0 ? (
                                <div className="space-y-2">
                                    {availableContacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            onClick={() => {
                                                setSelectedContacts(prev =>
                                                    prev.includes(contact.id)
                                                        ? prev.filter(id => id !== contact.id)
                                                        : [...prev, contact.id]
                                                );
                                            }}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedContacts.includes(contact.id)
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedContacts.includes(contact.id)}
                                                    onChange={() => { }} // Handled by parent div onClick
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-black">
                                                    {contact.firstName?.[0]}{contact.lastName?.[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-900">
                                                        {contact.firstName} {contact.lastName}
                                                    </div>
                                                    <div className="text-sm text-slate-500">{contact.email}</div>
                                                </div>
                                                {contact.company && (
                                                    <div className="text-xs text-slate-400 font-bold">{contact.company.name}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <div className="text-slate-400 font-bold uppercase text-sm tracking-widest">
                                        All contacts are already in this group
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-between items-center">
                            <div className="text-sm font-bold text-slate-600">
                                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsAddMemberModalOpen(false);
                                        setSelectedContacts([]);
                                    }}
                                    className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddMembers}
                                    disabled={selectedContacts.length === 0}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add {selectedContacts.length > 0 && `(${selectedContacts.length})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TabItem = ({ id, icon, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
        {icon}
        {id}
        {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
    </button>
);

export default GroupDetailPage;
