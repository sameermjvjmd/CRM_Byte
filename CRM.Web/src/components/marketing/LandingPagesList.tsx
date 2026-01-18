import React, { useState, useEffect } from 'react';
import { Globe, Plus, Eye, Edit, Trash2, ExternalLink, Activity, Copy } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface LandingPage {
    id: number;
    name: string;
    slug: string;
    status: string;
    visitCount: number;
    submissionCount: number;
    createdAt: string;
    publishedAt?: string;
}

const LandingPagesList: React.FC = () => {
    const [pages, setPages] = useState<LandingPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPage, setNewPage] = useState({ name: '', slug: '', description: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const response = await api.get('/landingpages');
            setPages(response.data);
        } catch (error) {
            console.error('Failed to load landing pages:', error);
            toast.error('Failed to load landing pages');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/landingpages', newPage);
            toast.success('Landing page created');
            setShowCreateModal(false);
            setNewPage({ name: '', slug: '', description: '' });
            fetchPages();
            // Optional: Navigate to builder immediately
            // navigate(`/marketing/pages/${res.data.id}/edit`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create page');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this landing page?')) return;
        try {
            await api.delete(`/landingpages/${id}`);
            setPages(prev => prev.filter(p => p.id !== id));
            toast.success('Page deleted');
        } catch (error) {
            toast.error('Failed to delete page');
        }
    };

    const copyLink = (slug: string) => {
        const url = `${window.location.origin}/pages/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading landing pages...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Landing Pages</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
                >
                    <Plus size={18} /> New Page
                </button>
            </div>

            {pages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Globe size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No landing pages yet</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Create beautiful landing pages to capture leads and grow your marketing lists.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                        Create your first page &rarr;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map(page => (
                        <div key={page.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${page.status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                                    }`}>
                                    <Globe size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${page.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                        }`}>
                                        {page.status}
                                    </span>
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-900 text-lg mb-1 truncate" title={page.name}>{page.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 font-mono bg-slate-50 p-1.5 rounded truncate">
                                <span>/{page.slug}</span>
                                <button onClick={() => copyLink(page.slug)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-indigo-600">
                                    <Copy size={12} />
                                </button>
                            </div>

                            <div className="flex items-center gap-6 mb-6">
                                <div>
                                    <div className="text-xl font-bold text-slate-900">{page.visitCount}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Visits</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-indigo-600">{page.submissionCount}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Leads</div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-xl font-bold text-emerald-600">
                                        {page.visitCount > 0 ? ((page.submissionCount / page.visitCount) * 100).toFixed(1) : 0}%
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Conv. Rate</div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                <button className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                                    <Edit size={16} /> Edit
                                </button>
                                {page.status === 'Published' && (
                                    <a
                                        href={`/pages/${page.slug}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                        title="View Live Page"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                )}
                                <button
                                    onClick={() => handleDelete(page.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-slate-800">New Landing Page</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Page Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newPage.name}
                                    onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="e.g. Summer Webinar Signup"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug (Optional)</label>
                                <input
                                    type="text"
                                    value={newPage.slug}
                                    onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                                    placeholder="summer-webinar"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">This will be the URL of your page. Leave blank to auto-generate.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                                <textarea
                                    value={newPage.description}
                                    onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Create Page</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPagesList;
