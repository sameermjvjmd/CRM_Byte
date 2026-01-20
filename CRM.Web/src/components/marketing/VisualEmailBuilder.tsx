import React, { useState } from 'react';
import { Image, Type, MousePointer, MoveVertical, Trash2, Save, Eye, Layout } from 'lucide-react';

interface Block {
    id: string;
    type: 'text' | 'image' | 'button' | 'divider';
    content: string;
    styles?: Record<string, string>;
}

interface VisualEmailBuilderProps {
    initialData?: string; // JSON string of blocks
    onSave?: (html: string, json: string) => void;
}

const VisualEmailBuilder: React.FC<VisualEmailBuilderProps> = ({ initialData, onSave }) => {
    const [blocks, setBlocks] = useState<Block[]>(() => {
        if (initialData) {
            try {
                return JSON.parse(initialData);
            } catch (e) {
                console.error('Failed to parse initial design JSON', e);
            }
        }
        return [
            { id: '1', type: 'text', content: '<h1>Welcome to our Newsletter</h1><p>Start editing your email content here.</p>' },
            { id: '2', type: 'button', content: 'Call to Action' }
        ];
    });
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const generateHtml = () => {
        return blocks.map(block => {
            if (block.type === 'text') return block.content;
            if (block.type === 'image') return `<img src="${block.content}" style="max-width: 100%; height: auto;" />`;
            if (block.type === 'button') return `<div style="text-align: center; margin: 20px 0;"><a href="#" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${block.content}</a></div>`;
            if (block.type === 'divider') return `<hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 20px 0;" />`;
            return '';
        }).join('\n');
    };

    const handleSave = () => {
        if (onSave) {
            const html = generateHtml();
            const json = JSON.stringify(blocks);
            onSave(html, json);
        }
    };

    const addBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: Date.now().toString(),
            type,
            content: type === 'text' ? '<p>New text block</p>' :
                type === 'button' ? 'Button Text' :
                    type === 'image' ? 'https://via.placeholder.com/600x300' : ''
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const updateBlockContent = (id: string, content: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    return (
        <div className="flex h-[calc(100vh-12rem)] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Sidebar (Tools) */}
            <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content Blocks</div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => addBlock('text')} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                        <Type size={20} />
                        <span className="text-xs font-medium">Text</span>
                    </button>
                    <button onClick={() => addBlock('image')} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                        <Image size={20} />
                        <span className="text-xs font-medium">Image</span>
                    </button>
                    <button onClick={() => addBlock('button')} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                        <MousePointer size={20} />
                        <span className="text-xs font-medium">Button</span>
                    </button>
                    <button onClick={() => addBlock('divider')} className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                        <MoveVertical size={20} className="rotate-90" />
                        <span className="text-xs font-medium">Divider</span>
                    </button>
                </div>

                <div className="mt-auto border-t border-slate-200 pt-4 space-y-2">
                    <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm shadow-md shadow-indigo-200">
                        <Save size={16} /> Save Template
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 p-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm">
                        <Eye size={16} /> Preview
                    </button>
                </div>
            </div>

            {/* Canvas (Editor) */}
            <div className="flex-1 bg-slate-100 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto bg-white min-h-[600px] shadow-lg rounded-none sm:rounded-md border border-slate-200">
                    {blocks.map((block, index) => (
                        <div
                            key={block.id}
                            onClick={() => setSelectedBlockId(block.id)}
                            className={`relative group p-4 border-2 border-transparent hover:border-indigo-100 transition-all ${selectedBlockId === block.id ? '!border-indigo-500 ring-2 ring-indigo-100' : ''}`}
                        >
                            {/* Block Controls overlay */}
                            <div className={`absolute right-2 top-[-12px] bg-white shadow-md border border-slate-200 rounded-md flex overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity z-10 ${selectedBlockId === block.id ? 'opacity-100' : ''}`}>
                                <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} className="p-1.5 hover:bg-slate-50 text-slate-500" title="Move Up"><MoveVertical size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1.5 hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={14} /></button>
                            </div>

                            {/* Block Content Rendering */}
                            {block.type === 'text' && (
                                <div dangerouslySetInnerHTML={{ __html: block.content }} className="prose prose-sm max-w-none focus:outline-none" />
                            )}
                            {block.type === 'image' && (
                                <img src={block.content} alt="Block" className="w-full h-auto rounded-md" />
                            )}
                            {block.type === 'button' && (
                                <div className="text-center">
                                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700">{block.content}</button>
                                </div>
                            )}
                            {block.type === 'divider' && (
                                <hr className="border-slate-200 my-2" />
                            )}
                        </div>
                    ))}

                    {blocks.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 border-2 border-dashed border-slate-200 m-8 rounded-lg">
                            <Layout size={32} className="mb-2 opacity-50" />
                            <p className="text-sm">Drag and drop blocks here or click to add</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Properties Panel (Right Sidebar) */}
            {selectedBlock && (
                <div className="w-72 bg-white border-l border-slate-200 p-4 animate-in slide-in-from-right duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Properties</span>
                        <button onClick={() => setSelectedBlockId(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                    </div>

                    <div className="space-y-4">
                        {selectedBlock.type === 'text' && (
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Content (HTML)</label>
                                <textarea
                                    value={selectedBlock.content}
                                    onChange={(e) => updateBlockContent(selectedBlock.id, e.target.value)}
                                    rows={8}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                />
                            </div>
                        )}
                        {selectedBlock.type === 'button' && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Button Text</label>
                                    <input
                                        type="text"
                                        value={selectedBlock.content}
                                        onChange={(e) => updateBlockContent(selectedBlock.id, e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Link URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </>
                        )}
                        {selectedBlock.type === 'image' && (
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={selectedBlock.content}
                                    onChange={(e) => updateBlockContent(selectedBlock.id, e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <div className="mt-2 text-xs text-slate-400">
                                    Tip: Paste a URL for now. Upload support coming later.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper for 'X' icon
const X = ({ size }: { size: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M18 6 6 18" /><path d="m6 6 18 12" />
    </svg>
);

export default VisualEmailBuilder;
