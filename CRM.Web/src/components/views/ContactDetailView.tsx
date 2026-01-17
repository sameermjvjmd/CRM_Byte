import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import type { Contact } from '../../types/contact';
import type { Activity } from '../../types/activity';
import type { Opportunity } from '../../types/opportunity';
import type { HistoryItem } from '../../types/history';
import { ArrowLeft, Mail, Phone, Building2, Settings, History, Calendar, Briefcase, Plus, Users, MapPin, StickyNote, FileText, Globe, MoreVertical, User, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';
import CreateModal from '../CreateModal';
import DocumentsTab from '../DocumentsTab';
import QuickActionsMenu from '../QuickActionsMenu';
import LatestActivitiesWidget from '../LatestActivitiesWidget';
import GroupsTab from '../tabs/GroupsTab';
import CompaniesTab from '../tabs/CompaniesTab';
import PersonalInfoTab from '../tabs/PersonalInfoTab';
import WebInfoTab from '../tabs/WebInfoTab';
import UserFieldsTab from '../tabs/UserFieldsTab';
import ContactEmailsTab from '../tabs/ContactEmailsTab';
import ContactAddressesTab from '../tabs/ContactAddressesTab';
import EmailComposer from '../email/EmailComposer';
import EmailHistoryTab from '../email/EmailHistoryTab';

interface ContactDetailViewProps {
    contactId: number;
    navigation?: {
        onPrevious?: () => void;
        onNext?: () => void;
        currentIndex?: number;
        totalCount?: number;
        hasPrevious?: boolean;
        hasNext?: boolean;
    };
}

const ContactDetailView = ({ contactId, navigation }: ContactDetailViewProps) => {
    // const { id } = useParams(); // Removed
    const navigate = useNavigate();
    const [contact, setContact] = useState<Contact | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Activities' | 'Opportunities' | 'History' | 'Groups' | 'Notes' | 'Documents' | 'Companies' | 'Personal' | 'WebInfo' | 'CustomFields' | 'Emails' | 'EmailAddresses' | 'Addresses'>('History');
    const [editingNotes, setEditingNotes] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New tab data states
    const [groups, setGroups] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [personalInfo, setPersonalInfo] = useState<any>({});
    const [webInfo, setWebInfo] = useState<any>({ customLinks: [] });

    const [modalType, setModalType] = useState<'Activity' | 'Note' | 'Contact' | 'Company' | 'Opportunity' | 'Group'>('Activity');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<any>({});
    const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [activityTypeFilter, setActivityTypeFilter] = useState<string | null>(null);
    const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch core data
                const [contactRes, activitiesRes, oppsRes, historyRes] = await Promise.all([
                    api.get(`/contacts/${contactId}`),
                    api.get(`/activities/contact/${contactId}`),
                    api.get(`/opportunities/contact/${contactId}`),
                    api.get(`/history/contact/${contactId}`)
                ]);
                setContact(contactRes.data);
                setActivities(activitiesRes.data);
                setOpportunities(oppsRes.data);
                setHistory(historyRes.data);
                setNoteText(contactRes.data.notes || '');
                setEditFormData(contactRes.data);

                // Fetch extended data (Week 7-8 features)
                // We wrap these in try-catch blocks individually or together so one failure doesn't break the page
                try {
                    const [groupsRes, personalRes, webRes] = await Promise.all([
                        api.get(`/groups/contact/${contactId}`),
                        api.get(`/contacts/${contactId}/personalinfo`),
                        api.get(`/contacts/${contactId}/webinfo`)
                    ]);

                    setGroups(groupsRes.data || []);
                    setPersonalInfo(personalRes.data || {});
                    setWebInfo(webRes.data || { customLinks: [] });
                } catch (extError) {
                    console.error('Error fetching extended data:', extError);
                }

            } catch (error) {
                console.error('Error fetching contact details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [contactId]);

    const handleSaveNotes = async () => {
        if (!contact) return;
        try {
            const updated = { ...contact, notes: noteText };
            await api.put(`/contacts/${contactId}`, updated);
            setContact(updated);
            setEditingNotes(false);
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    };

    const handleEditContact = () => {
        setEditFormData({ ...contact });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            await api.put(`/contacts/${contactId}`, editFormData);
            setContact(editFormData);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    const handleEditNote = (note: any) => {
        setSelectedNote(note);
        setIsEditNoteModalOpen(true);
    };

    const handleSaveNote = async () => {
        if (!selectedNote) return;
        try {
            await api.put(`/history/${selectedNote.id}`, selectedNote);
            // Refresh history
            const historyRes = await api.get(`/history/contact/${contactId}`);
            setHistory(historyRes.data);
            setIsEditNoteModalOpen(false);
            setSelectedNote(null);
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    // Group handlers
    const handleAddToGroup = async (groupId: number) => {
        try {
            await api.post(`/groups/${groupId}/members`, { contactId: contactId });
            // Refresh groups
            const groupsRes = await api.get(`/groups/contact/${contactId}`);
            setGroups(groupsRes.data);
            alert('Contact added to group successfully!');
        } catch (error) {
            console.error('Error adding to group:', error);
            alert('Failed to add contact to group');
        }
    };

    const handleRemoveFromGroup = async (groupId: number) => {
        try {
            await api.delete(`/groups/${groupId}/members/${contactId}`);
            setGroups(prev => prev.filter(g => g.id !== groupId));
            alert('Contact removed from group successfully!');
        } catch (error) {
            console.error('Error removing from group:', error);
            alert('Failed to remove contact from group');
        }
    };

    const handleCreateGroup = async (name: string, description: string) => {
        try {
            // 1. Create group
            const createRes = await api.post('/groups', { name, description });
            const newGroup = createRes.data;

            // 2. Add contact to new group
            await api.post(`/groups/${newGroup.id}/members`, { contactId: contactId });

            // 3. Refresh list
            const groupsRes = await api.get(`/groups/contact/${contactId}`);
            setGroups(groupsRes.data);

            alert(`Group "${name}" created and contact added!`);
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        }
    };

    // Company handlers
    const handleLinkCompany = async (companyId: number, relationship: string) => {
        try {
            console.log('Linking company:', companyId, relationship);
            alert('Company linked successfully!');
        } catch (error) {
            console.error('Error linking company:', error);
        }
    };

    const handleUnlinkCompany = async (companyId: number) => {
        try {
            setCompanies(prev => prev.filter(c => c.id !== companyId));
            alert('Company unlinked successfully!');
        } catch (error) {
            console.error('Error unlinking company:', error);
        }
    };

    const handleSetPrimaryCompany = async (companyId: number) => {
        try {
            setCompanies(prev => prev.map(c => ({
                ...c,
                isPrimary: c.id === companyId
            })));
            alert('Primary company updated!');
        } catch (error) {
            console.error('Error setting primary company:', error);
        }
    };

    // Personal info handler
    const handleUpdatePersonalInfo = async (info: any) => {
        try {
            info.contactId = contactId;
            await api.put(`/contacts/${contactId}/personalinfo`, info);
            setPersonalInfo(info);
            alert('Personal information updated successfully!');
        } catch (error) {
            console.error('Error updating personal info:', error);
            alert('Failed to update personal information');
        }
    };

    // Web info handler
    const handleUpdateWebInfo = async (info: any) => {
        try {
            info.contactId = contactId;
            await api.put(`/contacts/${contactId}/webinfo`, info);
            setWebInfo(info);
            alert('Web information updated successfully!');
        } catch (error) {
            console.error('Error updating web info:', error);
            alert('Failed to update web information');
        }
    };

    // Custom fields handler
    const handleUpdateCustomFields = async (values: any[]) => {
        if (!contact) return;
        try {
            const updatedContact = { ...contact, customValues: values };
            await api.put(`/contacts/${contactId}`, updatedContact);

            // Refresh to confirm save
            const res = await api.get(`/contacts/${contactId}`);
            setContact(res.data);

            alert('Custom fields updated successfully!');
        } catch (error) {
            console.error('Error updating custom fields:', error);
            alert('Failed to update custom fields');
        }
    };


    if (loading) return (
        <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400 min-h-screen bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="font-bold text-sm tracking-widest uppercase">Initializing Registry...</div>
        </div>
    );
    if (!contact) return <div className="p-8 text-red-500">Contact not found.</div>;

    const brandIndigo = "#6366F1";

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Context Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/contacts')} className="p-2.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    {navigation && (
                        <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                            <button
                                onClick={navigation.onPrevious}
                                disabled={!navigation.hasPrevious}
                                className={`p-1.5 rounded transition-colors ${navigation.hasPrevious ? 'text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm' : 'text-slate-300 cursor-not-allowed'}`}
                                title="Previous Record"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[10px] font-black text-slate-400 px-2 select-none">
                                {navigation.currentIndex !== undefined && navigation.totalCount ? `${navigation.currentIndex + 1} / ${navigation.totalCount}` : '•'}
                            </span>
                            <button
                                onClick={navigation.onNext}
                                disabled={!navigation.hasNext}
                                className={`p-1.5 rounded transition-colors ${navigation.hasNext ? 'text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm' : 'text-slate-300 cursor-not-allowed'}`}
                                title="Next Record"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">{contact.firstName} {contact.lastName}</h1>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${contact.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                {contact.status || 'Active'}
                            </span>
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{contact.jobTitle || 'Business Relationship'} @ {(contact.company as any)?.name || contact.company || 'Private Record'}</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setModalType('Activity');
                            setIsModalOpen(true);
                        }}
                        className="px-5 py-2 bg-slate-100 text-slate-600 rounded border border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Schedule
                    </button>
                    <button
                        onClick={handleEditContact}
                        className="px-5 py-2 bg-indigo-600 text-white rounded shadow-md text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        Edit Record
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-y-auto custom-scrollbar">


                {/* Information Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        {/* Contact Header */}
                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg">
                                {contact.firstName?.[0]}{contact.lastName?.[0]}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-black text-slate-900">
                                    {contact.salutation && <span className="text-slate-500 mr-1">{contact.salutation}</span>}
                                    {contact.firstName} {contact.lastName}
                                </h2>
                                <p className="text-sm font-bold text-slate-600">{contact.jobTitle || 'Contact'}</p>
                                {contact.department && (
                                    <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">{contact.department}</p>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Contact Information</h4>

                            <div className="flex items-start gap-3">
                                <Mail size={16} className="text-slate-400 mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-[10px] font-bold uppercase text-slate-400">Email</div>
                                    <div className="text-sm font-bold text-indigo-600">{contact.email}</div>
                                </div>
                            </div>

                            {contact.phone && (
                                <div className="flex items-start gap-3">
                                    <Phone size={16} className="text-slate-400 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold uppercase text-slate-400">Office Phone</div>
                                        <div className="text-sm font-bold text-slate-900">
                                            {contact.phone}
                                            {contact.phoneExtension && <span className="text-slate-500 ml-1">x{contact.phoneExtension}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {contact.mobilePhone && (
                                <div className="flex items-start gap-3">
                                    <Phone size={16} className="text-slate-400 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold uppercase text-slate-400">Mobile</div>
                                        <div className="text-sm font-bold text-slate-900">{contact.mobilePhone}</div>
                                    </div>
                                </div>
                            )}

                            {contact.fax && (
                                <div className="flex items-start gap-3">
                                    <Phone size={16} className="text-slate-400 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold uppercase text-slate-400">Fax</div>
                                        <div className="text-sm font-bold text-slate-900">{contact.fax}</div>
                                    </div>
                                </div>
                            )}

                            {contact.company && (
                                <div className="flex items-start gap-3">
                                    <Building2 size={16} className="text-slate-400 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold uppercase text-slate-400">Company</div>
                                        <div className="text-sm font-bold text-slate-900">
                                            {(contact.company as any)?.name || contact.company}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Address Section */}
                        {(contact.address1 || contact.city) && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Address</h4>
                                <div className="flex gap-3">
                                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                                    <div className="text-sm font-bold text-slate-600 leading-relaxed">
                                        {contact.address1 && <div>{contact.address1}</div>}
                                        {contact.address2 && <div>{contact.address2}</div>}
                                        <div>{[contact.city, contact.state, contact.zip].filter(Boolean).join(', ')}</div>
                                        {contact.country && <div className="text-slate-400 mt-1">{contact.country}</div>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Summary Dossier</h3>
                            <button
                                onClick={() => editingNotes ? handleSaveNotes() : setEditingNotes(true)}
                                className="text-[10px] text-indigo-600 font-black uppercase hover:underline"
                            >
                                {editingNotes ? 'Commit' : 'Modify'}
                            </button>
                        </div>
                        {editingNotes ? (
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="w-full h-32 p-3 border border-slate-200 rounded text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                            />
                        ) : (
                            <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase">
                                {contact.notes || "No supplemental dossier information available for this record."}
                            </p>
                        )}
                    </div>

                    {/* Latest Activities Widget */}
                    <LatestActivitiesWidget
                        contactId={contactId}
                        onActivityTypeClick={(activityType) => {
                            console.log('Activity type clicked:', activityType);
                            console.log('Current active tab:', activeTab);
                            setActivityTypeFilter(activityType);
                            setActiveTab('Activities');
                            console.log('Switched to Activities tab with filter:', activityType);
                        }}
                    />

                    {/* Quick Actions Menu */}
                    <QuickActionsMenu
                        contactName={`${contact.firstName} ${contact.lastName}`}
                        contactEmail={contact.email}
                        contactPhone={contact.phone}
                        onScheduleCall={() => {
                            setModalType('Activity');
                            setIsModalOpen(true);
                        }}
                        onScheduleMeeting={() => {
                            setModalType('Activity');
                            setIsModalOpen(true);
                        }}
                        onSendEmail={() => setIsEmailComposerOpen(true)}
                        onAddNote={() => {
                            setModalType('Note');
                            setIsModalOpen(true);
                        }}
                    />
                </div>

                {/* Tabbed Content Area */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/50 overflow-x-auto no-scrollbar">
                            <TabItem id="History" icon={<History size={16} />} active={activeTab === 'History'} onClick={() => setActiveTab('History')} />
                            <TabItem id="Notes" icon={<StickyNote size={16} />} active={activeTab === 'Notes'} onClick={() => setActiveTab('Notes')} />
                            <TabItem id="Activities" icon={<Calendar size={16} />} active={activeTab === 'Activities'} onClick={() => setActiveTab('Activities')} />
                            <TabItem id="Opportunities" icon={<Briefcase size={16} />} active={activeTab === 'Opportunities'} onClick={() => setActiveTab('Opportunities')} />
                            <TabItem id="Documents" icon={<FileText size={16} />} active={activeTab === 'Documents'} onClick={() => setActiveTab('Documents')} />
                            <TabItem id="Groups" icon={<Users size={16} />} active={activeTab === 'Groups'} onClick={() => setActiveTab('Groups')} />
                            <TabItem id="Companies" icon={<Building2 size={16} />} active={activeTab === 'Companies'} onClick={() => setActiveTab('Companies')} />
                            <TabItem id="Personal" label="Personal Info" icon={<User size={16} />} active={activeTab === 'Personal'} onClick={() => setActiveTab('Personal')} />
                            <TabItem id="WebInfo" label="Web Info" icon={<Globe size={16} />} active={activeTab === 'WebInfo'} onClick={() => setActiveTab('WebInfo')} />
                            <TabItem id="CustomFields" label="Custom Fields" icon={<Sliders size={16} />} active={activeTab === 'CustomFields'} onClick={() => setActiveTab('CustomFields')} />
                            <TabItem id="EmailAddresses" label="Emails" icon={<Mail size={16} />} active={activeTab === 'EmailAddresses'} onClick={() => setActiveTab('EmailAddresses')} />
                            <TabItem id="Addresses" icon={<MapPin size={16} />} active={activeTab === 'Addresses'} onClick={() => setActiveTab('Addresses')} />
                            <TabItem id="Emails" label="Correspondence" icon={<Mail size={16} />} active={activeTab === 'Emails'} onClick={() => setActiveTab('Emails')} />
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">

                            {activeTab === 'History' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Interaction Timeline</h4>
                                        <button className="text-[10px] font-black text-indigo-600 uppercase border-b-2 border-indigo-100 pb-0.5">Filter Log</button>
                                    </div>
                                    {history.length > 0 ? (
                                        <div className="relative border-l-2 border-slate-100 ml-3 pl-8 space-y-6">
                                            {history.map(item => (
                                                <div key={item.id} className="relative">
                                                    <div className={`absolute -left-[41px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${item.type === 'Call' ? 'bg-blue-500 text-white' : 'bg-indigo-500 text-white'
                                                        }`}>
                                                        {item.type === 'Call' ? <Phone size={12} strokeWidth={3} /> : <History size={12} strokeWidth={3} />}
                                                    </div>
                                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg group hover:bg-white hover:shadow-md transition-all">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="font-black text-slate-900 text-xs uppercase tracking-tight">{item.regarding}</div>
                                                            <span className="text-[9px] font-black uppercase bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{new Date(item.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="text-xs font-bold text-slate-500 uppercase leading-snug">{item.details || "System automated record entry."}</div>
                                                        <div className="mt-3 flex items-center justify-between">
                                                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.result || 'Logged'}</div>
                                                            <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreVertical size={14} className="text-slate-300" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-16 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">Timeline Empty</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Notes' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Detailed Observations</h4>
                                        <button
                                            onClick={() => {
                                                setModalType('Note');
                                                setIsModalOpen(true);
                                            }}
                                            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm"
                                        >
                                            + Log New Note
                                        </button>
                                    </div>
                                    {history.filter(h => h.type === 'Note').length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {history.filter(h => h.type === 'Note').map(item => (
                                                <div key={item.id} className="p-5 rounded-xl border-l-4 border-l-indigo-500 bg-white shadow-sm border border-slate-200">
                                                    <div className="text-xs font-bold text-slate-600 whitespace-pre-wrap uppercase leading-loose">{item.details}</div>
                                                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                                                        <div className="text-[10px] font-black text-slate-300 uppercase">{new Date(item.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</div>
                                                        <button
                                                            onClick={() => handleEditNote(item)}
                                                            className="text-[10px] font-black text-indigo-400 uppercase hover:text-indigo-600"
                                                        >
                                                            Edit Note
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-16 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">No Recorded Observations</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Activities' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                            Pending Engagements
                                            {activityTypeFilter && (
                                                <span className="ml-2 text-indigo-600">
                                                    • Filtered by {activityTypeFilter}
                                                </span>
                                            )}
                                        </h4>
                                        {activityTypeFilter && (
                                            <button
                                                onClick={() => setActivityTypeFilter(null)}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                                            >
                                                Clear Filter
                                            </button>
                                        )}
                                    </div>
                                    {(() => {
                                        console.log('Rendering Activities tab');
                                        console.log('Total activities:', activities.length);
                                        console.log('Current filter:', activityTypeFilter);

                                        const filteredActivities = activityTypeFilter
                                            ? activities.filter(act => {
                                                // Use 'type' instead of 'activityType' to match backend
                                                const actType = (act as any).type || (act as any).activityType;
                                                console.log('Checking activity:', act.subject, 'Type:', actType);
                                                // Map "Call Attempt" and "Call Reached" to "Call"
                                                if (activityTypeFilter === 'Call Attempt' || activityTypeFilter === 'Call Reached') {
                                                    const matches = actType === 'Call';
                                                    console.log('Filtering for Call, matches:', matches);
                                                    return matches;
                                                }
                                                const matches = actType === activityTypeFilter;
                                                console.log('Filtering for', activityTypeFilter, ', matches:', matches);
                                                return matches;
                                            })
                                            : activities;

                                        console.log('Filtered activities count:', filteredActivities.length);

                                        return filteredActivities.length > 0 ? filteredActivities.map(act => (
                                            <div key={act.id} className="flex gap-4 p-4 rounded-lg border border-slate-100 bg-white hover:shadow-md transition-all cursor-pointer group">
                                                <div className="p-2 h-fit bg-slate-50 rounded group-hover:bg-indigo-50 transition-all border border-slate-100">
                                                    {((act as any).type || (act as any).activityType) === 'Call' ? <Phone className="text-blue-500" size={16} /> : <Users className="text-indigo-500" size={16} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-black text-slate-900 text-xs uppercase tracking-tight">{act.subject}</div>
                                                    <div className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                                                        {new Date(act.startTime).toLocaleString()} • {act.priority} Prio
                                                    </div>
                                                </div>
                                                <button className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${act.isCompleted ? 'text-emerald-500 border-emerald-100 bg-emerald-50' : 'text-indigo-500 border-indigo-100 bg-indigo-50'}`}>
                                                    {act.isCompleted ? 'Verified' : 'Active'}
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="py-16 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">
                                                {activityTypeFilter ? `No ${activityTypeFilter} activities found` : 'Schedule Cleared'}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {activeTab === 'Documents' && (
                                <DocumentsTab entityType="Contact" entityId={contactId} />
                            )}

                            {activeTab === 'Groups' && (
                                <GroupsTab
                                    contactId={contactId}
                                    groups={groups}
                                    onAddToGroup={handleAddToGroup}
                                    onRemoveFromGroup={handleRemoveFromGroup}
                                    onCreateGroup={handleCreateGroup}
                                />
                            )}

                            {activeTab === 'Companies' && (
                                <CompaniesTab
                                    contactId={contactId}
                                    companies={companies}
                                    onLinkCompany={handleLinkCompany}
                                    onUnlinkCompany={handleUnlinkCompany}
                                    onSetPrimary={handleSetPrimaryCompany}
                                />
                            )}

                            {activeTab === 'Personal' && (
                                <PersonalInfoTab
                                    contactId={contactId}
                                    personalInfo={personalInfo}
                                    onUpdate={handleUpdatePersonalInfo}
                                />
                            )}

                            {activeTab === 'WebInfo' && (
                                <WebInfoTab
                                    contactId={contactId}
                                    webInfo={webInfo}
                                    onUpdate={handleUpdateWebInfo}
                                />
                            )}

                            {activeTab === 'CustomFields' && (
                                <UserFieldsTab
                                    entityId={contactId}
                                    entityType="Contact"
                                    customValues={contact.customValues || []}
                                    onUpdate={handleUpdateCustomFields}
                                />
                            )}


                            {activeTab === 'Opportunities' && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Sales Pipeline Objects</h4>
                                    {opportunities.length > 0 ? opportunities.map(op => (
                                        <div key={op.id} className="flex items-center justify-between p-5 rounded-lg border border-slate-100 bg-white hover:shadow-lg transition-all">
                                            <div>
                                                <div className="font-black text-slate-900 text-xs uppercase tracking-tight">{op.name}</div>
                                                <div className="text-[10px] font-black text-indigo-400 mt-1 uppercase tracking-[0.1em]">{op.stage} PHASE</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-emerald-600 text-sm tracking-tight">${op.amount.toLocaleString()}</div>
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Goal: {new Date(op.expectedCloseDate).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-16 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">No Active Deals</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Emails' && (
                                <EmailHistoryTab contactId={contactId} />
                            )}

                            {activeTab === 'EmailAddresses' && contact && (
                                <ContactEmailsTab
                                    contactId={contactId}
                                    emails={contact.contactEmails || []}
                                    onUpdate={async () => {
                                        const res = await api.get(`/contacts/${contactId}`);
                                        setContact(res.data);
                                    }}
                                />
                            )}

                            {activeTab === 'Addresses' && contact && (
                                <ContactAddressesTab
                                    contactId={contactId}
                                    addresses={contact.contactAddresses || []}
                                    onUpdate={async () => {
                                        const res = await api.get(`/contacts/${contactId}`);
                                        setContact(res.data);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div >

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    api.get(`/activities/contact/${contactId}`).then(res => setActivities(res.data));
                    api.get(`/history/contact/${contactId}`).then(res => setHistory(res.data));
                }}
                initialType={modalType}
                initialContactId={contactId}
            />

            {/* Edit Contact Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Edit Contact</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.firstName || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.lastName || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editFormData.email || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={editFormData.phone || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.jobTitle || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, jobTitle: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* NEW Act! CRM Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            Salutation
                                        </label>
                                        <select
                                            value={editFormData.salutation || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, salutation: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select...</option>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Dr.">Dr.</option>
                                            <option value="Prof.">Prof.</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.department || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            Office Phone
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="tel"
                                                value={editFormData.phone || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                value={editFormData.phoneExtension || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, phoneExtension: e.target.value })}
                                                placeholder="Ext"
                                                className="w-20 px-2 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            Mobile Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={editFormData.mobilePhone || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, mobilePhone: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            Fax
                                        </label>
                                        <input
                                            type="tel"
                                            value={editFormData.fax || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, fax: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={editFormData.status || 'Active'}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Prospect">Prospect</option>
                                            <option value="Customer">Customer</option>
                                            <option value="Vendor">Vendor</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.address1 || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, address1: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                                        placeholder="Address Line 1"
                                    />
                                    <input
                                        type="text"
                                        value={editFormData.address2 || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, address2: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Address Line 2"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.city || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.state || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                            ZIP
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.zip || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, zip: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Note Modal */}
            {
                isEditNoteModalOpen && selectedNote && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Edit Note</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Subject / Regarding
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedNote.regarding || ''}
                                        onChange={(e) => setSelectedNote({ ...selectedNote, regarding: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Note Details
                                    </label>
                                    <textarea
                                        value={selectedNote.details || ''}
                                        onChange={(e) => setSelectedNote({ ...selectedNote, details: e.target.value })}
                                        rows={8}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsEditNoteModalOpen(false);
                                        setSelectedNote(null);
                                    }}
                                    className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-indigo-700 transition-all shadow-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <EmailComposer
                isOpen={isEmailComposerOpen}
                onClose={() => setIsEmailComposerOpen(false)}
                defaultTo={contact?.email || ''}
                defaultContactId={contactId}
                defaultContactName={contact ? `${contact.firstName} ${contact.lastName}` : ''}
                onSent={() => {
                    // Optionally refresh history after email is sent
                    api.get(`/history/contact/${contactId}`).then(res => setHistory(res.data));
                }}
            />
        </div>
    );
};

const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 group">
        <div className="text-slate-300 group-hover:text-indigo-600 transition-colors">{icon}</div>
        <div className="flex-1 min-w-0">
            <div className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em]">{label}</div>
            <div className="text-xs font-bold text-slate-700 truncate uppercase mt-0.5">{value || 'Not Registered'}</div>
        </div>
    </div>
);

const TabItem = ({ id, label, icon, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
        {icon}
        {label || id}
        {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
    </button>
);



export default ContactDetailView;
