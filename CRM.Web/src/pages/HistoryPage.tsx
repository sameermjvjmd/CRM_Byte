import { useState, useEffect } from 'react';
import api from '../api/api';
import type { HistoryItem } from '../types/history';
import { Phone, Users, FileText, Mail, Calendar } from 'lucide-react';

const HistoryPage = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/history');
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Call': return <Phone size={16} className="text-blue-500" />;
            case 'Meeting': return <Users size={16} className="text-purple-500" />;
            case 'EmailSent': return <Mail size={16} className="text-emerald-500" />;
            default: return <FileText size={16} className="text-slate-400" />;
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">History List</h1>
                <p className="text-slate-500 text-sm">A chronological record of all interactions.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12"></th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Regarding</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        {getIcon(item.type)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900">{item.regarding}</div>
                                    <div className="text-xs text-slate-500 truncate max-w-xs">{item.details}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                        {item.result}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {item.contact ? `${item.contact.firstName} ${item.contact.lastName}` : '--'}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        {new Date(item.date).toLocaleString()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="p-8 text-center text-slate-400">Loading...</div>}
                {!loading && history.length === 0 && <div className="p-8 text-center text-slate-400">No history found.</div>}
            </div>
        </div>
    );
};

export default HistoryPage;
