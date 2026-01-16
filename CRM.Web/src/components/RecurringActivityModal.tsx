import { useState } from 'react';
import { X, Repeat, Calendar } from 'lucide-react';

interface RecurringPattern {
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
    interval: number;
    daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
    dayOfMonth?: number;
    endDate?: string;
    occurrences?: number;
}

interface RecurringActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (pattern: RecurringPattern) => void;
    initialPattern?: RecurringPattern;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const RecurringActivityModal = ({ isOpen, onClose, onSave, initialPattern }: RecurringActivityModalProps) => {
    const [frequency, setFrequency] = useState<RecurringPattern['frequency']>(initialPattern?.frequency || 'Weekly');
    const [interval, setInterval] = useState(initialPattern?.interval || 1);
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialPattern?.daysOfWeek || []);
    const [dayOfMonth, setDayOfMonth] = useState(initialPattern?.dayOfMonth || 1);
    const [endType, setEndType] = useState<'never' | 'date' | 'occurrences'>('never');
    const [endDate, setEndDate] = useState(initialPattern?.endDate || '');
    const [occurrences, setOccurrences] = useState(initialPattern?.occurrences || 10);

    const toggleDayOfWeek = (day: number) => {
        setDaysOfWeek(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day].sort()
        );
    };

    const handleSave = () => {
        const pattern: RecurringPattern = {
            frequency,
            interval,
            ...(frequency === 'Weekly' && { daysOfWeek }),
            ...(frequency === 'Monthly' && { dayOfMonth }),
            ...(endType === 'date' && { endDate }),
            ...(endType === 'occurrences' && { occurrences }),
        };
        onSave(pattern);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <Repeat size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Recurring Activity</h2>
                                <p className="text-sm font-bold text-slate-500">Set up repeating schedule</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Frequency */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">Repeat Every</label>
                            <div className="flex gap-3">
                                <select
                                    value={interval}
                                    onChange={(e) => setInterval(Number(e.target.value))}
                                    className="px-4 py-2 border border-slate-200 rounded-lg font-bold w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                                <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value as RecurringPattern['frequency'])}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Daily">Day(s)</option>
                                    <option value="Weekly">Week(s)</option>
                                    <option value="Monthly">Month(s)</option>
                                    <option value="Yearly">Year(s)</option>
                                </select>
                            </div>
                        </div>

                        {/* Weekly - Days of Week */}
                        {frequency === 'Weekly' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Repeat On</label>
                                <div className="flex gap-2">
                                    {WEEKDAYS.map((day, index) => (
                                        <button
                                            key={day}
                                            onClick={() => toggleDayOfWeek(index)}
                                            className={`flex-1 py-3 rounded-lg border-2 font-bold text-sm transition-all ${daysOfWeek.includes(index)
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Monthly - Day of Month */}
                        {frequency === 'Monthly' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Day of Month</label>
                                <select
                                    value={dayOfMonth}
                                    onChange={(e) => setDayOfMonth(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">Ends</label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="endType"
                                        checked={endType === 'never'}
                                        onChange={() => setEndType('never')}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-bold text-slate-700">Never</span>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="endType"
                                        checked={endType === 'date'}
                                        onChange={() => setEndType('date')}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-bold text-slate-700">On</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setEndType('date');
                                        }}
                                        className="px-3 py-2 border border-slate-200 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="endType"
                                        checked={endType === 'occurrences'}
                                        onChange={() => setEndType('occurrences')}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-bold text-slate-700">After</span>
                                    <input
                                        type="number"
                                        value={occurrences}
                                        onChange={(e) => {
                                            setOccurrences(Number(e.target.value));
                                            setEndType('occurrences');
                                        }}
                                        min="1"
                                        className="w-20 px-3 py-2 border border-slate-200 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="font-bold text-slate-700">occurrences</span>
                                </label>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-slate-400" />
                                <span className="text-xs font-black uppercase text-slate-400 tracking-wide">Summary</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700">
                                Repeats every {interval} {frequency.toLowerCase()}
                                {frequency === 'Weekly' && daysOfWeek.length > 0 && ` on ${daysOfWeek.map(d => WEEKDAYS[d]).join(', ')}`}
                                {frequency === 'Monthly' && ` on day ${dayOfMonth}`}.
                                {endType === 'never' && ' Never ends.'}
                                {endType === 'date' && ` Ends on ${endDate}.`}
                                {endType === 'occurrences' && ` Ends after ${occurrences} occurrences.`}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-white border border-slate-200 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            Save Recurrence
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecurringActivityModal;
export type { RecurringPattern };
