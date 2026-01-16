import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, User, Target, Briefcase, TrendingUp, Flag, Building2 } from 'lucide-react';
import api from '../../api/api';
import type { Contact } from '../../types/contact';
import type { Company } from '../../types/company';
import { SOURCES, OPPORTUNITY_TYPES, FORECAST_CATEGORIES, DEFAULT_PROBABILITIES, OPPORTUNITY_STAGES } from '../../types/opportunity';

interface AddOpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddOpportunityModal = ({ isOpen, onClose, onSuccess }: AddOpportunityModalProps) => {
    // Basic fields
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [stage, setStage] = useState('Lead');
    const [probability, setProbability] = useState('10');
    const [closeDate, setCloseDate] = useState('');
    const [contactId, setContactId] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [description, setDescription] = useState('');

    // Enhanced fields
    const [source, setSource] = useState('');
    const [type, setType] = useState('New Business');
    const [forecastCategory, setForecastCategory] = useState('Pipeline');
    const [nextAction, setNextAction] = useState('');
    const [nextActionDate, setNextActionDate] = useState('');
    const [tags, setTags] = useState('');
    const [owner, setOwner] = useState('');
    const [primaryCompetitor, setPrimaryCompetitor] = useState('');

    // Data sources
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
            fetchCompanies();
            // Default close date to 1 month from now
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            setCloseDate(date.toISOString().split('T')[0]);

            // Default next action date to 1 week from now
            const actionDate = new Date();
            actionDate.setDate(actionDate.getDate() + 7);
            setNextActionDate(actionDate.toISOString().split('T')[0]);
        }
    }, [isOpen]);

    // Update probability when stage changes
    useEffect(() => {
        const defaultProb = DEFAULT_PROBABILITIES[stage];
        if (defaultProb !== undefined) {
            setProbability(String(defaultProb));
        }
    }, [stage]);

    const fetchContacts = async () => {
        try {
            const response = await api.get('/contacts');
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/opportunities', {
                name,
                amount: parseFloat(amount),
                stage,
                probability: parseInt(probability),
                expectedCloseDate: new Date(closeDate).toISOString(),
                contactId: contactId ? parseInt(contactId) : null,
                companyId: companyId ? parseInt(companyId) : null,
                description: description || 'Created via Pipeline Board',
                source: source || null,
                type: type || 'New Business',
                forecastCategory: forecastCategory || 'Pipeline',
                nextAction: nextAction || null,
                nextActionDate: nextActionDate ? new Date(nextActionDate).toISOString() : null,
                tags: tags ? JSON.stringify(tags.split(',').map(t => t.trim())) : null,
                owner: owner || null,
                primaryCompetitor: primaryCompetitor || null
            });
            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error creating opportunity:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setAmount('');
        setStage('Lead');
        setProbability('10');
        setDescription('');
        setSource('');
        setType('New Business');
        setForecastCategory('Pipeline');
        setNextAction('');
        setTags('');
        setOwner('');
        setPrimaryCompetitor('');
        setShowAdvanced(false);
    };

    if (!isOpen) return null;

    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm";
    const labelClass = "block text-xs font-bold text-slate-700 uppercase mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Target size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">New Deal</h3>
                            <p className="text-xs text-slate-500">Add a new opportunity to your pipeline</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-5">
                        {/* Deal Name */}
                        <div>
                            <label className={labelClass}>Deal Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Enterprise CRM Implementation"
                                className={inputClass}
                            />
                        </div>

                        {/* Value & Close Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Value *</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="number"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Expected Close Date *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        required
                                        value={closeDate}
                                        onChange={(e) => setCloseDate(e.target.value)}
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stage & Probability */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Stage</label>
                                <select
                                    value={stage}
                                    onChange={(e) => setStage(e.target.value)}
                                    className={inputClass}
                                >
                                    {OPPORTUNITY_STAGES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Probability (%)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    value={probability}
                                    onChange={(e) => setProbability(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Next Action (Promoted) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Next Action</label>
                                <input
                                    type="text"
                                    value={nextAction}
                                    onChange={(e) => setNextAction(e.target.value)}
                                    placeholder="e.g. Send proposal"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Next Action Date</label>
                                <input
                                    type="date"
                                    value={nextActionDate}
                                    onChange={(e) => setNextActionDate(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className={labelClass}>Tags</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Separate tags with commas, e.g. Urgent, Enterprise, Q1"
                                className={inputClass}
                            />
                        </div>

                        {/* Contact & Company */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>
                                    <User size={12} className="inline mr-1" />
                                    Related Contact
                                </label>
                                <select
                                    value={contactId}
                                    onChange={(e) => setContactId(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Select a contact...</option>
                                    {contacts.map(contact => (
                                        <option key={contact.id} value={contact.id}>
                                            {contact.firstName} {contact.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <Building2 size={12} className="inline mr-1" />
                                    Company
                                </label>
                                <select
                                    value={companyId}
                                    onChange={(e) => setCompanyId(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Select a company...</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Source & Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>
                                    <TrendingUp size={12} className="inline mr-1" />
                                    Source
                                </label>
                                <select
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Select source...</option>
                                    {SOURCES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <Briefcase size={12} className="inline mr-1" />
                                    Type
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className={inputClass}
                                >
                                    {OPPORTUNITY_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Forecast Category */}
                        <div>
                            <label className={labelClass}>
                                <Flag size={12} className="inline mr-1" />
                                Forecast Category
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {FORECAST_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setForecastCategory(cat)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${forecastCategory === cat
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Advanced Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                        >
                            {showAdvanced ? '− Hide' : '+ Show'} Additional Details
                        </button>

                        {/* Advanced Fields */}
                        {showAdvanced && (
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                {/* Next Action */}
                                <div className="grid grid-cols-2 gap-4">

                                </div>

                                {/* Owner & Competitor */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Deal Owner</label>
                                        <input
                                            type="text"
                                            value={owner}
                                            onChange={(e) => setOwner(e.target.value)}
                                            placeholder="Sales rep name"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Primary Competitor</label>
                                        <input
                                            type="text"
                                            value={primaryCompetitor}
                                            onChange={(e) => setPrimaryCompetitor(e.target.value)}
                                            placeholder="e.g. Salesforce"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>Description / Notes</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add any additional details about this opportunity..."
                                        rows={3}
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="text-xs text-slate-500">
                        Weighted Value: <span className="font-bold text-slate-700">
                            ${((parseFloat(amount) || 0) * (parseInt(probability) || 0) / 100).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={handleSubmit}
                            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Deal'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddOpportunityModal;
