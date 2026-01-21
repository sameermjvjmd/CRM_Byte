import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
    Plus, Search, Filter, MoreVertical, FileText, Send,
    CheckCircle, XCircle, Clock, Eye, Copy, Trash2,
    Building2, User, DollarSign, Calendar
} from 'lucide-react';
import CreateQuoteModal from '../components/CreateQuoteModal';

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
                                        <div className="flex items-center justify-end gap-1">
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
                />
            )}
        </div>
    );
};

export default QuotesPage;
