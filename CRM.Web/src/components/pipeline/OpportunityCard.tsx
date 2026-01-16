import { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, DollarSign, AlertCircle, Calendar, Tag, MoreHorizontal, Copy, Share2, Trash2 } from 'lucide-react';
import type { Opportunity } from '../../types/opportunity';
import toast from 'react-hot-toast';

interface OpportunityCardProps {
    opportunity: Opportunity;
    index: number;
    onClone: () => void;
    onDelete: () => void;
}

const OpportunityCard = ({ opportunity, index, onClone, onDelete }: OpportunityCardProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    // Handle Share
    const handleShare = () => {
        const shareText = `Deal: ${opportunity.name}\nValue: $${opportunity.amount}\nStage: ${opportunity.stage}`;
        navigator.clipboard.writeText(shareText);
        toast.success('Deal details copied to clipboard');
        setShowMenu(false);
    };

    // Determine priority color based on probability
    const getProbabilityColor = (prob: number) => {
        if (prob >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (prob >= 50) return 'text-blue-600 bg-blue-50 border-blue-100';
        if (prob >= 25) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-slate-600 bg-slate-50 border-slate-100';
    };

    // Calculate days until close
    const daysUntilClose = () => {
        const today = new Date();
        const closeDate = new Date(opportunity.expectedCloseDate);
        const diffTime = closeDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = daysUntilClose();
    const isOverdue = daysLeft < 0;

    // Parse tags if they exist
    const tags = opportunity.tags ? JSON.parse(opportunity.tags) : [];

    return (
        <Draggable draggableId={opportunity.id?.toString() || ''} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                        relative bg-white p-4 rounded-xl border mb-3 shadow-sm hover:shadow-md transition-all group
                        ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 rotate-2' : 'border-slate-200'}
                    `}
                    style={provided.draggableProps.style}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 pr-6">{opportunity.name}</h4>

                        {/* Action Menu Trigger */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                            >
                                <MoreHorizontal size={14} />
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div className="absolute right-0 top-6 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onClone();
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <Copy size={12} /> Clone
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShare();
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <Share2 size={12} /> Share
                                    </button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete();
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <div className={`text-[10px] font-black px-2 py-0.5 rounded border ${getProbabilityColor(opportunity.probability)}`}>
                            {opportunity.probability}%
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                        <div className="p-1 rounded bg-slate-50 text-slate-400">
                            <DollarSign size={12} />
                        </div>
                        <span className="text-slate-900 font-extrabold text-sm">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(opportunity.amount)}
                        </span>
                    </div>

                    {opportunity.contact && (
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-50">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                                {opportunity.contact.firstName[0]}{opportunity.contact.lastName[0]}
                            </div>
                            <span className="text-xs text-slate-600 truncate max-w-[150px]">
                                {opportunity.contact.firstName} {opportunity.contact.lastName}
                            </span>
                        </div>
                    )}

                    {opportunity.nextAction && (
                        <div className="mb-3 px-2 py-1.5 bg-slate-50 rounded border border-slate-100">
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Next Action</div>
                            <div className="text-xs font-medium text-slate-700 truncate" title={opportunity.nextAction}>
                                {opportunity.nextAction}
                            </div>
                            {opportunity.nextActionDate && (
                                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {new Date(opportunity.nextActionDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    )}

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {tags.map((tag: string, i: number) => (
                                <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                                    <Tag size={10} className="text-slate-400" />
                                    {tag}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                            {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                            <span>{isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}</span>
                        </div>

                        {(opportunity.daysInCurrentStage || 0) > 0 && (
                            <div className="text-slate-400 flex items-center gap-1" title="Days in current stage">
                                <Clock size={12} />
                                <span>{opportunity.daysInCurrentStage}d</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default OpportunityCard;
