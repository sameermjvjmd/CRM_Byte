import api from './api';
import type { UserDto, CreateUserRequest, UpdateUserRequest } from '../types/auth';

/**
 * Users API service for handling user management interactions
 */
export const usersApi = {
    /**
     * Get all users
     */
    getUsers: async (): Promise<UserDto[]> => {
        const response = await api.get<UserDto[]>('/users');
        return response.data;
    },

    /**
     * Get user by ID
     */
    getUser: async (id: number): Promise<UserDto> => {
        const response = await api.get<UserDto>(`/users/${id}`);
        return response.data;
    },

    /**
     * Create a new user (Admin only)
     */
    createUser: async (data: CreateUserRequest): Promise<UserDto> => {
        const response = await api.post<UserDto>('/users', data);
        return response.data;
    },

    /**
     * Update user details (Admin only)
     */
    updateUser: async (id: number, data: UpdateUserRequest): Promise<void> => {
        await api.put(`/users/${id}`, data);
    },

    /**
     * Toggle user active status (Admin only)
     */
    toggleStatus: async (id: number): Promise<{ message: string }> => {
        const response = await api.patch<{ message: string }>(`/users/${id}/status`);
        return response.data;
    },

    /**
     * Delete user (Admin only)
     */
    deleteUser: async (id: number): Promise<void> => {
        await api.delete(`/users/${id}`);
    }
};

export default usersApi;
