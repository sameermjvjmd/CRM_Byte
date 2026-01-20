import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ComposedChart, Line
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, Target, Loader2, Settings } from 'lucide-react';
import api from '../api/api';
import QuotaSettingsModal from '../components/analytics/QuotaSettingsModal';

interface MonthlyForecastItem {
    month: number;
    monthName: string;
    quota: number;
    closedWon: number;
    pipelineWeighted: number;
    pipelineTotal: number;
}

interface SalesForecastSummary {
    fiscalYear: number;
    totalQuota: number;
    totalClosedWon: number;
    totalPipelineWeighted: number;
    achievementPercent: number;
    monthlyData: MonthlyForecastItem[];
}

const SalesForecastPage = () => {
    const [summary, setSummary] = useState<SalesForecastSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchForecastData();
    }, [year]);

    const fetchForecastData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/forecast/${year}`);
            setSummary(response.data);
        } catch (error) {
            console.error('Error fetching forecast data:', error);
            setError('Failed to load forecast data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loading && !summary) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="font-medium">Loading forecast data...</span>
                </div>
            </div>
        );
    }

    if (error && !summary) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="text-red-500 mb-2">
                        <Settings className="w-12 h-12 mx-auto opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Something went wrong</h3>
                    <p className="text-slate-500 mb-4">{error}</p>
                    <button
                        onClick={fetchForecastData}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#f8fafc] min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Sales Forecast & Quotas</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Track performance against quotas and projected revenue
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-bold"
                    >
                        <option value={year - 1}>{year - 1}</option>
                        <option value={year}>{year}</option>
                        <option value={year + 1}>{year + 1}</option>
                    </select>

                    <button
                        onClick={() => setIsQuotaModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-bold text-sm transition-colors shadow-sm"
                    >
                        <Settings size={16} /> Manage Quotas
                    </button>

                    <button
                        onClick={fetchForecastData}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        <TrendingUp size={20} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-indigo-50">
                            <Target className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Quota (Goal)</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.totalQuota || 0)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-emerald-50">
                            <DollarSign className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Closed Won (Actual)</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.totalClosedWon || 0)}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm">
                        <span className={`font-bold ${summary && summary.achievementPercent >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {(summary?.achievementPercent || 0).toFixed(1)}%
                        </span>
                        <span className="text-slate-400 ml-1">of annual goal</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-purple-50">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pipeline (Weighted)</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.totalPipelineWeighted || 0)}</p>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                        Projected additional revenue
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-blue-50">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Forecast Total</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {formatCurrency((summary?.totalClosedWon || 0) + (summary?.totalPipelineWeighted || 0))}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                        Actual + Weighted Pipeline
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">
                        Performance vs Quota ({year})
                    </h2>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={summary?.monthlyData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="monthName" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value: any, name: any) => [formatCurrency(Number(value)), name]}
                                    labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                    contentStyle={{
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                <Bar
                                    dataKey="closedWon"
                                    name="Closed Won"
                                    stackId="a"
                                    fill="#10b981" // emerald-500
                                    radius={[0, 0, 0, 0]}
                                    maxBarSize={50}
                                />
                                <Bar
                                    dataKey="pipelineWeighted"
                                    name="Pipeline (Weighted)"
                                    stackId="a"
                                    fill="#a78bfa" // violet-400
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="quota"
                                    name="Quota Goal"
                                    stroke="#ec4899" // pink-500
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Monthly Details</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Quota</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Closed Won</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline (Weighted)</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline (Total)</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Achievement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {summary?.monthlyData.map((item, index) => {
                                const achievement = item.quota > 0 ? (item.closedWon / item.quota) * 100 : 0;
                                return (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.monthName}</td>
                                        <td className="px-6 py-4 text-sm text-right text-slate-600">{formatCurrency(item.quota)}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">{formatCurrency(item.closedWon)}</td>
                                        <td className="px-6 py-4 text-sm text-right text-purple-600">{formatCurrency(item.pipelineWeighted)}</td>
                                        <td className="px-6 py-4 text-sm text-right text-slate-400">{formatCurrency(item.pipelineTotal)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                                ${achievement >= 100 ? 'bg-emerald-100 text-emerald-700' :
                                                    achievement >= 70 ? 'bg-blue-100 text-blue-700' :
                                                        achievement >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                {achievement.toFixed(0)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {/* Totals Row */}
                            <tr className="bg-slate-50 font-bold">
                                <td className="px-6 py-4 text-sm text-slate-900">Total</td>
                                <td className="px-6 py-4 text-sm text-right text-slate-900">{formatCurrency(summary?.totalQuota || 0)}</td>
                                <td className="px-6 py-4 text-sm text-right text-emerald-600">{formatCurrency(summary?.totalClosedWon || 0)}</td>
                                <td className="px-6 py-4 text-sm text-right text-purple-600">{formatCurrency(summary?.totalPipelineWeighted || 0)}</td>
                                <td className="px-6 py-4 text-sm text-right text-slate-500">-</td>
                                <td className="px-6 py-4 text-right text-slate-900">{(summary?.achievementPercent || 0).toFixed(0)}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <QuotaSettingsModal
                isOpen={isQuotaModalOpen}
                onClose={() => setIsQuotaModalOpen(false)}
                onSave={fetchForecastData}
            />
        </div>
    );
};

export default SalesForecastPage;
