import { useState, useEffect } from 'react';
import api from '../api/api';
import {
    Plus, Search, Zap, Play, Pause, Trash2, Settings, Edit,
    Mail, CheckSquare, RefreshCw, Bell, Globe, Activity,
    Users, Building2, Briefcase, Calendar, FileText,
    ChevronRight, MoreVertical, TestTube, BarChart3
} from 'lucide-react';

interface WorkflowRule {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    triggerType: string;
    entityType: string;
    triggerConditions?: string;
    actionType: string;
    actionParameters?: string;
    priority: number;
    delayMinutes: number;
    executionCount: number;
    successCount: number;
    failureCount: number;
    lastExecutedAt?: string;
    createdAt: string;
}

interface WorkflowStats {
    totalRules: number;
    activeRules: number;
    inactiveRules: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
}

const triggerConfig: Record<string, { label: string; icon: any; color: string }> = {
    OnRecordCreate: { label: 'On Create', icon: Plus, color: 'text-green-600' },
    OnRecordUpdate: { label: 'On Update', icon: RefreshCw, color: 'text-blue-600' },
    OnFieldChange: { label: 'Field Change', icon: Edit, color: 'text-purple-600' },
    OnStageChange: { label: 'Stage Change', icon: ChevronRight, color: 'text-orange-600' },
    OnSchedule: { label: 'Scheduled', icon: Calendar, color: 'text-slate-600' },
};

const actionConfig: Record<string, { label: string; icon: any; color: string }> = {
    SendEmail: { label: 'Send Email', icon: Mail, color: 'text-blue-600' },
    CreateTask: { label: 'Create Task', icon: CheckSquare, color: 'text-green-600' },
    UpdateField: { label: 'Update Field', icon: Edit, color: 'text-purple-600' },
    SendNotification: { label: 'Notification', icon: Bell, color: 'text-orange-600' },
    Webhook: { label: 'Webhook', icon: Globe, color: 'text-slate-600' },
    CreateActivity: { label: 'Create Activity', icon: Activity, color: 'text-indigo-600' },
};

const entityConfig: Record<string, { label: string; icon: any }> = {
    Contact: { label: 'Contact', icon: Users },
    Company: { label: 'Company', icon: Building2 },
    Opportunity: { label: 'Opportunity', icon: Briefcase },
    Activity: { label: 'Activity', icon: Calendar },
    Quote: { label: 'Quote', icon: FileText },
};

