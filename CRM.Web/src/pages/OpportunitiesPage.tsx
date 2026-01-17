import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import type { Opportunity, OpportunityStage } from '../types/opportunity';
import { Plus, MoreVertical, Calendar, User } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import CreateModal from '../components/CreateModal';
import CloseOpportunityModal from '../components/CloseOpportunityModal';

const STAGES = ['Initial', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const OpportunitiesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [closingOpportunity, setClosingOpportunity] = useState<{ id: number, name: string, stage: 'Closed Won' | 'Closed Lost' } | null>(null);

    useEffect(() => {
        fetchOpportunities();
    }, [location.state]);

    const fetchOpportunities = async () => {
        try {
            if (location.state?.lookupActive && location.state?.lookupResults) {
                setOpportunities(location.state.lookupResults);
            } else {
                const response = await api.get('/opportunities');
                setOpportunities(response.data);
            }
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOnDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { draggableId, destination, source } = result;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const movedOp = opportunities.find(op => op.id === parseInt(draggableId));
        if (!movedOp) return;

        const newStage = destination.droppableId as OpportunityStage;

        if (newStage === 'Closed Won' || newStage === 'Closed Lost') {
            setClosingOpportunity({
                id: movedOp.id!,
                name: movedOp.name,
                stage: newStage
            });
            setIsCloseModalOpen(true);
            return;
        }

        // Optimistic UI update for other stages
        const updated: Opportunity = { ...movedOp, stage: newStage };
        setOpportunities(prev => prev.map(o => o.id === updated.id ? updated : o));

        try {
            if (updated.id) {
                await api.put(`/opportunities/${updated.id}`, updated);
            }
        } catch (error) {
            console.error('Error moving stage:', error);
            // Revert on failure
            setOpportunities(prev => prev.map(o => o.id === movedOp.id ? movedOp : o));
        }
    };

    const getOppsByStage = (stage: string) => {
        return opportunities.filter(op => op.stage === stage);
    };

    const getStageTotal = (stage: string) => {
        return getOppsByStage(stage).reduce((sum, op) => sum + (op.amount || 0), 0);
    };

    if (loading) {
        return (
            <div className="p-8 h-full flex flex-col justify-center items-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                Loading pipeline...
            </div>
        );
    }

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Opportunities Pipeline</h1>
                    <p className="text-slate-500 text-sm">Track and manage your sales deals through stages.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
                >
                    <Plus size={18} />
                    New Opportunity
                </button>
            </div>

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-6 h-full min-w-max">
                        {STAGES.map((stage) => (
                            <div key={stage} className="w-80 flex flex-col">
                                <div className="mb-4 flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-700 uppercase tracking-wider text-xs">{stage}</h3>
                                        <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            {getOppsByStage(stage).length}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-primary">
                                        ${getStageTotal(stage).toLocaleString()}
                                    </span>
                                </div>

                                <Droppable droppableId={stage}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 bg-slate-50/50 rounded-xl p-3 border border-dashed text-sm transition-colors overflow-y-auto space-y-3 min-h-[150px] ${snapshot.isDraggingOver ? 'bg-indigo-50 border-indigo-300' : 'border-slate-200'}`}
                                        >
                                            {getOppsByStage(stage).map((op, index) => (
                                                <Draggable key={op.id} draggableId={String(op.id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{ ...provided.draggableProps.style }}
                                                            className={`bg-white p-4 rounded-lg shadow-sm border group hover:border-primary/50 transition-all ${snapshot.isDragging ? 'shadow-lg rotate-3 ring-2 ring-primary ring-opacity-50 z-50' : 'border-slate-200'}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h4
                                                                    className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors cursor-pointer"
                                                                    onClick={() => navigate(`/opportunities/${op.id}`)}
                                                                >
                                                                    {op.name}
                                                                </h4>
                                                                <button className="text-slate-400 hover:text-slate-600">
                                                                    <MoreVertical size={14} />
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                                                    {op.probability}%
                                                                </span>
                                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                    <Calendar size={10} />
                                                                    {new Date(op.expectedCloseDate).toLocaleDateString()}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-3">
                                                                <div className="flex items-center gap-1 text-slate-500 text-xs">
                                                                    <User size={12} />
                                                                    <span>Sameer MJ</span>
                                                                </div>
                                                                <div className="font-bold text-slate-900 text-sm">
                                                                    ${op.amount.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </div>
            </DragDropContext>

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType="Opportunity"
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchOpportunities();
                }}
            />

            {closingOpportunity && (
                <CloseOpportunityModal
                    isOpen={isCloseModalOpen}
                    onClose={() => setIsCloseModalOpen(false)}
                    opportunityId={closingOpportunity.id}
                    opportunityName={closingOpportunity.name}
                    targetStage={closingOpportunity.stage}
                    onSuccess={fetchOpportunities}
                />
            )}
        </div>
    );
};

export default OpportunitiesPage;
