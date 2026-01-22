import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, AlertTriangle, Target, ArrowLeft, Calendar, BarChart3 } from 'lucide-react';
import api from '../api/api';

interface VelocityStats {
    avgSalesCycle: number;
    dealsClosed30Days: number;
    revenueClosed30Days: number;
    winRate30Days: number;
}

interface StageVelocity {
    stage: string;
    avgDaysInStage: number;
    count: number;
    minDays: number;
    maxDays: number;
}

interface VelocityTrend {
    period: string;
    avgDays: number;
    dealsCount: number;
}

const DealVelocityPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<VelocityStats | null>(null);
    const [stageVelocity, setStageVelocity] = useState<StageVelocity[]>([]);
    const [velocityTrends, setVelocityTrends] = useState<VelocityTrend[]>([]);
    const [bottlenecks, setBottlenecks] = useState<StageVelocity[]>([]);

    useEffect(() => {
        fetchVelocityMetrics();
    }, []);

    const fetchVelocityMetrics = async () => {
        try {
            setLoading(true);

            // Fetch velocity data
            const velocityResponse = await api.get('/opportunities/velocity');
            setStats(velocityResponse.data);

            // Fetch stage-specific velocity
            const stageResponse = await api.get('/opportunities/stage-velocity');
            const stageData = stageResponse.data || [];
            setStageVelocity(stageData);

            // Identify bottlenecks (stages taking longer than average)
            const avgDays = stageData.reduce((sum: number, s: StageVelocity) => sum + s.avgDaysInStage, 0) / stageData.length;
            const bottleneckStages = stageData.filter((s: StageVelocity) => s.avgDaysInStage > avgDays * 1.5);
            setBottlenecks(bottleneckStages);

            // Fetch velocity trends (mock data for now - can be enhanced)
            const trendsResponse = await api.get('/opportunities/velocity-trends');
            setVelocityTrends(trendsResponse.data || []);

        } catch (error) {
            console.error('Failed to load velocity metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading velocity metrics...</p>
                </div>
            </div>
        );
    }

    const getVelocityColor = (days: number) => {
        if (days <= 30) return 'text-green-600';
        if (days <= 60) return 'text-yellow-600';
        if (days <= 90) return 'text-orange-600';
        return 'text-red-600';
    };

    const getVelocityBg = (days: number) => {
        if (days <= 30) return 'bg-green-50 border-green-200';
        if (days <= 60) return 'bg-yellow-50 border-yellow-200';
        if (days <= 90) return 'bg-orange-50 border-orange-200';
        return 'bg-red-50 border-red-200';
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/opportunities')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Deal Velocity Metrics</h1>
                        <p className="text-slate-500 text-sm">Understand how fast deals move through your pipeline</p>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-indigo-600 tracking-widest">Avg Sales Cycle</span>
                        <Clock className="text-indigo-600" size={20} />
                    </div>
                    <div className="text-3xl font-black text-indigo-700 mb-1">
                        {Math.round(stats?.avgSalesCycle || 0)} days
                    </div>
                    <div className="text-xs text-indigo-600">
                        From lead to close
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-green-600 tracking-widest">Closed (30 Days)</span>
                        <Target className="text-green-600" size={20} />
                    </div>
                    <div className="text-3xl font-black text-green-700 mb-1">
                        {stats?.dealsClosed30Days || 0}
                    </div>
                    <div className="text-xs text-green-600">
                        ${(stats?.revenueClosed30Days || 0).toLocaleString()} revenue
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-blue-600 tracking-widest">Win Rate (30d)</span>
                        <TrendingUp className="text-blue-600" size={20} />
                    </div>
                    <div className="text-3xl font-black text-blue-700 mb-1">
                        {(stats?.winRate30Days || 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-blue-600">
                        Last 30 days
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-orange-600 tracking-widest">Bottlenecks</span>
                        <AlertTriangle className="text-orange-600" size={20} />
                    </div>
                    <div className="text-3xl font-black text-orange-700 mb-1">
                        {bottlenecks.length}
                    </div>
                    <div className="text-xs text-orange-600">
                        Stages need attention
                    </div>
                </div>
            </div>

            {/* Stage Velocity */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="text-indigo-600" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">Average Days in Each Stage</h3>
                </div>

                {stageVelocity.length > 0 ? (
                    <div className="space-y-4">
                        {stageVelocity.map((stage, idx) => (
                            <div key={idx} className={`border rounded-lg p-4 ${getVelocityBg(stage.avgDaysInStage)}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-slate-900">{stage.stage}</h4>
                                        {bottlenecks.some(b => b.stage === stage.stage) && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded border border-red-200">
                                                Bottleneck
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-black ${getVelocityColor(stage.avgDaysInStage)}`}>
                                            {Math.round(stage.avgDaysInStage)} days
                                        </div>
                                        <div className="text-xs text-slate-500">{stage.count} opportunities</div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all ${stage.avgDaysInStage <= 30 ? 'bg-green-500' :
                                                stage.avgDaysInStage <= 60 ? 'bg-yellow-500' :
                                                    stage.avgDaysInStage <= 90 ? 'bg-orange-500' :
                                                        'bg-red-500'
                                            }`}
                                        style={{ width: `${Math.min((stage.avgDaysInStage / 120) * 100, 100)}%` }}
                                    />
                                </div>

                                {/* Min/Max */}
                                <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                                    <span>Min: {stage.minDays} days</span>
                                    <span>Max: {stage.maxDays} days</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        <p>No stage velocity data available yet</p>
                        <p className="text-xs mt-1">Data will appear as deals move through stages</p>
                    </div>
                )}
            </div>

            {/* Bottleneck Analysis */}
            {bottlenecks.length > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 p-6 shadow-sm mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-red-600" size={20} />
                        <h3 className="text-lg font-bold text-red-900">Identified Bottlenecks</h3>
                    </div>
                    <p className="text-sm text-red-700 mb-4">
                        These stages are taking significantly longer than average. Consider coaching or process improvements.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bottlenecks.map((stage, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 border border-red-200">
                                <h4 className="font-bold text-slate-900 mb-2">{stage.stage}</h4>
                                <div className="text-2xl font-black text-red-600 mb-1">
                                    {Math.round(stage.avgDaysInStage)} days
                                </div>
                                <div className="text-xs text-slate-600">
                                    {stage.count} opportunities stuck
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Velocity Trends */}
            {velocityTrends.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="text-purple-600" size={20} />
                        <h3 className="text-lg font-bold text-slate-900">Velocity Trends Over Time</h3>
                    </div>
                    <div className="space-y-3">
                        {velocityTrends.map((trend, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors">
                                <div>
                                    <h4 className="font-bold text-slate-900">{trend.period}</h4>
                                    <div className="text-xs text-slate-500">{trend.dealsCount} deals closed</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-black ${getVelocityColor(trend.avgDays)}`}>
                                        {Math.round(trend.avgDays)} days
                                    </div>
                                    <div className="text-xs text-slate-500">avg cycle</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Insights */}
            <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-6">
                <h3 className="text-lg font-bold text-indigo-900 mb-4">💡 Velocity Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-600">✓</span>
                        <div>
                            <strong>Faster is Better:</strong> Shorter sales cycles mean more deals closed and happier customers.
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-600">✓</span>
                        <div>
                            <strong>Identify Bottlenecks:</strong> Stages with high average days need process improvements.
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-600">✓</span>
                        <div>
                            <strong>Coach Your Team:</strong> Help reps move deals faster through slow stages.
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-600">✓</span>
                        <div>
                            <strong>Set Benchmarks:</strong> Use these metrics to set realistic timeline expectations.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealVelocityPage;
