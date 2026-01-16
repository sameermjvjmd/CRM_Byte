interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
    const getStatusStyles = (status: string) => {
        const normalizedStatus = status.toLowerCase();

        switch (normalizedStatus) {
            case 'active':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'inactive':
                return 'bg-slate-50 text-slate-500 border-slate-200';
            case 'prospect':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'customer':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'vendor':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'lead':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'qualified':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'unqualified':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-2 py-0.5 text-[9px]';
            case 'md':
                return 'px-3 py-1 text-[10px]';
            case 'lg':
                return 'px-4 py-1.5 text-xs';
            default:
                return 'px-3 py-1 text-[10px]';
        }
    };

    return (
        <span
            className={`
                inline-flex items-center justify-center
                rounded-full font-black uppercase tracking-wider
                border
                ${getStatusStyles(status)}
                ${getSizeClasses()}
            `}
        >
            {status}
        </span>
    );
};

export default StatusBadge;

// Usage example:
// <StatusBadge status="Active" />
// <StatusBadge status="Prospect" size="lg" />
// <StatusBadge status="Customer" size="sm" />
