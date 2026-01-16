import React, { useState, useEffect } from 'react';
import { X, Send, FileText, Eye, EyeOff, Pen } from 'lucide-react';
import { emailApi, type SendEmailRequest, type EmailTemplate, type EmailSignature } from '../../api/emailApi';
import { toast } from 'react-hot-toast';

interface EmailComposerProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTo?: string;
    defaultContactId?: number;
    defaultContactName?: string;
    onSent?: () => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
    isOpen,
    onClose,
    defaultTo = '',
    defaultContactId,
    defaultContactName = '',
    onSent,
}) => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [signatures, setSignatures] = useState<EmailSignature[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [selectedSignatureId, setSelectedSignatureId] = useState<number | null>(null);
    const [to, setTo] = useState(defaultTo);
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Placeholder values for template replacement
    const [placeholders, setPlaceholders] = useState<Record<string, string>>({
        ContactName: defaultContactName,
        CompanyName: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            fetchSignatures();
            setTo(defaultTo);
        }
    }, [isOpen, defaultTo]);

    useEffect(() => {
        setPlaceholders(prev => ({
            ...prev,
            ContactName: defaultContactName,
        }));
    }, [defaultContactName]);

    const fetchTemplates = async () => {
        try {
            const data = await emailApi.getTemplates();
            setTemplates(data.filter(t => t.isActive));
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    };

    const fetchSignatures = async () => {
        try {
            const data = await emailApi.getSignatures();
            setSignatures(data);
            // Auto-select default signature
            const defaultSig = data.find(s => s.isDefault);
            if (defaultSig) {
                setSelectedSignatureId(defaultSig.id);
            }
        } catch (error) {
            console.error('Failed to load signatures:', error);
        }
    };

    const handleTemplateChange = (templateId: number) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplateId(templateId);
            setSubject(replacePlaceholders(template.subject));
            setBody(replacePlaceholders(template.body));
        }
    };

    const replacePlaceholders = (text: string): string => {
        let result = text;
        Object.entries(placeholders).forEach(([key, value]) => {
            result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`);
        });
        return result;
    };

    const handleSend = async () => {
        if (!to.trim()) {
            toast.error('Please enter a recipient email address');
            return;
        }

        if (!subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }

        if (!body.trim()) {
            toast.error('Please enter a message body');
            return;
        }

        setIsSending(true);
        try {
            // Append signature if selected
            let finalBody = body;
            if (selectedSignatureId) {
                const signature = signatures.find(s => s.id === selectedSignatureId);
                if (signature) {
                    finalBody = `${body}<br><br>---<br>${signature.content}`;
                }
            }

            const request: SendEmailRequest = {
                to,
                cc: cc || undefined,
                bcc: bcc || undefined,
                subject,
                body: finalBody,
                templateId: selectedTemplateId || undefined,
                contactId: defaultContactId,
                placeholders,
            };

            await emailApi.sendEmail(request);
            toast.success('Email sent successfully!');
            onClose();
            onSent?.();

            // Reset form
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

    const resetForm = () => {
        setSelectedTemplateId(null);
        setSelectedSignatureId(null);
        setTo(defaultTo);
        setCc('');
        setBcc('');
        setSubject('');
        setBody('');
        setPlaceholders({
            ContactName: defaultContactName,
            CompanyName: '',
        });
        // Re-select default signature
        const defaultSig = signatures.find(s => s.isDefault);
        if (defaultSig) {
            setSelectedSignatureId(defaultSig.id);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div className="flex items-center gap-3">
                        <Send className="w-6 h-6 text-white" />
                        <h2 className="text-xl font-bold text-white">Compose Email</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Template Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <FileText className="inline w-4 h-4 mr-1" />
                            Use Template (Optional)
                        </label>
                        <select
                            value={selectedTemplateId || ''}
                            onChange={(e) => handleTemplateChange(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">-- Select a template --</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.name} - {t.subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Placeholder Fields (if template selected) */}
                    {selectedTemplateId && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                                Template Placeholders
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        value={placeholders.ContactName}
                                        onChange={(e) => setPlaceholders(prev => ({ ...prev, ContactName: e.target.value }))}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={placeholders.CompanyName}
                                        onChange={(e) => setPlaceholders(prev => ({ ...prev, CompanyName: e.target.value }))}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSubject(replacePlaceholders(templates.find(t => t.id === selectedTemplateId)?.subject || ''));
                                    setBody(replacePlaceholders(templates.find(t => t.id === selectedTemplateId)?.body || ''));
                                }}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Apply placeholders
                            </button>
                        </div>
                    )}

                    {/* Recipients */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            To <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="recipient@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cc
                            </label>
                            <input
                                type="email"
                                value={cc}
                                onChange={(e) => setCc(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="cc@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bcc
                            </label>
                            <input
                                type="email"
                                value={bcc}
                                onChange={(e) => setBcc(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="bcc@example.com"
                            />
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Email subject"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                {showPreview ? 'Edit' : 'Preview'}
                            </button>
                        </div>
                        {showPreview ? (
                            <div
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[200px] bg-gray-50 dark:bg-gray-900 overflow-auto"
                                dangerouslySetInnerHTML={{ __html: body }}
                            />
                        ) : (
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={10}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                                placeholder="Email body (HTML supported)"
                            />
                        )}
                    </div>

                    {/* Signature Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Pen className="inline w-4 h-4 mr-1" />
                            Signature (Optional)
                        </label>
                        <select
                            value={selectedSignatureId || ''}
                            onChange={(e) => setSelectedSignatureId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">-- No signature --</option>
                            {signatures.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} {s.isDefault ? '(Default)' : ''}
                                </option>
                            ))}
                        </select>
                        {selectedSignatureId && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-500 mb-1">Preview:</div>
                                <div
                                    className="text-xs text-gray-600 dark:text-gray-400"
                                    dangerouslySetInnerHTML={{ __html: signatures.find(s => s.id === selectedSignatureId)?.content || '' }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        {isSending ? 'Sending...' : 'Send Email'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailComposer;
