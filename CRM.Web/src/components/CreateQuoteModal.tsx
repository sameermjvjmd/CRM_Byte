import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';
import api from '../api/api';

interface Product {
    id: number;
    name: string;
    sku?: string;
    price: number;
    category: string;
    isTaxable: boolean;
    taxRate: number;
}

interface CreateQuoteModalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: {
        opportunityId?: number;
        contactId?: number;
        companyId?: number;
        lineItems?: any[];
        subject?: string;
    };
}

const CreateQuoteModal = ({ onClose, onSuccess, initialData }: CreateQuoteModalProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        subject: initialData?.subject || '',
        contactId: initialData?.contactId || '',
        companyId: initialData?.companyId || '',
        opportunityId: initialData?.opportunityId || '',
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentTerms: 'Net 30',
        notes: '',
        currency: 'USD'
    });
    const [lineItems, setLineItems] = useState<any[]>(initialData?.lineItems || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, contactsRes, companiesRes] = await Promise.all([
                    api.get('/products?activeOnly=true'),
                    api.get('/contacts'),
                    api.get('/companies')
                ]);
                setProducts(productsRes.data);
                setContacts(contactsRes.data);
                setCompanies(companiesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const addLineItem = () => {
        setLineItems([...lineItems, {
            productId: null,
            name: '',
            quantity: 1,
            unitPrice: 0,
            discountPercent: 0,
            isTaxable: true,
            taxRate: 0
        }]);
    };

    const updateLineItem = (index: number, field: string, value: any) => {
        const updated = [...lineItems];
        updated[index][field] = value;

        // If product selected, populate fields
        if (field === 'productId' && value) {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                updated[index].name = product.name;
                updated[index].sku = product.sku;
                updated[index].unitPrice = product.price;
                updated[index].isTaxable = product.isTaxable;
                updated[index].taxRate = product.taxRate;
            }
        }

        setLineItems(updated);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return lineItems.reduce((sum, item) => {
            const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
            const discount = lineTotal * ((item.discountPercent || 0) / 100);
            const tax = item.isTaxable ? (lineTotal - discount) * ((item.taxRate || 0) / 100) : 0;
            return sum + lineTotal - discount + tax;
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject) {
            alert('Please enter a quote subject');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                contactId: formData.contactId ? parseInt(String(formData.contactId)) : null,
                companyId: formData.companyId ? parseInt(String(formData.companyId)) : null,
                opportunityId: formData.opportunityId ? parseInt(String(formData.opportunityId)) : null,
                lineItems: lineItems.map((item, index) => ({
                    ...item,
                    productId: item.productId ? parseInt(item.productId) : null,
                    sortOrder: index
                }))
            };

            await api.post('/quotes', payload);
            onSuccess();
        } catch (error: any) {
            console.error('Error creating quote:', error);
            const data = error.response?.data;
            let errorMsg = 'Failed to create quote';

            if (data?.errors) {
                const details = Object.entries(data.errors)
                    .map(([key, val]) => `${key}: ${(val as string[]).join(', ')}`)
                    .join('\n');
                errorMsg = (data.title || 'Validation Error') + '\n\n' + details;
            } else if (data?.title) {
                errorMsg = data.title;
            } else if (data?.message) {
                errorMsg = data.message;
            }

            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
                    <h2 className="text-xl font-black text-white">Create New Quote</h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {/* Basic Info */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Quote Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                    Quote Subject *
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="e.g., Website Redesign Proposal"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                    Client (Contact)
                                </label>
                                <select
                                    value={formData.contactId}
                                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    <option value="">-- Select Contact --</option>
                                    {contacts.map(c => (
                                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                    Client (Company)
                                </label>
                                <select
                                    value={formData.companyId}
                                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    <option value="">-- Select Company --</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                    Expiration Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.expirationDate}
                                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                    Payment Terms
                                </label>
                                <select
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    <option value="Due on Receipt">Due on Receipt</option>
                                    <option value="Net 15">Net 15</option>
                                    <option value="Net 30">Net 30</option>
                                    <option value="Net 45">Net 45</option>
                                    <option value="Net 60">Net 60</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">
                                Line Items
                            </label>
                            <button
                                type="button"
                                onClick={addLineItem}
                                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all"
                            >
                                <Plus size={14} /> Add Item
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            {lineItems.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                                        <Plus size={24} />
                                    </div>
                                    <p className="text-slate-400 font-medium text-sm">No items added yet</p>
                                    <button
                                        type="button"
                                        onClick={addLineItem}
                                        className="mt-2 text-indigo-600 font-bold text-xs hover:underline uppercase tracking-wide"
                                    >
                                        Add your first item
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 w-[40%]">Product/Item</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 w-[15%]">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 w-[20%]">Price</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 w-[20%]">Total</th>
                                                <th className="px-4 py-3 w-[5%]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {lineItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={item.productId || ''}
                                                            onChange={(e) => updateLineItem(index, 'productId', e.target.value)}
                                                            className="w-full px-2 py-1.5 border border-slate-200 rounded font-medium text-sm mb-2 focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        >
                                                            <option value="">-- Select Product --</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.name} ({p.sku || 'No SKU'}) - ${p.price}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                                                            className="w-full px-2 py-1.5 border border-slate-200 rounded font-medium text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                                            placeholder="Item name / description"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                                                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-center font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-right font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-slate-700 align-top pt-5">
                                                        ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center align-top pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLineItem(index)}
                                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 border-t border-slate-200">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-widest text-xs">
                                                    Total Amount
                                                </td>
                                                <td className="px-4 py-3 text-right font-black text-xl text-indigo-600">
                                                    ${calculateTotal().toFixed(2)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                            Additional Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium resize-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Terms & conditions, delivery notes, etc."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="text-sm font-medium text-slate-500">
                        {lineItems.length} items
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-white hover:border-slate-300 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check size={18} />
                            )}
                            {loading ? 'Creating...' : 'Create Quote'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateQuoteModal;
