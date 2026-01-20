import { useState, useEffect } from 'react';
import { quoteTemplatesApi } from '../../api/quoteTemplatesApi';
import type { QuoteTemplate } from '../../types/QuoteTemplate';
import { Plus, Edit2, Trash2, Check, Layout, X, Save, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const QuoteTemplatesPage = () => {
    const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Partial<QuoteTemplate>>({
        name: 'New Template',
        primaryColor: '#4f46e5',
        secondaryColor: '#64748b',
        textColor: '#0f172a',
        companyName: 'Your Company Name',
        companyAddress: '123 Business Street\nCity, State 12345',
        defaultFooter: 'Thank you for your business!',
        isDefault: false,
        showSku: true,
        showQuantity: true,
        showDiscountColumn: true,
        showTaxSummary: true,
        showShipping: true,
        showNotes: true
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const data = await quoteTemplatesApi.getAll();
            setTemplates(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (template: QuoteTemplate) => {
        setCurrentTemplate(template);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentTemplate({
            name: 'New Template',
            primaryColor: '#4f46e5',
            secondaryColor: '#64748b',
            textColor: '#0f172a',
            companyName: 'Your Company Name',
            companyAddress: '123 Business Street\nCity, State 12345',
            defaultFooter: 'Thank you for your business!',
            isDefault: false,
            showSku: true,
            showQuantity: true,
            showDiscountColumn: true,
            showTaxSummary: true,
            showShipping: true,
            showNotes: true
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!currentTemplate.name) {
            toast.error('Template name is required');
            return;
        }

        try {
            if (currentTemplate.id) {
                await quoteTemplatesApi.update(currentTemplate.id, currentTemplate as QuoteTemplate);
                toast.success('Template updated');
            } else {
                await quoteTemplatesApi.create(currentTemplate as QuoteTemplate);
                toast.success('Template created');
            }
            setIsEditing(false);
            fetchTemplates();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save template');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await quoteTemplatesApi.delete(id);
            toast.success('Template deleted');
            fetchTemplates();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete template');
        }
    };

    // Live Preview Component
    const QuotePreview = ({ data }: { data: Partial<QuoteTemplate> }) => (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-slate-200 w-full max-w-[210mm] aspect-[210/297] mx-auto text-[0.6rem] relative">
            {/* Header */}
            <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-2"
                            style={{ backgroundColor: data.primaryColor }}
                        >
                            Q
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: data.textColor }}>QUOTE</h1>
                        <p style={{ color: data.secondaryColor }}>#Q-2026-001</p>
                    </div>
                    <div className="text-right">
                        <h2 className="font-bold text-lg" style={{ color: data.textColor }}>{data.companyName}</h2>
                        <div className="whitespace-pre-wrap" style={{ color: data.secondaryColor }}>
                            {data.companyAddress}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="font-bold uppercase mb-1" style={{ color: data.secondaryColor }}>Quote To:</p>
                        <p className="font-bold" style={{ color: data.textColor }}>John Doe</p>
                        <p style={{ color: data.secondaryColor }}>Acme Corp</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-bold uppercase mb-1" style={{ color: data.secondaryColor }}>Date</p>
                            <p className="font-bold" style={{ color: data.textColor }}>Jan 19, 2026</p>
                        </div>
                        <div>
                            <p className="font-bold uppercase mb-1" style={{ color: data.secondaryColor }}>Valid Until</p>
                            <p className="font-bold" style={{ color: data.textColor }}>Feb 19, 2026</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-8">
                    <div className="flex text-white font-bold py-2 px-4 rounded-t-lg" style={{ backgroundColor: data.primaryColor }}>
                        <div className="flex-1">Description</div>
                        {data.showQuantity && <div className="w-16 text-center">Qty</div>}
                        <div className="w-20 text-right">Price</div>
                        <div className="w-20 text-right">Total</div>
                    </div>
                    <div className="border border-t-0 border-slate-200 rounded-b-lg">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex py-2 px-4 border-b border-slate-100 last:border-0 relative">
                                <div className="flex-1">
                                    <div className="font-medium" style={{ color: data.textColor }}>Sample Product {i}</div>
                                    {data.showSku && <div className="text-[0.5rem] opacity-60">SKU-00{i}</div>}
                                </div>
                                {data.showQuantity && <div className="w-16 text-center" style={{ color: data.secondaryColor }}>1</div>}
                                <div className="w-20 text-right" style={{ color: data.secondaryColor }}>$100.00</div>
                                <div className="w-20 text-right font-bold" style={{ color: data.textColor }}>$100.00</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-1/2 space-y-2">
                        <div className="flex justify-between" style={{ color: data.secondaryColor }}>
                            <span>Subtotal</span>
                            <span>$200.00</span>
                        </div>
                        {data.showDiscountColumn && (
                            <div className="flex justify-between text-emerald-600">
                                <span>Discount</span>
                                <span>-$0.00</span>
                            </div>
                        )}
                        {data.showTaxSummary && (
                            <div className="flex justify-between" style={{ color: data.secondaryColor }}>
                                <span>Tax (10%)</span>
                                <span>$20.00</span>
                            </div>
                        )}
                        {data.showShipping && (
                            <div className="flex justify-between" style={{ color: data.secondaryColor }}>
                                <span>Shipping</span>
                                <span>$10.00</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ color: data.textColor, borderColor: data.secondaryColor }}>
                            <span>Total</span>
                            <span style={{ color: data.primaryColor }}>$230.00</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-8 left-8 right-8 text-center border-t pt-4" style={{ borderColor: '#e2e8f0' }}>
                    <p style={{ color: data.secondaryColor }}>{data.defaultFooter}</p>
                    {data.defaultTerms && (
                        <p className="mt-2 text-[0.5rem] text-slate-400">{data.defaultTerms}</p>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="p-8">Loading templates...</div>;

    if (isEditing) {
        return (
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Editor Sidebar */}
                <div className="w-full md:w-96 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Edit Template</h2>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                            <input
                                type="text"
                                value={currentTemplate.name}
                                onChange={e => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={currentTemplate.isDefault}
                                    onChange={e => setCurrentTemplate({ ...currentTemplate, isDefault: e.target.checked })}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Set as Default Template</span>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Layout size={16} /> Branding
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={currentTemplate.companyName}
                                        onChange={e => setCurrentTemplate({ ...currentTemplate, companyName: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address & Details</label>
                                    <textarea
                                        value={currentTemplate.companyAddress}
                                        onChange={e => setCurrentTemplate({ ...currentTemplate, companyAddress: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={currentTemplate.primaryColor}
                                            onChange={e => setCurrentTemplate({ ...currentTemplate, primaryColor: e.target.value })}
                                            className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={currentTemplate.primaryColor}
                                            onChange={e => setCurrentTemplate({ ...currentTemplate, primaryColor: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Secondary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={currentTemplate.secondaryColor}
                                            onChange={e => setCurrentTemplate({ ...currentTemplate, secondaryColor: e.target.value })}
                                            className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={currentTemplate.secondaryColor}
                                            onChange={e => setCurrentTemplate({ ...currentTemplate, secondaryColor: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Layout size={16} /> Layout & Visibility
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { key: 'showSku', label: 'Show SKU Column' },
                                    { key: 'showQuantity', label: 'Show Quantity Column' },
                                    { key: 'showDiscountColumn', label: 'Show Discount Info' },
                                    { key: 'showTaxSummary', label: 'Show Tax Summary' },
                                    { key: 'showShipping', label: 'Show Shipping Cost' },
                                ].map((option) => (
                                    <label key={option.key} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={(currentTemplate as any)[option.key]}
                                            onChange={e => setCurrentTemplate({ ...currentTemplate, [option.key]: e.target.checked })}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-slate-700">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-3">Defaults</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Footer Text</label>
                                    <input
                                        type="text"
                                        value={currentTemplate.defaultFooter}
                                        onChange={e => setCurrentTemplate({ ...currentTemplate, defaultFooter: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Terms & Conditions</label>
                                    <textarea
                                        value={currentTemplate.defaultTerms}
                                        onChange={e => setCurrentTemplate({ ...currentTemplate, defaultTerms: e.target.value })}
                                        rows={4}
                                        placeholder="Enter default terms..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 sticky bottom-0 bg-white">
                        <button
                            onClick={handleSave}
                            className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            <Save size={18} />
                            Save Template
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex items-center justify-center">
                    <div className="scale-100 origin-top shadow-2xl">
                        <QuotePreview data={currentTemplate} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quote Templates</h1>
                    <p className="text-slate-500 mt-1">Manage branding and defaults for your quotes.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="h-32 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: template.primaryColor }}></div>
                            <div className="w-16 h-20 bg-white shadow-sm border border-slate-200 rounded flex flex-col items-center justify-center gap-1">
                                <div className="w-8 h-1 rounded-full opactiy-50" style={{ backgroundColor: template.primaryColor }}></div>
                                <div className="w-10 h-1 bg-slate-100 rounded-full"></div>
                                <div className="w-10 h-1 bg-slate-100 rounded-full"></div>
                            </div>
                            {template.isDefault && (
                                <span className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                                    Default
                                </span>
                            )}
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-slate-900">{template.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{template.companyName}</p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(template)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="px-3 py-2 bg-white border border-slate-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-200 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Layout size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No templates found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuoteTemplatesPage;
