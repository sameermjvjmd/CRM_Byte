import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Role, PermissionCategory, CreateRoleRequest } from '../../types/auth';
import rolesApi from '../../api/rolesApi';
import RoleForm from '../../components/roles/RoleForm';
import { ChevronLeft } from 'lucide-react';

const RoleManagePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [role, setRole] = useState<Role | undefined>(undefined);
    const [permissions, setPermissions] = useState<PermissionCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch permissions first as they are needed for both modes
                const permsData = await rolesApi.getPermissionsGrouped();
                setPermissions(permsData);

                if (isEditMode && id) {
                    const roleId = parseInt(id, 10);
                    const roleData = await rolesApi.getRole(roleId);
                    setRole(roleData);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, isEditMode]);

    const handleSubmit = async (data: CreateRoleRequest) => {
        setIsSubmitting(true);
        try {
            if (isEditMode && role) {
                // Determine what changed
                if (data.name !== role.name || data.description !== role.description) {
                    await rolesApi.updateRole(role.id, {
                        name: data.name,
                        description: data.description
                    });
                }

                // Always update permissions to be safe, or check diff
                // Simple approach: just update
                await rolesApi.updateRolePermissions(role.id, {
                    permissionIds: data.permissionIds
                });

            } else {
                await rolesApi.createRole(data);
            }
            navigate('/settings/roles');
        } catch (err) {
            console.error(err);
            // Ideally set error state to show in form
            alert('Failed to save role. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={() => navigate('/settings/roles')}
                    className="mt-4 text-indigo-600 hover:underline"
                >
                    Back to Roles
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <button
                onClick={() => navigate('/settings/roles')}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
                Back to Roles
            </button>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    {isEditMode ? `Edit Role: ${role?.name}` : 'Create New Role'}
                </h1>
                <p className="text-slate-500 mt-1">
                    {isEditMode
                        ? 'Modify role details and permissions.'
                        : 'Define a new role and assign its capabilities.'}
                </p>
            </div>

            <RoleForm
                initialData={role}
                permissionCategories={permissions}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/settings/roles')}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default RoleManagePage;
