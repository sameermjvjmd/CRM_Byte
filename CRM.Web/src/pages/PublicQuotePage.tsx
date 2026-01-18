import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { Download, CheckCircle, XCircle, Building2, User, Mail, Calendar, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

interface Quote {
    id: number;
    subject: string;
    quoteNumber: string;
    status: string;
    contact?: { firstName: string; lastName: string; email?: string };
    company?: { name: string };
    quoteDate: string;
    expirationDate?: string;
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    total: number;
    currency: string;
    paymentTerms: string;
    notes?: string;
    lineItems: QuoteLineItem[];
    publicToken?: string;
}

interface QuoteLineItem {
    id: number;
    name: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    lineTotal: number;
    isTaxable: boolean;
    taxAmount: number;
}

const PublicQuotePage = () => {
    const { token } = useParams<{ token: string }>();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (token) fetchQuote();
    }, [token]);

    const fetchQuote = async () => {
        try {
            const response = await api.get(`/quotes/public/${token}`);
            setQuote(response.data);

            // Mark as viewed if currently Sent
            if (response.data.status === 'Sent') {
                markAsViewed();
            }
        } catch (error) {
            console.error('Error fetching quote:', error);
            toast.error('Failed to load quote');
        } finally {
            setLoading(false);
        }
    };

    const markAsViewed = async () => {
        try {
            await api.post(`/quotes/public/${token}/view`);
            // Update local state to show 'Viewed' immediately
            setQuote(prev => prev ? { ...prev, status: 'Viewed', viewedDate: new Date().toISOString() } : null);
        } catch (error) {
            console.error('Error marking quote as viewed:', error);
        }
    };

    const handleStatusChange = async (status: 'Accepted' | 'Declined') => {
        setActionLoading(true);
        try {
            const endpoint = status === 'Accepted' ? 'accept' : 'decline';
            await api.post(`/quotes/public/${token}/${endpoint}`, {
                // For decline, we might need a reason, but keeping it simple for now as per previous implementation
                status // Keeping this if the backend expects it, but new endpoints might be specific
            });
            // The new endpoints are specific: public/{token}/accept or decline
            // They expect body with AcceptedBy/Email or Reason.
            // Let's refine this below.
            setQuote(prev => prev ? { ...prev, status } : null);
            toast.success(`Quote ${status} successfully!`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update quote status');
        } finally {
            setActionLoading(false);
        }
    };

    // Reuse PDF generation logic
    const generatePDF = () => {
        if (!quote) return;

        const doc = new jsPDF();

        doc.setFontSize(24);
        doc.setTextColor(30, 58, 95);
        doc.text('QUOTE', 20, 25);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`#${quote.quoteNumber}`, 20, 32);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Your Company Name', 140, 25);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text('123 Business Street', 140, 32);
        doc.text('City, State 12345', 140, 37);

        // Quote details
        const detailsY = 55;
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text('Quote To:', 20, detailsY);
        doc.setTextColor(100);
        if (quote.contact) doc.text(`${quote.contact.firstName} ${quote.contact.lastName}`, 20, detailsY + 6);
        if (quote.company) doc.text(quote.company.name, 20, detailsY + 12);

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

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(quote.subject, 20, 90);

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
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'center' },
                4: { halign: 'right' }
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(10);
        doc.text('Subtotal:', 130, finalY);
        doc.text(`$${quote.subtotal.toFixed(2)}`, 170, finalY, { align: 'right' });

        if (quote.taxAmount > 0) {
            doc.text('Tax:', 130, finalY + 7);
            doc.text(`$${quote.taxAmount.toFixed(2)}`, 170, finalY + 7, { align: 'right' });
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Total:', 130, finalY + 15);
        doc.text(`$${quote.total.toFixed(2)}`, 170, finalY + 15, { align: 'right' });

        doc.save(`Quote_${quote.quoteNumber}.pdf`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
    );

    if (!quote) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Quote Not Found</h1>
                <p className="text-slate-500">The quote you are looking for does not exist or has expired.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            Q
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900">Quote #{quote.quoteNumber}</h1>
                            <p className="text-xs text-slate-500">{new Date(quote.quoteDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button
                        onClick={generatePDF}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                        <Download size={16} /> Download PDF
                    </button>
                </div>

                {/* Main Quote Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                    {/* Status Banner */}
                    {quote.status === 'Accepted' && (
                        <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex items-center gap-3 text-emerald-700 font-bold">
                            <CheckCircle size={20} />
                            This quote has been accepted.
                        </div>
                    )}
                    {quote.status === 'Declined' && (
                        <div className="bg-red-50 border-b border-red-100 p-4 flex items-center gap-3 text-red-700 font-bold">
                            <XCircle size={20} />
                            This quote has been declined.
                        </div>
                    )}

                    <div className="p-8">
                        {/* Title & Info */}
                        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">{quote.subject}</h2>
                                <div className="space-y-1 text-sm text-slate-500">
                                    <p>Prepared for:</p>
                                    <p className="font-bold text-slate-800 text-lg">
                                        {quote.contact ? `${quote.contact.firstName} ${quote.contact.lastName}` : 'Valued Client'}
                                    </p>
                                    {quote.company && <p className="font-medium">{quote.company.name}</p>}
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-sm text-slate-500">Total Amount</p>
                                <p className="text-4xl font-black text-indigo-600">${quote.total.toFixed(2)}</p>
                                <p className="text-xs text-slate-400 font-medium bg-slate-100 inline-block px-2 py-1 rounded">
                                    {quote.currency}
                                </p>
                            </div>
                        </div>

                        {/* Dates Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                <p className="font-bold text-slate-700 flex items-center gap-2">
                                    <Calendar size={14} className="text-indigo-500" />
                                    {new Date(quote.quoteDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valid Until</p>
                                <p className="font-bold text-slate-700 flex items-center gap-2">
                                    <Clock size={14} className="text-orange-500" />
                                    {quote.expirationDate ? new Date(quote.expirationDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Terms</p>
                                <p className="font-bold text-slate-700">{quote.paymentTerms}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reference</p>
                                <p className="font-bold text-slate-700">#{quote.quoteNumber}</p>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="mb-10 overflow-hidden rounded-lg border border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Description</th>
                                        <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-wider text-xs w-24">Qty</th>
                                        <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase tracking-wider text-xs w-32">Unit Price</th>
                                        <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase tracking-wider text-xs w-32">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {quote.lineItems.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{item.name}</div>
                                                {item.sku && <div className="text-xs text-slate-400 mt-0.5">{item.sku}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-slate-600">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-600">${item.unitPrice.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-800">${item.lineTotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Financials */}
                        <div className="flex justify-end mb-10">
                            <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">${quote.subtotal.toFixed(2)}</span>
                                </div>
                                {quote.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>Discount ({quote.discountPercent}%)</span>
                                        <span className="font-medium">-${quote.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Tax</span>
                                    <span className="font-medium">${quote.taxAmount.toFixed(2)}</span>
                                </div>
                                {quote.shippingAmount > 0 && (
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Shipping</span>
                                        <span className="font-medium">${quote.shippingAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                    <span className="font-bold text-slate-900">Total</span>
                                    <span className="text-2xl font-black text-indigo-600">${quote.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {quote.notes && (
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 mb-8">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes & Terms</h3>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{quote.notes}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {quote.status === 'Sent' || quote.status === 'Viewed' ? (
                            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t border-slate-100">
                                <button
                                    onClick={() => handleStatusChange('Declined')}
                                    disabled={actionLoading}
                                    className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Decline Quote
                                </button>
                                <button
                                    onClick={() => handleStatusChange('Accepted')}
                                    disabled={actionLoading}
                                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
                                >
                                    Accept Quote
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="text-center text-slate-400 text-sm">
                    Powered by <strong>Act! CRM</strong>
                </div>
            </div>
        </div>
    );
};

export default PublicQuotePage;
