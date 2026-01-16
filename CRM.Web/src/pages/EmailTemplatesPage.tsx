import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Edit2, Trash2 } from 'lucide-react';
import type { EmailTemplate, CreateEmailTemplateDto, UpdateEmailTemplateDto } from '../api/emailApi';
import { emailApi } from '../api/emailApi';
import EmailTemplateModal from '../components/email/EmailTemplateModal';
import { toast } from 'react-hot-toast';

const EmailTemplatesPage: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | undefined>(undefined);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await emailApi.getTemplates();
            setTemplates(data);
        } catch (error) {
            toast.error('Failed to load templates');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleCreate = () => {
        setSelectedTemplate(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await emailApi.deleteTemplate(id);
            toast.success('Template deleted');
            fetchTemplates();
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    const handleSubmit = async (data: CreateEmailTemplateDto | UpdateEmailTemplateDto) => {
        try {
            if (selectedTemplate) {
                await emailApi.updateTemplate(selectedTemplate.id, { ...data, isActive: (data as any).isActive ?? true });
                toast.success('Template updated');
            } else {
                await emailApi.createTemplate(data as CreateEmailTemplateDto);
                toast.success('Template created');
            }
            setIsModalOpen(false);
            fetchTemplates();
        } catch (error) {
            toast.error('Failed to save template');
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Context Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-30">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Email Templates</h1>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                            Marketing
                        </span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Manage your email templates and designs
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-5 py-2 bg-indigo-600 text-white rounded shadow-md text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={14} strokeWidth={3} />
                    Create Template
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-auto">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="relative group w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={14} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filter templates..."
                                className="w-full bg-white border border-slate-200 text-xs font-bold rounded py-1.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 uppercase tracking-widest"
                            />
                        </div>
                        <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {filteredTemplates.length} Templates Found
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse act-table">
                        <thead>
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="w-32 text-right px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6 bg-white h-16"></td>
                                    </tr>
                                ))
                            ) : filteredTemplates.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 text-slate-300 mb-2" />
                                            <p>{searchTerm ? 'No templates match your search' : 'No templates found. Create one to get started!'}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <tr key={template.id} className="hover:bg-slate-50 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="font-black text-slate-900 text-xs uppercase tracking-tight">{template.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">
                                            <div className="truncate max-w-xs">{template.subject}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1 w-fit">
                                                {template.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 w-fit ${template.isActive
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                {template.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(template)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                    title="Edit Template"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(template.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Template"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EmailTemplateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                template={selectedTemplate}
            />
        </div>
    );
};

export default EmailTemplatesPage;
