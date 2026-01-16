import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../../types/auth';
import rolesApi from '../../api/rolesApi';
import { Plus, Shield, Users, Edit2, Trash2, Lock } from 'lucide-react';

const RolesPage: React.FC = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const data = await rolesApi.getRoles();
            setRoles(data);
            setError(null);
        } catch (err) {
            setError('Failed to load roles. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await rolesApi.deleteRole(id);
            setDeleteConfirmId(null);
            loadRoles(); // Reload list
        } catch (err) {
            console.error('Failed to delete role', err);
            // Ideally show toast notification
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
                    <p className="text-slate-500 mt-1">Manage access control and assign permissions to user roles.</p>
                </div>
                <button
                    onClick={() => navigate('/settings/roles/new')}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Create New Role
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
                    >
                        <div className="p-5 flex-1">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-md ${role.isSystemRole ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {role.isSystemRole ? <Lock className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                </div>
                                {role.isSystemRole && (
                                    <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                        SYSTEM
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 mb-1">{role.name}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[2.5em]">
                                {role.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{role.userCount} Users</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>{role.permissions.length} Permissions</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={() => navigate(`/settings/roles/${role.id}`)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit Role
                            </button>

                            {!role.isSystemRole && (
                                deleteConfirmId === role.id ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-red-600 font-medium">Confirm?</span>
                                        <button
                                            onClick={() => handleDelete(role.id)}
                                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(null)}
                                            className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300"
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirmId(role.id)}
                                        className="text-sm font-medium text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                                        disabled={role.userCount > 0}
                                        title={role.userCount > 0 ? "Cannot delete role assigned to users" : "Delete Role"}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RolesPage;
