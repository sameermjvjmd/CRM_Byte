import { useState, useEffect, useRef } from 'react';
import {
    FileText, Download, Trash2, Upload, File, Eye, History,
    Tag, FolderOpen, Search, X, Edit2, Clock, Image as ImageIcon,
    FileSpreadsheet, Filter
} from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

interface DocumentsTabProps {
    entityType: 'Contact' | 'Company' | 'Group' | 'Opportunity';
    entityId: number;
    onEdit?: (doc: any) => void;
}

interface Document {
    id: number;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    contentType: string;
    description?: string;
    category?: string;
    tags?: string;
    version: number;
    isPublic: boolean;
    accessCount: number;
    lastAccessedAt?: string;
    formattedFileSize: string;
    fileExtension: string;
    isImage: boolean;
    isPdf: boolean;
    isOfficeDoc: boolean;
    versionCount: number;
}

interface DocumentVersion {
    id: number;
    fileName: string;
    fileSize: number;
    version: number;
    uploadedAt: string;
    uploadedByUserId?: number;
    formattedFileSize: string;
}

const CATEGORIES = [
    'Contract', 'Proposal', 'Invoice', 'Quote', 'Marketing Material',
    'Presentation', 'Report', 'Legal', 'HR Document', 'Technical Documentation',
    'Meeting Notes', 'Other'
];

