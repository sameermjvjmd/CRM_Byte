import { Mail, Phone, Calendar, FileText, Users, MessageSquare, Video, MapPin } from 'lucide-react';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    action: () => void;
}

interface QuickActionsMenuProps {
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    onScheduleCall?: () => void;
    onScheduleMeeting?: () => void;
    onSendEmail?: () => void;
    onAddNote?: () => void;
    onSendSMS?: () => void;
    onVideoCall?: () => void;
    onViewMap?: () => void;
    onCreateDocument?: () => void;
}

const QuickActionsMenu = ({
    contactName,
    contactEmail,
    contactPhone,
    onScheduleCall,
    onScheduleMeeting,
    onSendEmail,
    onAddNote,
    onSendSMS,
    onVideoCall,
    onViewMap,
    onCreateDocument
}: QuickActionsMenuProps) => {
    const actions: QuickAction[] = [
        {
            id: 'call',
            label: 'Schedule Call',
            icon: <Phone size={20} />,
            color: 'blue',
            action: onScheduleCall || (() => { })
        },
        {
            id: 'meeting',
            label: 'Schedule Meeting',
            icon: <Calendar size={20} />,
            color: 'purple',
            action: onScheduleMeeting || (() => { })
        },
        {
            id: 'email',
            label: 'Send Email',
            icon: <Mail size={20} />,
            color: 'indigo',
            action: onSendEmail || (() => { })
        },
        {
            id: 'document',
            label: 'Create Document',
            icon: <FileText size={20} />,
            color: 'amber',
            action: onCreateDocument || (() => { })
        },
        {
            id: 'note',
            label: 'Add Note',
            icon: <FileText size={20} />,
            color: 'green',
            action: onAddNote || (() => { })
        },
        {
            id: 'sms',
            label: 'Send SMS',
            icon: <MessageSquare size={20} />,
            color: 'pink',
            action: onSendSMS || (() => { })
        },
        {
            id: 'video',
            label: 'Video Call',
            icon: <Video size={20} />,
            color: 'cyan',
            action: onVideoCall || (() => { })
        },
        {
            id: 'map',
            label: 'View on Map',
            icon: <MapPin size={20} />,
            color: 'red',
            action: onViewMap || (() => { })
        }
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; hover: string }> = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'hover:bg-indigo-100' },
            green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100' },
            pink: { bg: 'bg-pink-50', text: 'text-pink-600', hover: 'hover:bg-pink-100' },
            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', hover: 'hover:bg-cyan-100' },
            red: { bg: 'bg-red-50', text: 'text-red-600', hover: 'hover:bg-red-100' }
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-indigo-600" />
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-wide">Quick Actions</h3>
                </div>
                {contactName && (
                    <p className="text-lg font-bold text-slate-900">for {contactName}</p>
                )}
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => {
                    const colors = getColorClasses(action.color);
                    return (
                        <button
                            key={action.id}
                            onClick={action.action}
                            className={`p-4 rounded-xl border-2 border-slate-200 ${colors.hover} transition-all group`}
                        >
                            <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                {action.icon}
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-slate-900">{action.label}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Contact Info */}
            {(contactEmail || contactPhone) && (
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                    {contactEmail && (
                        <div className="flex items-center gap-2 text-sm">
                            <Mail size={14} className="text-slate-400" />
                            <a href={`mailto:${contactEmail}`} className="font-bold text-indigo-600 hover:underline">
                                {contactEmail}
                            </a>
                        </div>
                    )}
                    {contactPhone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className="text-slate-400" />
                            <a href={`tel:${contactPhone}`} className="font-bold text-indigo-600 hover:underline">
                                {contactPhone}
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuickActionsMenu;
