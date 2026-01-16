import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Trash2, Upload, File } from 'lucide-react';
import api from '../api/api';

interface DocumentsTabProps {
    entityType: 'Contact' | 'Company' | 'Group' | 'Opportunity';
    entityId: number;
}

interface Document {
    id: number;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    contentType: string;
}

const DocumentsTab = ({ entityType, entityId }: DocumentsTabProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocuments();
    }, [entityType, entityId]);

    const fetchDocuments = async () => {
        try {
            const response = await api.get(`/documents?entityType=${entityType}&entityId=${entityId}`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', entityType);
        formData.append('entityId', entityId.toString());

        setUploading(true);
        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchDocuments(); // Refresh list
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Failed to upload document.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
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
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(documents.filter(d => d.id !== id));
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Attached Documents</h4>
                    <p className="text-xs text-slate-500 mt-1">Manage files and agreements for this record.</p>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-sm text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                        {uploading ? (
                            <span className="animate-pulse">Uploading...</span>
                        ) : (
                            <>
                                <Upload size={14} strokeWidth={3} />
                                Upload File
                            </>
                        )}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                        <div key={doc.id} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                    <File size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-slate-900 truncate" title={doc.fileName}>{doc.fileName}</div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                        <span>{formatSize(doc.fileSize)}</span>
                                        <span>•</span>
                                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>
    );
};

export default DocumentsTab;
