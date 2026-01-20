import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

interface User {
    id: number;
    firstName: string;
    lastName: string;
}

interface SalesQuota {
    id?: number;
    userId: number;
    amount: number;
    fiscalYear: number;
    periodType: 'Monthly' | 'Quarterly' | 'Yearly';
    periodNumber: number;
}

interface QuotaSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
}

const QuotaSettingsModal: React.FC<QuotaSettingsModalProps> = ({ isOpen, onClose, onSave }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [quotas, setQuotas] = useState<SalesQuota[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedUserId) {
            fetchQuotas();
        }
    }, [selectedUserId, year]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            if (response.data.length > 0 && !selectedUserId) {
                setSelectedUserId(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        }
    };

    const fetchQuotas = async () => {
        if (!selectedUserId) return;
        setLoading(true);
        try {
            const response = await api.get(`/sales-quotas?userId=${selectedUserId}&year=${year}`);
            const existingQuotas: SalesQuota[] = response.data;

            // Initialize empty quotas for 12 months if they don't exist
            const initializedQuotas: SalesQuota[] = [];
            for (let month = 1; month <= 12; month++) {
                const existing = existingQuotas.find(q => q.periodNumber === month && q.periodType === 'Monthly');
                initializedQuotas.push(existing || {
                    userId: selectedUserId,
                    amount: 0,
                    fiscalYear: year,
                    periodType: 'Monthly',
                    periodNumber: month
                });
            }
            setQuotas(initializedQuotas);
        } catch (error) {
            console.error('Error fetching quotas:', error);
            toast.error('Failed to load quotas');
        } finally {
            setLoading(false);
        }
    };

    const handleQuotaChange = (monthIndex: number, amount: string) => {
        const newQuotas = [...quotas];
        newQuotas[monthIndex].amount = parseFloat(amount) || 0;
        setQuotas(newQuotas);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/sales-quotas/bulk', quotas);
            toast.success('Quotas saved successfully');
            if (onSave) onSave();
            onClose();
        } catch (error) {
            console.error('Error saving quotas:', error);
            toast.error('Failed to save quotas');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Manage Sales Quotas</h2>
                        <p className="text-sm text-slate-500">Set monthly sales targets for your team</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Controls */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select User</label>
                            <select
                                value={selectedUserId || ''}
                                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fiscal Year</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Matrix */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {quotas.map((quota, index) => (
                                <div key={index} className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600 block">{monthNames[index]}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={quota.amount}
                                            onChange={(e) => handleQuotaChange(index, e.target.value)}
                                            className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 flex items-center gap-2 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
                        <AlertCircle size={16} />
                        <p>Total Annual Quota: <strong>${quotas.reduce((sum, q) => sum + q.amount, 0).toLocaleString()}</strong></p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save size={18} /> Save Quotas
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuotaSettingsModal;
