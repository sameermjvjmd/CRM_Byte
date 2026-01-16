import { useState, useEffect } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Plus, Download, Search, LayoutGrid, List as ListIcon } from 'lucide-react';
import StageColumn from '../components/pipeline/StageColumn';
import AddOpportunityModal from '../components/pipeline/AddOpportunityModal';
import CloseReasonModal from '../components/pipeline/CloseReasonModal';
import type { Opportunity } from '../types/opportunity';
import api from '../api/api';
import toast from 'react-hot-toast';

// Initial columns configuration
const PIPELINE_STAGES = [
    { id: 'Lead', title: 'Lead', color: 'border-slate-400' },
    { id: 'Qualified', title: 'Qualified', color: 'border-blue-500' },
    { id: 'Proposal', title: 'Proposal', color: 'border-purple-500' },
    { id: 'Negotiation', title: 'Negotiation', color: 'border-orange-500' },
    { id: 'Closed Won', title: 'Closed Won', color: 'border-emerald-500' },
    { id: 'Closed Lost', title: 'Closed Lost', color: 'border-red-500' }
];

const PipelineBoardPage = () => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Close reason modal state
    const [closeModal, setCloseModal] = useState<{
        isOpen: boolean;
        isWin: boolean;
        opportunityId: string;
        opportunityName: string;
    }>({ isOpen: false, isWin: false, opportunityId: '', opportunityName: '' });

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            const response = await api.get('/opportunities');
            setOpportunities(response.data);
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStage = destination.droppableId;
        const opportunity = opportunities.find(o => o.id?.toString() === draggableId);

        // Check if moving to a closed stage - show modal
        if ((newStage === 'Closed Won' || newStage === 'Closed Lost') && opportunity) {
            setCloseModal({
                isOpen: true,
                isWin: newStage === 'Closed Won',
                opportunityId: draggableId,
                opportunityName: opportunity.name
            });
            return; // Don't move yet, wait for modal confirmation
        }

        // Normal stage change (not closing)
        await updateOpportunityStage(draggableId, newStage as Opportunity['stage']);
    };

    const updateOpportunityStage = async (
        opportunityId: string,
        newStage: Opportunity['stage'],
        winReason?: string,
        lostReason?: string,
        notes?: string
    ) => {
        // Optimistic update
        const updatedOpportunities = opportunities.map(opp =>
            opp.id?.toString() === opportunityId
                ? { ...opp, stage: newStage }
                : opp
        );
        setOpportunities(updatedOpportunities);

        try {
            const opportunity = opportunities.find(o => o.id?.toString() === opportunityId);
            await api.put(`/opportunities/${opportunityId}`, {
                ...opportunity,
                stage: newStage,
                winReason: winReason || opportunity?.winReason,
                lostReason: lostReason || opportunity?.lostReason,
                winLossNotes: notes || opportunity?.winLossNotes,
                wonDate: newStage === 'Closed Won' ? new Date().toISOString() : opportunity?.wonDate,
                lostDate: newStage === 'Closed Lost' ? new Date().toISOString() : opportunity?.lostDate,
                actualCloseDate: (newStage === 'Closed Won' || newStage === 'Closed Lost')
                    ? new Date().toISOString()
                    : opportunity?.actualCloseDate
            });

            if (newStage === 'Closed Won') {
                toast.success('🎉 Deal won! Great job!');
            } else if (newStage === 'Closed Lost') {
                toast('Deal marked as lost', { icon: '📊' });
            }
        } catch (error) {
            console.error('Error updating opportunity stage:', error);
            toast.error('Failed to update opportunity');
            fetchOpportunities(); // Revert
        }
    };

    const handleCloseConfirm = async (reason: string, notes: string) => {
        const { opportunityId, isWin } = closeModal;
        const newStage = isWin ? 'Closed Won' : 'Closed Lost';

        await updateOpportunityStage(
            opportunityId,
            newStage as Opportunity['stage'],
            isWin ? reason : undefined,
            !isWin ? reason : undefined,
            notes
        );

        setCloseModal({ isOpen: false, isWin: false, opportunityId: '', opportunityName: '' });
    };

    const handleClone = async (opportunity: Opportunity) => {
        try {
            // Create a clean copy without ID and navigation properties
            const { id, stageHistory, products, contact, company, ...data } = opportunity;

            await api.post('/opportunities', {
                ...data,
                name: `${data.name} (Copy)`,
                createdAt: undefined,
                lastModifiedAt: undefined,
                // Reset stage to Lead for cloned deals usually, or keep it? 
                // Let's keep it but maybe reset dates
                actualCloseDate: null,
                wonDate: null,
                lostDate: null
            });
            toast.success('Opportunity cloned successfully');
            fetchOpportunities();
        } catch (error) {
            console.error('Clone failed', error);
            toast.error('Failed to clone opportunity');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
        try {
            await api.delete(`/opportunities/${id}`);
            toast.success('Opportunity deleted');
            fetchOpportunities();
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Failed to delete opportunity');
        }
    };

    const getStageOpportunities = (stageId: string) => {
        return opportunities.filter(op => {
            // Handle legacy stage names mapping (force cast to avoid TS errors)
            const currentStage = op.stage as string;
            if (stageId === 'Lead' && (currentStage === 'Lead' || currentStage === 'Initial')) return true;
            if (stageId === 'Qualified' && (currentStage === 'Qualified' || currentStage === 'Qualification')) return true;
            return currentStage === stageId;
        });
    };

    const getStageTotal = (stageId: string) => {
        return getStageOpportunities(stageId).reduce((sum, op) => sum + op.amount, 0);
    };

    const getTotalPipelineValue = () => {
        return opportunities.reduce((sum, op) => sum + op.amount, 0);
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading pipeline...</div>;
    }

    return (
        <div className="h-full flex flex-col bg-slate-50/50">
            {/* Header / Toolbar */}
            <div className="px-8 py-6 border-b border-slate-200 bg-white">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Sales Pipeline</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            Total Pipeline Value: <span className="text-emerald-600 font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(getTotalPipelineValue())}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                            <Download size={18} />
                            <span className="text-xs uppercase tracking-wider">Export</span>
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-indigo-100 shadow-lg"
                        >
                            <Plus size={18} />
                            <span className="text-xs uppercase tracking-wider">New Deal</span>
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search deals, contacts, or companies..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-lg text-sm transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
                    <div className="flex gap-4 h-full min-w-max pb-4">
                        {PIPELINE_STAGES.map(stage => (
                            <StageColumn
                                key={stage.id}
                                stageId={stage.id}
                                title={stage.title}
                                color={stage.color}
                                opportunities={getStageOpportunities(stage.id)}
                                totalValue={getStageTotal(stage.id)}
                                onClone={handleClone}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>
            </DragDropContext>

            {/* Modals */}
            <AddOpportunityModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchOpportunities}
            />
            <CloseReasonModal
                isOpen={closeModal.isOpen}
                isWin={closeModal.isWin}
                opportunityName={closeModal.opportunityName}
                onClose={() => setCloseModal({ isOpen: false, isWin: false, opportunityId: '', opportunityName: '' })}
                onConfirm={handleCloseConfirm}
            />
        </div>
    );
};

export default PipelineBoardPage;
