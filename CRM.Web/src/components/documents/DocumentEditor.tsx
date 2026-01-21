import React, { useRef, useEffect } from 'react';
import { DocumentEditorContainerComponent, Toolbar } from '@syncfusion/ej2-react-documenteditor';
import { registerLicense } from '@syncfusion/ej2-base';
import { X } from 'lucide-react';

// Import Syncfusion styles
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-react-documenteditor/styles/material.css';

// Register Syncfusion license
// Replace this with your actual license key
registerLicense('ORg4AjUWIQA/Gnt2VVhhQlFaclhJXGFWfVJpTGpQdk5xdV9DaVZUTWY/P1ZhSXxVdkRhWX5dcHNURGdbVUN9XUI=');

import api from '../../api/api';
import toast from 'react-hot-toast';

DocumentEditorContainerComponent.Inject(Toolbar);

interface DocumentEditorProps {
    isOpen: boolean;
    onClose: () => void;
    contactId?: number;
    contactName?: string;
    onSave?: (content: string, type: 'note' | 'attachment') => void;
    initialDocumentId?: number;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
    isOpen,
    onClose,
    contactId,
    contactName,
    onSave,
    initialDocumentId
}) => {
    const containerRef = useRef<DocumentEditorContainerComponent>(null);

    // Setup service URL for backend operations (Import, Paste, RestrictEditing)
    // Ensure CORS is configured on backend to allow this origin
    const serviceUrl = 'http://localhost:5000/api/documenteditor/';

    useEffect(() => {
        if (isOpen && initialDocumentId && containerRef.current) {
            loadDocument(initialDocumentId);
        }
    }, [isOpen, initialDocumentId]);

    const loadDocument = async (docId: number) => {
        const loadingToast = toast.loading('Loading document...');
        try {
            // 1. Get file content as Blob
            const response = await api.get(`/documents/${docId}/download`, { responseType: 'blob' });

            // 2. Import via Backend to get SFDT
            const formData = new FormData();
            formData.append('files', response.data, 'document.docx');

            // Use fetch because api uses baseUrl /api, but serviceUrl includes /api/documenteditor/ which contains Import
            // But wait, serviceUrl is 'http://localhost:5000/api/documenteditor/'
            // Import endpoint is 'http://localhost:5000/api/documenteditor/Import'

            const importRes = await fetch(serviceUrl + 'Import', {
                method: 'POST',
                body: formData
            });

            if (!importRes.ok) throw new Error('Import failed');

            const sfdt = await importRes.text(); // Returns JSON string

            // 3. Open in Editor
            if (containerRef.current) {
                containerRef.current.documentEditor.open(sfdt);
                toast.success('Document loaded', { id: loadingToast });
            }
        } catch (error) {
            console.error('Error loading document:', error);
            toast.error('Failed to load document', { id: loadingToast });
        }
    };

    const onSaveDocument = () => {
        if (containerRef.current) {
            containerRef.current.documentEditor.save(contactName || 'Document', 'Docx');
        }
    };

    const handleSaveToCrm = () => {
        if (!containerRef.current || !contactId) return;

        const fileName = (contactName ? `${contactName}_Document` : 'Document') + '.docx';
        const loadingToast = toast.loading('Saving to record...');

        containerRef.current.documentEditor.saveAsBlob('Docx').then(async (blob: Blob) => {
            const formData = new FormData();
            formData.append('file', blob, fileName);

            try {
                if (initialDocumentId) {
                    await api.put(`/documents/${initialDocumentId}/content`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    toast.success('Document updated successfully!', { id: loadingToast });
                } else {
                    formData.append('entityType', 'Contact');
                    formData.append('entityId', contactId.toString());

                    await api.post('/documents/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    toast.success('Document saved to record successfully!', { id: loadingToast });
                }
            } catch (error) {
                console.error('Error saving to CRM:', error);
                toast.error('Failed to save document to record.', { id: loadingToast });
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-800">
                            Document Editor - {contactName || 'New Document'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {contactId && (
                            <button
                                onClick={handleSaveToCrm}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded hover:bg-emerald-700 transition shadow-sm"
                            >
                                Save to Record
                            </button>
                        )}
                        <button
                            onClick={onSaveDocument}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 transition shadow-sm"
                        >
                            Download
                        </button>
                        <div className="h-6 w-px bg-slate-300 mx-2"></div>
                        <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-600 rounded">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Editor Container */}
                <div className="flex-1 overflow-hidden bg-gray-100">
                    <DocumentEditorContainerComponent
                        ref={containerRef}
                        id="container"
                        height={'100%'}
                        serviceUrl={serviceUrl}
                        enableToolbar={true}
                        locale="en-US"
                    />
                </div>
            </div>
            <style>{`
                /* Overrides for Syncfusion z-index issues if any */
                .e-dialog { z-index: 10000 !important; }
            `}</style>
        </div>
    );
};

export default DocumentEditor;
