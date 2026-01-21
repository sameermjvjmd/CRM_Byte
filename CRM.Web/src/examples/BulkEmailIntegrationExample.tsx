// Example: How to add Bulk Email to your Contacts page

import React, { useState } from 'react';
import { Mail, Users } from 'lucide-react';
import BulkEmailComposer from '../components/email/BulkEmailComposer';

// Add this to your Contacts page component

const ContactsPage = () => {
    // State for selected contacts
    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
    const [showBulkEmail, setShowBulkEmail] = useState(false);

    // Toggle contact selection
    const toggleContactSelection = (contact: any) => {
        setSelectedContacts(prev => {
            const exists = prev.find(c => c.id === contact.id);
            if (exists) {
                return prev.filter(c => c.id !== contact.id);
            } else {
                return [...prev, contact];
            }
        });
    };

    // Select all contacts
    const selectAllContacts = (contacts: any[]) => {
        setSelectedContacts(contacts);
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedContacts([]);
    };

    return (
        <div>
            {/* Action Bar - Add this above your contacts table */}
            {selectedContacts.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                            {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowBulkEmail(true)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 transition-all shadow-sm"
                        >
                            <Mail className="w-4 h-4" />
                            Send Bulk Email
                        </button>
                        <button
                            onClick={clearSelection}
                            className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {/* Contacts Table - Add checkboxes to each row */}
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="p-3">
                            <input
                                type="checkbox"
                                checked={selectedContacts.length === contacts.length && contacts.length > 0}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        selectAllContacts(contacts);
                                    } else {
                                        clearSelection();
                                    }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Company</th>
                        {/* ... other columns */}
                    </tr>
                </thead>
                <tbody>
                    {contacts.map(contact => (
                        <tr key={contact.id}>
                            <td className="p-3">
                                <input
                                    type="checkbox"
                                    checked={selectedContacts.some(c => c.id === contact.id)}
                                    onChange={() => toggleContactSelection(contact)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </td>
                            <td>{contact.firstName} {contact.lastName}</td>
                            <td>{contact.email}</td>
                            <td>{contact.companyName}</td>
                            {/* ... other cells */}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Bulk Email Modal */}
            <BulkEmailComposer
                isOpen={showBulkEmail}
                onClose={() => setShowBulkEmail(false)}
                selectedContacts={selectedContacts}
                onSent={() => {
                    // Clear selection after sending
                    setSelectedContacts([]);
                    // Optionally refresh email history or show success message
                    toast.success('Bulk emails sent successfully!');
                }}
            />
        </div>
    );
};

export default ContactsPage;


// ============================================
// Alternative: Quick Action Button on Each Row
// ============================================

// Add this to individual contact rows for quick bulk email
const ContactRow = ({ contact }) => {
    const [showBulkEmail, setShowBulkEmail] = useState(false);

    return (
        <>
            <tr>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td>
                    <button
                        onClick={() => setShowBulkEmail(true)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Send email"
                    >
                        <Mail className="w-4 h-4" />
                    </button>
                </td>
            </tr>

            <BulkEmailComposer
                isOpen={showBulkEmail}
                onClose={() => setShowBulkEmail(false)}
                selectedContacts={[contact]} // Single contact
                onSent={() => setShowBulkEmail(false)}
            />
        </>
    );
};


// ============================================
// Integration with Contact Groups
// ============================================

const ContactGroupPage = ({ groupId }) => {
    const [groupContacts, setGroupContacts] = useState([]);
    const [showBulkEmail, setShowBulkEmail] = useState(false);

    useEffect(() => {
        // Fetch all contacts in this group
        fetchGroupContacts(groupId);
    }, [groupId]);

    return (
        <div>
            <button
                onClick={() => setShowBulkEmail(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
                Email All Group Members ({groupContacts.length})
            </button>

            <BulkEmailComposer
                isOpen={showBulkEmail}
                onClose={() => setShowBulkEmail(false)}
                selectedContacts={groupContacts}
                onSent={() => setShowBulkEmail(false)}
            />
        </div>
    );
};


// ============================================
// Integration with Filtered Lists
// ============================================

const FilteredContactsList = () => {
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [showBulkEmail, setShowBulkEmail] = useState(false);

    const applyFilters = (filters) => {
        // Apply your filters
        const filtered = contacts.filter(c => {
            // Your filter logic
            return true;
        });
        setFilteredContacts(filtered);
    };

    return (
        <div>
            {/* Filters UI */}
            <div className="mb-4">
                {/* Filter inputs */}
            </div>

            {/* Send to filtered results */}
            {filteredContacts.length > 0 && (
                <button
                    onClick={() => setShowBulkEmail(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Email Filtered Contacts ({filteredContacts.length})
                </button>
            )}

            <BulkEmailComposer
                isOpen={showBulkEmail}
                onClose={() => setShowBulkEmail(false)}
                selectedContacts={filteredContacts}
                onSent={() => setShowBulkEmail(false)}
            />
        </div>
    );
};
