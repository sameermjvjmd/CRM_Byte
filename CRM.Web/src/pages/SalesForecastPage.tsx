import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ComposedChart, Line
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, Target, ArrowUpRight, Loader2 } from 'lucide-react';
import api from '../api/api';

interface ForecastData {
    month: string;
    monthName: string;
    dealCount: number;
    totalValue: number;
    weightedValue: number;
}

interface VelocityData {
    averageSalesCycleDays: number;
    fastestDealDays: number;
    slowestDealDays: number;
    dealsClosedLast30Days: number;
    averageDaysPerStage: { stage: string; averageDays: number }[];
}

interface QuarterlyForecast {
    quarter: string;
    totalValue: number;
    weightedValue: number;
    dealCount: number;
}

const SalesForecastPage = () => {
    const [forecast, setForecast] = useState<ForecastData[]>([]);
    const [velocity, setVelocity] = useState<VelocityData | null>(null);
    const [quarterlyData, setQuarterlyData] = useState<QuarterlyForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'monthly' | 'quarterly'>('monthly');

    useEffect(() => {
        fetchForecastData();
    }, []);

    const fetchForecastData = async () => {
        try {
            const [forecastRes, velocityRes] = await Promise.all([
                api.get('/pipelineanalytics/forecast'),
                api.get('/pipelineanalytics/velocity')
            ]);

            setForecast(forecastRes.data);
            setVelocity(velocityRes.data);

            // Calculate quarterly data from monthly
            const quarters = groupByQuarter(forecastRes.data);
            setQuarterlyData(quarters);
        } catch (error) {
            console.error('Error fetching forecast data:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupByQuarter = (monthlyData: ForecastData[]): QuarterlyForecast[] => {
        const quarterMap: Record<string, QuarterlyForecast> = {};

        monthlyData.forEach(item => {
            const [year, month] = item.month.split('-');
            const q = Math.ceil(parseInt(month) / 3);
            const quarterKey = `Q${q} ${year}`;

            if (!quarterMap[quarterKey]) {
                quarterMap[quarterKey] = {
                    quarter: quarterKey,
                    totalValue: 0,
                    weightedValue: 0,
                    dealCount: 0
                };
            }

            quarterMap[quarterKey].totalValue += item.totalValue;
            quarterMap[quarterKey].weightedValue += item.weightedValue;
            quarterMap[quarterKey].dealCount += item.dealCount;
        });

        return Object.values(quarterMap);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const totalForecastValue = forecast.reduce((sum, f) => sum + f.totalValue, 0);
    const totalWeightedValue = forecast.reduce((sum, f) => sum + f.weightedValue, 0);
    const totalDeals = forecast.reduce((sum, f) => sum + f.dealCount, 0);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="font-medium">Loading forecast data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#f8fafc] min-h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Sales Forecast</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Revenue projections based on expected close dates and probabilities
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'monthly'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setViewMode('quarterly')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'quarterly'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            Quarterly
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-emerald-50">
                            <DollarSign className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Pipeline</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalForecastValue)}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                        <span className="text-emerald-600 font-medium">Next 6 months</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-indigo-50">
                            <Target className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Weighted Forecast</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalWeightedValue)}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm text-slate-500">
                        <span>Probability-adjusted value</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-purple-50">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Avg Sales Cycle</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {velocity?.averageSalesCycleDays || 0} days
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm text-slate-500">
                        <span>From lead to close</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-orange-50">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Deals This Month</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {velocity?.dealsClosedLast30Days || 0}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm text-slate-500">
                        <span>Closed in last 30 days</span>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">
                        {viewMode === 'monthly' ? 'Monthly Revenue Forecast' : 'Quarterly Revenue Forecast'}
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            {viewMode === 'monthly' ? (
                                <ComposedChart data={forecast}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="monthName" tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(Number(value ?? 0))}
                                        labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                        contentStyle={{
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="totalValue"
                                        name="Total Pipeline"
                                        fill="#e0e7ff"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="weightedValue"
                                        name="Weighted Forecast"
                                        fill="#6366f1"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="dealCount"
                                        name="Deal Count"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        dot={{ fill: '#f97316' }}
                                        yAxisId={0}
                                    />
                                </ComposedChart>
                            ) : (
                                <BarChart data={quarterlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(Number(value ?? 0))}
                                        labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                        contentStyle={{
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="totalValue"
                                        name="Total Pipeline"
                                        fill="#e0e7ff"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="weightedValue"
                                        name="Weighted Forecast"
                                        fill="#6366f1"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stage Velocity */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Sales Velocity</h2>
                    <div className="space-y-4">
                        {velocity?.averageDaysPerStage.map((stage) => (
                            <div key={stage.stage} className="group">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-slate-700">{stage.stage}</span>
                                    <span className="text-sm font-bold text-slate-900">{stage.averageDays} days</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min((stage.averageDays / (velocity?.averageSalesCycleDays || 30)) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 mt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-500">Fastest Deal</span>
                                <span className="text-sm font-bold text-emerald-600">
                                    {velocity?.fastestDealDays || 0} days
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Slowest Deal</span>
                                <span className="text-sm font-bold text-red-500">
                                    {velocity?.slowestDealDays || 0} days
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forecast Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">
                        {viewMode === 'monthly' ? 'Monthly Breakdown' : 'Quarterly Breakdown'}
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {viewMode === 'monthly' ? 'Month' : 'Quarter'}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Deals
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Total Pipeline
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Weighted Forecast
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Confidence
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(viewMode === 'monthly' ? forecast : quarterlyData).map((item, index) => {
                                const confidence = item.totalValue > 0 ? (item.weightedValue / item.totalValue) * 100 : 0;

                                return (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {'monthName' in item ? item.monthName : item.quarter}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-slate-700">
                                            {item.dealCount}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">
                                            {formatCurrency(item.totalValue)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-indigo-600">
                                            {formatCurrency(item.weightedValue)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                                ${confidence >= 70 ? 'bg-emerald-100 text-emerald-700' :
                                                    confidence >= 40 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-600'}`}>
                                                {confidence.toFixed(0)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-50">
                            <tr>
                                <td className="px-6 py-4 text-sm font-bold text-slate-900">Total</td>
                                <td className="px-6 py-4 text-sm text-right font-bold text-slate-900">
                                    {totalDeals}
                                </td>
                                <td className="px-6 py-4 text-sm text-right font-bold text-slate-900">
                                    {formatCurrency(totalForecastValue)}
                                </td>
                                <td className="px-6 py-4 text-sm text-right font-bold text-indigo-600">
                                    {formatCurrency(totalWeightedValue)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                                        {totalForecastValue > 0 ? ((totalWeightedValue / totalForecastValue) * 100).toFixed(0) : 0}%
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesForecastPage;
