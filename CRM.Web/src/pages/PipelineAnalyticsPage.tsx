import { useState, useEffect, type ReactNode } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, DollarSign, Target, Award, Loader2 } from 'lucide-react';
import api from '../api/api';

interface PipelineStats {
    totalDeals: number;
    openDeals: number;
    closedWonDeals: number;
    closedLostDeals: number;
    totalValue: number;
    weightedValue: number;
    openValue: number;
    wonValue: number;
    lostValue: number;
    averageDealSize: number;
    winRate: number;
}

interface StageBreakdown {
    stage: string;
    count: number;
    value: number;
    weightedValue: number;
    averageProbability: number;
}

interface Forecast {
    month: string;
    monthName: string;
    dealCount: number;
    totalValue: number;
    weightedValue: number;
}

const STAGE_COLORS: Record<string, string> = {
    'Lead': '#94a3b8',
    'Qualified': '#3b82f6',
    'Proposal': '#8b5cf6',
    'Negotiation': '#f97316',
    'Closed Won': '#10b981',
    'Closed Lost': '#ef4444'
};

const PipelineAnalyticsPage = () => {
    const [stats, setStats] = useState<PipelineStats | null>(null);
    const [stageData, setStageData] = useState<StageBreakdown[]>([]);
    const [forecast, setForecast] = useState<Forecast[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [statsRes, stageRes, forecastRes] = await Promise.all([
                api.get('/pipelineanalytics/stats'),
                api.get('/pipelineanalytics/by-stage'),
                api.get('/pipelineanalytics/forecast')
            ]);
            setStats(statsRes.data);
            setStageData(stageRes.data);
            setForecast(forecastRes.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const pieData = stageData.filter(s => s.count > 0).map(s => ({
        name: s.stage,
        value: s.count,
        color: STAGE_COLORS[s.stage] || '#94a3b8'
    }));

    return (
        <div className="p-8 bg-slate-50/50 min-h-full">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pipeline Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">Insights into your sales performance</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<DollarSign className="text-emerald-500" />}
                        title="Total Pipeline"
                        value={formatCurrency(stats?.totalValue || 0)}
                        subtitle={`Weighted: ${formatCurrency(stats?.weightedValue || 0)}`}
                        color="emerald"
                    />
                    <StatCard
                        icon={<Target className="text-blue-500" />}
                        title="Open Deals"
                        value={stats?.openDeals.toString() || '0'}
                        subtitle={formatCurrency(stats?.openValue || 0)}
                        color="blue"
                    />
                    <StatCard
                        icon={<Award className="text-indigo-500" />}
                        title="Win Rate"
                        value={`${stats?.winRate || 0}%`}
                        subtitle={`${stats?.closedWonDeals || 0} won / ${stats?.closedLostDeals || 0} lost`}
                        color="indigo"
                    />
                    <StatCard
                        icon={<TrendingUp className="text-orange-500" />}
                        title="Avg Deal Size"
                        value={formatCurrency(stats?.averageDealSize || 0)}
                        subtitle={`${stats?.totalDeals || 0} total deals`}
                        color="orange"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Pipeline by Stage - Bar Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Pipeline by Stage (Value)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                                <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
                                <Tooltip
                                    formatter={(value: any) => formatCurrency(Number(value))}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                                    {stageData.map((entry, index) => (
                                        <Cell key={index} fill={STAGE_COLORS[entry.stage] || '#6366f1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Deal Distribution - Pie Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Deal Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Forecast Chart */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
                    <h3 className="font-bold text-slate-800 mb-4">Revenue Forecast (Next 6 Months)</h3>
                    {forecast.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={forecast}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
                                <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
                                <Tooltip
                                    formatter={(value: any) => formatCurrency(Number(value))}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="totalValue" name="Expected" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="weightedValue" name="Weighted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            No forecast data available
                        </div>
                    )}
                </div>

                {/* Stage Details Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">Stage Breakdown</h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Stage</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Deals</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Value</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Weighted</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Avg Probability</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stageData.map((stage) => (
                                <tr key={stage.stage} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage.stage] }} />
                                            <span className="font-medium text-slate-800">{stage.stage}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-600">{stage.count}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(stage.value)}</td>
                                    <td className="px-6 py-4 text-right text-emerald-600 font-bold">{formatCurrency(stage.weightedValue)}</td>
                                    <td className="px-6 py-4 text-right text-slate-500">{Math.round(stage.averageProbability)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color }: {
    icon: ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color: string;
}) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg bg-${color}-50`}>
                {icon}
            </div>
        </div>
        <div className="text-2xl font-black text-slate-800">{value}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{title}</div>
        <div className="text-sm text-slate-500 mt-2">{subtitle}</div>
    </div>
);

export default PipelineAnalyticsPage;
