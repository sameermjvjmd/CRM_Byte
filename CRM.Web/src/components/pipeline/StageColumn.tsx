import StrictModeDroppable from './StrictModeDroppable';
import type { Opportunity } from '../../types/opportunity';
import OpportunityCard from './OpportunityCard';

interface StageColumnProps {
    stageId: string;
    title: string;
    opportunities: Opportunity[];
    color: string;
    totalValue: number;
    onClone: (opportunity: Opportunity) => void;
    onDelete: (id: number) => void;
}

const StageColumn = ({ stageId, title, opportunities, color, totalValue, onClone, onDelete }: StageColumnProps) => {
    return (
        <div className="flex flex-col h-full min-w-[280px] w-[280px] snap-center">
            {/* Header */}
            <div className={`p-3 rounded-t-xl border-b-4 ${color} bg-white border-x border-t border-slate-200 shadow-sm mb-3`}>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-black text-slate-800 uppercase tracking-wide text-xs">{title}</h3>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {opportunities.length}
                    </span>
                </div>
                <div className="text-sm font-black text-slate-600">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalValue)}
                </div>
            </div>

            {/* Droppable Area */}
            <StrictModeDroppable droppableId={stageId}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                            flex-1 p-2 rounded-xl transition-colors overflow-y-auto custom-scrollbar
                            ${snapshot.isDraggingOver ? 'bg-indigo-50/50 ring-2 ring-indigo-200 ring-inset' : 'bg-slate-100/50'}
                        `}
                    >
                        {opportunities.map((opp, index) => (
                            <OpportunityCard
                                key={opp.id}
                                opportunity={opp}
                                index={index}
                                onClone={() => onClone(opp)}
                                onDelete={() => onDelete(opp.id!)}
                            />
                        ))}
                        {provided.placeholder}

                        {opportunities.length === 0 && (
                            <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-2">
                                <span className="text-xs font-bold uppercase tracking-widest opacity-50">Empty</span>
                            </div>
                        )}
                    </div>
                )}
            </StrictModeDroppable>
        </div>
    );
};

export default StageColumn;