const DocumentsTab = ({ entityType, entityId, onEdit }: DocumentsTabProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [versions, setVersions] = useState<DocumentVersion[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload form state
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadCategory, setUploadCategory] = useState('');
    const [uploadTags, setUploadTags] = useState('');

    // Edit form state
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editTags, setEditTags] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [entityType, entityId, selectedCategory, searchTerm]);

    const fetchDocuments = async () => {
        try {
            const params = new URLSearchParams({
                entityType,
                entityId: entityId.toString(),
            });
            if (selectedCategory) params.append('category', selectedCategory);
            if (searchTerm) params.append('search', searchTerm);

            const response = await api.get(`/documents?${params}`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadFile(file);
            setShowUploadModal(true);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) return;

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('entityType', entityType);
        formData.append('entityId', entityId.toString());
        if (uploadDescription) formData.append('description', uploadDescription);
        if (uploadCategory) formData.append('category', uploadCategory);
        if (uploadTags) formData.append('tags', uploadTags);

        setUploading(true);
        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Document uploaded successfully');
            setShowUploadModal(false);
            resetUploadForm();
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const resetUploadForm = () => {
        setUploadFile(null);
        setUploadDescription('');
        setUploadCategory('');
        setUploadTags('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDownload = async (doc: Document) => {
        try {
            const response = await api.get(`/documents/${doc.id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success('Document downloaded');
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Failed to download document');
        }
    };

    const handlePreview = (doc: Document) => {
        if (!doc.isImage && !doc.isPdf) {
            toast.error('Preview not available for this file type');
            return;
        }
        setSelectedDoc(doc);
        setShowPreview(true);
    };

    const handleViewVersions = async (doc: Document) => {
        try {
            const response = await api.get(`/documents/${doc.id}/versions`);
            setVersions(response.data);
            setSelectedDoc(doc);
            setShowVersions(true);
        } catch (error) {
            console.error('Error fetching versions:', error);
            toast.error('Failed to load version history');
        }
    };

    const handleEdit = (doc: Document) => {
        setSelectedDoc(doc);
        setEditDescription(doc.description || '');
        setEditCategory(doc.category || '');
        setEditTags(doc.tags || '');
        setEditIsPublic(doc.isPublic);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedDoc) return;

        try {
            await api.put(`/documents/${selectedDoc.id}`, {
                description: editDescription,
                category: editCategory,
                tags: editTags,
                isPublic: editIsPublic,
            });
            toast.success('Document updated successfully');
            setShowEditModal(false);
            fetchDocuments();
        } catch (error) {
            console.error('Error updating document:', error);
            toast.error('Failed to update document');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this document and all its versions?')) return;
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(documents.filter(d => d.id !== id));
            toast.success('Document deleted');
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document');
        }
    };

    const getFileIcon = (doc: Document) => {
        if (doc.isImage) return <ImageIcon size={20} />;
        if (doc.isPdf) return <FileText size={20} />;
        if (doc.isOfficeDoc) return <FileSpreadsheet size={20} />;
        return <File size={20} />;
    };

    const getCategoryColor = (category?: string) => {
        const colors: Record<string, string> = {
            'Contract': 'bg-blue-100 text-blue-700',
            'Proposal': 'bg-purple-100 text-purple-700',
            'Invoice': 'bg-green-100 text-green-700',
            'Quote': 'bg-yellow-100 text-yellow-700',
            'Legal': 'bg-red-100 text-red-700',
            'Marketing Material': 'bg-pink-100 text-pink-700',
        };
        return colors[category || ''] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header with Search and Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Attached Documents</h4>
                    <p className="text-xs text-slate-500 mt-1">Manage files and agreements for this record.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-sm text-xs font-black uppercase tracking-widest transition-all"
                    >
                        <Upload size={14} strokeWidth={3} />
                        Upload File
                    </button>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Documents Grid */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="p-4 bg-white rounded-full text-slate-300 mb-3 shadow-sm">
                        <FileText size={24} />
                    </div>
                    <div className="text-sm font-bold text-slate-800">No documents yet</div>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">Upload proposals, contracts, or agreements to keep them handy.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {documents.map((doc) => (
                        <div key={doc.id} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 overflow-hidden flex-1">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                    {getFileIcon(doc)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-sm font-bold text-slate-900 truncate" title={doc.fileName}>
                                            {doc.fileName}
                                        </div>
                                        {doc.version > 1 && (
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full">
                                                v{doc.version}
                                            </span>
                                        )}
                                        {doc.category && (
                                            <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${getCategoryColor(doc.category)}`}>
                                                {doc.category}
                                            </span>
                                        )}
                                    </div>
                                    {doc.description && (
                                        <div className="text-xs text-slate-600 truncate mb-1">{doc.description}</div>
                                    )}
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-wrap">
                                        <span>{doc.formattedFileSize}</span>
                                        <span>•</span>
                                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                        {doc.accessCount > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{doc.accessCount} downloads</span>
                                            </>
                                        )}
                                        {doc.tags && (
                                            <>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <Tag size={10} />
                                                    <span>{doc.tags}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {(doc.isImage || doc.isPdf) && (
                                    <button
                                        onClick={() => handlePreview(doc)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Preview"
                                    >
                                        <Eye size={16} />
                                    </button>
                                )}
                                {doc.versionCount > 0 && (
                                    <button
                                        onClick={() => handleViewVersions(doc)}
                                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                        title="Version History"
                                    >
                                        <History size={16} />
                                    </button>
                                )}
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(doc)}
                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Edit Content"
                                    >
                                        <FileText size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleEdit(doc)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Details"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <Download size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Upload Document</h3>
                            <button onClick={() => { setShowUploadModal(false); resetUploadForm(); }} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
                                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{uploadFile?.name}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={uploadDescription}
                                    onChange={(e) => setUploadDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    rows={2}
                                    placeholder="Optional description..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    value={uploadCategory}
                                    onChange={(e) => setUploadCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select category...</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                                <input
                                    type="text"
                                    value={uploadTags}
                                    onChange={(e) => setUploadTags(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., legal, q1, 2026"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && selectedDoc && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="max-w-6xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 text-white">
                            <h3 className="text-lg font-bold">{selectedDoc.fileName}</h3>
                            <button onClick={() => setShowPreview(false)} className="hover:text-slate-300">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="bg-white rounded-lg overflow-auto flex-1">
                            {selectedDoc.isImage ? (
                                <img
                                    src={`${api.defaults.baseURL}/documents/${selectedDoc.id}/preview`}
                                    alt={selectedDoc.fileName}
                                    className="max-w-full h-auto mx-auto"
                                />
                            ) : selectedDoc.isPdf ? (
                                <iframe
                                    src={`${api.defaults.baseURL}/documents/${selectedDoc.id}/preview`}
                                    className="w-full h-full min-h-[600px]"
                                    title={selectedDoc.fileName}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Version History Modal */}
            {showVersions && selectedDoc && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Version History: {selectedDoc.fileName}</h3>
                            <button onClick={() => setShowVersions(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {versions.map((ver) => (
                                <div key={ver.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                                            v{ver.version}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{ver.fileName}</div>
                                            <div className="text-xs text-slate-500">
                                                {ver.formattedFileSize} • {new Date(ver.uploadedAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload({ ...selectedDoc, id: ver.id, fileName: ver.fileName })}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                        title="Download this version"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedDoc && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Edit Document Details</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">No category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                                <input
                                    type="text"
                                    value={editTags}
                                    onChange={(e) => setEditTags(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., legal, q1, 2026"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsTab;
