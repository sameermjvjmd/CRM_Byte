import {
    Mail, Phone, Calendar, CheckSquare, Users, FileText, Video, Coffee, MessageSquare,
    PhoneOff, PhoneForwarded, Sun, RefreshCw, User, Printer, Star
} from 'lucide-react';

interface ActivityType {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    hexColor: string;
}

interface ActivityTypeSelectorProps {
    selectedType: string;
    onTypeChange: (type: string) => void;
    layout?: 'grid' | 'list' | 'compact';
    showAll?: boolean;
}

// Primary activity types (always shown)
const PRIMARY_ACTIVITY_TYPES: ActivityType[] = [
    { id: 'Call', label: 'Call', icon: <Phone size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', hexColor: '#3B82F6' },
    { id: 'Meeting', label: 'Meeting', icon: <Users size={20} />, color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100', hexColor: '#8B5CF6' },
    { id: 'To-Do', label: 'To-Do', icon: <CheckSquare size={20} />, color: 'text-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100', hexColor: '#F97316' },
    { id: 'Email', label: 'Email', icon: <Mail size={20} />, color: 'text-cyan-600', bgColor: 'bg-cyan-50 hover:bg-cyan-100', hexColor: '#06B6D4' },
    { id: 'Follow-up', label: 'Follow-up', icon: <RefreshCw size={20} />, color: 'text-amber-600', bgColor: 'bg-amber-50 hover:bg-amber-100', hexColor: '#F59E0B' },
    { id: 'Appointment', label: 'Appointment', icon: <Calendar size={20} />, color: 'text-pink-600', bgColor: 'bg-pink-50 hover:bg-pink-100', hexColor: '#EC4899' },
];

// Extended activity types
const EXTENDED_ACTIVITY_TYPES: ActivityType[] = [
    { id: 'CallAttempt', label: 'Call Attempt', icon: <PhoneOff size={20} />, color: 'text-indigo-600', bgColor: 'bg-indigo-50 hover:bg-indigo-100', hexColor: '#6366F1' },
    { id: 'CallReached', label: 'Call Reached', icon: <PhoneForwarded size={20} />, color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100', hexColor: '#22C55E' },
    { id: 'CallLeftMessage', label: 'Left Message', icon: <MessageSquare size={20} />, color: 'text-yellow-600', bgColor: 'bg-yellow-50 hover:bg-yellow-100', hexColor: '#EAB308' },
    { id: 'Event', label: 'Event', icon: <Star size={20} />, color: 'text-teal-600', bgColor: 'bg-teal-50 hover:bg-teal-100', hexColor: '#14B8A6' },
    { id: 'Personal', label: 'Personal', icon: <User size={20} />, color: 'text-slate-600', bgColor: 'bg-slate-50 hover:bg-slate-100', hexColor: '#64748B' },
    { id: 'Vacation', label: 'Vacation/OOO', icon: <Sun size={20} />, color: 'text-emerald-600', bgColor: 'bg-emerald-50 hover:bg-emerald-100', hexColor: '#10B981' },
    { id: 'Video Call', label: 'Video Call', icon: <Video size={20} />, color: 'text-cyan-600', bgColor: 'bg-cyan-50 hover:bg-cyan-100', hexColor: '#06B6D4' },
    { id: 'Lunch', label: 'Lunch', icon: <Coffee size={20} />, color: 'text-amber-600', bgColor: 'bg-amber-50 hover:bg-amber-100', hexColor: '#F59E0B' },
    { id: 'Letter', label: 'Letter', icon: <FileText size={20} />, color: 'text-lime-600', bgColor: 'bg-lime-50 hover:bg-lime-100', hexColor: '#84CC16' },
    { id: 'Fax', label: 'Fax', icon: <Printer size={20} />, color: 'text-stone-600', bgColor: 'bg-stone-50 hover:bg-stone-100', hexColor: '#78716C' },
];

// All activity types combined
const ACTIVITY_TYPES: ActivityType[] = [...PRIMARY_ACTIVITY_TYPES, ...EXTENDED_ACTIVITY_TYPES];

const ActivityTypeSelector = ({ selectedType, onTypeChange, layout = 'grid', showAll = false }: ActivityTypeSelectorProps) => {
    const typesToShow = showAll ? ACTIVITY_TYPES : PRIMARY_ACTIVITY_TYPES;

    if (layout === 'compact') {
        return (
            <div className="flex flex-wrap gap-2">
                {typesToShow.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => onTypeChange(type.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${selectedType === type.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : `${type.bgColor} ${type.color}`
                            }`}
                    >
                        {type.icon}
                        {type.label}
                    </button>
                ))}
            </div>
        );
    }

    if (layout === 'grid') {
        return (
            <div className="grid grid-cols-3 gap-3">
                {typesToShow.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => onTypeChange(type.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedType === type.id
                            ? 'border-indigo-500 shadow-lg shadow-indigo-200'
                            : 'border-slate-200'
                            } ${type.bgColor}`}
                    >
                        <div className={`flex flex-col items-center gap-2 ${type.color}`}>
                            {type.icon}
                            <span className="text-xs font-bold">{type.label}</span>
                        </div>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {typesToShow.map((type) => (
                <button
                    key={type.id}
                    onClick={() => onTypeChange(type.id)}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${selectedType === type.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <div className={`${type.color}`}>{type.icon}</div>
                    <span className="text-sm font-bold text-slate-900">{type.label}</span>
                </button>
            ))}
        </div>
    );
};

// Helper to get color by type
export const getActivityTypeColor = (typeId: string): string => {
    const type = ACTIVITY_TYPES.find(t => t.id === typeId);
    return type?.hexColor || '#6366F1';
};

export default ActivityTypeSelector;
export { ACTIVITY_TYPES, PRIMARY_ACTIVITY_TYPES, EXTENDED_ACTIVITY_TYPES };
