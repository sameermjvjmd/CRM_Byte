import { useState, useEffect } from 'react';
import { X, Mail, Building2, Users, Bell, Clock, Search, Repeat, UserCircle, Plus, Calendar as CalendarIcon } from 'lucide-react';
import api from '../api/api';
import { customFieldsApi } from '../api/customFieldsApi';
import { advancedSearchApi, type SavedSearch } from '../api/advancedSearchApi';
import { CustomFieldRenderer, type CustomFieldValue, type CustomFieldDefinition } from './common/CustomFieldRenderer';

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title?: string;
    initialType?: 'Contact' | 'Company' | 'Opportunity' | 'Activity' | 'Group' | 'Note' | 'Product';
    hideTabs?: boolean;
    initialContactId?: number;
    templateData?: any; // Template data to pre-fill form
}

const CreateModal = ({ isOpen, onClose, onSuccess, title, initialType = 'Contact', hideTabs = false, initialContactId, templateData }: CreateModalProps) => {
    const [type, setType] = useState<'Contact' | 'Company' | 'Opportunity' | 'Activity' | 'Group' | 'Note' | 'Product'>(initialType);
    const [loading, setLoading] = useState(false);
    const [customFields, setCustomFields] = useState<any[]>([]);
    const [customValues, setCustomValues] = useState<any[]>([]);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [attendeeSearch, setAttendeeSearch] = useState('');
    const [attendeeResults, setAttendeeResults] = useState<any[]>([]);
    const [selectedAttendees, setSelectedAttendees] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        // Contact
        salutation: '', firstName: '', lastName: '', email: '', phone: '', mobilePhone: '', fax: '', phoneExtension: '',
        jobTitle: '', department: '', status: 'Active', referredBy: '',
        address1: '', city: '', state: '', zip: '', country: '',
        // Company/Group
        name: '', industry: '', website: '', description: '', isDynamic: false, savedSearchId: '',
        // Opportunity
        // Opportunity
        amount: 0, stage: 'Initial', probability: 50, expectedCloseDate: new Date().toISOString().split('T')[0], contactId: initialContactId || '',
        // Activity
        subject: '', activityType: 'Call', startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16), priority: 'Normal',
        isCompleted: false, duration: 30, location: '', isAllDay: false,
        hasReminder: true, reminderMinutesBefore: 15, notes: '',
        // Recurrence
        isRecurring: false, recurrencePattern: 'Weekly', recurrenceInterval: 1,
        recurrenceEndDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], // Default 1 month
        recurrenceDays: [],
        // Note
        regarding: '', details: '',
        // Product
        productName: '', productCode: '', quantity: 1, unitPrice: 0, discount: 0, discountType: 'Percentage',
        // New associations
        companyId: '',
        attendees: '[]'
    });

    useEffect(() => {
        if (isOpen) {
            setType(initialType);
            if (initialContactId) {
                setFormData((prev: any) => ({ ...prev, contactId: initialContactId }));
            }
            // Apply template data if provided
            if (templateData) {
                setFormData((prev: any) => ({ ...prev, ...templateData }));
            }
        }
    }, [initialType, initialContactId, isOpen, templateData]);

    useEffect(() => {
        if (isOpen && ['Contact', 'Company', 'Opportunity'].includes(type) && type !== 'Group') {
            customFieldsApi.getAll(type).then(data => setCustomFields(data)).catch(() => setCustomFields([]));
        }

        if (isOpen && type === 'Group') {
            advancedSearchApi.getSavedSearches().then(setSavedSearches).catch(console.error);
        }

        if (isOpen && type === 'Product') {
            api.get('/products?activeOnly=true').then(res => setProducts(res.data)).catch(console.error);
        }

        setCustomValues([]);
    }, [type, isOpen]);



    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let endpoint = '';
            let payload: any = {};

            switch (type) {
                case 'Contact':
                    endpoint = '/contacts';
                    payload = {
                        salutation: formData.salutation || null,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone || null,
                        mobilePhone: formData.mobilePhone || null,
                        fax: formData.fax || null,
                        phoneExtension: formData.phoneExtension || null,
                        jobTitle: formData.jobTitle || null,
                        department: formData.department || null,
                        status: formData.status || 'Active',
                        referredBy: formData.referredBy || null,
                        address1: formData.address1 || null,
                        city: formData.city || null,
                        state: formData.state || null,
                        zip: formData.zip || null,
                        country: formData.country || null,
                        customValues: customValues
                    };
                    break;
                case 'Company':
                    endpoint = '/companies';
                    payload = {
                        name: formData.name,
                        industry: formData.industry,
                        website: formData.website,
                        description: formData.description,
                        customValues: customValues
                    };
                    break;
                case 'Group':
                    endpoint = '/groups';
                    let dynamicQuery = null;
                    if (formData.isDynamic && formData.savedSearchId) {
                        const search = savedSearches.find(s => s.id === Number(formData.savedSearchId));
                        if (search) {
                            dynamicQuery = JSON.stringify({
                                criteria: search.criteria,
                                matchType: search.matchType
                            });
                        }
                    }
                    payload = {
                        name: formData.name,
                        description: formData.description,
                        isDynamic: formData.isDynamic,
                        dynamicQuery: dynamicQuery
                    };
                    break;
                case 'Opportunity':
                    endpoint = '/opportunities';
                    payload = {
                        name: formData.name,
                        amount: Number(formData.amount), // Ensure number
                        stage: formData.stage,
                        probability: Number(formData.probability), // Ensure number
                        expectedCloseDate: formData.expectedCloseDate,
                        contactId: formData.contactId ? Number(formData.contactId) : null,
                        customValues: customValues
                    };
                    break;
                case 'Activity':
                    endpoint = '/activities';
                    // Calculate EndTime based on StartTime + Duration to ensure consistency
                    const start = new Date(formData.startTime);
                    const durationMins = Number(formData.duration || 30);
                    const end = new Date(start.getTime() + durationMins * 60000);

                    payload = {
                        subject: formData.subject,
                        type: formData.activityType, // Backend uses 'type' not 'activityType'
                        startTime: formData.startTime,
                        endTime: end.toISOString(),
                        priority: formData.priority,
                        isCompleted: formData.isCompleted,
                        contactId: formData.contactId ? Number(formData.contactId) : null,
                        opportunityId: formData.opportunityId ? Number(formData.opportunityId) : null,
                        location: formData.location,
                        notes: formData.notes || formData.description,
                        isAllDay: formData.isAllDay || false,
                        hasReminder: formData.hasReminder || false,
                        reminderMinutesBefore: Number(formData.reminderMinutesBefore || 15),
                        // Recurrence payload
                        isRecurring: formData.isRecurring,
                        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : null,
                        recurrenceInterval: formData.isRecurring ? Number(formData.recurrenceInterval) : 1,
                        recurrenceEndDate: formData.isRecurring ? formData.recurrenceEndDate : null,
                        recurrenceDays: formData.isRecurring && formData.recurrencePattern === 'Weekly' && formData.recurrenceDays?.length
                            ? formData.recurrenceDays.join(',')
                            : null,
                        attendees: JSON.stringify(selectedAttendees)
                    };
                    break;
                case 'Note':
                    endpoint = '/history';
                    payload = {
                        type: 'Note',
                        regarding: formData.regarding,
                        details: formData.details,
                        result: 'Completed',
                        date: new Date().toISOString(), // Or let backend handle it
                        contactId: formData.contactId ? Number(formData.contactId) : null
                    };
                    break;
                case 'Product':
                    endpoint = `/opportunities/${formData.opportunityId}/products`;
                    payload = {
                        productName: formData.productName,
                        productCode: formData.productCode,
                        quantity: Number(formData.quantity),
                        unitPrice: Number(formData.unitPrice),
                        discount: Number(formData.discount),
                        discountType: formData.discountType,
                        description: formData.description
                    };
                    break;
            }

            // Attach custom values if any
            if (customValues.length > 0) {
                const validValues = customValues.filter((cv: any) => cv.customFieldId && !isNaN(Number(cv.customFieldId)));
                if (validValues.length > 0) {
                    // Try PascalCase for Collection and Items (Strict Binding Check)
                    payload['CustomValues'] = validValues.map((cv: any) => ({
                        CustomFieldId: Number(cv.customFieldId),
                        EntityId: 0,
                        EntityType: 'Contact',
                        Value: String(cv.value)
                    }));
                }
            }

            await api.post(endpoint, payload);
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                firstName: '', lastName: '', email: '', phone: '', jobTitle: '',
                address1: '', city: '', state: '', zip: '', country: '',
                name: '', industry: '', website: '', description: '',
                amount: 0, stage: 'Initial', probability: 50, expectedCloseDate: new Date().toISOString().split('T')[0], contactId: '',
                subject: '', activityType: 'Call', startTime: new Date().toISOString().slice(0, 16),
                endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16), priority: 'Medium',
                isCompleted: false,
                regarding: '', details: ''
            });
        } catch (error: any) {
            console.error('Error creating:', error);
            const data = error.response?.data;
            const msg = data?.title || data?.message || error.message || 'Unknown error';
            alert(`Failed to create record: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const inputStyle = "w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 hover:border-slate-400";
    const labelStyle = "text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 block";
    const selectStyle = "w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer hover:border-slate-400 appearance-none";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{title || `Create New ${type}`}</h2>
                        <p className="text-xs text-slate-500 mt-1">Enter the details below to create a new record.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8">
                        {/* Tabs */}
                        {!hideTabs && (
                            <div className="flex justify-center mb-8">
                                <div className="flex bg-slate-100/80 p-1.5 rounded-xl overflow-x-auto w-full md:w-auto">
                                    {(['Contact', 'Company', 'Group', 'Opportunity', 'Activity', 'Note'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setType(t)}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-w-[80px] ${type === t ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}


                        <form onSubmit={handleSubmit} className="space-y-6">
                            {type === 'Contact' && (
                                <>
                                    <div className="grid grid-cols-12 gap-5">
                                        <div className="col-span-3">
                                            <label className={labelStyle}>Salutation</label>
                                            <select name="salutation" value={formData.salutation} onChange={handleChange} className={selectStyle}>
                                                <option value="">-</option>
                                                <option value="Mr.">Mr.</option>
                                                <option value="Ms.">Ms.</option>
                                                <option value="Mrs.">Mrs.</option>
                                                <option value="Dr.">Dr.</option>
                                                <option value="Prof.">Prof.</option>
                                            </select>
                                        </div>
                                        <div className="col-span-4">
                                            <label className={labelStyle}>First Name</label>
                                            <input required name="firstName" value={formData.firstName} onChange={handleChange} className={inputStyle} placeholder="John" />
                                        </div>
                                        <div className="col-span-5">
                                            <label className={labelStyle}>Last Name</label>
                                            <input required name="lastName" value={formData.lastName} onChange={handleChange} className={inputStyle} placeholder="Doe" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelStyle}>Job Title</label>
                                            <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={inputStyle} placeholder="e.g. Sales Manager" />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Department</label>
                                            <input name="department" value={formData.department} onChange={handleChange} className={inputStyle} placeholder="e.g. Marketing" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelStyle}>Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputStyle} pl-10`} placeholder="john.doe@example.com" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-5">
                                            <label className={labelStyle}>Phone</label>
                                            <input name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} placeholder="Office" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelStyle}>Ext</label>
                                            <input name="phoneExtension" value={formData.phoneExtension} onChange={handleChange} className={inputStyle} placeholder="123" />
                                        </div>
                                        <div className="col-span-5">
                                            <label className={labelStyle}>Mobile</label>
                                            <input name="mobilePhone" value={formData.mobilePhone} onChange={handleChange} className={inputStyle} placeholder="Cell" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelStyle}>Fax</label>
                                            <input name="fax" value={formData.fax} onChange={handleChange} className={inputStyle} placeholder="Fax Number" />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Status</label>
                                            <select name="status" value={formData.status} onChange={handleChange} className={selectStyle}>
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Prospect">Prospect</option>
                                                <option value="Customer">Customer</option>
                                                <option value="Vendor">Vendor</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Referred By</label>
                                        <input name="referredBy" value={formData.referredBy} onChange={handleChange} className={inputStyle} placeholder="Name of referrer" />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Address</label>
                                        <input name="address1" value={formData.address1} onChange={handleChange} className={`${inputStyle} mb-3`} placeholder="Street Address" />
                                        <div className="grid grid-cols-3 gap-3">
                                            <input name="city" value={formData.city} onChange={handleChange} className={inputStyle} placeholder="City" />
                                            <input name="state" value={formData.state} onChange={handleChange} className={inputStyle} placeholder="State" />
                                            <input name="zip" value={formData.zip} onChange={handleChange} className={inputStyle} placeholder="Zip" />
                                        </div>
                                    </div>

                                    {/* Custom Fields */}
                                    {customFields.length > 0 && (
                                        <div className="pt-4 border-t border-slate-100">
                                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Additional Details</h3>
                                            <CustomFieldRenderer
                                                fields={customFields}
                                                values={customValues}
                                                onChange={setCustomValues}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {(type === 'Company' || type === 'Group') && (
                                <>
                                    <div>
                                        <label className={labelStyle}>{type} Name</label>
                                        <div className="relative">
                                            {type === 'Company' ? <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /> : <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
                                            <input required name="name" value={formData.name} onChange={handleChange} className={`${inputStyle} pl-10`} placeholder={type === 'Company' ? "Acme Corp" : "VIP Customers"} />
                                        </div>
                                    </div>
                                    {type === 'Company' && (
                                        <div>
                                            <label className={labelStyle}>Industry</label>
                                            <input name="industry" value={formData.industry} onChange={handleChange} className={inputStyle} placeholder="Technology" />
                                        </div>
                                    )}
                                    {type === 'Group' && (
                                        <div>
                                            <label className={labelStyle}>Description</label>
                                            <textarea name="description" value={formData.description} onChange={handleChange} className={`${inputStyle} h-32 resize-none`} placeholder="Description of this group..." />
                                        </div>
                                    )}

                                    {type === 'Group' && (
                                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="isDynamic"
                                                        checked={formData.isDynamic || false}
                                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, isDynamic: e.target.checked }))}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                                <div>
                                                    <label className="text-sm font-bold text-slate-800 block">Dynamic Group (Smart Group)</label>
                                                    <p className="text-xs text-slate-500">Automatically adds contacts based on criteria.</p>
                                                </div>
                                            </div>

                                            {formData.isDynamic && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <label className={labelStyle}>Source Saved Search</label>
                                                    <div className="relative">
                                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <select
                                                            name="savedSearchId"
                                                            value={formData.savedSearchId}
                                                            onChange={handleChange}
                                                            className={`${selectStyle} pl-10`}
                                                            required={formData.isDynamic}
                                                        >
                                                            <option value="">Select a saved search...</option>
                                                            {savedSearches.filter(s => s.entityType === 'Contacts').map(s => (
                                                                <option key={s.id} value={s.id}>{s.name} ({s.criteria.length} rules)</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-2">
                                                        The group logic will be copied from the selected search.
                                                        Future changes to the Saved Search record will NOT affect this group (snapshot).
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Custom Fields for Company */}
                                    {type === 'Company' && customFields.length > 0 && (
                                        <div className="pt-4 border-t border-slate-100">
                                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Additional Details</h3>
                                            <CustomFieldRenderer
                                                fields={customFields}
                                                values={customValues}
                                                onChange={setCustomValues}
                                            />
                                        </div>
                                    )}
                                </>
                            )}


                            {type === 'Opportunity' && (
                                <>
                                    <div>
                                        <label className={labelStyle}>Opportunity Name</label>
                                        <input required name="name" value={formData.name} onChange={handleChange} className={inputStyle} placeholder="Enterprise License Deal" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelStyle}>Estimated Value ($)</label>
                                            <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Probability (%)</label>
                                            <input required type="number" name="probability" value={formData.probability} onChange={handleChange} className={inputStyle} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Stage</label>
                                        <select name="stage" value={formData.stage} onChange={handleChange} className={selectStyle}>
                                            {['Initial', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100">
                                        <label className={labelStyle}>Primary Contact</label>
                                        <div className="relative">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search contacts..."
                                                className={`${inputStyle} pl-10`}
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    if (e.target.value.length > 2) {
                                                        api.get(`/contacts?search=${e.target.value}`).then(res => setSearchResults(res.data));
                                                    } else {
                                                        setSearchResults([]);
                                                    }
                                                }}
                                            />
                                            {searchResults.length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                    {searchResults.map(c => (
                                                        <div
                                                            key={c.id}
                                                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700 flex justify-between items-center"
                                                            onClick={() => {
                                                                setFormData((prev: any) => ({ ...prev, contactId: c.id }));
                                                                setSearchTerm(`${c.firstName} ${c.lastName}`);
                                                                setSearchResults([]);
                                                            }}
                                                        >
                                                            <span>{c.firstName} {c.lastName}</span>
                                                            <span className="text-[10px] text-slate-400">{c.email}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Custom Fields */}
                                    {customFields.length > 0 && (
                                        <div className="pt-4 border-t border-slate-100">
                                            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Additional Details</h3>
                                            <CustomFieldRenderer
                                                fields={customFields}
                                                values={customValues}
                                                onChange={setCustomValues}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {type === 'Activity' && (
                                <>
                                    <div>
                                        <label className={labelStyle}>Subject</label>
                                        <input required name="subject" value={formData.subject} onChange={handleChange} className={inputStyle} placeholder="Follow-up Call" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelStyle}>Type</label>
                                            <select name="activityType" value={formData.activityType} onChange={handleChange} className={selectStyle}>
                                                <optgroup label="Common">
                                                    <option value="Call">Call</option>
                                                    <option value="Meeting">Meeting</option>
                                                    <option value="To-Do">To-Do</option>
                                                    <option value="Email">Email</option>
                                                    <option value="Follow-up">Follow-up</option>
                                                    <option value="Appointment">Appointment</option>
                                                </optgroup>
                                                <optgroup label="Call Outcomes">
                                                    <option value="CallAttempt">Call Attempt</option>
                                                    <option value="CallReached">Call Reached</option>
                                                    <option value="CallLeftMessage">Left Message</option>
                                                </optgroup>
                                                <optgroup label="Other">
                                                    <option value="Event">Event</option>
                                                    <option value="Personal">Personal</option>
                                                    <option value="Vacation">Vacation/OOO</option>
                                                    <option value="Letter">Letter</option>
                                                    <option value="Fax">Fax</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Priority</label>
                                            <select name="priority" value={formData.priority} onChange={handleChange} className={selectStyle}>
                                                <option value="High">High</option>
                                                <option value="Normal">Normal</option>
                                                <option value="Low">Low</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelStyle}>Contact</label>
                                            <div className="relative">
                                                <UserCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search..."
                                                    className={`${inputStyle} pl-10`}
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        if (e.target.value.length > 1) {
                                                            api.get(`/contacts?search=${e.target.value}`).then(res => setSearchResults(res.data));
                                                        } else {
                                                            setSearchResults([]);
                                                        }
                                                    }}
                                                />
                                                {searchResults.length > 0 && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                        {searchResults.map(c => (
                                                            <div
                                                                key={c.id}
                                                                className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700"
                                                                onClick={() => {
                                                                    setFormData((prev: any) => ({ ...prev, contactId: c.id }));
                                                                    setSearchTerm(`${c.firstName} ${c.lastName}`);
                                                                    setSearchResults([]);
                                                                }}
                                                            >
                                                                {c.firstName} {c.lastName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Company</label>
                                            <div className="relative">
                                                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="companySearch"
                                                    placeholder="Search..."
                                                    className={`${inputStyle} pl-10`}
                                                    onChange={(e) => {
                                                        if (e.target.value.length > 1) {
                                                            api.get(`/companies?search=${e.target.value}`).then(res => {
                                                                // Temporary results handling
                                                                console.log(res.data);
                                                            });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendees Section */}
                                    <div className="space-y-3">
                                        <label className={labelStyle}>Attendees / Invitees</label>
                                        <div className="relative">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {selectedAttendees.map(a => (
                                                    <span key={a.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black ring-1 ring-indigo-200">
                                                        {a.name}
                                                        <X
                                                            size={12}
                                                            className="cursor-pointer hover:text-indigo-900"
                                                            onClick={() => setSelectedAttendees(prev => prev.filter(x => x.id !== a.id))}
                                                        />
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Add attendees..."
                                                    className={`${inputStyle} pl-10`}
                                                    value={attendeeSearch}
                                                    onChange={(e) => {
                                                        setAttendeeSearch(e.target.value);
                                                        if (e.target.value.length > 1) {
                                                            api.get(`/contacts?search=${e.target.value}`).then(res => setAttendeeResults(res.data));
                                                        } else {
                                                            setAttendeeResults([]);
                                                        }
                                                    }}
                                                />
                                                {attendeeResults.length > 0 && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                        {attendeeResults.map(c => (
                                                            <div
                                                                key={c.id}
                                                                className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700 flex justify-between"
                                                                onClick={() => {
                                                                    if (!selectedAttendees.find(x => x.id === c.id)) {
                                                                        setSelectedAttendees(prev => [...prev, { id: c.id, name: `${c.firstName} ${c.lastName}` }]);
                                                                    }
                                                                    setAttendeeSearch('');
                                                                    setAttendeeResults([]);
                                                                }}
                                                            >
                                                                <span>{c.firstName} {c.lastName}</span>
                                                                <Plus size={14} className="text-slate-300" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* All-Day Toggle */}
                                    <div className="flex items-center gap-3 py-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isAllDay"
                                                checked={formData.isAllDay || false}
                                                onChange={(e) => setFormData((prev: any) => ({ ...prev, isAllDay: e.target.checked }))}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-slate-400" />
                                            <span className="text-sm font-medium text-slate-700">All-Day Event</span>
                                        </div>
                                    </div>

                                    {!formData.isAllDay && (
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className={labelStyle}>Start Time</label>
                                                <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className={inputStyle} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Duration</label>
                                                <select name="duration" value={formData.duration || 30} onChange={handleChange} className={selectStyle}>
                                                    <option value="15">15 min</option>
                                                    <option value="30">30 min</option>
                                                    <option value="45">45 min</option>
                                                    <option value="60">1 Hour</option>
                                                    <option value="90">1.5 Hours</option>
                                                    <option value="120">2 Hours</option>
                                                    <option value="180">3 Hours</option>
                                                    <option value="240">4 Hours</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {formData.isAllDay && (
                                        <div>
                                            <label className={labelStyle}>Date</label>
                                            <input type="date" name="startTime" value={formData.startTime?.split('T')[0] || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, startTime: e.target.value + 'T00:00' }))} className={inputStyle} />
                                        </div>
                                    )}

                                    {/* Reminder Toggle */}
                                    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="hasReminder"
                                                    checked={formData.hasReminder ?? true}
                                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, hasReminder: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Bell size={16} className="text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700">Reminder</span>
                                            </div>
                                        </div>
                                        {formData.hasReminder && (
                                            <select
                                                name="reminderMinutesBefore"
                                                value={formData.reminderMinutesBefore || 15}
                                                onChange={handleChange}
                                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700"
                                            >
                                                <option value="0">At time of event</option>
                                                <option value="5">5 min before</option>
                                                <option value="15">15 min before</option>
                                                <option value="30">30 min before</option>
                                                <option value="60">1 hour before</option>
                                                <option value="1440">1 day before</option>
                                            </select>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelStyle}>Location</label>
                                        <input name="location" value={formData.location || ''} onChange={handleChange} className={inputStyle} placeholder="e.g. Conference Room A or Zoom link" />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Notes</label>
                                        <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className={`${inputStyle} h-24 resize-none`} placeholder="Add agenda or notes..." />
                                    </div>

                                    {/* Recurrence Section */}
                                    <div className="border-t border-slate-100 pt-4 mt-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="isRecurring"
                                                    checked={formData.isRecurring || false}
                                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, isRecurring: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Repeat size={16} className="text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700">Recurring Activity</span>
                                            </div>
                                        </div>

                                        {formData.isRecurring && (
                                            <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-200 animate-in slide-in-from-top-2">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={labelStyle}>Repeats</label>
                                                        <select name="recurrencePattern" value={formData.recurrencePattern} onChange={handleChange} className={selectStyle}>
                                                            <option value="Daily">Daily</option>
                                                            <option value="Weekly">Weekly</option>
                                                            <option value="Monthly">Monthly</option>
                                                            <option value="Yearly">Yearly</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={labelStyle}>Every (Interval)</label>
                                                        <div className="flex items-center gap-2">
                                                            <input type="number" min="1" max="99" name="recurrenceInterval" value={formData.recurrenceInterval} onChange={handleChange} className={inputStyle} />
                                                            <span className="text-xs font-bold text-slate-400 uppercase">
                                                                {formData.recurrencePattern === 'Daily' ? 'Days' :
                                                                    formData.recurrencePattern === 'Weekly' ? 'Weeks' :
                                                                        formData.recurrencePattern === 'Monthly' ? 'Months' : 'Years'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {formData.recurrencePattern === 'Weekly' && (
                                                    <div>
                                                        <label className={labelStyle}>On Days</label>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                                <button
                                                                    key={day}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current = formData.recurrenceDays || [];
                                                                        const updated = current.includes(day)
                                                                            ? current.filter((d: string) => d !== day)
                                                                            : [...current, day];
                                                                        setFormData({ ...formData, recurrenceDays: updated });
                                                                    }}
                                                                    className={`w-8 h-8 rounded-full text-[10px] font-black uppercase flex items-center justify-center transition-all ${(formData.recurrenceDays || []).includes(day)
                                                                        ? 'bg-indigo-600 text-white shadow-md scale-110'
                                                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                                                        }`}
                                                                >
                                                                    {day.substring(0, 1)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className={labelStyle}>End Date</label>
                                                    <div className="relative">
                                                        <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input type="date" name="recurrenceEndDate" value={formData.recurrenceEndDate} onChange={handleChange} className={`${inputStyle} pl-10`} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {type === 'Note' && (
                                <>
                                    <div>
                                        <label className={labelStyle}>Subject / Regarding</label>
                                        <input required name="regarding" value={formData.regarding} onChange={handleChange} className={inputStyle} placeholder="Meeting Recap" />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Note Details</label>
                                        <textarea required name="details" value={formData.details} onChange={handleChange} className={`${inputStyle} h-40 resize-none`} placeholder="Enter note details here..." />
                                    </div>
                                </>
                            )}

                            {type === 'Product' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className={labelStyle}>Select from Catalog (Optional)</label>
                                            <select
                                                className={inputStyle}
                                                onChange={(e) => {
                                                    const prod = products.find(p => p.id === Number(e.target.value));
                                                    if (prod) {
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            productName: prod.name,
                                                            productCode: prod.sku || prev.productCode,
                                                            unitPrice: prod.price || prev.unitPrice,
                                                            description: prod.description || prev.description
                                                        }));
                                                    }
                                                }}
                                            >
                                                <option value="">-- Choose Product --</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.sku || 'No SKU'}) - ${p.price}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelStyle}>Product Name *</label>
                                            <input required name="productName" value={formData.productName} onChange={handleChange} className={inputStyle} placeholder="e.g. Professional License" />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Product Code</label>
                                            <input name="productCode" value={formData.productCode} onChange={handleChange} className={inputStyle} placeholder="e.g. LIC-001" />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Quantity *</label>
                                            <input type="number" required min="1" name="quantity" value={formData.quantity} onChange={handleChange} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Unit Price ({formData.currency || '$'}) *</label>
                                            <input type="number" required min="0" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className={inputStyle} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className={labelStyle}>Discount</label>
                                                <input type="number" min="0" step="0.01" name="discount" value={formData.discount} onChange={handleChange} className={inputStyle} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Type</label>
                                                <select name="discountType" value={formData.discountType} onChange={handleChange} className={inputStyle}>
                                                    <option value="Percentage">%</option>
                                                    <option value="Fixed">$</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelStyle}>Description</label>
                                            <textarea name="description" value={formData.description} onChange={handleChange} className={`${inputStyle} h-20 resize-none`} placeholder="Product details..." />
                                        </div>
                                    </div>
                                </>
                            )}



                            <div className="pt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateModal;
