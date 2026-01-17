import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
    Plus, Search, Filter, MoreVertical, FileText, Send,
    CheckCircle, XCircle, Clock, Eye, Copy, Trash2,
    Building2, User, DollarSign, Calendar
} from 'lucide-react';

interface Quote {
    id: number;
    subject: string;
    quoteNumber: string;
    status: string;
    contactId?: number;
    contact?: { firstName: string; lastName: string };
    companyId?: number;
    company?: { name: string };
    opportunityId?: number;
    opportunity?: { name: string };
    quoteDate: string;
    expirationDate?: string;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    currency: string;
    recipientName?: string;
    recipientEmail?: string;
    createdAt: string;
    lineItems?: QuoteLineItem[];
}

interface QuoteLineItem {
    id: number;
    productId?: number;
    name: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

interface Product {
    id: number;
    name: string;
    sku?: string;
    price: number;
    category: string;
    isTaxable: boolean;
    taxRate: number;
}

const statusConfig: Record<string, { color: string; icon: any; bg: string }> = {
    Draft: { color: 'text-slate-600', icon: FileText, bg: 'bg-slate-100' },
    Sent: { color: 'text-blue-600', icon: Send, bg: 'bg-blue-100' },
    Viewed: { color: 'text-purple-600', icon: Eye, bg: 'bg-purple-100' },
    Accepted: { color: 'text-green-600', icon: CheckCircle, bg: 'bg-green-100' },
    Declined: { color: 'text-red-600', icon: XCircle, bg: 'bg-red-100' },
    Expired: { color: 'text-orange-600', icon: Clock, bg: 'bg-orange-100' },
};

const QuotesPage = () => {
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetchQuotes();
        fetchProducts();
    }, [statusFilter]);

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (searchQuery) params.append('search', searchQuery);

            const response = await api.get(`/quotes?${params.toString()}`);
            setQuotes(response.data);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products?activeOnly=true');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this quote?')) return;

        try {
            await api.delete(`/quotes/${id}`);
            setQuotes(quotes.filter(q => q.id !== id));
        } catch (error) {
            console.error('Error deleting quote:', error);
            alert('Failed to delete quote');
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            await api.post(`/quotes/${id}/duplicate`);
            fetchQuotes();
        } catch (error) {
            console.error('Error duplicating quote:', error);
            alert('Failed to duplicate quote');
        }
    };

    const handleSend = async (quote: Quote) => {
        const email = prompt('Enter recipient email:', quote.recipientEmail || '');
        if (!email) return;

        try {
            await api.post(`/quotes/${quote.id}/send`, { email });
            fetchQuotes();
            alert('Quote sent successfully!');
        } catch (error) {
            console.error('Error sending quote:', error);
            alert('Failed to send quote');
        }
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status] || statusConfig.Draft;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.color} ${config.bg}`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    const statuses = ['', 'Draft', 'Sent', 'Viewed', 'Accepted', 'Declined', 'Expired'];

    return (
        <div className="p-6 bg-slate-50 min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Quotes & Proposals</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Create and manage quotes for your clients
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} />
                    NEW QUOTE
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search quotes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchQuotes()}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Statuses</option>
                        {statuses.filter(s => s).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Quotes', value: quotes.length, icon: FileText, color: 'indigo' },
                    { label: 'Draft', value: quotes.filter(q => q.status === 'Draft').length, icon: FileText, color: 'slate' },
                    { label: 'Sent', value: quotes.filter(q => q.status === 'Sent').length, icon: Send, color: 'blue' },
                    { label: 'Accepted', value: quotes.filter(q => q.status === 'Accepted').length, icon: CheckCircle, color: 'green' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                                <stat.icon size={20} className={`text-${stat.color}-600`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quotes Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Quote</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Client</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Date</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Total</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={6} className="px-6 py-6">
                                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    </td>
                                </tr>
                            ))
                        ) : quotes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-medium">No quotes found</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                                    >
                                        Create your first quote
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            quotes.map(quote => (
                                <tr key={quote.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-slate-900">{quote.subject}</p>
                                            <p className="text-xs text-slate-500 font-medium">{quote.quoteNumber}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            {quote.contact && (
                                                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                                    <User size={12} className="text-slate-400" />
                                                    {quote.contact.firstName} {quote.contact.lastName}
                                                </span>
                                            )}
                                            {quote.company && (
                                                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Building2 size={12} />
                                                    {quote.company.name}
                                                </span>
                                            )}
                                            {!quote.contact && !quote.company && (
                                                <span className="text-sm text-slate-400 italic">No client</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(quote.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium text-slate-700">
                                                {formatDate(quote.quoteDate)}
                                            </span>
                                            {quote.expirationDate && (
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    Expires {formatDate(quote.expirationDate)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-lg font-black text-slate-900">
                                            {formatCurrency(quote.total, quote.currency)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/quotes/${quote.id}`)}
                                                className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors"
                                                title="View/Edit"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {quote.status === 'Draft' && (
                                                <button
                                                    onClick={() => handleSend(quote)}
                                                    className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                                                    title="Send"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDuplicate(quote.id)}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                                                title="Duplicate"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quote.id)}
                                                className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Quote Modal */}
            {showCreateModal && (
                <CreateQuoteModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchQuotes();
                    }}
                    products={products}
                />
            )}
        </div>
    );
};

