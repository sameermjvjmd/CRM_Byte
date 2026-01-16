import { useState, useEffect } from 'react';
import { X, Mail, Building2, Users, Bell, Clock } from 'lucide-react';
import api from '../api/api';

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialType?: 'Contact' | 'Company' | 'Opportunity' | 'Activity' | 'Group' | 'Note';
    initialContactId?: number;
    templateData?: any; // Template data to pre-fill form
}

const CreateModal = ({ isOpen, onClose, onSuccess, initialType = 'Contact', initialContactId, templateData }: CreateModalProps) => {
    const [type, setType] = useState<'Contact' | 'Company' | 'Opportunity' | 'Activity' | 'Group' | 'Note'>(initialType);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<any>({
        // Contact
        firstName: '', lastName: '', email: '', phone: '', jobTitle: '',
        address1: '', city: '', state: '', zip: '', country: '',
        // Company/Group
        name: '', industry: '', website: '', description: '',
        // Opportunity
        amount: 0, stage: 'Initial', probability: 50, expectedCloseDate: new Date().toISOString().split('T')[0], contactId: initialContactId || '',
        // Activity
        subject: '', activityType: 'Call', startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16), priority: 'Normal',
        isCompleted: false, duration: 30, location: '', isAllDay: false,
        hasReminder: true, reminderMinutesBefore: 15, notes: '',
        // Note
        regarding: '', details: ''
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
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        jobTitle: formData.jobTitle,
                        address1: formData.address1,
                        city: formData.city,
                        state: formData.state,
                        zip: formData.zip,
                        country: formData.country
                    };
                    break;
                case 'Company':
                    endpoint = '/companies';
                    payload = {
                        name: formData.name,
                        industry: formData.industry,
                        website: formData.website,
                        description: formData.description
                    };
                    break;
                case 'Group':
                    endpoint = '/groups';
                    payload = {
                        name: formData.name,
                        description: formData.description
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
                        contactId: formData.contactId ? Number(formData.contactId) : null
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
                        location: formData.location,
                        notes: formData.notes || formData.description,
                        isAllDay: formData.isAllDay || false,
                        hasReminder: formData.hasReminder || false,
                        reminderMinutesBefore: Number(formData.reminderMinutesBefore || 15)
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
        } catch (error) {
            console.error('Error creating:', error);
            alert('Failed to create record. Please ensure the backend is running.');
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
                        <h2 className="text-xl font-bold text-slate-900">Create New {type}</h2>
                        <p className="text-xs text-slate-500 mt-1">Enter the details below to create a new record.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8">
                        {/* Tabs */}
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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {type === 'Contact' && (
                                <>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelStyle}>First Name</label>
                                            <input required name="firstName" value={formData.firstName} onChange={handleChange} className={inputStyle} placeholder="John" />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Last Name</label>
                                            <input required name="lastName" value={formData.lastName} onChange={handleChange} className={inputStyle} placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputStyle} pl-10`} placeholder="john.doe@example.com" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelStyle}>Job Title</label>
                                            <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={inputStyle} placeholder="e.g. Sales Manager" />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Phone</label>
                                            <input name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} placeholder="+1 (555) 000-0000" />
                                        </div>
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