const WorkflowsPage = () => {
    const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
    const [stats, setStats] = useState<WorkflowStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<WorkflowRule | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActive, setFilterActive] = useState<string>('');

    useEffect(() => {
        fetchWorkflows();
        fetchStats();
    }, []);

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterActive === 'active') params.append('active', 'true');
            if (filterActive === 'inactive') params.append('active', 'false');

            const response = await api.get(`/workflows?${params.toString()}`);
            setWorkflows(response.data);
        } catch (error) {
            console.error('Error fetching workflows:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/workflows/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await api.patch(`/workflows/${id}/toggle`);
            fetchWorkflows();
            fetchStats();
        } catch (error) {
            console.error('Error toggling workflow:', error);
            alert('Failed to toggle workflow');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this workflow?')) return;

        try {
            await api.delete(`/workflows/${id}`);
            fetchWorkflows();
            fetchStats();
        } catch (error) {
            console.error('Error deleting workflow:', error);
            alert('Failed to delete workflow');
        }
    };

    const handleTest = async (id: number) => {
        try {
            await api.post(`/workflows/${id}/test`);
            alert('Test execution completed successfully!');
            fetchWorkflows();
            fetchStats();
        } catch (error) {
            console.error('Error testing workflow:', error);
            alert('Failed to test workflow');
        }
    };

    const filteredWorkflows = workflows.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 bg-slate-50 min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Workflow Automation</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Automate tasks with triggers and actions
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingWorkflow(null);
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} />
                    NEW WORKFLOW
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Total Rules</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalRules}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Zap size={20} className="text-indigo-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Active</p>
                                <p className="text-2xl font-black text-green-600 mt-1">{stats.activeRules}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Play size={20} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Executions</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalExecutions}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <BarChart3 size={20} className="text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Success Rate</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{stats.successRate.toFixed(1)}%</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Activity size={20} className="text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search workflows..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium"
                        />
                    </div>
                    <select
                        value={filterActive}
                        onChange={(e) => {
                            setFilterActive(e.target.value);
                            fetchWorkflows();
                        }}
                        className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium"
                    >
                        <option value="">All Workflows</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Workflows List */}
            <div className="space-y-4">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
                            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        </div>
                    ))
                ) : filteredWorkflows.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
                        <Zap size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No workflows found</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                        >
                            Create your first workflow
                        </button>
                    </div>
                ) : (
                    filteredWorkflows.map(workflow => {
                        const trigger = triggerConfig[workflow.triggerType] || triggerConfig.OnRecordCreate;
                        const action = actionConfig[workflow.actionType] || actionConfig.SendEmail;
                        const entity = entityConfig[workflow.entityType] || entityConfig.Contact;
                        const TriggerIcon = trigger.icon;
                        const ActionIcon = action.icon;
                        const EntityIcon = entity.icon;

                        return (
                            <div
                                key={workflow.id}
                                className={`bg-white rounded-xl shadow-sm border ${workflow.isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50'} p-6 transition-all hover:shadow-md`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900">{workflow.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${workflow.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {workflow.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {workflow.description && (
                                            <p className="text-sm text-slate-500 mb-4">{workflow.description}</p>
                                        )}

                                        {/* Workflow Flow */}
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                                                <EntityIcon size={14} className="text-slate-600" />
                                                <span className="font-medium">{entity.label}</span>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-400" />
                                            <div className={`flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg ${trigger.color}`}>
                                                <TriggerIcon size={14} />
                                                <span className="font-medium">{trigger.label}</span>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-400" />
                                            <div className={`flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg ${action.color}`}>
                                                <ActionIcon size={14} />
                                                <span className="font-medium">{action.label}</span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
                                            <span>Executed: <strong className="text-slate-700">{workflow.executionCount}</strong> times</span>
                                            <span>Success: <strong className="text-green-600">{workflow.successCount}</strong></span>
                                            <span>Failed: <strong className="text-red-600">{workflow.failureCount}</strong></span>
                                            {workflow.lastExecutedAt && (
                                                <span>Last: <strong>{new Date(workflow.lastExecutedAt).toLocaleDateString()}</strong></span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 ml-4">
                                        <button
                                            onClick={() => handleTest(workflow.id)}
                                            className="p-2 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors"
                                            title="Test"
                                        >
                                            <TestTube size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleToggle(workflow.id)}
                                            className={`p-2 rounded-lg transition-colors ${workflow.isActive
                                                    ? 'hover:bg-orange-100 text-orange-600'
                                                    : 'hover:bg-green-100 text-green-600'
                                                }`}
                                            title={workflow.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {workflow.isActive ? <Pause size={18} /> : <Play size={18} />}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingWorkflow(workflow);
                                                setShowCreateModal(true);
                                            }}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Settings size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(workflow.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <WorkflowModal
                    workflow={editingWorkflow}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingWorkflow(null);
                    }}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        setEditingWorkflow(null);
                        fetchWorkflows();
                        fetchStats();
                    }}
                />
            )}
        </div>
    );
};

// Workflow Create/Edit Modal
const WorkflowModal = ({
    workflow,
    onClose,
    onSuccess
}: {
    workflow: WorkflowRule | null;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const [formData, setFormData] = useState({
        name: workflow?.name || '',
        description: workflow?.description || '',
        isActive: workflow?.isActive ?? true,
        triggerType: workflow?.triggerType || 'OnRecordCreate',
        entityType: workflow?.entityType || 'Contact',
        triggerConditions: workflow?.triggerConditions || '',
        actionType: workflow?.actionType || 'SendEmail',
        actionParameters: workflow?.actionParameters || '',
        priority: workflow?.priority || 0,
        delayMinutes: workflow?.delayMinutes || 0,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Please enter a workflow name');
            return;
        }

        setLoading(true);
        try {
            if (workflow) {
                await api.put(`/workflows/${workflow.id}`, { ...formData, id: workflow.id });
            } else {
                await api.post('/workflows', formData);
            }
            onSuccess();
        } catch (error: any) {
            console.error('Error saving workflow:', error);
            alert(error.response?.data?.title || 'Failed to save workflow');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">
                        {workflow ? 'Edit Workflow' : 'Create New Workflow'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                Workflow Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium"
                                placeholder="e.g., Welcome Email on New Contact"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium"
                                placeholder="What does this workflow do?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                    Entity Type
                                </label>
                                <select
                                    value={formData.entityType}
                                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium"
                                >
                                    {Object.entries(entityConfig).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                    Trigger
                                </label>
                                <select
                                    value={formData.triggerType}
                                    onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium"
                                >
                                    {Object.entries(triggerConfig).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                    Action
                                </label>
                                <select
                                    value={formData.actionType}
                                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium"
                                >
                                    {Object.entries(actionConfig).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                    Delay (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.delayMinutes}
                                    onChange={(e) => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                Action Parameters (JSON)
                            </label>
                            <textarea
                                value={formData.actionParameters}
                                onChange={(e) => setFormData({ ...formData, actionParameters: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-mono text-sm"
                                placeholder='{"templateId": 1, "to": "{Contact.Email}"}'
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                                Activate workflow immediately
                            </label>
                        </div>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : workflow ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkflowsPage;
