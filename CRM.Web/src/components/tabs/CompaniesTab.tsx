import { useState } from 'react';
import { Building2, Plus, Link, Trash2, Globe, MapPin, Phone } from 'lucide-react';

interface Company {
    id: number;
    name: string;
    industry?: string;
    website?: string;
    phone?: string;
    address?: string;
    relationship: 'Primary' | 'Secondary' | 'Vendor' | 'Partner';
    isPrimary: boolean;
}

interface CompaniesTabProps {
    contactId: number;
    companies: Company[];
    onLinkCompany: (companyId: number, relationship: string) => void;
    onUnlinkCompany: (companyId: number) => void;
    onSetPrimary: (companyId: number) => void;
}

const CompaniesTab = ({ contactId, companies, onLinkCompany, onUnlinkCompany, onSetPrimary }: CompaniesTabProps) => {
    const [showLinkDialog, setShowLinkDialog] = useState(false);

    const primaryCompany = companies.find(c => c.isPrimary);
    const secondaryCompanies = companies.filter(c => !c.isPrimary);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Associated Companies</h3>
                    <p className="text-sm font-bold text-slate-500">
                        {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'}
                    </p>
                </div>
                <button
                    onClick={() => setShowLinkDialog(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Link size={16} />
                    Link Company
                </button>
            </div>

            {/* Primary Company */}
            {primaryCompany ? (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 size={16} className="text-indigo-600" />
                        <span className="text-xs font-black uppercase text-indigo-600 tracking-wide">Primary Company</span>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                            <Building2 size={32} />
                        </div>

                        <div className="flex-1">
                            <h4 className="text-xl font-black text-slate-900 mb-2">{primaryCompany.name}</h4>

                            {primaryCompany.industry && (
                                <p className="text-sm font-bold text-slate-600 mb-3">{primaryCompany.industry}</p>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                {primaryCompany.website && (
                                    <a
                                        href={primaryCompany.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline"
                                    >
                                        <Globe size={14} />
                                        {primaryCompany.website}
                                    </a>
                                )}
                                {primaryCompany.phone && (
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Phone size={14} />
                                        {primaryCompany.phone}
                                    </div>
                                )}
                                {primaryCompany.address && (
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 col-span-2">
                                        <MapPin size={14} />
                                        {primaryCompany.address}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                    <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-sm font-bold text-slate-500">No primary company</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">Link a company to set as primary</p>
                </div>
            )}

            {/* Secondary Companies */}
            {secondaryCompanies.length > 0 && (
                <div>
                    <h4 className="text-sm font-black uppercase text-slate-400 tracking-wide mb-3">
                        Other Companies
                    </h4>
                    <div className="space-y-3">
                        {secondaryCompanies.map((company) => (
                            <div
                                key={company.id}
                                className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:shadow-md transition-all group"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
                                    <Building2 size={24} />
                                </div>

                                {/* Company Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-slate-900">{company.name}</h4>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${company.relationship === 'Vendor' ? 'bg-orange-100 text-orange-700' :
                                                company.relationship === 'Partner' ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {company.relationship}
                                        </span>
                                    </div>
                                    {company.industry && (
                                        <p className="text-sm font-bold text-slate-600">{company.industry}</p>
                                    )}
                                    {company.website && (
                                        <a
                                            href={company.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-indigo-600 hover:underline mt-1 inline-block"
                                        >
                                            {company.website}
                                        </a>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onSetPrimary(company.id)}
                                        className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all"
                                    >
                                        Set Primary
                                    </button>
                                    <button
                                        onClick={() => onUnlinkCompany(company.id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                        title="Unlink company"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {companies.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                    <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-sm font-bold text-slate-500">No companies linked</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">Link this contact to companies</p>
                </div>
            )}

            {/* Info */}
            {companies.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Link size={16} className="text-blue-600 mt-0.5" />
                        <div className="text-xs font-bold text-blue-800">
                            <strong>Tip:</strong> Set one company as primary to display it prominently. Other companies will appear as secondary associations.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompaniesTab;
export type { Company };
