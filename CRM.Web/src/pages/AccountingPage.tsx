import { DollarSign, FileText, TrendingUp, Calendar, Download } from 'lucide-react';

const AccountingPage = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Accounting & Finance</h1>
                <p className="text-sm text-slate-500 font-bold mt-1">Financial overview and management</p>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <DollarSign size={20} className="text-emerald-600" />
                        </div>
                        <TrendingUp size={16} className="text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">$847,523</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Revenue</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText size={20} className="text-blue-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">128</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Invoices Sent</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Calendar size={20} className="text-orange-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">$45,200</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Payments</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <TrendingUp size={20} className="text-purple-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">+18.5%</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Growth Rate</div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice #</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { invoice: 'INV-2024-001', client: 'ByteSymphony Inc.', amount: '$12,500', status: 'Paid', date: '2024-01-10' },
                                { invoice: 'INV-2024-002', client: 'TechCorp Solutions', amount: '$8,750', status: 'Pending', date: '2024-01-09' },
                                { invoice: 'INV-2024-003', client: 'Digital Dynamics', amount: '$15,200', status: 'Overdue', date: '2024-01-05' },
                            ].map((transaction, idx) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{transaction.invoice}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{transaction.client}</td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-900">{transaction.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${transaction.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' :
                                                transaction.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-red-100 text-red-600'
                                            }`}>
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{transaction.date}</td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                                            <Download size={16} className="text-slate-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-6">
                <button className="p-6 bg-white border border-slate-200 rounded-xl text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                    <FileText size={24} className="text-slate-400 group-hover:text-indigo-600 mb-3" />
                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight">Create Invoice</div>
                    <div className="text-xs text-slate-500 mt-1">Generate a new invoice</div>
                </button>
                <button className="p-6 bg-white border border-slate-200 rounded-xl text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                    <Download size={24} className="text-slate-400 group-hover:text-indigo-600 mb-3" />
                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight">Export Report</div>
                    <div className="text-xs text-slate-500 mt-1">Download financial reports</div>
                </button>
                <button className="p-6 bg-white border border-slate-200 rounded-xl text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                    <TrendingUp size={24} className="text-slate-400 group-hover:text-indigo-600 mb-3" />
                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight">View Analytics</div>
                    <div className="text-xs text-slate-500 mt-1">Financial trends and insights</div>
                </button>
            </div>
        </div>
    );
};

export default AccountingPage;
