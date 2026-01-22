import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Users, Target, TrendingUp, BarChart3 } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

interface AssignmentRule {
    id?: number;
    name: string;
    isActive: boolean;
    priority: number;
    assignmentType: 'RoundRobin' | 'Territory' | 'ScoreBased' | 'Workload';
    criteria: string; // JSON: {minScore, maxScore, territory, source, etc}
    assignToUserIds: number[];
    assignToUsers?: string[]; // For display
}

const LeadAssignmentRules = () => {
    const [rules, setRules] = useState<AssignmentRule[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRule, setEditingRule] = useState<AssignmentRule | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchRules();
        fetchUsers();
    }, []);

    const fetchRules = async () => {
        try {
            const response = await api.get('/marketing/lead-assignment-rules');
            setRules(response.data || []);
        } catch (error) {
            console.error('Failed to fetch rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const handleSaveRule = async () => {
        if (!editingRule) return;

        try {
            if (editingRule.id) {
                await api.put(`/marketing/lead-assignment-rules/${editingRule.id}`, editingRule);
                toast.success('Rule updated successfully');
            } else {
                await api.post('/marketing/lead-assignment-rules', editingRule);
                toast.success('Rule created successfully');
            }
            setShowModal(false);
            setEditingRule(null);
            fetchRules();
        } catch (error) {
            toast.error('Failed to save rule');
            console.error(error);
        }
    };

    const handleDeleteRule = async (id: number) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;

        try {
            await api.delete(`/marketing/lead-assignment-rules/${id}`);
            toast.success('Rule deleted successfully');
            fetchRules();
        } catch (error) {
            toast.error('Failed to delete rule');
            console.error(error);
        }
    };

    const handleToggleActive = async (rule: AssignmentRule) => {
        try {
            await api.put(`/marketing/lead-assignment-rules/${rule.id}`, {
                ...rule,
                isActive: !rule.isActive
            });
            toast.success(rule.isActive ? 'Rule deactivated' : 'Rule activated');
            fetchRules();
        } catch (error) {
            toast.error('Failed to update rule');
            console.error(error);
        }
    };

    const openNewRuleModal = () => {
        setEditingRule({
            name: '',
            isActive: true,
            priority: rules.length + 1,
            assignmentType: 'RoundRobin',
            criteria: '{}',
            assignToUserIds: []
        });
        setShowModal(true);
    };

    const getAssignmentTypeLabel = (type: string) => {
        switch (type) {
            case 'RoundRobin': return '🔄 Round Robin';
            case 'Territory': return '🗺️ Territory';
            case 'ScoreBased': return '⭐ Score Based';
            case 'Workload': return '⚖️ Workload Balance';
            default: return type;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading assignment rules...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lead Assignment Rules</h1>
                    <p className="text-slate-500 text-sm">Automatically assign new leads to sales reps</p>
                </div>
                <button
                    onClick={openNewRuleModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    New Rule
                </button>
            </div>

            {/* Rules List */}
            {rules.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <Users className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Assignment Rules</h3>
                    <p className="text-slate-500 mb-4">Create your first rule to automatically assign leads to sales reps</p>
                    <button
                        onClick={openNewRuleModal}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Create First Rule
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {rules.sort((a, b) => a.priority - b.priority).map((rule) => (
                        <div
                            key={rule.id}
                            className={`bg-white rounded-xl border-2 p-6 transition-all ${rule.isActive ? 'border-indigo-200' : 'border-slate-200 opacity-60'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">{rule.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {rule.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded">
                                            Priority {rule.priority}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                        <span className="font-medium">{getAssignmentTypeLabel(rule.assignmentType)}</span>
                                        <span>•</span>
                                        <span>{rule.assignToUsers?.length || 0} assigned users</span>
                                    </div>
                                    {rule.assignToUsers && rule.assignToUsers.length > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {rule.assignToUsers.map((userName, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                                                    {userName}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(rule)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${rule.isActive
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                    >
                                        {rule.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingRule(rule);
                                            setShowModal(true);
                                        }}
                                        className="px-3 py-1.5 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => rule.id && handleDeleteRule(rule.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <Target className="text-blue-600 mb-3" size={24} />
                    <h4 className="font-bold text-slate-900 mb-2">Round Robin</h4>
                    <p className="text-sm text-slate-600">Distribute leads evenly across all assigned sales reps</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <TrendingUp className="text-purple-600 mb-3" size={24} />
                    <h4 className="font-bold text-slate-900 mb-2">Score Based</h4>
                    <p className="text-sm text-slate-600">Assign high-score leads to senior reps automatically</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <BarChart3 className="text-green-600 mb-3" size={24} />
                    <h4 className="font-bold text-slate-900 mb-2">Workload Balance</h4>
                    <p className="text-sm text-slate-600">Assign to reps with the fewest active leads</p>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && editingRule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingRule.id ? 'Edit Assignment Rule' : 'New Assignment Rule'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Rule Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name</label>
                                <input
                                    type="text"
                                    value={editingRule.name}
                                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g., High Score Leads to Senior Reps"
                                />
                            </div>

                            {/* Assignment Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assignment Type</label>
                                <select
                                    value={editingRule.assignmentType}
                                    onChange={(e) => setEditingRule({ ...editingRule, assignmentType: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="RoundRobin">Round Robin</option>
                                    <option value="Territory">Territory Based</option>
                                    <option value="ScoreBased">Score Based</option>
                                    <option value="Workload">Workload Balance</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                <input
                                    type="number"
                                    value={editingRule.priority}
                                    onChange={(e) => setEditingRule({ ...editingRule, priority: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    min="1"
                                />
                                <p className="text-xs text-slate-500 mt-1">Lower numbers = higher priority</p>
                            </div>

                            {/* Assign To Users */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To Users</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                                    {users.map((user) => (
                                        <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                                            <input
                                                type="checkbox"
                                                checked={editingRule.assignToUserIds.includes(user.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setEditingRule({
                                                            ...editingRule,
                                                            assignToUserIds: [...editingRule.assignToUserIds, user.id]
                                                        });
                                                    } else {
                                                        setEditingRule({
                                                            ...editingRule,
                                                            assignToUserIds: editingRule.assignToUserIds.filter(id => id !== user.id)
                                                        });
                                                    }
                                                }}
                                                className="rounded border-slate-300"
                                            />
                                            <span className="text-sm text-slate-700">{user.fullName || user.email}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editingRule.isActive}
                                    onChange={(e) => setEditingRule({ ...editingRule, isActive: e.target.checked })}
                                    className="rounded border-slate-300"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Rule is active
                                </label>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingRule(null);
                                }}
                                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRule}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Save size={18} />
                                Save Rule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadAssignmentRules;
