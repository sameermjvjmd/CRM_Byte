import { useState } from 'react';
import {
    MapPin, Plus, Trash2, Edit2, Star, Check, X,
    AlertCircle, Loader2, Globe
} from 'lucide-react';
import api from '../../api/api';
import type { ContactAddress } from '../../types/contact';
import { ADDRESS_TYPES } from '../../types/contact';

interface ContactAddressesTabProps {
    contactId: number;
    addresses: ContactAddress[];
    onUpdate: () => void;
}

const ContactAddressesTab = ({ contactId, addresses, onUpdate }: ContactAddressesTabProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const emptyAddress = {
        addressType: 'Business',
        label: '',
        address1: '',
        address2: '',
        address3: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        county: '',
        isPrimary: false
    };

    const [newAddress, setNewAddress] = useState({ ...emptyAddress });
    const [editAddress, setEditAddress] = useState({ ...emptyAddress });

    const handleAdd = async () => {
        if (!newAddress.address1 && !newAddress.city) {
            setError('At least address line 1 or city is required');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await api.post(`/contacts/${contactId}/addresses`, newAddress);
            setNewAddress({ ...emptyAddress });
            setIsAdding(false);
            onUpdate();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add address');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (address: ContactAddress) => {
        setEditingId(address.id);
        setEditAddress({
            addressType: address.addressType,
            label: address.label || '',
            address1: address.address1 || '',
            address2: address.address2 || '',
            address3: address.address3 || '',
            city: address.city || '',
            state: address.state || '',
            postalCode: address.postalCode || '',
            country: address.country || '',
            county: address.county || '',
            isPrimary: address.isPrimary
        });
    };

    const handleUpdate = async () => {
        setSaving(true);
        setError(null);

        try {
            await api.put(`/contacts/${contactId}/addresses/${editingId}`, editAddress);
            setEditingId(null);
            onUpdate();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update address');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (addressId: number) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            await api.delete(`/contacts/${contactId}/addresses/${addressId}`);
            onUpdate();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete address');
        }
    };

    const handleSetPrimary = async (addressId: number) => {
        try {
            await api.post(`/contacts/${contactId}/addresses/${addressId}/set-primary`);
            onUpdate();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to set primary');
        }
    };

    const openGoogleMaps = (address: ContactAddress) => {
        const query = encodeURIComponent(address.singleLineAddress || address.formattedAddress || '');
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    const AddressForm = ({
        data,
        onChange,
        onSave,
        onCancel,
        showPrimary = true
    }: {
        data: typeof newAddress;
        onChange: (data: typeof newAddress) => void;
        onSave: () => void;
        onCancel: () => void;
        showPrimary?: boolean;
    }) => (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <select
                    value={data.addressType}
                    onChange={e => onChange({ ...data, addressType: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                >
                    {ADDRESS_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Label (e.g., Main Office)"
                    value={data.label}
                    onChange={e => onChange({ ...data, label: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none md:col-span-2"
                />
            </div>
            <div className="grid grid-cols-1 gap-3 mb-3">
                <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={data.address1}
                    onChange={e => onChange({ ...data, address1: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                />
                <input
                    type="text"
                    placeholder="Address Line 2 (apt, suite, etc.)"
                    value={data.address2}
                    onChange={e => onChange({ ...data, address2: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <input
                    type="text"
                    placeholder="City *"
                    value={data.city}
                    onChange={e => onChange({ ...data, city: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                />
                <input
                    type="text"
                    placeholder="State/Province"
                    value={data.state}
                    onChange={e => onChange({ ...data, state: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                />
                <input
                    type="text"
                    placeholder="ZIP/Postal Code"
                    value={data.postalCode}
                    onChange={e => onChange({ ...data, postalCode: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                />
                <input
                    type="text"
                    placeholder="Country"
                    value={data.country}
                    onChange={e => onChange({ ...data, country: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                />
            </div>
            {showPrimary && (
                <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={data.isPrimary}
                            onChange={e => onChange({ ...data, isPrimary: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600"
                        />
                        Set as primary address
                    </label>
                </div>
            )}
            <div className="flex gap-2">
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Addresses
                </h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Address
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Add new address form */}
            {isAdding && (
                <div className="mb-4">
                    <AddressForm
                        data={newAddress}
                        onChange={setNewAddress}
                        onSave={handleAdd}
                        onCancel={() => setIsAdding(false)}
                    />
                </div>
            )}

            {/* Address list */}
            {addresses.length === 0 && !isAdding ? (
                <div className="text-center py-8 text-slate-400">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No addresses added yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {addresses.map(address => (
                        <div
                            key={address.id}
                            className={`p-4 border rounded-xl transition-all ${address.isPrimary
                                    ? 'bg-indigo-50 border-indigo-200'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {editingId === address.id ? (
                                <AddressForm
                                    data={editAddress}
                                    onChange={setEditAddress}
                                    onSave={handleUpdate}
                                    onCancel={() => setEditingId(null)}
                                    showPrimary={!address.isPrimary}
                                />
                            ) : (
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <MapPin className={`w-5 h-5 mt-1 ${address.isPrimary ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 text-xs font-bold text-slate-600 bg-slate-100 rounded">
                                                    {address.addressType}
                                                </span>
                                                {address.isPrimary && (
                                                    <span className="px-2 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-100 rounded-full">
                                                        PRIMARY
                                                    </span>
                                                )}
                                                {address.label && (
                                                    <span className="text-xs text-slate-500">{address.label}</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-slate-700 space-y-0.5">
                                                {address.address1 && <div>{address.address1}</div>}
                                                {address.address2 && <div>{address.address2}</div>}
                                                <div className="text-slate-600">
                                                    {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
                                                </div>
                                                {address.country && <div className="text-slate-500">{address.country}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openGoogleMaps(address)}
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="View on Google Maps"
                                        >
                                            <Globe className="w-4 h-4" />
                                        </button>
                                        {!address.isPrimary && (
                                            <button
                                                onClick={() => handleSetPrimary(address.id)}
                                                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Set as primary"
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContactAddressesTab;
