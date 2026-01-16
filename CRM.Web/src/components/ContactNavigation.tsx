import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContactNavigationProps {
    currentIndex: number;
    totalContacts: number;
    onPrevious: () => void;
    onNext: () => void;
    contactName?: string;
}

const ContactNavigation = ({
    currentIndex,
    totalContacts,
    onPrevious,
    onNext,
    contactName
}: ContactNavigationProps) => {
    const displayIndex = currentIndex + 1; // 1-indexed for display

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-lg">
            {/* Previous button */}
            <button
                onClick={onPrevious}
                disabled={currentIndex === 0}
                className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Previous contact"
            >
                <ChevronLeft size={16} className="text-slate-600" />
            </button>

            {/* Counter */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">{displayIndex}</span>
                <span className="text-sm font-bold text-slate-400">of</span>
                <span className="text-sm font-black text-slate-900">{totalContacts}</span>
            </div>

            {/* Next button */}
            <button
                onClick={onNext}
                disabled={currentIndex >= totalContacts - 1}
                className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Next contact"
            >
                <ChevronRight size={16} className="text-slate-600" />
            </button>

            {/* Optional: Contact name */}
            {contactName && (
                <>
                    <div className="w-px h-6 bg-slate-200 mx-2"></div>
                    <span className="text-sm font-bold text-slate-600 truncate max-w-[200px]">
                        {contactName}
                    </span>
                </>
            )}
        </div>
    );
};

export default ContactNavigation;
