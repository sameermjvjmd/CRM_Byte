import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Star } from 'lucide-react';
import type { EmailSignature, CreateEmailSignatureDto, UpdateEmailSignatureDto } from '../api/emailApi';
import { emailApi } from '../api/emailApi';
import EmailSignatureModal from '../components/email/EmailSignatureModal';
import { toast } from 'react-hot-toast';

const EmailSignaturesPage: React.FC = () => {
    const [signatures, setSignatures] = useState<EmailSignature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSignature, setSelectedSignature] = useState<EmailSignature | undefined>(undefined);

    const fetchSignatures = async () => {
        try {
            setIsLoading(true);
            const data = await emailApi.getSignatures();
            setSignatures(data);
        } catch (error) {
            toast.error('Failed to load signatures');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSignatures();
    }, []);

    const handleCreate = () => {
        setSelectedSignature(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (signature: EmailSignature) => {
        setSelectedSignature(signature);
        setIsModalOpen(true);
    };

    const handleSetDefault = async (id: number) => {
        try {
            await emailApi.setDefaultSignature(id);
            toast.success('Default signature updated');
            fetchSignatures();
        } catch (error) {
            toast.error('Failed to set default signature');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this signature?')) return;
        try {
            await emailApi.deleteSignature(id);
            toast.success('Signature deleted');
            fetchSignatures();
        } catch (error) {
            toast.error('Failed to delete signature');
        }
    };

    const handleSubmit = async (data: CreateEmailSignatureDto | UpdateEmailSignatureDto) => {
        try {
            if (selectedSignature) {
                await emailApi.updateSignature(selectedSignature.id, data as UpdateEmailSignatureDto);
                toast.success('Signature updated');
            } else {
                await emailApi.createSignature(data as CreateEmailSignatureDto);
                toast.success('Signature created');
            }
            setIsModalOpen(false);
            fetchSignatures();
        } catch (error) {
            toast.error('Failed to save signature');
        }
    };

    const filteredSignatures = signatures.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Context Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-30">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Email Signatures</h1>
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-black uppercase tracking-widest">
                            Personal
                        </span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Manage your email signatures
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-5 py-2 bg-indigo-600 text-white rounded shadow-md text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={14} strokeWidth={3} />
                    Create Signature
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
                                placeholder="Filter signatures..."
                                className="w-full bg-white border border-slate-200 text-xs font-bold rounded py-1.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 uppercase tracking-widest"
                            />
                        </div>
                        <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {filteredSignatures.length} Signatures Found
                        </div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : filteredSignatures.length === 0 ? (
                            <div className="py-16 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                <p>{searchTerm ? 'No signatures match your search' : 'No signatures found. Create one to get started!'}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredSignatures.map((signature) => (
                                    <div
                                        key={signature.id}
                                        className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all group relative"
                                    >
                                        {signature.isDefault && (
                                            <div className="absolute top-3 right-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-600 border border-yellow-200">
                                                    <Star size={10} fill="currentColor" />
                                                    Default
                                                </span>
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">{signature.name}</h3>
                                        </div>
                                        <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-100 max-h-32 overflow-auto">
                                            <div
                                                className="text-xs text-slate-600"
                                                dangerouslySetInnerHTML={{ __html: signature.content }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                {new Date(signature.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!signature.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(signature.id)}
                                                        className="p-1.5 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                                        title="Set as Default"
                                                    >
                                                        <Star size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(signature)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                    title="Edit Signature"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(signature.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Signature"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <EmailSignatureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                signature={selectedSignature}
            />
        </div>
    );
};

export default EmailSignaturesPage;
