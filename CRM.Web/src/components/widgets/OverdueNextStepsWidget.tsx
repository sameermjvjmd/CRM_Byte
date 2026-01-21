import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

interface OverdueOpportunity {
    id: number;
    name: string;
    nextAction: string;
    nextActionDate: string;
    nextActionOwner: string;
    amount: number;
    stage: string;
    daysOverdue: number;
}

const OverdueNextStepsWidget = () => {
    const [overdueOpps, setOverdueOpps] = useState<OverdueOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOverdueOpps = async () => {
            try {
                const response = await api.get('/opportunities');
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Filter opportunities with overdue next steps
                const overdue = response.data
                    .filter((opp: any) => {
                        if (!opp.nextActionDate) return false;
                        const actionDate = new Date(opp.nextActionDate);
                        actionDate.setHours(0, 0, 0, 0);
                        return actionDate < today && opp.stage !== 'Closed Won' && opp.stage !== 'Closed Lost';
                    })
                    .map((opp: any) => {
                        const actionDate = new Date(opp.nextActionDate);
                        actionDate.setHours(0, 0, 0, 0);
                        const diffTime = today.getTime() - actionDate.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        return {
                            id: opp.id,
                            name: opp.name,
                            nextAction: opp.nextAction,
                            nextActionDate: opp.nextActionDate,
                            nextActionOwner: opp.nextActionOwner,
                            amount: opp.amount,
                            stage: opp.stage,
                            daysOverdue: diffDays
                        };
                    })
                    .sort((a: any, b: any) => b.daysOverdue - a.daysOverdue)
                    .slice(0, 5); // Show top 5 most overdue

                setOverdueOpps(overdue);
            } catch (error) {
                console.error('Error fetching overdue opportunities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOverdueOpps();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl shadow-sm border-2 border-red-100">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-lg">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase text-red-900 tracking-widest">Overdue Actions</h3>
                    <p className="text-xs text-red-600 font-medium">Opportunities needing attention</p>
                </div>
            </div>

            {overdueOpps.length === 0 ? (
                <div className="bg-white rounded-lg p-6 border-2 border-dashed border-red-200 text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-sm text-red-400 font-medium">All caught up!</p>
                    <p className="text-xs text-red-300 mt-1">No overdue next steps</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {overdueOpps.map((opp) => (
                        <motion.div
                            key={opp.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => navigate(`/opportunities/${opp.id}`)}
                            className="bg-white rounded-lg p-4 border border-red-100 shadow-sm cursor-pointer hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">
                                            {opp.name}
                                        </h4>
                                        <ExternalLink size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium mb-2 truncate">
                                        {opp.nextAction}
                                    </p>
                                    <div className="flex items-center gap-3 text-[10px]">
                                        <div className="flex items-center gap-1 text-red-600 font-black">
                                            <Calendar size={10} />
                                            <span>
                                                {new Date(opp.nextActionDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-black uppercase">
                                            {opp.daysOverdue}d overdue
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-xs font-black text-slate-900">
                                        ${opp.amount.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium mt-1">
                                        {opp.stage}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {overdueOpps.length > 0 && (
                        <button
                            onClick={() => navigate('/opportunities')}
                            className="w-full mt-2 px-4 py-2 bg-white text-red-600 border-2 border-red-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                            View All Opportunities
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default OverdueNextStepsWidget;
