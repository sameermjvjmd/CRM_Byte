import { useState, useEffect } from 'react';
import { X, Building2, Save, Loader2, Search } from 'lucide-react';
import api from '../../api/api';
import type { Company } from '../../types/company';
import { INDUSTRIES, COMPANY_TYPES, STOCK_EXCHANGES } from '../../types/company';

interface EditCompanyModalProps {
    isOpen: boolean;
    company: Company;
    onClose: () => void;
    onSuccess: () => void;
}

const EditCompanyModal = ({ isOpen, company, onClose, onSuccess }: EditCompanyModalProps) => {
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);

    const [formData, setFormData] = useState<Partial<Company>>({});

    useEffect(() => {
        if (isOpen && company) {
            setFormData({
                id: company.id,
                name: company.name,
                industry: company.industry,
                parentCompanyId: company.parentCompanyId,
                website: company.website,
                phone: company.phone,
                email: company.email,
                description: company.description,
                address: company.address,
                city: company.city,
                state: company.state,
                country: company.country,
                zipCode: company.zipCode,
                annualRevenue: company.annualRevenue,
                employeeCount: company.employeeCount,
                sicCode: company.sicCode,
                naicsCode: company.naicsCode,
                companyType: company.companyType,
                tickerSymbol: company.tickerSymbol,
                stockExchange: company.stockExchange
            });

            // Fetch potential parent companies
            api.get('/companies').then(res => {
                // Filter out self to avoid cycles
                setCompanies(res.data.filter((c: Company) => c.id !== company.id));
            }).catch(console.error);
        }
    }, [isOpen, company]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/companies/${company.id}`, {
                ...company, // Keep existing fields
                ...formData, // Overwrite with new values
                lastModifiedAt: new Date().toISOString()
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update company', error);
            alert('Failed to update company');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

    const inputStyle = "w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400";
    const labelStyle = "text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 block";
    const selectStyle = "w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Building2 className="text-indigo-600" /> Edit Company
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Update company details and hierarchy</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2 mb-4">Core Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelStyle}>Company Name *</label>
                                    <input required name="name" value={formData.name || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Parent Company</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <select
                                            name="parentCompanyId"
                                            value={formData.parentCompanyId || ''}
                                            onChange={handleChange}
                                            className={`${selectStyle} pl-10`}
                                        >
                                            <option value="">-- No Parent (Top Level) --</option>
                                            {companies.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelStyle}>Industry</label>
                                    <select name="industry" value={formData.industry || ''} onChange={handleChange} className={selectStyle}>
                                        <option value="">Select...</option>
                                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyle}>Company Type</label>
                                    <select name="companyType" value={formData.companyType || ''} onChange={handleChange} className={selectStyle}>
                                        <option value="">Select...</option>
                                        {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2 mb-4">Contact Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelStyle}>Phone</label>
                                    <input name="phone" value={formData.phone || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Email</label>
                                    <input name="email" value={formData.email || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Website</label>
                                    <input name="website" value={formData.website || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2 mb-4">Address</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelStyle}>Address Line 1</label>
                                    <input name="address" value={formData.address || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="col-span-2">
                                        <label className={labelStyle}>City</label>
                                        <input name="city" value={formData.city || ''} onChange={handleChange} className={inputStyle} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>State</label>
                                        <input name="state" value={formData.state || ''} onChange={handleChange} className={inputStyle} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Zip Code</label>
                                        <input name="zipCode" value={formData.zipCode || ''} onChange={handleChange} className={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelStyle}>Country</label>
                                    <input name="country" value={formData.country || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2 mb-4">Financials & Metrics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className={labelStyle}>Annual Revenue</label>
                                    <input type="number" name="annualRevenue" value={formData.annualRevenue || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Employees</label>
                                    <input type="number" name="employeeCount" value={formData.employeeCount || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Ticker Symbol</label>
                                    <input name="tickerSymbol" value={formData.tickerSymbol || ''} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Stock Exchange</label>
                                    <select name="stockExchange" value={formData.stockExchange || ''} onChange={handleChange} className={selectStyle}>
                                        <option value="">Select...</option>
                                        {STOCK_EXCHANGES.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>Description</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} className={`${inputStyle} h-32 resize-none`} />
                        </div>

                    </form>
                </div>

                <div className="padding-8 border-t border-slate-100 bg-slate-50 p-6 flex justify-end gap-3 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCompanyModal;
