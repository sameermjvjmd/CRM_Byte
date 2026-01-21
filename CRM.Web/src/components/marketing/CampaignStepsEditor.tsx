import React, { useState, useEffect } from 'react';
import { Mail, Plus, Clock, Trash2, Edit, Save, X, MoveUp, MoveDown, Layers } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { emailApi, type EmailTemplate } from '../../api/emailApi';

interface CampaignStep {
    id: number;
    campaignId: number;
    name: string;
    orderIndex: number;
    delayMinutes: number;
    subject?: string;
    htmlContent?: string;
    templateId?: number;
    sentCount: number;
    openCount: number;
    clickCount: number;
}

interface Props {
    campaignId: number;
    campaignName: string;
    onClose: () => void;
}

const CampaignStepsEditor: React.FC<Props> = ({ campaignId, campaignName, onClose }) => {
    const [steps, setSteps] = useState<CampaignStep[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingStepId, setEditingStepId] = useState<number | null>(null);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        delayMinutes: 0,
        subject: '',
        htmlContent: '',
        templateId: undefined as number | undefined
    });

    useEffect(() => {
        fetchSteps();
        fetchTemplates();
    }, [campaignId]);

    const fetchSteps = async () => {
        try {
            const response = await api.get(`/marketing/campaigns/${campaignId}/steps`);
            setSteps(response.data);
        } catch (error) {
            console.error('Failed to load steps:', error);
            toast.error('Failed to load campaign steps');
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const data = await emailApi.getTemplates();
            setTemplates(data.filter(t => t.isActive));
        } catch (error) {
            console.error('Failed to load templates', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStepId) {
                await api.put(`/marketing/campaigns/${campaignId}/steps/${editingStepId}`, formData);
                toast.success('Step updated');
            } else {
                await api.post(`/marketing/campaigns/${campaignId}/steps`, formData);
                toast.success('Step added');
            }
            setShowAddForm(false);
            setEditingStepId(null);
            resetForm();
            fetchSteps();
        } catch (error) {
            toast.error('Failed to save step');
        }
    };

    const handleEdit = (step: CampaignStep) => {
        setFormData({
            name: step.name,
            delayMinutes: step.delayMinutes,
            subject: step.subject || '',
            htmlContent: step.htmlContent || '',
            templateId: step.templateId
        });
        setEditingStepId(step.id);
        setShowAddForm(true);
    };

    const handleDelete = async (stepId: number) => {
        if (!window.confirm('Delete this step?')) return;
        try {
            await api.delete(`/marketing/campaigns/${campaignId}/steps/${stepId}`);
            toast.success('Step deleted');
            setSteps(prev => prev.filter(s => s.id !== stepId));
        } catch (error) {
            toast.error('Failed to delete step');
        }
    };

    const handleReorder = async (startIndex: number, direction: 'up' | 'down') => {
        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? startIndex - 1 : startIndex + 1;

        if (targetIndex < 0 || targetIndex >= newSteps.length) return;

        const [movedStep] = newSteps.splice(startIndex, 1);
        newSteps.splice(targetIndex, 0, movedStep);

        setSteps(newSteps); // Optimistic update

        try {
            await api.put(`/marketing/campaigns/${campaignId}/steps/reorder`, newSteps.map(s => s.id));
            toast.success('Order updated');
        } catch (error) {
            toast.error('Failed to update order');
            fetchSteps(); // Rollback
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            delayMinutes: 0,
            subject: '',
            htmlContent: '',
            templateId: undefined
        });
        setEditingStepId(null);
    };

    const formatDelay = (minutes: number) => {
        if (minutes === 0) return 'Immediately';
        if (minutes < 60) return `${minutes} minutes later`;
        if (minutes < 1440) return `${Math.round(minutes / 60)} hours later`;
        return `${Math.round(minutes / 1440)} days later`;
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Layers size={20} />
                            <h3 className="font-bold text-xl tracking-tight">Drip Journey Editor</h3>
                        </div>
                        <p className="text-indigo-100 text-sm opacity-90">Design the automated flow for: <span className="font-bold text-white">{campaignName}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Loading steps...</div>
                    ) : (
                        <div className="max-w-2xl mx-auto space-y-8 relative">
                            {/* Vertical Line Connector */}
                            {steps.length > 1 && (
                                <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-dashed border-l-2 border-dashed border-indigo-200 -z-10" />
                            )}

                            {steps.length === 0 && !showAddForm && (
                                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                                    No steps defined. Define your first drip action below.
                                </div>
                            )}

                            {steps.map((step, index) => (
                                <div key={step.id} className="relative flex gap-6 items-start group">
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200 shrink-0 border-4 border-white">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group-hover:border-indigo-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{step.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                    <Clock size={12} /> {formatDelay(step.delayMinutes)}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleReorder(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg disabled:opacity-30"
                                                >
                                                    <MoveUp size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleReorder(index, 'down')}
                                                    disabled={index === steps.length - 1}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg disabled:opacity-30"
                                                >
                                                    <MoveDown size={16} />
                                                </button>
                                                <button onClick={() => handleEdit(step)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(step.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 border border-slate-100 italic flex justify-between items-center">
                                            <div>
                                                <span className="font-bold text-slate-400 mr-2 uppercase text-[10px]">Subject:</span>
                                                {step.subject || 'No subject set'}
                                            </div>
                                            <div className="flex gap-4 ml-4 shrink-0 transition-all">
                                                <div className="text-center group/stat">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Sent</div>
                                                    <div className="font-mono text-indigo-600 font-bold">{step.sentCount || 0}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1 group-hover/stat:text-indigo-400 transition-colors">Opens</div>
                                                    <div className="font-mono text-slate-600 font-bold">{step.openCount || 0}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Clicks</div>
                                                    <div className="font-mono text-slate-600 font-bold">{step.clickCount || 0}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {showAddForm ? (
                                <div className="relative flex gap-6 items-start animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0 border-4 border-white shadow-lg shadow-emerald-100">
                                        {steps.length + 1}
                                    </div>
                                    <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-2xl border-2 border-emerald-100 shadow-xl p-6 space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-slate-800 text-lg">{editingStepId ? 'Edit Step' : 'New Journey Step'}</h4>
                                            <button type="button" onClick={() => { setShowAddForm(false); setEditingStepId(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Step Name *</label>
                                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Welcome Email" />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Delay *</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={
                                                            formData.delayMinutes % 1440 === 0 && formData.delayMinutes > 0 ? formData.delayMinutes / 1440 :
                                                                formData.delayMinutes % 60 === 0 && formData.delayMinutes > 0 ? formData.delayMinutes / 60 :
                                                                    formData.delayMinutes
                                                        }
                                                        onChange={e => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            const unitSelect = document.getElementById('unit-select') as HTMLSelectElement;
                                                            const unit = unitSelect?.value || 'minutes';
                                                            let mins = val;
                                                            if (unit === 'hours') mins = val * 60;
                                                            if (unit === 'days') mins = val * 1440;
                                                            setFormData({ ...formData, delayMinutes: mins });
                                                        }}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                    <select
                                                        id="unit-select"
                                                        defaultValue={
                                                            formData.delayMinutes % 1440 === 0 && formData.delayMinutes > 0 ? 'days' :
                                                                formData.delayMinutes % 60 === 0 && formData.delayMinutes > 0 ? 'hours' :
                                                                    'minutes'
                                                        }
                                                        onChange={e => {
                                                            const unit = e.target.value;
                                                            const input = e.target.previousElementSibling as HTMLInputElement;
                                                            const val = parseInt(input.value) || 0;
                                                            let mins = val;
                                                            if (unit === 'hours') mins = val * 60;
                                                            if (unit === 'days') mins = val * 1440;
                                                            setFormData({ ...formData, delayMinutes: mins });
                                                        }}
                                                        className="bg-slate-100 border border-slate-200 rounded-lg px-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                                    >
                                                        <option value="minutes">Minutes</option>
                                                        <option value="hours">Hours</option>
                                                        <option value="days">Days</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject *</label>
                                                <input required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Email Subject" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Use Template</label>
                                                <select
                                                    value={formData.templateId || ''}
                                                    onChange={e => {
                                                        const tid = e.target.value ? parseInt(e.target.value) : undefined;
                                                        setFormData(prev => ({ ...prev, templateId: tid }));
                                                    }}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="">-- No Template --</option>
                                                    {templates.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Email Content (HTML)</label>
                                                <div className="flex gap-2">
                                                    {['FirstName', 'LastName', 'Email', 'FullName'].map(p => (
                                                        <button
                                                            key={p}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, htmlContent: prev.htmlContent + `{${p}}` }))}
                                                            className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            +{p}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <textarea rows={4} value={formData.htmlContent} onChange={e => setFormData({ ...formData, htmlContent: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs" placeholder="<p>Hi {FirstName}, welcome!</p>" />
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                            <button type="button" onClick={() => { setShowAddForm(false); setEditingStepId(null); }} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                                            <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-lg shadow-emerald-100 transition-all flex items-center gap-2">
                                                <Save size={16} /> {editingStepId ? 'Update Step' : 'Save Step'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={() => { resetForm(); setShowAddForm(true); }}
                                        className="group relative flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 font-bold hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                                    >
                                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                        Add Next Step in Journey
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-400 font-medium">
                    <p>Subscribers entered in this drip will proceed through each step automatically.</p>
                    <p>{steps.length} Steps Defined</p>
                </div>
            </div>
        </div>
    );
};

export default CampaignStepsEditor;
