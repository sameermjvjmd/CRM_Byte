import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { LoginRequest, RegisterRequest, AuthState } from '../types/auth';
import authApi from '../api/authApi';

interface AuthContextType extends AuthState {
    login: (data: LoginRequest) => Promise<{ success: boolean; message?: string }>;
    register: (data: RegisterRequest) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        accessToken: null,
        refreshToken: null,
    });

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            const token = authApi.getAccessToken();
            const storedUser = authApi.getStoredUser();

            if (token && storedUser) {
                // Validate token with the server
                const isValid = await authApi.validateToken();

                if (isValid) {
                    setState({
                        user: storedUser,
                        isAuthenticated: true,
                        isLoading: false,
                        accessToken: token,
                        refreshToken: authApi.getRefreshToken(),
                    });
                } else {
                    // Try to refresh token
                    try {
                        const response = await authApi.refreshToken();
                        if (response.success && response.user) {
                            setState({
                                user: response.user,
                                isAuthenticated: true,
                                isLoading: false,
                                accessToken: response.accessToken || null,
                                refreshToken: response.refreshToken || null,
                            });
                        } else {
                            await authApi.logout();
                            setState({
                                user: null,
                                isAuthenticated: false,
                                isLoading: false,
                                accessToken: null,
                                refreshToken: null,
                            });
                        }
                    } catch {
                        await authApi.logout();
                        setState({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            accessToken: null,
                            refreshToken: null,
                        });
                    }
                }
            } else {
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        };

        initializeAuth();
    }, []);

    const login = useCallback(async (data: LoginRequest) => {
        try {
            const response = await authApi.login(data);

            if (response.success && response.user) {
                setState({
                    user: response.user,
                    isAuthenticated: true,
                    isLoading: false,
                    accessToken: response.accessToken || null,
                    refreshToken: response.refreshToken || null,
                });
                return { success: true };
            }

            return { success: false, message: response.message || 'Login failed' };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login failed';
            return { success: false, message };
        }
    }, []);

    const register = useCallback(async (data: RegisterRequest) => {
        try {
            const response = await authApi.register(data);
            return { success: response.success, message: response.message };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            return { success: false, message };
        }
    }, []);

    const logout = useCallback(async () => {
        await authApi.logout();
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            accessToken: null,
            refreshToken: null,
        });
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const user = await authApi.getCurrentUser();
            setState((prev) => ({ ...prev, user }));
        } catch {
            // If refresh fails, logout
            await logout();
        }
    }, [logout]);

    const hasPermission = useCallback((permission: string): boolean => {
        if (!state.user) return false;

        // Admin role has all permissions
        if (state.user.roles.includes('Admin')) return true;

        return state.user.permissions.includes(permission);
    }, [state.user]);

    const hasRole = useCallback((role: string): boolean => {
        if (!state.user) return false;
        return state.user.roles.includes(role);
    }, [state.user]);

    const hasAnyRole = useCallback((roles: string[]): boolean => {
        if (!state.user) return false;
        return roles.some((role) => state.user?.roles.includes(role));
    }, [state.user]);

    const value: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        refreshUser,
        hasPermission,
        hasRole,
        hasAnyRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth context
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

/**
 * Hook to check if user has a specific permission
 */
export const usePermission = (permission: string): boolean => {
    const { hasPermission } = useAuth();
    return hasPermission(permission);
};

/**
 * Hook to check if user has a specific role
 */
export const useRole = (role: string): boolean => {
    const { hasRole } = useAuth();
    return hasRole(role);
};

export default AuthContext;
