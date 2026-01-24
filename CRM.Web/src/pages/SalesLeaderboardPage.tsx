import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Target, DollarSign, ArrowLeft, Award, Star, Activity } from 'lucide-react';
import api from '../api/api';

interface LeaderboardEntry {
    owner: string;
    totalDeals: number;
    wonDeals: number;
    lostDeals: number;
    openDeals: number;
    wonValue: number;
    pipelineValue: number;
    winRate: number;
}

const SalesLeaderboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [sortBy, setSortBy] = useState<'revenue' | 'winRate' | 'deals'>('revenue');

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports/opportunities/leaderboard');
            setLeaderboard(response.data || []);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSortedLeaderboard = () => {
        const sorted = [...leaderboard];
        switch (sortBy) {
            case 'revenue':
                return sorted.sort((a, b) => b.wonValue - a.wonValue);
            case 'winRate':
                return sorted.sort((a, b) => b.winRate - a.winRate);
            case 'deals':
                return sorted.sort((a, b) => b.wonDeals - a.wonDeals);
            default:
                return sorted;
        }
    };

    const getRankBadge = (index: number) => {
        if (index === 0) return { emoji: '🥇', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
        if (index === 1) return { emoji: '🥈', color: 'bg-slate-100 text-slate-700 border-slate-300' };
        if (index === 2) return { emoji: '🥉', color: 'bg-orange-100 text-orange-700 border-orange-300' };
        return { emoji: `#${index + 1}`, color: 'bg-slate-50 text-slate-600 border-slate-200' };
    };

    const getWinRateColor = (rate: number) => {
        if (rate >= 70) return 'text-green-600';
        if (rate >= 50) return 'text-yellow-600';
        if (rate >= 30) return 'text-orange-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    const sortedData = getSortedLeaderboard();
    const topPerformer = sortedData[0];

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
                        <h1 className="text-2xl font-bold text-slate-900">Sales Leaderboard</h1>
                        <p className="text-slate-500 text-sm">Recognize top performers and track team success</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="revenue">Revenue</option>
                        <option value="winRate">Win Rate</option>
                        <option value="deals">Deals Won</option>
                    </select>
                </div>
            </div>

            {/* Top Performer Spotlight */}
            {topPerformer && (
                <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-xl border-2 border-yellow-300 p-8 mb-8 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-3xl shadow-lg">
                            🏆
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-yellow-700 tracking-widest mb-1">
                                Top Performer
                            </div>
                            <h2 className="text-3xl font-black text-yellow-900">{topPerformer.owner}</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/80 rounded-lg p-4 border border-yellow-200">
                            <div className="text-xs text-yellow-700 font-bold mb-1">Total Revenue</div>
                            <div className="text-2xl font-black text-yellow-900">
                                ${topPerformer.wonValue.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-white/80 rounded-lg p-4 border border-yellow-200">
                            <div className="text-xs text-yellow-700 font-bold mb-1">Deals Won</div>
                            <div className="text-2xl font-black text-yellow-900">
                                {topPerformer.wonDeals}
                            </div>
                        </div>
                        <div className="bg-white/80 rounded-lg p-4 border border-yellow-200">
                            <div className="text-xs text-yellow-700 font-bold mb-1">Win Rate</div>
                            <div className="text-2xl font-black text-yellow-900">
                                {topPerformer.winRate.toFixed(1)}%
                            </div>
                        </div>
                        <div className="bg-white/80 rounded-lg p-4 border border-yellow-200">
                            <div className="text-xs text-yellow-700 font-bold mb-1">Pipeline</div>
                            <div className="text-2xl font-black text-yellow-900">
                                ${topPerformer.pipelineValue.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600 tracking-widest">
                                    Rank
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600 tracking-widest">
                                    Sales Rep
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-black uppercase text-slate-600 tracking-widest">
                                    <div className="flex items-center justify-end gap-1">
                                        <DollarSign size={14} />
                                        Revenue
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-black uppercase text-slate-600 tracking-widest">
                                    <div className="flex items-center justify-end gap-1">
                                        <Trophy size={14} />
                                        Won
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-black uppercase text-slate-600 tracking-widest">
                                    <div className="flex items-center justify-end gap-1">
                                        <Target size={14} />
                                        Win Rate
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-black uppercase text-slate-600 tracking-widest">
                                    <div className="flex items-center justify-end gap-1">
                                        <Activity size={14} />
                                        Open
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-black uppercase text-slate-600 tracking-widest">
                                    <div className="flex items-center justify-end gap-1">
                                        <TrendingUp size={14} />
                                        Pipeline
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedData.map((entry, index) => {
                                const badge = getRankBadge(index);
                                return (
                                    <tr
                                        key={index}
                                        className={`hover:bg-slate-50 transition-colors ${index < 3 ? 'bg-slate-50/50' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 font-black text-sm ${badge.color}`}
                                            >
                                                {badge.emoji}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                                    {entry.owner.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{entry.owner}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {entry.totalDeals} total deals
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-black text-slate-900">
                                                ${entry.wonValue.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                ${(entry.wonValue / (entry.wonDeals || 1)).toLocaleString()} avg
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-black text-green-600">{entry.wonDeals}</div>
                                            <div className="text-xs text-slate-500">{entry.lostDeals} lost</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`font-black text-lg ${getWinRateColor(entry.winRate)}`}>
                                                {entry.winRate.toFixed(1)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-indigo-600">{entry.openDeals}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-slate-900">
                                                ${entry.pipelineValue.toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Team Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="text-green-600" size={20} />
                        <h4 className="text-xs font-black uppercase text-green-600 tracking-widest">Team Total</h4>
                    </div>
                    <div className="text-3xl font-black text-green-700">
                        ${leaderboard.reduce((sum, e) => sum + e.wonValue, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600 mt-1">Total revenue won</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="text-blue-600" size={20} />
                        <h4 className="text-xs font-black uppercase text-blue-600 tracking-widest">Team Wins</h4>
                    </div>
                    <div className="text-3xl font-black text-blue-700">
                        {leaderboard.reduce((sum, e) => sum + e.wonDeals, 0)}
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Total deals won</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="text-indigo-600" size={20} />
                        <h4 className="text-xs font-black uppercase text-indigo-600 tracking-widest">Avg Win Rate</h4>
                    </div>
                    <div className="text-3xl font-black text-indigo-700">
                        {leaderboard.length > 0
                            ? (leaderboard.reduce((sum, e) => sum + e.winRate, 0) / leaderboard.length).toFixed(1)
                            : 0}%
                    </div>
                    <p className="text-xs text-indigo-600 mt-1">Team average</p>
                </div>
            </div>

            {/* Insights */}
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                <h3 className="text-lg font-bold text-purple-900 mb-4">🎯 Leaderboard Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                    <div className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <div>
                            <strong>Recognize Excellence:</strong> Celebrate top performers publicly to motivate the team.
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <div>
                            <strong>Identify Coaching Needs:</strong> Help lower performers improve their win rates.
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <div>
                            <strong>Share Best Practices:</strong> Learn from top performers' strategies.
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <div>
                            <strong>Set Team Goals:</strong> Use these metrics to establish realistic targets.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesLeaderboardPage;