// Create Quote Modal Component
const CreateQuoteModal = ({
    onClose,
    onSuccess,
    products
}: {
    onClose: () => void;
    onSuccess: () => void;
    products: Product[];
}) => {
    const [formData, setFormData] = useState({
        subject: '',
        contactId: '',
        companyId: '',
        opportunityId: '',
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentTerms: 'Net 30',
        notes: '',
        currency: 'USD'
    });
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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
                contactId: formData.contactId ? parseInt(formData.contactId) : null,
                companyId: formData.companyId ? parseInt(formData.companyId) : null,
                opportunityId: formData.opportunityId ? parseInt(formData.opportunityId) : null,
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Create New Quote</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                Quote Subject *
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium"
                                placeholder="e.g., Website Redesign Proposal"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                Expiration Date
                            </label>
                            <input
                                type="date"
                                value={formData.expirationDate}
                                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                                Payment Terms
                            </label>
                            <select
                                value={formData.paymentTerms}
                                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium"
                            >
                                <option value="Due on Receipt">Due on Receipt</option>
                                <option value="Net 15">Net 15</option>
                                <option value="Net 30">Net 30</option>
                                <option value="Net 45">Net 45</option>
                                <option value="Net 60">Net 60</option>
                            </select>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-bold text-slate-600 uppercase">
                                Line Items
                            </label>
                            <button
                                type="button"
                                onClick={addLineItem}
                                className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>
                        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                            {lineItems.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-slate-400 font-medium">No items added yet</p>
                                    <button
                                        type="button"
                                        onClick={addLineItem}
                                        className="mt-2 text-indigo-600 font-bold text-sm hover:underline"
                                    >
                                        Add your first item
                                    </button>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Product/Item</th>
                                            <th className="px-4 py-2 text-center text-xs font-bold text-slate-500 w-20">Qty</th>
                                            <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 w-28">Price</th>
                                            <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 w-28">Total</th>
                                            <th className="px-4 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {lineItems.map((item, index) => (
                                            <tr key={index} className="bg-white">
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={item.productId || ''}
                                                        onChange={(e) => updateLineItem(index, 'productId', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-slate-200 rounded font-medium text-sm"
                                                    >
                                                        <option value="">-- Select Product --</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} ({p.sku || 'No SKU'}) - ${p.price}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {!item.productId && (
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                                                            className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded font-medium text-sm"
                                                            placeholder="Or enter custom item name"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                                                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-center font-medium"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-right font-medium"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                    ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLineItem(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-700">
                                                Total:
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-lg text-indigo-600">
                                                ${calculateTotal().toFixed(2)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-medium resize-none"
                            placeholder="Additional notes or terms..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="text-2xl font-black text-slate-900">
                        Total: <span className="text-indigo-600">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Quote'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotesPage;
