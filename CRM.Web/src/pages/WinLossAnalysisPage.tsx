import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Target, Award, AlertCircle, Users, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import api from '../api/api';

interface WinLossStats {
    totalOpportunities: number;
    wonCount: number;
    lostCount: number;
    winRate: number;
    totalWonValue: number;
    totalLostValue: number;
    avgWonValue: number;
    avgLostValue: number;
    avgDaysToWin: number;
    avgDaysToLose: number;
}

interface ReasonBreakdown {
    reason: string;
    count: number;
    percentage: number;
    totalValue: number;
}

interface CompetitorAnalysis {
    competitor: string;
    wonAgainst: number;
    lostAgainst: number;
    winRate: number;
}

interface StageAnalysis {
    stage: string;
    wonFromStage: number;
    lostFromStage: number;
    conversionRate: number;
}

const WinLossAnalysisPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<WinLossStats | null>(null);
    const [winReasons, setWinReasons] = useState<ReasonBreakdown[]>([]);
    const [lossReasons, setLossReasons] = useState<ReasonBreakdown[]>([]);
    const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis[]>([]);
    const [stageAnalysis, setStageAnalysis] = useState<StageAnalysis[]>([]);
    const [timeRange, setTimeRange] = useState('all'); // all, 30days, 90days, year

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/opportunities/win-loss-analysis?timeRange=${timeRange}`);
            const data = response.data;

            setStats(data.stats);
            setWinReasons(data.winReasons || []);
            setLossReasons(data.lossReasons || []);
            setCompetitorAnalysis(data.competitorAnalysis || []);
            setStageAnalysis(data.stageAnalysis || []);
        } catch (error) {
            console.error('Failed to load win/loss analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold text-slate-900">Win/Loss Analysis</h1>
                        <p className="text-slate-500 text-sm">Understand what drives wins and losses</p>
                    </div>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="all">All Time</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="year">Last Year</option>
                </select>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-green-600 tracking-widest">Won Deals</span>
                        <Award className="text-green-600" size={20} />
                    </div>
                    <div className="text-3xl font-black text-green-700 mb-1">{stats?.wonCount || 0}</div>
                    <div className="text-xs text-green-600">
                        ${(stats?.totalWonValue || 0).toLocaleString()} total value
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-red-600 tracking-widest">Lost Deals</span>
                        <AlertCircle className="text-red-600" size={20} />
                    </div>
                    <div className="text-3xl font-black text-red-700 mb-1">{stats?.lostCount || 0}</div>
                    <div className="text-xs text-red-600">
                        ${(stats?.totalLostValue || 0).toLocaleString()} total value
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-indigo-600 tracking-widest">Win Rate</span>
                        <Target className="text-indigo-600" size={20} />
                    </div>
                    <div className="text-3xl font-black text-indigo-700 mb-1">{(stats?.winRate || 0).toFixed(1)}%</div>
                    <div className="text-xs text-indigo-600">
                        {stats?.totalOpportunities || 0} total opportunities
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-blue-600 tracking-widest">Avg Deal Size</span>
                        <DollarSign className="text-blue-600" size={20} />
                    </div>
                    <div className="text-3xl font-black text-blue-700 mb-1">
                        ${(stats?.avgWonValue || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-600">
                        Won: ${(stats?.avgWonValue || 0).toLocaleString()} | Lost: ${(stats?.avgLostValue || 0).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Win/Loss Reasons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Win Reasons */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="text-green-600" size={20} />
                        <h3 className="text-lg font-bold text-slate-900">Top Win Reasons</h3>
                    </div>
                    {winReasons.length > 0 ? (
                        <div className="space-y-3">
                            {winReasons.map((reason, idx) => (
                                <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-slate-900">{reason.reason || 'Not specified'}</span>
                                        <span className="text-sm font-bold text-green-600">{reason.count} deals</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all"
                                                style={{ width: `${reason.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-600">{reason.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        Total value: ${reason.totalValue.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <p>No win reasons recorded yet</p>
                        </div>
                    )}
                </div>

                {/* Loss Reasons */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="text-red-600" size={20} />
                        <h3 className="text-lg font-bold text-slate-900">Top Loss Reasons</h3>
                    </div>
                    {lossReasons.length > 0 ? (
                        <div className="space-y-3">
                            {lossReasons.map((reason, idx) => (
                                <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-slate-900">{reason.reason || 'Not specified'}</span>
                                        <span className="text-sm font-bold text-red-600">{reason.count} deals</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full transition-all"
                                                style={{ width: `${reason.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-600">{reason.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        Total value: ${reason.totalValue.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <p>No loss reasons recorded yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Competitor Analysis */}
            {competitorAnalysis.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="text-indigo-600" size={20} />
                        <h3 className="text-lg font-bold text-slate-900">Performance vs. Competitors</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {competitorAnalysis.map((comp, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-lg p-4">
                                <h4 className="font-bold text-slate-900 mb-3">{comp.competitor}</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-green-600">Won against:</span>
                                        <span className="font-bold">{comp.wonAgainst}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-red-600">Lost against:</span>
                                        <span className="font-bold">{comp.lostAgainst}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-600">Win Rate:</span>
                                            <span className={`text-sm font-black ${comp.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                                {comp.winRate.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stage Analysis */}
            {stageAnalysis.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-purple-600" size={20} />
                        <h3 className="text-lg font-bold text-slate-900">Win/Loss by Stage</h3>
                    </div>
                    <div className="space-y-3">
                        {stageAnalysis.map((stage, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-slate-900">{stage.stage}</h4>
                                    <span className={`text-sm font-black ${stage.conversionRate >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
                                        {stage.conversionRate.toFixed(1)}% conversion
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-600">Won from stage:</span>
                                        <span className="ml-2 font-bold text-green-600">{stage.wonFromStage}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-600">Lost from stage:</span>
                                        <span className="ml-2 font-bold text-red-600">{stage.lostFromStage}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sales Cycle Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-green-600" size={20} />
                        <h4 className="text-sm font-black uppercase text-green-600 tracking-widest">Avg Days to Win</h4>
                    </div>
                    <div className="text-4xl font-black text-green-700">{stats?.avgDaysToWin || 0}</div>
                    <p className="text-xs text-green-600 mt-1">Average sales cycle for won deals</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-red-600" size={20} />
                        <h4 className="text-sm font-black uppercase text-red-600 tracking-widest">Avg Days to Lose</h4>
                    </div>
                    <div className="text-4xl font-black text-red-700">{stats?.avgDaysToLose || 0}</div>
                    <p className="text-xs text-red-600 mt-1">Average time before losing deals</p>
                </div>
            </div>
        </div>
    );
};

export default WinLossAnalysisPage;
