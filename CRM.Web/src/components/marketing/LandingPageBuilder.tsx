import React, { useState, useEffect } from 'react';
import { Save, Eye, ArrowLeft, Plus, Trash2, Move, Layout, Type, Image as ImageIcon, Minus, Send, Settings, Code, Copy, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

// Types
interface Block {
    id: string;
    type: 'text' | 'image' | 'spacer' | 'divider' | 'form';
    content: any;
}

interface WebFormConfig {
    fields: FormField[];
    submitText: string;
    successMessage: string;
    marketingListId: number | null;
    redirectUrl: string;
}

interface FormField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'number';
    required: boolean;
    key: string; // maps to backend (firstName, email, etc)
}

const LandingPageBuilder: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [marketingLists, setMarketingLists] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [showEmbedModal, setShowEmbedModal] = useState(false);

    useEffect(() => {
        fetchPage();
        fetchLists();
        fetchUsers();
    }, [id]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (e) {
            console.error('Failed to fetch users', e);
        }
    };

    const fetchPage = async () => {
        try {
            const res = await api.get(`/landingpages/${id}`);
            setPage(res.data);
            if (res.data.jsonContent) {
                try {
                    setBlocks(JSON.parse(res.data.jsonContent));
                } catch (e) {
                    setBlocks([]);
                }
            }
        } catch (error) {
            toast.error('Failed to load page');
            navigate('/marketing');
        } finally {
            setLoading(false);
        }
    };

    const fetchLists = async () => {
        try {
            const res = await api.get('/marketing/lists');
            setMarketingLists(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async () => {
        try {
            // Find the form block to extract config
            const formBlock = blocks.find(b => b.type === 'form');
            let formDto = null;

            if (formBlock) {
                formDto = {
                    Name: page.name + ' Form',
                    FormFieldsJson: JSON.stringify(formBlock.content.fields),
                    SubmitButtonText: formBlock.content.submitText,
                    SuccessMessage: formBlock.content.successMessage,
                    RedirectUrl: formBlock.content.redirectUrl,
                    MarketingListId: formBlock.content.marketingListId,
                    CreateContact: true,
                    AssignToUserId: formBlock.content.assignToUserId
                };
            }

            await api.put(`/landingpages/${id}`, {
                ...page,
                jsonContent: JSON.stringify(blocks),
                webForm: formDto
            });
            toast.success('Page saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save page');
        }
    };

    const addBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: getDefaultContent(type)
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const getDefaultContent = (type: Block['type']) => {
        switch (type) {
            case 'text': return { html: '<h2>Heading</h2><p>Your content here...</p>', align: 'left' };
            case 'image': return { url: 'https://via.placeholder.com/600x300', alt: 'Image', width: '100%' };
            case 'form': return {
                fields: [
                    { id: '1', label: 'Email Address', type: 'email', required: true, key: 'email' },
                    { id: '2', label: 'First Name', type: 'text', required: true, key: 'firstName' }
                ],
                submitText: 'Subscribe Now',
                successMessage: 'Thanks for signing up!',
                marketingListId: null,
                assignToUserId: null,
                redirectUrl: ''
            };
            case 'spacer': return { height: 40 };
            default: return {};
        }
    };

    const updateBlock = (id: string, content: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...content } } : b));
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(blocks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setBlocks(items);
    };

    const copyEmbedCode = () => {
        const code = `<iframe src="${window.location.origin}/pages/${page?.slug}" width="100%" height="800" frameborder="0"></iframe>`;
        navigator.clipboard.writeText(code);
        toast.success('Embed code copied to clipboard!');
    };

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    if (loading) return <div>Loading builder...</div>;

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/marketing')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-slate-900">{page?.name}</h1>
                        <select
                            value={page?.status || 'Draft'}
                            onChange={(e) => setPage({ ...page, status: e.target.value })}
                            className={`text-xs ml-2 px-2 py-0.5 rounded font-bold uppercase border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${page?.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                        >
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowEmbedModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">
                        <Code size={16} /> Embed
                    </button>
                    <a href={`/pages/${page?.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">
                        <Eye size={16} /> Preview
                    </a>
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar (Tools) */}
                <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Content Blocks</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => addBlock('text')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all">
                            <Type size={24} className="text-slate-600 mb-2" />
                            <span className="text-xs font-medium text-slate-900">Text</span>
                        </button>
                        <button onClick={() => addBlock('image')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all">
                            <ImageIcon size={24} className="text-slate-600 mb-2" />
                            <span className="text-xs font-medium text-slate-900">Image</span>
                        </button>
                        <button onClick={() => addBlock('form')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all">
                            <Send size={24} className="text-slate-600 mb-2" />
                            <span className="text-xs font-medium text-slate-900">Form</span>
                        </button>
                        <button onClick={() => addBlock('spacer')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all">
                            <Minus size={24} className="text-slate-600 mb-2" />
                            <span className="text-xs font-medium text-slate-900">Spacer</span>
                        </button>
                    </div>
                </div>

                {/* Center Canvas */}
                <div className="flex-1 bg-slate-100 p-8 overflow-y-auto">
                    <div className="max-w-[800px] mx-auto bg-white min-h-[800px] shadow-sm rounded-xl overflow-hidden">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="canvas">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="p-8 min-h-full">
                                        {blocks.map((block, index) => (
                                            <Draggable key={block.id} draggableId={block.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        onClick={() => setSelectedBlockId(block.id)}
                                                        className={`relative group mb-2 border-2 rounded transition-all ${selectedBlockId === block.id ? 'border-indigo-500 ring-4 ring-indigo-50 z-10' : 'border-transparent hover:border-slate-200'
                                                            } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                                    >
                                                        {/* Drag Handle */}
                                                        <div {...provided.dragHandleProps} className="absolute left-2 top-2 p-1 bg-white shadow rounded text-slate-400 opacity-0 group-hover:opacity-100 cursor-move z-20">
                                                            <Move size={14} />
                                                        </div>

                                                        {/* Delete Handle */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                                                            className="absolute right-2 top-2 p-1 bg-white shadow rounded text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 z-20"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>

                                                        {/* Content Rendering */}
                                                        <div className="pointer-events-none">
                                                            {block.type === 'text' && (
                                                                <div
                                                                    dangerouslySetInnerHTML={{ __html: block.content.html }}
                                                                    className="prose max-w-none"
                                                                    style={{ textAlign: block.content.align }}
                                                                />
                                                            )}
                                                            {block.type === 'image' && (
                                                                <img src={block.content.url} alt={block.content.alt} style={{ width: block.content.width }} />
                                                            )}
                                                            {block.type === 'spacer' && (
                                                                <div style={{ height: block.content.height }} />
                                                            )}
                                                            {block.type === 'form' && (
                                                                <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
                                                                    <div className="space-y-4">
                                                                        {block.content.fields.map((field: any) => (
                                                                            <div key={field.id}>
                                                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                                                    {field.label} {field.required && '*'}
                                                                                </label>
                                                                                <input type={field.type} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white" disabled placeholder={`Enter ${field.label}...`} />
                                                                            </div>
                                                                        ))}
                                                                        <button className="w-full py-2 bg-indigo-600 text-white rounded-md font-medium">
                                                                            {block.content.submitText}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {blocks.length === 0 && (
                                            <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                                                <p>Drag blocks from the left to start building</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>

                {/* Right Sidebar (Properties) */}
                {selectedBlock && (
                    <div className="w-72 bg-white border-l border-slate-200 p-4 h-full overflow-y-auto">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                            <Settings size={14} />
                            {selectedBlock.type === 'form' ? 'Form Settings' : 'Block Settings'}
                        </h3>

                        <div className="space-y-4">
                            {selectedBlock.type === 'text' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Content (HTML)</label>
                                    <textarea
                                        value={selectedBlock.content.html}
                                        onChange={(e) => updateBlock(selectedBlock.id, { html: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg h-32 font-mono text-xs"
                                    />
                                    <label className="block text-xs font-bold text-slate-700 mt-3 mb-1">Alignment</label>
                                    <select
                                        value={selectedBlock.content.align}
                                        onChange={(e) => updateBlock(selectedBlock.id, { align: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                        <option value="justify">Justify</option>
                                    </select>
                                </div>
                            )}

                            {selectedBlock.type === 'image' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        value={selectedBlock.content.url}
                                        onChange={(e) => updateBlock(selectedBlock.id, { url: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                            )}

                            {selectedBlock.type === 'spacer' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Height (px)</label>
                                    <input
                                        type="number"
                                        value={selectedBlock.content.height}
                                        onChange={(e) => updateBlock(selectedBlock.id, { height: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                            )}

                            {selectedBlock.type === 'form' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                                        <input
                                            type="text"
                                            value={selectedBlock.content.submitText}
                                            onChange={(e) => updateBlock(selectedBlock.id, { submitText: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Success Message</label>
                                        <input
                                            type="text"
                                            value={selectedBlock.content.successMessage}
                                            onChange={(e) => updateBlock(selectedBlock.id, { successMessage: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Target List</label>
                                        <select
                                            value={selectedBlock.content.marketingListId || ''}
                                            onChange={(e) => updateBlock(selectedBlock.id, { marketingListId: e.target.value ? parseInt(e.target.value) : null })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        >
                                            <option value="">-- Select List --</option>
                                            {marketingLists.map(list => (
                                                <option key={list.id} value={list.id}>{list.name}</option>
                                            ))}

                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Assign Leads To</label>
                                        <select
                                            value={selectedBlock.content.assignToUserId || ''}
                                            onChange={(e) => updateBlock(selectedBlock.id, { assignToUserId: e.target.value ? parseInt(e.target.value) : null })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        >
                                            <option value="">-- Auto-Assign (Round Robin) --</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>{user.fullName}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-slate-400 mt-1">New contacts will be owned by this user.</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200">
                                        <label className="block text-xs font-bold text-slate-700 mb-2">Form Fields</label>
                                        {selectedBlock.content.fields.map((field: any, idx: number) => (
                                            <div key={idx} className="bg-slate-50 p-2 rounded mb-2 border border-slate-200 text-xs">
                                                <div className="font-bold">{field.label}</div>
                                                <div className="text-slate-500">{field.type} • {field.required ? 'Required' : 'Optional'}</div>
                                            </div>
                                        ))}
                                        <p className="text-[10px] text-slate-400 italic">Field editing coming next update.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Embed Modal */}
            {showEmbedModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Embed Landing Page</h3>
                            <button onClick={() => setShowEmbedModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500">
                                Copy the code below and paste it into any website to embed this landing page.
                            </p>
                            <div className="relative">
                                <textarea
                                    readOnly
                                    value={`<iframe src="${window.location.origin}/pages/${page?.slug}" width="100%" height="800" frameborder="0"></iframe>`}
                                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-600 focus:outline-none resize-none"
                                />
                                <button
                                    onClick={copyEmbedCode}
                                    className="absolute top-2 right-2 p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-500"
                                    title="Copy to clipboard"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                            <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                <Code size={16} className="shrink-0 mt-0.5" />
                                <p>Ensure the status of the page is set to <strong>Published</strong> before embedding, otherwise visitors will see a 404 error.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setShowEmbedModal(false)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPageBuilder;
