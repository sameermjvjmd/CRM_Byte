import { useState } from 'react';
import { Globe, Link as LinkIcon, Edit, Save, X, ExternalLink } from 'lucide-react';

interface WebLink {
    id: string;
    label: string;
    url: string;
    type: 'personal' | 'business' | 'social' | 'other';
}

interface WebInfo {
    website?: string;
    blog?: string;
    portfolio?: string;
    customLinks: WebLink[];
}

interface WebInfoTabProps {
    contactId: number;
    webInfo: WebInfo;
    onUpdate: (info: WebInfo) => void;
}

const WebInfoTab = ({ contactId, webInfo, onUpdate }: WebInfoTabProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<WebInfo>(webInfo);
    const [newLinkLabel, setNewLinkLabel] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkType, setNewLinkType] = useState<'personal' | 'business' | 'social' | 'other'>('business');

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(webInfo);
        setIsEditing(false);
    };

    const handleAddLink = () => {
        if (newLinkLabel.trim() && newLinkUrl.trim()) {
            const newLink: WebLink = {
                id: Date.now().toString(),
                label: newLinkLabel,
                url: newLinkUrl,
                type: newLinkType
            };
            setFormData(prev => ({
                ...prev,
                customLinks: [...prev.customLinks, newLink]
            }));
            setNewLinkLabel('');
            setNewLinkUrl('');
            setNewLinkType('business');
        }
    };

    const handleRemoveLink = (id: string) => {
        setFormData(prev => ({
            ...prev,
            customLinks: prev.customLinks.filter(link => link.id !== id)
        }));
    };

    const getLinkTypeColor = (type: string) => {
        const colors = {
            personal: 'bg-pink-100 text-pink-700',
            business: 'bg-blue-100 text-blue-700',
            social: 'bg-purple-100 text-purple-700',
            other: 'bg-slate-100 text-slate-700'
        };
        return colors[type as keyof typeof colors] || colors.other;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Web Information</h3>
                    <p className="text-sm font-bold text-slate-500">Websites and online presence</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <Edit size={16} />
                        Edit
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            <Save size={16} />
                            Save
                        </button>
                    </div>
                )}
            </div>

            {/* Primary Websites */}
            <div>
                <h4 className="text-sm font-black uppercase text-slate-400 tracking-wide mb-3">Primary Websites</h4>
                <div className="space-y-3">
                    {/* Website */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe size={16} className="text-blue-600" />
                            <label className="text-xs font-bold text-blue-600 uppercase">Website</label>
                        </div>
                        {isEditing ? (
                            <input
                                type="url"
                                value={formData.website || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com"
                            />
                        ) : (
                            formData.website ? (
                                <a
                                    href={formData.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 font-bold text-blue-900 hover:underline"
                                >
                                    {formData.website}
                                    <ExternalLink size={14} />
                                </a>
                            ) : (
                                <p className="text-blue-400 italic">Not provided</p>
                            )
                        )}
                    </div>

                    {/* Blog */}
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe size={16} className="text-green-600" />
                            <label className="text-xs font-bold text-green-600 uppercase">Blog</label>
                        </div>
                        {isEditing ? (
                            <input
                                type="url"
                                value={formData.blog || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, blog: e.target.value }))}
                                className="w-full px-3 py-2 border border-green-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="https://blog.example.com"
                            />
                        ) : (
                            formData.blog ? (
                                <a
                                    href={formData.blog}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 font-bold text-green-900 hover:underline"
                                >
                                    {formData.blog}
                                    <ExternalLink size={14} />
                                </a>
                            ) : (
                                <p className="text-green-400 italic">Not provided</p>
                            )
                        )}
                    </div>

                    {/* Portfolio */}
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe size={16} className="text-purple-600" />
                            <label className="text-xs font-bold text-purple-600 uppercase">Portfolio</label>
                        </div>
                        {isEditing ? (
                            <input
                                type="url"
                                value={formData.portfolio || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                                className="w-full px-3 py-2 border border-purple-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="https://portfolio.example.com"
                            />
                        ) : (
                            formData.portfolio ? (
                                <a
                                    href={formData.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 font-bold text-purple-900 hover:underline"
                                >
                                    {formData.portfolio}
                                    <ExternalLink size={14} />
                                </a>
                            ) : (
                                <p className="text-purple-400 italic">Not provided</p>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Links */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-black uppercase text-slate-400 tracking-wide">Custom Links</h4>
                    {isEditing && (
                        <span className="text-xs font-bold text-slate-400">{formData.customLinks.length} link(s)</span>
                    )}
                </div>

                {/* Add Link Form (Editing Mode) */}
                {isEditing && (
                    <div className="mb-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                        <h5 className="text-sm font-black text-indigo-900 mb-3">Add New Link</h5>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={newLinkLabel}
                                onChange={(e) => setNewLinkLabel(e.target.value)}
                                placeholder="Label (e.g., LinkedIn)"
                                className="px-3 py-2 border border-indigo-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="url"
                                value={newLinkUrl}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                placeholder="URL"
                                className="px-3 py-2 border border-indigo-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <select
                                value={newLinkType}
                                onChange={(e) => setNewLinkType(e.target.value as any)}
                                className="px-3 py-2 border border-indigo-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="business">Business</option>
                                <option value="personal">Personal</option>
                                <option value="social">Social</option>
                                <option value="other">Other</option>
                            </select>
                            <button
                                onClick={handleAddLink}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all"
                            >
                                Add Link
                            </button>
                        </div>
                    </div>
                )}

                {/* Links List */}
                <div className="space-y-2">
                    {formData.customLinks.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                            <LinkIcon size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-sm font-bold text-slate-500">No custom links</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">Add links to external resources</p>
                        </div>
                    ) : (
                        formData.customLinks.map((link) => (
                            <div
                                key={link.id}
                                className="flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-xl group hover:shadow-md transition-all"
                            >
                                <LinkIcon size={16} className="text-slate-400" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{link.label}</span>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${getLinkTypeColor(link.type)}`}>
                                            {link.type}
                                        </span>
                                    </div>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-1"
                                    >
                                        {link.url}
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => handleRemoveLink(link.id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebInfoTab;
export type { WebInfo, WebLink };
