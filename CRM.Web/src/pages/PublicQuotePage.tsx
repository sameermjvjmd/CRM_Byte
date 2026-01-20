import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { Download, CheckCircle, XCircle, Building2, User, Mail, Calendar, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import type { QuoteTemplate } from '../types/QuoteTemplate';

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
    quoteTemplate?: QuoteTemplate;
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
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [declineModalOpen, setDeclineModalOpen] = useState(false);
    const [acceptForm, setAcceptForm] = useState({ name: '', email: '' });
    const [declineReason, setDeclineReason] = useState('');
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

    const handleStatusChange = (status: 'Accepted' | 'Declined') => {
        if (status === 'Accepted') {
            // Pre-fill with contact info if available
            if (quote?.contact) {
                setAcceptForm({
                    name: `${quote.contact.firstName} ${quote.contact.lastName}`,
                    email: quote.contact.email || ''
                });
            }
            setAcceptModalOpen(true);
        } else {
            setDeclineModalOpen(true);
        }
    };

    const confirmAccept = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post(`/quotes/public/${token}/accept`, {
                acceptedBy: acceptForm.name,
                email: acceptForm.email,
                signature: 'Digital Consent' // Placeholder or could add signature pad later
            });
            setQuote(prev => prev ? { ...prev, status: 'Accepted' } : null);
            setAcceptModalOpen(false);
            toast.success('Quote accepted successfully!');
        } catch (error) {
            console.error('Error accepting quote:', error);
            toast.error('Failed to accept quote. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const confirmDecline = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post(`/quotes/public/${token}/decline`, {
                reason: declineReason
            });
            setQuote(prev => prev ? { ...prev, status: 'Declined' } : null);
            setDeclineModalOpen(false);
            toast.success('Quote declined.');
        } catch (error) {
            console.error('Error declining quote:', error);
            toast.error('Failed to decline quote.');
        } finally {
            setActionLoading(false);
        }
    };

    // Derived branding and layout
    const branding = {
        primaryColor: quote?.quoteTemplate?.primaryColor || '#4f46e5',
        secondaryColor: quote?.quoteTemplate?.secondaryColor || '#64748b',
        textColor: quote?.quoteTemplate?.textColor || '#1e293b',
        companyName: quote?.quoteTemplate?.companyName || 'Your Company Name',
        companyAddress: quote?.quoteTemplate?.companyAddress || '123 Business Street\nCity, State 12345',
        footer: quote?.quoteTemplate?.defaultFooter || 'Thank you for your business!',
        terms: quote?.quoteTemplate?.defaultTerms
    };

    const layout = {
        showSku: quote?.quoteTemplate ? quote.quoteTemplate.showSku : true,
        showQty: quote?.quoteTemplate ? quote.quoteTemplate.showQuantity : true,
        showDiscount: quote?.quoteTemplate ? quote.quoteTemplate.showDiscountColumn : true,
        showTax: quote?.quoteTemplate ? quote.quoteTemplate.showTaxSummary : true,
        showShipping: quote?.quoteTemplate ? quote.quoteTemplate.showShipping : true,
    };

    // Reuse PDF generation logic
    const generatePDF = () => {
        if (!quote) return;

        // Use template settings or defaults
        // Logic moved up to component scope

        const doc = new jsPDF();

        // Helper to convert hex to rgb
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)
            ] : [0, 0, 0];
        };

        const primaryRgb = hexToRgb(branding.primaryColor);
        const textRgb = hexToRgb(branding.textColor);

        // Header Structure
        doc.setFontSize(24);
        doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
        doc.text('QUOTE', 20, 25);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`#${quote.quoteNumber}`, 20, 32);

        // Company Info (Right Aligned)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
        doc.text(branding.companyName, 190, 25, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100);

        const addressLines = branding.companyAddress.split('\n');
        let currentY = 32;
        addressLines.forEach(line => {
            doc.text(line, 190, currentY, { align: 'right' });
            currentY += 5;
        });

        // Quote details
        const detailsY = 60;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
        doc.text('Quote To:', 20, detailsY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        if (quote.contact) doc.text(`${quote.contact.firstName} ${quote.contact.lastName}`, 20, detailsY + 6);
        if (quote.company) doc.text(quote.company.name, 20, detailsY + 12);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
        doc.text('Date:', 120, detailsY);
        doc.text('Valid Until:', 120, detailsY + 8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(new Date(quote.quoteDate).toLocaleDateString(), 150, detailsY);
        if (quote.expirationDate) {
            doc.text(new Date(quote.expirationDate).toLocaleDateString(), 150, detailsY + 8);
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
        doc.text(quote.subject, 20, 95);

        // Build Table Columns based on Layout
        const head = [['Description']];
        if (layout.showSku) head[0].unshift('SKU'); // Prepend if showing
        if (layout.showQty) head[0].push('Qty');
        head[0].push('Unit Price');
        if (layout.showDiscount) head[0].push('Discount');
        head[0].push('Total');

        const body = quote.lineItems.map(item => {
            const row = [item.name];
            if (layout.showSku) row.unshift(item.sku || '-');
            if (layout.showQty) row.push(item.quantity.toString());
            row.push(`$${item.unitPrice.toFixed(2)}`);
            if (layout.showDiscount) row.push(item.discountPercent > 0 ? `${item.discountPercent}%` : '-');
            row.push(`$${item.lineTotal.toFixed(2)}`);
            return row;
        });

        // Determine column styles dynamically
        const columnStyles: any = {};
        let colIndex = 0;

        // SKU (if exists, usually index 0)
        if (layout.showSku) {
            columnStyles[colIndex] = { cellWidth: 25 };
            colIndex++;
        }

        // Description (always exists)
        columnStyles[colIndex] = { cellWidth: 'auto' };
        colIndex++;

        // Qty
        if (layout.showQty) {
            columnStyles[colIndex] = { halign: 'center', cellWidth: 15 };
            colIndex++;
        }

        // Unit Price
        columnStyles[colIndex] = { halign: 'right', cellWidth: 25 };
        colIndex++;

        // Discount
        if (layout.showDiscount) {
            columnStyles[colIndex] = { halign: 'center', cellWidth: 20 };
            colIndex++;
        }

        // Total
        columnStyles[colIndex] = { halign: 'right', cellWidth: 25, fontStyle: 'bold' };

        autoTable(doc, {
            startY: 105,
            head: head,
            body: body,
            theme: 'grid',
            headStyles: {
                fillColor: [primaryRgb[0], primaryRgb[1], primaryRgb[2]] as any,
                fontSize: 9,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                textColor: 50,
                cellPadding: 3
            },
            columnStyles: columnStyles
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Subtotal:', 130, finalY);
        doc.text(`$${quote.subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });

        let currentTotalY = finalY;

        if (layout.showDiscount && quote.discountAmount > 0) {
            currentTotalY += 6;
            doc.text(`Discount (${quote.discountPercent}%)`, 130, currentTotalY);
            doc.setTextColor(0, 128, 0); // Green
            doc.text(`-$${quote.discountAmount.toFixed(2)}`, 190, currentTotalY, { align: 'right' });
            doc.setTextColor(100); // Reset
        }

        if (layout.showTax && quote.taxAmount > 0) {
            currentTotalY += 6;
            doc.text('Tax:', 130, currentTotalY);
            doc.text(`$${quote.taxAmount.toFixed(2)}`, 190, currentTotalY, { align: 'right' });
        }

        if (layout.showShipping && quote.shippingAmount > 0) {
            currentTotalY += 6;
            doc.text('Shipping:', 130, currentTotalY);
            doc.text(`$${quote.shippingAmount.toFixed(2)}`, 190, currentTotalY, { align: 'right' });
        }

        currentTotalY += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
        doc.text('Total:', 130, currentTotalY);
        doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
        doc.text(`$${quote.total.toFixed(2)}`, 190, currentTotalY, { align: 'right' });

        // Footer
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150);

        // Footer Text
        const pageHeight = doc.internal.pageSize.height;
        doc.text(branding.footer, 105, pageHeight - 20, { align: 'center' });

        // Terms (Small text below footer)
        if (quote.quoteTemplate?.defaultTerms) {
            doc.setFontSize(7);
            doc.text(quote.quoteTemplate.defaultTerms, 105, pageHeight - 15, { align: 'center', maxWidth: 170 });
        }

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
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200" style={{ borderTopWidth: 4, borderTopColor: branding.primaryColor }}>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                            style={{ backgroundColor: branding.primaryColor }}
                        >
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
                                <p className="text-4xl font-black" style={{ color: branding.primaryColor }}>
                                    ${quote.total.toFixed(2)}
                                </p>
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
                                    <Calendar size={14} style={{ color: branding.primaryColor }} />
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
                                    <span className="text-2xl font-black" style={{ color: branding.primaryColor }}>
                                        ${quote.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {(quote.notes || branding.terms) && (
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 mb-8">
                                <div className="space-y-4">
                                    {quote.notes && (
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
                                            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{quote.notes}</p>
                                        </div>
                                    )}
                                    {branding.terms && (
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Terms & Conditions</h3>
                                            <p className="text-xs text-slate-500 whitespace-pre-wrap">{branding.terms}</p>
                                        </div>
                                    )}
                                </div>
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
                                    className="px-6 py-3 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                                    style={{
                                        backgroundColor: branding.primaryColor,
                                        boxShadow: `0 10px 15px -3px ${branding.primaryColor}40`
                                    }}
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

            {/* Accept Modal */}
            {acceptModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Accept Quote</h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Please confirm your details to accept this quote. By clicking "Accept Quote", you agree to the terms and conditions.
                            </p>
                            <form onSubmit={confirmAccept} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={acceptForm.name}
                                        onChange={e => setAcceptForm({ ...acceptForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={acceptForm.email}
                                        onChange={e => setAcceptForm({ ...acceptForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g. john@example.com"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setAcceptModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-70"
                                    >
                                        {actionLoading ? 'Processing...' : 'Accept Quote'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Decline Modal */}
            {declineModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Decline Quote</h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Please let us know why you are declining this quote so we can improve our services.
                            </p>
                            <form onSubmit={confirmDecline} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Reason for Declining</label>
                                    <textarea
                                        required
                                        value={declineReason}
                                        onChange={e => setDeclineReason(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g. Price too high, went with competitor..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setDeclineModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-70"
                                    >
                                        {actionLoading ? 'Processing...' : 'Decline Quote'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PublicQuotePage;
