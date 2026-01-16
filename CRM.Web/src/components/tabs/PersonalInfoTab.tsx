import { useState } from 'react';
import { User, Edit, Save, X, Calendar, Users, Heart, Briefcase } from 'lucide-react';

interface PersonalInfo {
    dateOfBirth?: string;
    spouse?: string;
    children?: string;
    hobbies?: string;
    achievements?: string;
    personalNotes?: string;
    anniversary?: string;
    education?: string;
    linkedin?: string;
    twitter?: string;
}

interface PersonalInfoTabProps {
    contactId: number;
    personalInfo: PersonalInfo;
    onUpdate: (info: PersonalInfo) => void;
}

const PersonalInfoTab = ({ contactId, personalInfo, onUpdate }: PersonalInfoTabProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<PersonalInfo>(personalInfo);

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(personalInfo);
        setIsEditing(false);
    };

    const handleChange = (field: keyof PersonalInfo, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const InfoItem = ({ icon, label, value, editable = true }: any) => (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
            </div>
            {isEditing && editable ? (
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleChange(label.toLowerCase().replace(' ', '') as keyof PersonalInfo, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Enter ${label.toLowerCase()}...`}
                />
            ) : (
                <p className="font-bold text-slate-900">{value || <span className="text-slate-400 italic">Not provided</span>}</p>
            )}
        </div>
    );

    const TextAreaItem = ({ label, value, field }: { label: string; value?: string; field: keyof PersonalInfo }) => (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{label}</label>
            {isEditing ? (
                <textarea
                    value={value || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                    placeholder={`Enter ${label.toLowerCase()}...`}
                />
            ) : (
                <p className="font-bold text-slate-900 whitespace-pre-wrap">{value || <span className="text-slate-400 italic">Not provided</span>}</p>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Personal Information</h3>
                    <p className="text-sm font-bold text-slate-500">Personal details and life events</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <Edit size={16} />
                        Edit
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            <Save size={16} />
                            Save
                        </button>
                    </div>
                )}
            </div>

            {/* Important Dates */}
            <div>
                <h4 className="text-sm font-black uppercase text-slate-400 tracking-wide mb-3">Important Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-pink-600" />
                            <label className="text-xs font-bold text-pink-600 uppercase">Date of Birth</label>
                        </div>
                        {isEditing ? (
                            <input
                                type="date"
                                value={formData.dateOfBirth || ''}
                                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                className="w-full px-3 py-2 border border-pink-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        ) : (
                            <p className="font-bold text-pink-900">
                                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : <span className="text-pink-400 italic">Not set</span>}
                            </p>
                        )}
                    </div>

                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart size={16} className="text-purple-600" />
                            <label className="text-xs font-bold text-purple-600 uppercase">Anniversary</label>
                        </div>
                        {isEditing ? (
                            <input
                                type="date"
                                value={formData.anniversary || ''}
                                onChange={(e) => handleChange('anniversary', e.target.value)}
                                className="w-full px-3 py-2 border border-purple-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        ) : (
                            <p className="font-bold text-purple-900">
                                {formData.anniversary ? new Date(formData.anniversary).toLocaleDateString() : <span className="text-purple-400 italic">Not set</span>}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Family */}
            <div>
                <h4 className="text-sm font-black uppercase text-slate-400 tracking-wide mb-3">Family</h4>
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={<Users size={14} className="text-blue-600" />} label="Spouse" value={formData.spouse} />
                    <InfoItem icon={<Users size={14} className="text-green-600" />} label="Children" value={formData.children} />
                </div>
            </div>

            {/* Professional */}
            <div>
                <h4 className="text-sm font-black uppercase text-slate-400 tracking-wide mb-3">Professional</h4>
                <div className="grid grid-cols-1 gap-4">
                    <InfoItem icon={<Briefcase size={14} className="text-indigo-600" />} label="Education" value={formData.education} />
                </div>
            </div>

            {/* Personal Details */}
            <div>
                <h4 className="text-sm font-black uppercase text-slate-400 tracking-wide mb-3">Personal Details</h4>
                <div className="space-y-4">
                    <TextAreaItem label="Hobbies & Interests" value={formData.hobbies} field="hobbies" />
                    <TextAreaItem label="Achievements" value={formData.achievements} field="achievements" />
                    <TextAreaItem label="Personal Notes" value={formData.personalNotes} field="personalNotes" />
                </div>
            </div>

            {/* Social Media */}
            <div>
                <h4 className="text-sm font-black uppercase text-slate-400 tracking-wide mb-3">Social Media</h4>
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={<span className="text-blue-600 font-bold text-xs">in</span>} label="LinkedIn" value={formData.linkedin} />
                    <InfoItem icon={<span className="text-sky-600 font-bold text-xs">𝕏</span>} label="Twitter" value={formData.twitter} />
                </div>
            </div>

            {/* Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <User size={16} className="text-amber-600 mt-0.5" />
                    <div className="text-xs font-bold text-amber-800">
                        <strong>Private Information:</strong> This tab contains sensitive personal details. Use this information appropriately and respect privacy.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoTab;
export type { PersonalInfo };
