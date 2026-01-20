import api from './api';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    RefreshTokenRequest,
    User,
    RegisterTenantRequest,
    TenantResponse,
    SubdomainCheckResponse
} from '../types/auth';

const TOKEN_KEY = 'nexus_access_token';
const REFRESH_TOKEN_KEY = 'nexus_refresh_token';
const USER_KEY = 'nexus_user';

/**
 * Auth API service for handling authentication operations
 */
export const authApi = {
    /**
     * Login with email and password
     */
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', data);

        if (response.data.success && response.data.accessToken) {
            // Store tokens
            localStorage.setItem(TOKEN_KEY, response.data.accessToken);
            if (response.data.refreshToken) {
                localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
            }
            if (response.data.user) {
                localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
            }
        }

        return response.data;
    },

    /**
     * Register a new user
     */
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await api.post<RegisterResponse>('/auth/register', data);
        return response.data;
    },

    /**
     * Refresh access token
     */
    refreshToken: async (): Promise<LoginResponse> => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await api.post<LoginResponse>('/auth/refresh', {
            refreshToken
        } as RefreshTokenRequest);

        if (response.data.success && response.data.accessToken) {
            localStorage.setItem(TOKEN_KEY, response.data.accessToken);
            if (response.data.refreshToken) {
                localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
            }
            if (response.data.user) {
                localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
            }
        }

        return response.data;
    },

    /**
     * Logout - revoke refresh token and clear storage
     */
    logout: async (): Promise<void> => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (refreshToken) {
            try {
                await api.post('/auth/logout', { refreshToken });
            } catch {
                // Ignore errors on logout
            }
        }

        // Clear storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    /**
     * Get current user from API
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        return response.data;
    },

    /**
     * Validate current token
     */
    validateToken: async (): Promise<boolean> => {
        try {
            await api.get('/auth/validate');
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Check if user has a specific permission
     */
    checkPermission: async (permission: string): Promise<boolean> => {
        try {
            const response = await api.get<{ permission: string; hasAccess: boolean }>(
                `/auth/check-permission/${permission}`
            );
            return response.data.hasAccess;
        } catch {
            return false;
        }
    },

    // ========== Token Management ==========

    /**
     * Get stored access token
     */
    getAccessToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Get stored refresh token
     */
    getRefreshToken: (): string | null => {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    /**
     * Get stored user
     */
    getStoredUser: (): User | null => {
        const userStr = localStorage.getItem(USER_KEY);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    /**
     * Check if user is authenticated (has valid token in storage)
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    // ========== Tenant Registration ==========

    /**
     * Check subdomain availability
     */
    checkSubdomain: async (subdomain: string): Promise<SubdomainCheckResponse> => {
        const response = await api.get<SubdomainCheckResponse>(
            `/tenants/check-subdomain/${subdomain}`
        );
        return response.data;
    },

    /**
     * Register a new tenant (organization)
     */
    registerTenant: async (data: RegisterTenantRequest): Promise<TenantResponse> => {
        try {
            const response = await api.post<TenantResponse>('/tenants/register', data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error('Tenant Registration API Error Response:', error.response.data);
                return error.response.data;
            }
            throw error;
        }
    }
};

export { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY };
export default authApi;
