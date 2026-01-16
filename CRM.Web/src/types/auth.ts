// Auth-related types for the frontend

export interface User {
    id: number;
    email: string;
    fullName: string;
    avatarUrl?: string;
    roles: string[];
    permissions: string[];
}

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
    user?: User;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    phone?: string;
}

export interface RegisterResponse {
    success: boolean;
    message?: string;
    userId?: number;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

// Tenant registration types
export interface RegisterTenantRequest {
    subdomain: string;
    companyName: string;
    adminEmail: string;
    adminPassword: string;
    adminName: string;
    plan?: string;
}

export interface TenantResponse {
    success: boolean;
    message?: string;
    tenantId?: number;
    subdomain?: string;
    companyName?: string;
    loginUrl?: string;
}

export interface SubdomainCheckResponse {
    subdomain: string;
    available: boolean;
    message?: string;
}

// Auth context state
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    refreshToken: string | null;
}

// Role/Permission types
export interface Role {
    id: number;
    name: string;
    description?: string;
    isSystemRole: boolean;
    createdAt: string;
    permissions: Permission[];
    userCount: number;
}

export interface Permission {
    id: number;
    code: string;
    name: string;
    category: string;
    description?: string;
}

export interface PermissionCategory {
    category: string;
    permissions: Permission[];
}

export interface RoleListItem {
    id: number;
    name: string;
    isSystemRole: boolean;
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
    permissionIds: number[];
}

export interface UpdateRoleRequest {
    name: string;
    description?: string;
}

export interface UpdateRolePermissionsRequest {
    permissionIds: number[];
}

// User Management Types
export interface UserDto {
    id: number;
    email: string;
    fullName: string;
    jobTitle?: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
    role: string;
    roleId: number;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    fullName: string;
    jobTitle?: string;
    roleId: number;
}

export interface UpdateUserRequest {
    fullName: string;
    jobTitle?: string;
    roleId: number;
    password?: string;
}
