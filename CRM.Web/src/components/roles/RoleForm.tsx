import React, { useState, useEffect } from 'react';
import type { Role, PermissionCategory, CreateRoleRequest } from '../../types/auth';
import PermissionList from './PermissionList';
import { Save, AlertCircle } from 'lucide-react';

interface RoleFormProps {
    initialData?: Role;
    permissionCategories: PermissionCategory[];
    onSubmit: (data: CreateRoleRequest) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({
    initialData,
    permissionCategories,
    onSubmit,
    onCancel,
    isSubmitting
}) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Initialize selected permissions from initialData
    useEffect(() => {
        if (initialData) {
            setSelectedPermissions(initialData.permissions.map(p => p.id));
        }
    }, [initialData]);

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = 'Role name is required';
        }

        if (selectedPermissions.length === 0) {
            newErrors.permissions = 'At least one permission must be selected';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            await onSubmit({
                name,
                description,
                permissionIds: selectedPermissions
            });
        } catch (error) {
            // Error handling usually done by parent or global handler, 
            // but we could set form-level errors here if needed
            console.error('Form submission error', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    {initialData ? 'Edit Role Details' : 'Role Details'}
                </h3>

                <div className="grid grid-cols-1 gap-6 max-w-2xl">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                            Role Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={initialData?.isSystemRole}
                            className={`
                                w-full rounded-md border px-3 py-2 text-sm outline-none transition-all
                                ${errors.name
                                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                    : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                                }
                                ${initialData?.isSystemRole ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}
                            `}
                            placeholder="e.g. Sales Manager"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.name}
                            </p>
                        )}
                        {initialData?.isSystemRole && (
                            <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> System role names cannot be changed
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="Brief description of what this role can do..."
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Permissions</h3>
                    <p className="text-sm text-slate-500">Select the permissions assigned to this role.</p>
                    {errors.permissions && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-1 bg-red-50 p-2 rounded w-fit">
                            <AlertCircle className="w-4 h-4" /> {errors.permissions}
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <PermissionList
                        groupedPermissions={permissionCategories}
                        selectedPermissionIds={selectedPermissions}
                        onChange={setSelectedPermissions}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || (initialData?.isSystemRole && selectedPermissions.length === initialData.permissions.length && description === initialData.description)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            {initialData ? 'Update Role' : 'Create Role'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default RoleForm;
