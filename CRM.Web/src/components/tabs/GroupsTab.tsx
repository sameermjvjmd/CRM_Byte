import { useState } from 'react';
import { Users, Plus, Trash2, Calendar, Tag } from 'lucide-react';

interface Group {
    id: number;
    name: string;
    description: string;
    memberCount: number;
    createdAt: string;
    category?: string;
}

interface GroupsTabProps {
    contactId: number;
    groups: Group[];
    onAddToGroup: (groupId: number) => void;
    onRemoveFromGroup: (groupId: number) => void;
    onCreateGroup: (name: string, description: string) => void;
}

const GroupsTab = ({ contactId, groups, onAddToGroup, onRemoveFromGroup, onCreateGroup }: GroupsTabProps) => {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');

    const handleCreateGroup = () => {
        if (newGroupName.trim()) {
            onCreateGroup(newGroupName, newGroupDesc);
            setNewGroupName('');
            setNewGroupDesc('');
            setShowCreateDialog(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Group Membership</h3>
                    <p className="text-sm font-bold text-slate-500">
                        Member of {groups.length} group{groups.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddDialog(true)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add to Group
                    </button>
                    <button
                        onClick={() => setShowCreateDialog(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <Plus size={16} />
                        Create Group
                    </button>
                </div>
            </div>

            {/* Create Group Dialog */}
            {showCreateDialog && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
                    <h4 className="text-sm font-black text-indigo-900 mb-4">Create New Group</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-indigo-700 uppercase">Group Name</label>
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="e.g., VIP Customers"
                                className="w-full mt-1 px-4 py-2 border border-indigo-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-indigo-700 uppercase">Description (Optional)</label>
                            <textarea
                                value={newGroupDesc}
                                onChange={(e) => setNewGroupDesc(e.target.value)}
                                placeholder="Describe this group..."
                                className="w-full mt-1 px-4 py-2 border border-indigo-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCreateDialog(false)}
                                className="flex-1 px-4 py-2 bg-white border border-indigo-300 rounded-lg font-bold text-sm text-indigo-700 hover:bg-indigo-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all"
                            >
                                Create & Add Contact
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Groups List */}
            <div className="space-y-3">
                {groups.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-500">Not a member of any groups</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">Add this contact to a group to organize better</p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <div
                            key={group.id}
                            className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:shadow-md transition-all group"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                                <Users size={24} />
                            </div>

                            {/* Group Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-black text-slate-900">{group.name}</h4>
                                    {group.category && (
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase">
                                            {group.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-slate-600">{group.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Users size={12} />
                                        {group.memberCount} members
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(group.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => onRemoveFromGroup(group.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                                title="Remove from group"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Stats */}
            {groups.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="text-2xl font-black text-purple-900">{groups.length}</div>
                        <div className="text-xs font-bold text-purple-600 uppercase">Total Groups</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-2xl font-black text-blue-900">
                            {groups.reduce((sum, g) => sum + g.memberCount, 0)}
                        </div>
                        <div className="text-xs font-bold text-blue-600 uppercase">Total Connections</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-2xl font-black text-green-900">
                            {new Set(groups.map(g => g.category)).size}
                        </div>
                        <div className="text-xs font-bold text-green-600 uppercase">Categories</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupsTab;
export type { Group };
