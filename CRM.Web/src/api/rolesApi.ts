import api from './api';
import type {
    Role,
    RoleListItem,
    Permission,
    PermissionCategory,
    CreateRoleRequest,
    UpdateRoleRequest,
    UpdateRolePermissionsRequest
} from '../types/auth';

/**
 * Roles API service for handling role and permission management
 */
export const rolesApi = {
    /**
     * Get all roles
     */
    getRoles: async (): Promise<Role[]> => {
        const response = await api.get<Role[]>('/roles');
        return response.data;
    },

    /**
     * Get role by ID
     */
    getRole: async (id: number): Promise<Role> => {
        const response = await api.get<Role>(`/roles/${id}`);
        return response.data;
    },

    /**
     * Get simple role list for dropdowns
     */
    getRoleList: async (): Promise<RoleListItem[]> => {
        const response = await api.get<RoleListItem[]>('/roles/list');
        return response.data;
    },

    /**
     * Create a new role
     */
    createRole: async (data: CreateRoleRequest): Promise<Role> => {
        const response = await api.post<Role>('/roles', data);
        return response.data;
    },

    /**
     * Update role details
     */
    updateRole: async (id: number, data: UpdateRoleRequest): Promise<void> => {
        await api.put(`/roles/${id}`, data);
    },

    /**
     * Update role permissions
     */
    updateRolePermissions: async (id: number, data: UpdateRolePermissionsRequest): Promise<void> => {
        await api.put(`/roles/${id}/permissions`, data);
    },

    /**
     * Delete a role
     */
    deleteRole: async (id: number): Promise<void> => {
        await api.delete(`/roles/${id}`);
    },

    /**
     * Get all permissions
     */
    getPermissions: async (): Promise<Permission[]> => {
        const response = await api.get<Permission[]>('/roles/permissions');
        return response.data;
    },

    /**
     * Get permissions grouped by category
     */
    getPermissionsGrouped: async (): Promise<PermissionCategory[]> => {
        const response = await api.get<PermissionCategory[]>('/roles/permissions/grouped');
        return response.data;
    }
};

export default rolesApi;
