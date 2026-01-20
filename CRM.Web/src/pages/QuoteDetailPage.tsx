import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
    ArrowLeft, Save, Send, Download, Trash2, Plus, Check,
    X, FileText, Building2, User, Calendar, Clock, DollarSign,
    Copy, Printer, Mail, ExternalLink
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Quote {
    id: number;
    subject: string;
    quoteNumber: string;
    status: string;
    contactId?: number;
    contact?: { id: number; firstName: string; lastName: string; email?: string };
    companyId?: number;
    company?: { id: number; name: string };
    opportunityId?: number;
    opportunity?: { id: number; name: string };
    quoteDate: string;
    expirationDate?: string;
    sentDate?: string;
    viewedDate?: string;
    acceptedDate?: string;
    declinedDate?: string;
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    total: number;
    currency: string;
    paymentTerms: string;
    termsAndConditions?: string;
    notes?: string;
    recipientName?: string;
    recipientEmail?: string;
    recipientAddress?: string;
    version: number;
    publicToken?: string;
    createdAt: string;
    lastModifiedAt: string;
    lineItems: QuoteLineItem[];
}

interface QuoteLineItem {
    id: number;
    productId?: number;
    product?: { name: string };
    name: string;
    sku?: string;
    description?: string;
    quantity: number;
    unitOfMeasure: string;
    unitPrice: number;
    cost: number;
    discountPercent: number;
    discountAmount: number;
    isTaxable: boolean;
    taxRate: number;
    taxAmount: number;
    lineTotal: number;
    lineTotalWithTax: number;
    sortOrder: number;
    notes?: string;
}

interface Product {
    id: number;
    name: string;
    sku?: string;
    price: number;
    isTaxable: boolean;
    taxRate: number;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    Draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    Sent: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    Viewed: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    Accepted: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    Declined: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    Expired: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
};

const QuoteDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    // Form state
    const [formData, setFormData] = useState<Partial<Quote>>({});
    const [lineItems, setLineItems] = useState<Partial<QuoteLineItem>[]>([]);

    useEffect(() => {
        fetchQuote();
        fetchProducts();
    }, [id]);

    const fetchQuote = async () => {
        try {
            const response = await api.get(`/quotes/${id}`);
            setQuote(response.data);
            setFormData(response.data);
            setLineItems(response.data.lineItems || []);
        } catch (error) {
            console.error('Error fetching quote:', error);
            alert('Failed to load quote');
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

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/quotes/${id}`, {
                ...formData,
                lineItems: lineItems.map((item, index) => ({
                    ...item,
                    sortOrder: index
                }))
            });
            await fetchQuote();
            setIsEditing(false);
            alert('Quote saved successfully!');
        } catch (error: any) {
            console.error('Error saving quote:', error);
            alert(error.response?.data?.title || 'Failed to save quote');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this quote?')) return;

        try {
            await api.delete(`/quotes/${id}`);
            navigate('/quotes');
        } catch (error) {
            console.error('Error deleting quote:', error);
            alert('Failed to delete quote');
        }
    };

    const handleSend = async () => {
        const defaultEmail = quote?.recipientEmail || quote?.contact?.email;
        let email = defaultEmail;

        if (!email) {
            const newEmail = prompt('Enter recipient email:');
            if (!newEmail) return;
            email = newEmail;
        } else {
            if (!confirm(`Send quote to ${email}? Click Cancel to enter a different address.`)) {
                const newEmail = prompt('Enter recipient email:', defaultEmail || '');
                if (!newEmail) return;
                email = newEmail;
            }
        }

        try {
            await api.post(`/quotes/${id}/send`, { email });
            await fetchQuote();
            alert('Quote sent successfully!');
        } catch (error) {
            console.error('Error sending quote:', error);
            alert('Failed to send quote');
        }
    };

    const handleDuplicate = async () => {
        try {
            const response = await api.post(`/quotes/${id}/duplicate`);
            navigate(`/quotes/${response.data.id}`);
        } catch (error) {
            console.error('Error duplicating quote:', error);
            alert('Failed to duplicate quote');
        }
    };

    const addLineItem = () => {
        setLineItems([...lineItems, {
            name: '',
            quantity: 1,
            unitOfMeasure: 'Each',
            unitPrice: 0,
            discountPercent: 0,
            discountAmount: 0,
            isTaxable: true,
            taxRate: 0,
            taxAmount: 0,
            lineTotal: 0,
            lineTotalWithTax: 0,
            sortOrder: lineItems.length
        }]);
    };

    const updateLineItem = (index: number, field: string, value: any) => {
        const updated = [...lineItems];
        (updated[index] as any)[field] = value;

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

        // Recalculate line total
        const item = updated[index];
        const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
        const discount = subtotal * ((item.discountPercent || 0) / 100);
        item.lineTotal = subtotal - discount;
        item.taxAmount = item.isTaxable ? item.lineTotal * ((item.taxRate || 0) / 100) : 0;
        item.lineTotalWithTax = item.lineTotal + item.taxAmount;

        setLineItems(updated);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
        const taxAmount = lineItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
        const discountAmount = subtotal * ((formData.discountPercent || 0) / 100);
        const total = subtotal - discountAmount + taxAmount + (formData.shippingAmount || 0);
        return { subtotal, taxAmount, discountAmount, total };
    };

    // PDF Generation
    const generatePDF = () => {
        if (!quote) return;

        const doc = new jsPDF();
        const totals = calculateTotals();

        // Header
        doc.setFontSize(24);
        doc.setTextColor(30, 58, 95);
        doc.text('QUOTE', 20, 25);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`#${quote.quoteNumber}`, 20, 32);

        // Company info (right side)
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Your Company Name', 140, 25);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text('123 Business Street', 140, 32);
        doc.text('City, State 12345', 140, 37);

        // Quote details
        doc.setFontSize(10);
        doc.setTextColor(0);
        const detailsY = 55;

        doc.text('Quote To:', 20, detailsY);
        doc.setTextColor(100);
        if (quote.contact) {
            doc.text(`${quote.contact.firstName} ${quote.contact.lastName}`, 20, detailsY + 6);
        }
        if (quote.company) {
            doc.text(quote.company.name, 20, detailsY + 12);
        }

        doc.setTextColor(0);
        doc.text('Quote Date:', 120, detailsY);
        doc.setTextColor(100);
        doc.text(new Date(quote.quoteDate).toLocaleDateString(), 150, detailsY);

        if (quote.expirationDate) {
            doc.setTextColor(0);
            doc.text('Valid Until:', 120, detailsY + 8);
            doc.setTextColor(100);
            doc.text(new Date(quote.expirationDate).toLocaleDateString(), 150, detailsY + 8);
        }

        doc.setTextColor(0);
        doc.text('Payment Terms:', 120, detailsY + 16);
        doc.setTextColor(100);
        doc.text(quote.paymentTerms, 150, detailsY + 16);

        // Subject
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(quote.subject, 20, 90);

        // Line items table
        const tableData = quote.lineItems.map(item => [
            item.name,
            item.quantity.toString(),
            `$${item.unitPrice.toFixed(2)}`,
            item.discountPercent > 0 ? `${item.discountPercent}%` : '-',
            `$${item.lineTotal.toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: 100,
            head: [['Item', 'Qty', 'Unit Price', 'Discount', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [30, 58, 95] },
            styles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 70 },
                1: { halign: 'center', cellWidth: 20 },
                2: { halign: 'right', cellWidth: 30 },
                3: { halign: 'center', cellWidth: 25 },
                4: { halign: 'right', cellWidth: 30 }
            }
        });

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(10);
        doc.text('Subtotal:', 130, finalY);
        doc.text(`$${totals.subtotal.toFixed(2)}`, 170, finalY, { align: 'right' });

        if (quote.discountPercent > 0) {
            doc.text(`Discount (${quote.discountPercent}%):`, 130, finalY + 7);
            doc.text(`-$${totals.discountAmount.toFixed(2)}`, 170, finalY + 7, { align: 'right' });
        }

        doc.text('Tax:', 130, finalY + 14);
        doc.text(`$${totals.taxAmount.toFixed(2)}`, 170, finalY + 14, { align: 'right' });

        if (quote.shippingAmount > 0) {
            doc.text('Shipping:', 130, finalY + 21);
            doc.text(`$${quote.shippingAmount.toFixed(2)}`, 170, finalY + 21, { align: 'right' });
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Total:', 130, finalY + 30);
        doc.text(`$${totals.total.toFixed(2)}`, 170, finalY + 30, { align: 'right' });

        // Notes
        if (quote.notes) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text('Notes:', 20, finalY + 45);
            doc.setTextColor(100);
            const splitNotes = doc.splitTextToSize(quote.notes, 170);
            doc.text(splitNotes, 20, finalY + 52);
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Thank you for your business!', 105, 280, { align: 'center' });

        doc.save(`Quote_${quote.quoteNumber}.pdf`);
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="p-6">
                <p className="text-red-500">Quote not found</p>
                <button onClick={() => navigate('/quotes')} className="mt-4 text-indigo-600">
                    ← Back to Quotes
                </button>
            </div>
        );
    }

    const statusStyle = statusColors[quote.status] || statusColors.Draft;
    const totals = calculateTotals();

    return (
        <div className="p-6 bg-slate-50 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/quotes')}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-900">{quote.subject}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                                {quote.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{quote.quoteNumber}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={generatePDF}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                        <Download size={16} />
                        Download PDF
                    </button>
                    {quote.status === 'Draft' && (
                        <button
                            onClick={handleSend}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
                        >
                            <Send size={16} />
                            Send Quote
                        </button>
                    )}
                    <button
                        onClick={() => window.open(`/portal/quotes/${quote.publicToken}`, '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
                        title="View Public Page"
                    >
                        <ExternalLink size={16} />
                        View
                    </button>
                    <button
                        onClick={handleDuplicate}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Duplicate"
                    >
                        <Copy size={18} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                    {/* Quote Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Quote Details</h2>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm text-indigo-600 font-bold hover:underline"
                                >
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData(quote);
                                            setLineItems(quote.lineItems);
                                        }}
                                        className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded font-bold disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={formData.subject || ''}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiration Date</label>
                                    <input
                                        type="date"
                                        value={formData.expirationDate?.split('T')[0] || ''}
                                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Terms</label>
                                    <select
                                        value={formData.paymentTerms || 'Net 30'}
                                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                    >
                                        <option value="Due on Receipt">Due on Receipt</option>
                                        <option value="Net 15">Net 15</option>
                                        <option value="Net 30">Net 30</option>
                                        <option value="Net 45">Net 45</option>
                                        <option value="Net 60">Net 60</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500">Quote Date:</span>
                                    <span className="ml-2 font-medium">{new Date(quote.quoteDate).toLocaleDateString()}</span>
                                </div>
                                {quote.expirationDate && (
                                    <div>
                                        <span className="text-slate-500">Expires:</span>
                                        <span className="ml-2 font-medium">{new Date(quote.expirationDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-slate-500">Payment Terms:</span>
                                    <span className="ml-2 font-medium">{quote.paymentTerms}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Version:</span>
                                    <span className="ml-2 font-medium">{quote.version}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Line Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Line Items</h2>
                            {isEditing && (
                                <button
                                    onClick={addLineItem}
                                    className="flex items-center gap-1 text-sm text-indigo-600 font-bold"
                                >
                                    <Plus size={16} /> Add Item
                                </button>
                            )}
                        </div>

                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Item</th>
                                    <th className="px-4 py-2 text-center text-xs font-bold text-slate-500 w-20">Qty</th>
                                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 w-28">Price</th>
                                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 w-28">Total</th>
                                    {isEditing && <th className="px-4 py-2 w-10"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lineItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={item.name || ''}
                                                    onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                                                    className="w-full px-2 py-1 border border-slate-200 rounded"
                                                    placeholder="Item name"
                                                />
                                            ) : (
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    {item.sku && <p className="text-xs text-slate-400">{item.sku}</p>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                                                    className="w-full px-2 py-1 border border-slate-200 rounded text-center"
                                                />
                                            ) : (
                                                item.quantity
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-2 py-1 border border-slate-200 rounded text-right"
                                                />
                                            ) : (
                                                `$${item.unitPrice?.toFixed(2)}`
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold">
                                            ${(item.lineTotal || 0).toFixed(2)}
                                        </td>
                                        {isEditing && (
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => removeLineItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex flex-col items-end gap-1 text-sm">
                                <div className="flex justify-between w-48">
                                    <span className="text-slate-500">Subtotal:</span>
                                    <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                                </div>
                                {quote.discountPercent > 0 && (
                                    <div className="flex justify-between w-48 text-green-600">
                                        <span>Discount ({quote.discountPercent}%):</span>
                                        <span>-${totals.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between w-48">
                                    <span className="text-slate-500">Tax:</span>
                                    <span className="font-medium">${totals.taxAmount.toFixed(2)}</span>
                                </div>
                                {quote.shippingAmount > 0 && (
                                    <div className="flex justify-between w-48">
                                        <span className="text-slate-500">Shipping:</span>
                                        <span className="font-medium">${quote.shippingAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between w-48 pt-2 border-t border-slate-200 text-lg">
                                    <span className="font-bold">Total:</span>
                                    <span className="font-black text-indigo-600">${totals.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {(quote.notes || isEditing) && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-3">Notes</h2>
                            {isEditing ? (
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                    placeholder="Additional notes..."
                                />
                            ) : (
                                <p className="text-slate-600 whitespace-pre-wrap">{quote.notes}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Client</h2>
                        <div className="space-y-3">
                            {quote.contact && (
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-slate-400" />
                                    <span className="font-medium">{quote.contact.firstName} {quote.contact.lastName}</span>
                                </div>
                            )}
                            {quote.company && (
                                <div className="flex items-center gap-2">
                                    <Building2 size={16} className="text-slate-400" />
                                    <span className="font-medium">{quote.company.name}</span>
                                </div>
                            )}
                            {quote.recipientEmail && (
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-slate-400" />
                                    <span className="text-sm">{quote.recipientEmail}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Timeline</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                <span className="text-slate-500">Created:</span>
                                <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
                            </div>
                            {quote.sentDate && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-slate-500">Sent:</span>
                                    <span>{new Date(quote.sentDate).toLocaleDateString()}</span>
                                </div>
                            )}
                            {quote.viewedDate && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span className="text-slate-500">Viewed:</span>
                                    <span>{new Date(quote.viewedDate).toLocaleDateString()}</span>
                                </div>
                            )}
                            {quote.acceptedDate && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-slate-500">Accepted:</span>
                                    <span>{new Date(quote.acceptedDate).toLocaleDateString()}</span>
                                </div>
                            )}
                            {quote.declinedDate && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span className="text-slate-500">Declined:</span>
                                    <span>{new Date(quote.declinedDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetailPage;
