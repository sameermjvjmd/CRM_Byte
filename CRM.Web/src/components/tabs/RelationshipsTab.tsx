import { useState } from 'react';
import { User, Plus, Trash2, Edit2, Link as LinkIcon, Search, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';

interface ContactRelationship {
    id: number;
    contactId: number;
    relatedContactId: number;
    relationshipType: string;
    notes?: string;
    isPrimary: boolean;
    relatedContact?: {
        id: number;
        firstName: string;
        lastName: string;
        jobTitle?: string;
        companyName?: string; // Flattened or joined
    };
}

interface RelationshipsTabProps {
    relationships: ContactRelationship[];
    onAdd: (relationship: Omit<ContactRelationship, 'id' | 'relatedContact'>) => Promise<void>;
    onEdit: (id: number, relationship: Partial<ContactRelationship>) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const RelationshipsTab = ({ relationships, onAdd, onEdit, onDelete }: RelationshipsTabProps) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        relatedContactId: 0,
        relationshipType: 'Spouse',
        notes: '',
        isPrimary: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedContactName, setSelectedContactName] = useState('');

    const resetForm = () => {
        setFormData({
            relatedContactId: 0,
            relationshipType: 'Spouse',
            notes: '',
            isPrimary: false
        });
        setSearchTerm('');
        setSearchResults([]);
        setSelectedContactName('');
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleEditStart = (rel: ContactRelationship) => {
        setFormData({
            relatedContactId: rel.relatedContactId,
            relationshipType: rel.relationshipType,
            notes: rel.notes || '',
            isPrimary: rel.isPrimary
        });
        // We might not have the name if it wasn't loaded, but usually relatedContact is populated
        setSelectedContactName(rel.relatedContact ? `${rel.relatedContact.firstName} ${rel.relatedContact.lastName}` : 'Unknown Contact');
        setEditingId(rel.id);
        setIsFormOpen(true);
    };

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length > 2) {
            try {
                const res = await api.get(`/contacts?search=${term}`);
                setSearchResults(res.data);
            } catch (error) {
                console.error("Search failed", error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.relatedContactId === 0) {
            toast.error('Please select a contact');
            return;
        }

        try {
            if (editingId) {
                await onEdit(editingId, {
                    relationshipType: formData.relationshipType,
                    notes: formData.notes,
                    isPrimary: formData.isPrimary
                }); // Usually can't change the RelatedContactId on edit easily without validation
                toast.success('Relationship updated');
            } else {
                // @ts-ignore
                await onAdd(formData);
                toast.success('Relationship added');
            }
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save relationship');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Relationships</h3>
                    <p className="text-sm font-bold text-slate-500">
                        {relationships.length} linked contact{relationships.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Plus size={16} />
                    Link Contact
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6 animate-in slide-in-from-top-4">
                    <h4 className="text-sm font-black text-slate-900 mb-4 uppercase">
                        {editingId ? 'Edit Relationship' : 'New Relationship'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!editingId && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Related Contact *</label>
                                <div className="relative mt-1">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm || selectedContactName}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Search contacts..."
                                        className="w-full pl-10 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {searchResults.map(c => (
                                                <div
                                                    key={c.id}
                                                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-700 flex justify-between items-center"
                                                    onClick={() => {
                                                        setFormData({ ...formData, relatedContactId: c.id });
                                                        setSelectedContactName(`${c.firstName} ${c.lastName}`);
                                                        setSearchTerm(''); // Clear search term to show selected name
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
                                {formData.relatedContactId !== 0 && (
                                    <div className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1">
                                        <Check size={12} /> Selected: {selectedContactName}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Relationship Type</label>
                                <select
                                    value={formData.relationshipType}
                                    onChange={e => setFormData({ ...formData, relationshipType: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Spouse">Spouse</option>
                                    <option value="Partner">Partner</option>
                                    <option value="Colleague">Colleague</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Child">Child</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPrimary}
                                        onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Primary Relationship</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20"
                                placeholder="Optional notes about this relationship..."
                            />
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
                                {editingId ? 'Update Relationship' : 'Link Contact'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {relationships.map((rel) => (
                    <div key={rel.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group">
                        <div className="w-10 h-10 rounded-full bg-indigo-100/50 flex items-center justify-center text-indigo-600">
                            <LinkIcon size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                {rel.relatedContact ? (
                                    <>
                                        {rel.relatedContact.firstName} {rel.relatedContact.lastName}
                                        {rel.isPrimary && (
                                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold uppercase">Primary</span>
                                        )}
                                    </>
                                ) : 'Unknown Contact'}
                            </h4>
                            <p className="text-sm text-slate-500 font-medium">
                                is {rel.relationshipType}
                                {rel.notes && <span className="text-slate-400 mx-2">• {rel.notes}</span>}
                            </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEditStart(rel)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to remove this relationship?')) {
                                        onDelete(rel.id);
                                    }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {relationships.length === 0 && !isFormOpen && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                        <LinkIcon size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-500">No relationships defined</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">Link this contact to others (e.g. Spouse, Manager)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RelationshipsTab;
export type { ContactRelationship };
