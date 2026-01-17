import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import type { Group } from '../types/group';
import { Users, Plus, MoreVertical, Calendar } from 'lucide-react';
import CreateModal from '../components/CreateModal';

const GroupsPage = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await api.get('/groups');
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Groups</h1>
                    <p className="text-slate-500 text-sm">Segment your contacts into target lists.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
                >
                    <Plus size={18} />
                    New Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                    <div
                        key={group.id}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-primary/50 transition-all group cursor-pointer"
                        onClick={() => navigate(`/groups/${group.id}`)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${group.isDynamic ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                <Users size={24} />
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{group.name}</h3>
                            {group.isDynamic && <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded border border-purple-200">Dynamic</span>}
                        </div>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">{group.description || "No description provided."}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>{group.isDynamic ? 'Auto-Managed' : `${group.contacts?.length || 0} Members`}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{new Date(group.createdAt!).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && groups.length === 0 && (
                <div className="text-center py-12 text-slate-400">Loading groups...</div>
            )}

            {!loading && groups.length === 0 && (
                <div className="text-center py-12 text-slate-400">No groups found. Create one to get started.</div>
            )}

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchGroups();
                }}
                initialType="Group"  // Note: createModal needs update to handle 'Group'
            />
        </div>
    );
};

export default GroupsPage;
