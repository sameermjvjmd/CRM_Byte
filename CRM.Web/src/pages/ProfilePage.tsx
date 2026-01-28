import { useState, useEffect } from 'react';
import { User, Shield, Key, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import profileApi, { type UpdateProfileRequest, type ChangePasswordRequest } from '../api/profileApi';
import TwoFactorSetup from '../components/auth/TwoFactorSetup';

const ProfilePage = () => {
    const { user, refreshUser } = useAuth(); // Assuming refreshUser exists, if not I'll just rely on state or reload
    const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState<UpdateProfileRequest>({
        fullName: '',
        jobTitle: '',
        phone: ''
    });

    const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await profileApi.getProfile();
            setFormData({
                fullName: data.fullName,
                jobTitle: data.jobTitle || '',
                phone: '' // Phone might not be in UserDto yet
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile");
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await profileApi.updateProfile(formData);
            toast.success("Profile updated!");
            // refreshUser(); // If implemented
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await profileApi.changePassword(passwordData);
            toast.success("Password changed successfully");
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-full">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage your personal information and security settings</p>
                </header>

                <div className="flex gap-8 items-start">
                    {/* Sidebar Tabs */}
                    <div className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                    {user?.fullName?.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-bold text-slate-900 truncate">{user?.fullName}</div>
                                    <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                                </div>
                            </div>
                        </div>
                        <nav className="p-2 space-y-1">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <User size={18} />
                                General Info
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Shield size={18} />
                                Security
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
                        {activeTab === 'general' ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4">Personal Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Title</label>
                                            <input
                                                type="text"
                                                value={formData.jobTitle}
                                                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                disabled
                                                value={user?.email || ''}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 bg-slate-50 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-slate-400 mt-1">Email cannot be changed. Contact admin for help.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
                                    >
                                        <Save size={16} />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8">
                                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Key size={20} className="text-indigo-600" />
                                            Change Password
                                        </h2>
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3 text-amber-800 text-xs">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <p>You will be required to log in again after changing your password.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.currentPassword}
                                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    minLength={6}
                                                    value={passwordData.newPassword}
                                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                />
                                                <p className="text-xs text-slate-400 mt-1">Must be at least 6 characters long</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
                                        >
                                            <Save size={16} />
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>

                                <div className="pt-8 border-t border-slate-100">
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Shield size={20} className="text-indigo-600" />
                                        Two-Factor Authentication
                                    </h2>

                                    {user?.roles?.includes('Admin') ? (
                                        <div className="max-w-2xl">
                                            {user?.twoFactorEnabled ? (
                                                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
                                                    <div className="flex items-center gap-3 text-green-700">
                                                        <CheckCircle className="w-6 h-6" />
                                                        <div>
                                                            <h3 className="font-semibold text-sm">Two-Factor Authentication is Active</h3>
                                                            <p className="text-xs text-green-600">Your account is secured with a second layer of authentication.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <TwoFactorSetup onComplete={() => {
                                                    toast.success("2FA enabled successfully!");
                                                    refreshUser();
                                                }} />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-500 text-sm italic">
                                            Two-factor authentication is currently managed by your administrator.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
