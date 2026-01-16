import React, { useState, useEffect } from 'react';
import type { CreateUserRequest, UserDto, RoleListItem } from '../../types/auth';
import { Save, X, Eye, EyeOff } from 'lucide-react';
import rolesApi from '../../api/rolesApi';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateUserRequest) => Promise<void>;
    initialData?: UserDto;
    isSubmitting: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isSubmitting
}) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [roleId, setRoleId] = useState<number>(0);
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState<RoleListItem[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isOpen) {
            loadRoles();
            if (initialData) {
                setFullName(initialData.fullName);
                setEmail(initialData.email);
                setJobTitle(initialData.jobTitle || '');
                setRoleId(initialData.roleId);
                setPassword(''); // Don't show password on edit
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    const loadRoles = async () => {
        try {
            const data = await rolesApi.getRoleList();
            setRoles(data);
            // Default to 'User' role if creating new and user role exists (id 3 usually)
            if (!initialData && data.length > 0) {
                const defaultRole = data.find(r => r.name === 'User') || data[0];
                setRoleId(defaultRole.id);
            }
        } catch (err) {
            console.error('Failed to load roles', err);
        }
    };

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setPassword('');
        setJobTitle('');
        setRoleId(0);
        setErrors({});
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';

        if (!initialData && !password) {
            newErrors.password = 'Password is required for new users';
        } else if (password && password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (roleId === 0) newErrors.roleId = 'Role is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        await onSubmit({
            fullName,
            email,
            password, // If editing and empty, handled by parent/API logic
            jobTitle,
            roleId
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {initialData ? 'Edit User' : 'Add New User'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition-all
                                ${errors.fullName ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'}`}
                            placeholder="e.g. John Doe"
                        />
                        {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!!initialData} // Email immutable on edit for now
                            className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition-all
                                ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'}
                                ${initialData ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                            placeholder="john@company.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Job Title
                        </label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-indigo-500 transition-all"
                            placeholder="e.g. Sales Manager"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={roleId}
                            onChange={(e) => setRoleId(Number(e.target.value))}
                            className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition-all
                                ${errors.roleId ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'}`}
                        >
                            <option value={0} disabled>Select a role</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name} {role.isSystemRole ? '(System)' : ''}
                                </option>
                            ))}
                        </select>
                        {errors.roleId && <p className="mt-1 text-xs text-red-500">{errors.roleId}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {initialData ? 'New Password (Optional)' : 'Password'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition-all pr-10
                                    ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'}`}
                                placeholder={initialData ? 'Leave blank to keep current' : 'Min. 8 characters'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {isSubmitting ? 'Saving...' : (
                                <>
                                    <Save size={16} />
                                    {initialData ? 'Update User' : 'Create User'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;
