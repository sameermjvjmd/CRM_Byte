import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-hot-toast';

interface Block {
    id: string;
    type: 'text' | 'image' | 'spacer' | 'divider' | 'form';
    content: any;
}

const PublicLandingPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<any>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                // Assuming public endpoint is mapped to /api/landingpages/public/:slug
                // Or standard endpoint if no auth required (backend handles it)
                const res = await api.get(`/landingpages/public/${slug}`);
                setPage(res.data);
                if (res.data.jsonContent) {
                    try {
                        setBlocks(JSON.parse(res.data.jsonContent));
                    } catch (e) {
                        setBlocks([]);
                    }
                }
            } catch (error) {
                console.error('Failed to load page');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/landingpages/public/${page.id}/submit`, { data: formData });
            setSuccess(true);
            if (page.webForm?.redirectUrl) {
                setTimeout(() => {
                    window.location.href = page.webForm.redirectUrl;
                }, 2000);
            }
        } catch (error) {
            toast.error('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    if (!page) return <div className="min-h-screen flex items-center justify-center bg-white text-slate-500">Page not found</div>;

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <div className={`max-w-[800px] mx-auto px-6 py-12 ${page.theme === 'Dark' ? 'bg-slate-900 text-white' : ''}`}>
                {blocks.map(block => (
                    <div key={block.id} className="mb-4">
                        {block.type === 'text' && (
                            <div
                                dangerouslySetInnerHTML={{ __html: block.content.html }}
                                className="prose max-w-none"
                                style={{ textAlign: block.content.align }}
                            />
                        )}
                        {block.type === 'image' && (
                            <div style={{ textAlign: 'center' }}>
                                <img src={block.content.url} alt={block.content.alt} style={{ width: block.content.width, maxWidth: '100%' }} className="rounded-lg shadow-sm inline-block" />
                            </div>
                        )}
                        {block.type === 'spacer' && (
                            <div style={{ height: block.content.height }} />
                        )}
                        {block.type === 'form' && (
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
                                {success ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
                                        <p className="text-slate-600">{block.content.successMessage}</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {block.content.fields.map((field: any) => (
                                            <div key={field.id}>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                </label>
                                                <input
                                                    type={field.type}
                                                    required={field.required}
                                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                    placeholder={`Enter ${field.label}...`}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Submitting...' : block.content.submitText}
                                        </button>
                                        <p className="text-xs text-center text-slate-400 mt-4">
                                            Scale your business with Nexus CRM
                                        </p>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PublicLandingPage;
