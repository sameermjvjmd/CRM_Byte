import { useEffect, useState } from 'react';
import { Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

interface Contact {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    company?: string;
    updatedAt?: string;
}

const RecentContactsWidget = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecentContacts();
    }, []);

    const fetchRecentContacts = async () => {
        try {
            const response = await api.get('/contacts');
            // Get the 5 most recently updated contacts
            const sorted = response.data.sort((a: Contact, b: Contact) => {
                const dateA = new Date(a.updatedAt || 0).getTime();
                const dateB = new Date(b.updatedAt || 0).getTime();
                return dateB - dateA;
            }).slice(0, 5);
            setContacts(sorted);
        } catch (error) {
            console.error('Error fetching recent contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-slate-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Contacts</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Recently updated contacts</p>
                    </div>
                    <Users className="text-green-500" size={20} />
                </div>
            </div>

            <div className="p-6">
                <div className="space-y-2">
                    {contacts.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Users className="mx-auto mb-2 opacity-20" size={40} />
                            <p className="text-sm font-semibold">No recent contacts</p>
                        </div>
                    ) : (
                        contacts.map((contact) => (
                            <button
                                key={contact.id}
                                onClick={() => navigate(`/contacts/${contact.id}`)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {contact.firstName?.[0]}{contact.lastName?.[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                {contact.firstName} {contact.lastName}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {contact.email || contact.company || 'No details'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                            </button>
                        ))
                    )}
                </div>

                <button
                    onClick={() => navigate('/contacts')}
                    className="mt-4 w-full py-2 px-4 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                    View All Contacts
                </button>
            </div>
        </div>
    );
};

export default RecentContactsWidget;
