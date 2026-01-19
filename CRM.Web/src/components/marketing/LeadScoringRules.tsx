import React, { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Edit, CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

interface LeadScoringRule {
    id: number;
    name: string;
    description?: string;
    category: string;
    triggerType: string;
    pointsValue: number;
    isActive: boolean;
    conditions?: string;
    createdAt: string;
}

const LeadScoringRules: React.FC = () => {
    const [rules, setRules] = useState<LeadScoringRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRuleId, setCurrentRuleId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Engagement',
        triggerType: 'EmailOpen',
        pointsValue: 5,
        conditions: '[]'
    });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const response = await api.get('/marketing/scoring/rules');
            setRules(response.data);
        } catch (error) {
            console.error('Failed to load scoring rules:', error);
            toast.error('Failed to load scoring rules');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentRuleId) {
                await api.put(`/marketing/scoring/rules/${currentRuleId}`, formData);
                toast.success('Rule updated successfully');
            } else {
                await api.post('/marketing/scoring/rules', formData);
                toast.success('Rule created successfully');
            }
            setShowCreateModal(false);
            resetForm();
            fetchRules();
        } catch (error) {
            console.error('Failed to save rule:', error);
            toast.error('Failed to save rule');
        }
    };

    const handleEdit = (rule: LeadScoringRule) => {
        setFormData({
            name: rule.name,
            description: rule.description || '',
            category: rule.category,
            triggerType: rule.triggerType,
            pointsValue: rule.pointsValue,
            conditions: rule.conditions || '[]'
        });
        setCurrentRuleId(rule.id);
        setIsEditing(true);
        setShowCreateModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this scoring rule?')) return;
        try {
            await api.delete(`/marketing/scoring/rules/${id}`);
            toast.success('Rule deleted');
            setRules(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error('Failed to delete rule');
        }
    };

    const toggleActive = async (rule: LeadScoringRule) => {
        try {
            await api.put(`/marketing/scoring/rules/${rule.id}/toggle`);
            setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r));
            toast.success(`Rule ${!rule.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to toggle rule status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'Engagement',
            triggerType: 'EmailOpen',
            pointsValue: 5,
            conditions: '[]'
        });
        setIsEditing(false);
        setCurrentRuleId(null);
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading scoring rules...</div>;

    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all";
    const labelClass = "block text-xs font-bold text-slate-700 uppercase mb-1";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Lead Scoring Rules</h2>
                    <p className="text-sm text-slate-500">Define how contacts earn points based on their behavior.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                    <Plus size={18} /> Add Rule
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rules.length === 0 ? (
                    <div className="col-span-full p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                        No lead scoring rules defined yet. Click "Add Rule" to get started.
                    </div>
                ) : (
                    rules.map(rule => (
                        <div key={rule.id} className={`bg-white rounded-2xl border ${rule.isActive ? 'border-indigo-100 shadow-sm' : 'border-slate-200 opacity-75'} overflow-hidden group transition-all`}>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-xl ${rule.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Zap size={20} fill={rule.isActive ? 'currentColor' : 'none'} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(rule)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                                            title="Edit Rule"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rule.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Rule"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900 leading-tight">{rule.name}</h3>
                                        {rule.isActive ? (
                                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
                                                <CheckCircle2 size={10} /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                                                <XCircle size={10} /> Paused
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{rule.description || 'No description provided.'}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400 font-medium">Trigger</span>
                                        <span className="text-slate-800 font-bold bg-slate-50 px-2 py-0.5 rounded">{rule.triggerType}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400 font-medium">Points</span>
                                        <span className={`font-bold px-2 py-0.5 rounded ${rule.pointsValue >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                            {rule.pointsValue >= 0 ? '+' : ''}{rule.pointsValue}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{rule.category}</span>
                                <button
                                    onClick={() => toggleActive(rule)}
                                    className={`text-xs font-bold ${rule.isActive ? 'text-rose-600 hover:text-rose-700' : 'text-indigo-600 hover:text-indigo-700'}`}
                                >
                                    {rule.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                            <h3 className="font-bold text-lg text-slate-800">{isEditing ? 'Edit Rule' : 'Create Scoring Rule'}</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className={labelClass}>Rule Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Email Open Bonus"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What does this rule do?"
                                    rows={2}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option value="Engagement">Engagement</option>
                                        <option value="Demographic">Demographic</option>
                                        <option value="Behavioral">Behavioral</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Trigger Event</label>
                                    <select
                                        value={formData.triggerType}
                                        onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option value="EmailOpen">Email Opened</option>
                                        <option value="EmailClick">Link Clicked</option>
                                        <option value="FormSubmit">Form Submitted</option>
                                        <option value="PageVisit">Page Visited</option>
                                        <option value="ActivityCreated">Activity Logged</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Points Value</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="-50"
                                        max="50"
                                        step="1"
                                        value={formData.pointsValue}
                                        onChange={(e) => setFormData({ ...formData, pointsValue: parseInt(e.target.value) })}
                                        className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <span className={`w-12 text-center font-bold text-sm bg-slate-100 py-1 rounded-md ${formData.pointsValue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {formData.pointsValue}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 italic">Negative values subtract points from the contact.</p>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3">
                                <AlertCircle className="text-amber-600 shrink-0" size={18} />
                                <div>
                                    <p className="text-xs font-bold text-amber-800">Advanced Conditions (JSON)</p>
                                    <p className="text-[10px] text-amber-700">Optional: filter which events trigger this rule.</p>
                                    <textarea
                                        value={formData.conditions}
                                        onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                                        className="w-full mt-2 p-2 bg-white border border-amber-200 rounded text-xs font-mono outline-none"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all">
                                    {isEditing ? 'Update Rule' : 'Create Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadScoringRules;
