import { Clock, ArrowRight } from 'lucide-react';

interface StageChange {
    id: number;
    fromStage: string;
    toStage: string;
    changedAt: string;
    reason?: string;
    changedByUserId?: number;
    daysInPreviousStage: number;
}

interface StageHistoryTimelineProps {
    history: StageChange[];
    opportunityCreatedAt?: string;
}

const STAGE_COLORS: Record<string, string> = {
    'Lead': 'bg-slate-400',
    'Qualified': 'bg-blue-500',
    'Proposal': 'bg-purple-500',
    'Negotiation': 'bg-orange-500',
    'Closed Won': 'bg-emerald-500',
    'Closed Lost': 'bg-red-500'
};

export default function StageHistoryTimeline({ history, opportunityCreatedAt }: StageHistoryTimelineProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No stage changes yet</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

            {/* Created event */}
            {opportunityCreatedAt && (
                <div className="relative flex items-start gap-4 pb-6">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-indigo-500 flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    </div>
                    <div className="flex-1 pt-1">
                        <p className="text-sm font-medium text-slate-800">
                            Opportunity Created
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {formatDate(opportunityCreatedAt)}
                        </p>
                    </div>
                </div>
            )}

            {/* Stage changes */}
            {history.map((change) => (
                <div key={change.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
                    {/* Timeline dot */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${STAGE_COLORS[change.toStage] || 'bg-slate-400'
                        }`}>
                        <ArrowRight className="w-4 h-4 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${STAGE_COLORS[change.fromStage] || 'bg-slate-400'
                                }`}>
                                {change.fromStage}
                            </span>
                            <ArrowRight size={14} className="text-slate-400" />
                            <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${STAGE_COLORS[change.toStage] || 'bg-slate-400'
                                }`}>
                                {change.toStage}
                            </span>
                        </div>

                        <p className="text-xs text-slate-500">
                            {formatDate(change.changedAt)}
                        </p>

                        {change.daysInPreviousStage > 0 && (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <Clock size={12} />
                                Spent {change.daysInPreviousStage} day{change.daysInPreviousStage !== 1 ? 's' : ''} in {change.fromStage}
                            </p>
                        )}

                        {change.reason && (
                            <p className="text-sm text-slate-600 mt-2 pt-2 border-t border-slate-100 italic">
                                "{change.reason}"
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
