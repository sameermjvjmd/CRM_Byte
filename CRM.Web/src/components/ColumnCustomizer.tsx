import { useState } from 'react';
import { Columns, Eye, EyeOff, GripVertical, X } from 'lucide-react';

interface Column {
    id: string;
    label: string;
    visible: boolean;
    order: number;
}

interface ColumnCustomizerProps {
    columns: Column[];
    onColumnsChange: (columns: Column[]) => void;
    isOpen: boolean;
    onClose: () => void;
}

const ColumnCustomizer = ({ columns, onColumnsChange, isOpen, onClose }: ColumnCustomizerProps) => {
    const [localColumns, setLocalColumns] = useState(columns);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const toggleColumn = (id: string) => {
        setLocalColumns(prev =>
            prev.map(col =>
                col.id === id ? { ...col, visible: !col.visible } : col
            )
        );
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newColumns = [...localColumns];
        const draggedItem = newColumns[draggedIndex];
        newColumns.splice(draggedIndex, 1);
        newColumns.splice(index, 0, draggedItem);

        setLocalColumns(newColumns.map((col, i) => ({ ...col, order: i })));
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleApply = () => {
        onColumnsChange(localColumns);
        onClose();
    };

    const handleReset = () => {
        const resetColumns = columns.map((col, index) => ({
            ...col,
            visible: true,
            order: index
        }));
        setLocalColumns(resetColumns);
    };

    if (!isOpen) return null;

    const visibleCount = localColumns.filter(col => col.visible).length;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Columns size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Customize Columns</h2>
                            <p className="text-sm font-bold text-slate-500">{visibleCount} of {localColumns.length} visible</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Instructions */}
                <div className="p-6 bg-blue-50 border-b border-blue-200">
                    <p className="text-sm font-bold text-blue-900">
                        <strong>Drag</strong> to reorder • <strong>Click eye</strong> to show/hide
                    </p>
                </div>

                {/* Columns List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-2">
                        {localColumns.map((column, index) => (
                            <div
                                key={column.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center gap-3 p-4 bg-slate-50 border-2 rounded-xl cursor-move transition-all ${draggedIndex === index
                                        ? 'border-indigo-500 shadow-lg'
                                        : 'border-slate-200 hover:border-slate-300'
                                    } ${!column.visible ? 'opacity-50' : ''}`}
                            >
                                {/* Drag Handle */}
                                <div className="text-slate-400 cursor-grab active:cursor-grabbing">
                                    <GripVertical size={20} />
                                </div>

                                {/* Column Label */}
                                <div className="flex-1 font-bold text-slate-900 select-none">
                                    {column.label}
                                </div>

                                {/* Visibility Toggle */}
                                <button
                                    onClick={() => toggleColumn(column.id)}
                                    className={`p-2 rounded-lg transition-all ${column.visible
                                            ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                            : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                        }`}
                                >
                                    {column.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-6 py-3 bg-white border border-slate-200 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-100 transition-all"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </>
    );
};

export default ColumnCustomizer;
export type { Column };
