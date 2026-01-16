import { useState } from 'react';
import { FileText, Phone, Mail, Users, Calendar, CheckSquare } from 'lucide-react';

interface ActivityTemplate {
    id: string;
    name: string;
    type: string;
    duration: number;
    description: string;
    icon: React.ReactNode;
    color: string;
}

interface ActivityTemplateSelectorProps {
    onSelectTemplate: (template: ActivityTemplate) => void;
}

const DEFAULT_TEMPLATES: ActivityTemplate[] = [
    {
        id: 'follow-up-call',
        name: 'Follow-up Call',
        type: 'Call',
        duration: 15,
        description: 'Standard follow-up call with client',
        icon: <Phone size={20} />,
        color: 'blue'
    },
    {
        id: 'client-meeting',
        name: 'Client Meeting',
        type: 'Meeting',
        duration: 60,
        description: 'In-person or virtual client meeting',
        icon: <Users size={20} />,
        color: 'purple'
    },
    {
        id: 'send-proposal',
        name: 'Send Proposal',
        type: 'To-Do',
        duration: 30,
        description: 'Prepare and send proposal to client',
        icon: <CheckSquare size={20} />,
        color: 'green'
    },
    {
        id: 'send-email',
        name: 'Send Follow-up Email',
        type: 'Email',
        duration: 10,
        description: 'Send follow-up email after meeting',
        icon: <Mail size={20} />,
        color: 'indigo'
    },
    {
        id: 'quarterly-review',
        name: 'Quarterly Business Review',
        type: 'Meeting',
        duration: 90,
        description: 'Quarterly review with key stakeholders',
        icon: <Calendar size={20} />,
        color: 'orange'
    },
    {
        id: 'discovery-call',
        name: 'Discovery Call',
        type: 'Call',
        duration: 30,
        description: 'Initial discovery call with prospect',
        icon: <Phone size={20} />,
        color: 'cyan'
    },
];

const ActivityTemplateSelector = ({ onSelectTemplate }: ActivityTemplateSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTemplates = DEFAULT_TEMPLATES.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; hover: string }> = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
            green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'hover:bg-indigo-100' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:bg-orange-100' },
            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', hover: 'hover:bg-cyan-100' },
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <FileText size={24} className="text-indigo-600" />
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Activity Templates</h3>
                        <p className="text-sm font-bold text-slate-500">Quick start with pre-configured activities</p>
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(template => {
                    const colors = getColorClasses(template.color);
                    return (
                        <button
                            key={template.id}
                            onClick={() => onSelectTemplate(template)}
                            className={`p-4 rounded-xl border-2 border-slate-200 ${colors.hover} transition-all text-left group`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0`}>
                                    {template.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-slate-900 mb-1">{template.name}</h4>
                                    <p className="text-xs font-bold text-slate-500 mb-2">{template.description}</p>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                        <span>{template.type}</span>
                                        <span>•</span>
                                        <span>{template.duration} min</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-sm font-bold text-slate-500">No templates found</p>
                </div>
            )}
        </div>
    );
};

export default ActivityTemplateSelector;
export type { ActivityTemplate };
export { DEFAULT_TEMPLATES };
