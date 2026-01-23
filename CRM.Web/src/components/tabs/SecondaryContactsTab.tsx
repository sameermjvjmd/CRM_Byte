import { useState } from 'react';
import { User, Plus, Trash2, Edit2, Phone, Mail, Building, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SecondaryContact {
    id: number;
    firstName: string;
    lastName: string;
    title?: string;
    department?: string;
    role: string;
    phone?: string;
    mobile?: string;
    email?: string;
    notes?: string;
}

interface SecondaryContactsTabProps {
    contacts: SecondaryContact[];
    onAdd: (contact: Omit<SecondaryContact, 'id'>) => Promise<void>;
    onEdit: (id: number, contact: Omit<SecondaryContact, 'id'>) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const SecondaryContactsTab = ({ contacts, onAdd, onEdit, onDelete }: SecondaryContactsTabProps) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<SecondaryContact, 'id'>>({
        firstName: '',
        lastName: '',
        title: '',
        department: '',
        role: 'Alternate',
        phone: '',
        mobile: '',
        email: '',
        notes: ''
    });

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            title: '',
            department: '',
            role: 'Alternate',
            phone: '',
            mobile: '',
            email: '',
            notes: ''
        });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleEditStart = (contact: SecondaryContact) => {
        setFormData({
            firstName: contact.firstName,
            lastName: contact.lastName,
            title: contact.title || '',
            department: contact.department || '',
            role: contact.role,
            phone: contact.phone || '',
            mobile: contact.mobile || '',
            email: contact.email || '',
            notes: contact.notes || ''
        });
        setEditingId(contact.id);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await onEdit(editingId, formData);
                toast.success('Secondary contact updated');
            } else {
                await onAdd(formData);
                toast.success('Secondary contact added');
            }
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save contact');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Secondary Contacts</h3>
                    <p className="text-sm font-bold text-slate-500">
                        {contacts.length} alternate contact{contacts.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Plus size={16} />
                    Add New
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6 animate-in slide-in-from-top-4">
                    <h4 className="text-sm font-black text-slate-900 mb-4 uppercase">
                        {editingId ? 'Edit Contact' : 'New Secondary Contact'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">First Name *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Last Name *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Alternate">Alternate</option>
                                    <option value="Assistant">Assistant</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Colleague">Colleague</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Partner">Partner</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Child">Child</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200"
                            >
                                {editingId ? 'Update Contact' : 'Add Contact'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((contact) => (
                    <div key={contact.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-lg">
                                    {contact.firstName[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{contact.firstName} {contact.lastName}</h4>
                                    <p className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                        {contact.role}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEditStart(contact)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this secondary contact?')) {
                                            onDelete(contact.id);
                                        }
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            {contact.title && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Briefcase size={14} className="text-slate-400" />
                                    <span className="font-semibold">{contact.title}</span>
                                    {contact.department && <span className="text-slate-400">({contact.department})</span>}
                                </div>
                            )}
                            {contact.email && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Mail size={14} className="text-slate-400" />
                                    <a href={`mailto:${contact.email}`} className="hover:text-indigo-600 font-semibold">{contact.email}</a>
                                </div>
                            )}
                            {contact.phone && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Phone size={14} className="text-slate-400" />
                                    <a href={`tel:${contact.phone}`} className="hover:text-indigo-600 font-semibold">{contact.phone}</a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {contacts.length === 0 && !isFormOpen && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <User size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 font-bold">No secondary contacts found</p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="mt-4 text-indigo-600 font-bold hover:underline"
                        >
                            Add a secondary contact
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecondaryContactsTab;
export type { SecondaryContact };
