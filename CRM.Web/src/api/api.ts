import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'nexus_access_token';
const REFRESH_TOKEN_KEY = 'nexus_refresh_token';

// Extract tenant from URL subdomain
// Examples:
//   byte.crm.bytesymphony.in → "byte"
//   demo.app.bytesymphony.in → "demo"
//   crm.bytesymphony.in → null (no tenant)
//   localhost:5173 → null (development)
const getTenant = (): string | null => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Skip localhost and IP addresses
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return null;
    }

    // For URLs like: byte.crm.bytesymphony.in (4+ parts)
    // Or: byte.bytesymphony.in (3 parts where first is tenant)
    if (parts.length >= 3) {
        const firstPart = parts[0].toLowerCase();
        // Skip reserved subdomains
        const reserved = ['www', 'app', 'api', 'admin', 'crm', 'mail', 'ftp'];
        if (!reserved.includes(firstPart)) {
            return firstPart;
        }
    }

    return null;
};

// Use localhost for development, production URL for deployed
const getApiBaseUrl = (): string => {
    const hostname = window.location.hostname;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }

    // Production
    return 'https://api.bytesymphony.in/api';
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token and tenant header to requests
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN_KEY);
        const tenant = getTenant();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add tenant header if available
        if (tenant && config.headers) {
            config.headers['X-Tenant'] = tenant;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors and token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // If error is 401 and we have a refresh token
        if (error.response?.status === 401 && originalRequest) {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

            // Skip if this is a login/refresh request
            if (originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            if (refreshToken && !isRefreshing) {
                isRefreshing = true;

                try {
                    // Try to refresh the token
                    const response = await axios.post(
                        `${getApiBaseUrl()}/auth/refresh`,
                        { refreshToken },
                        { headers: { 'Content-Type': 'application/json' } }
                    );

                    if (response.data.success && response.data.accessToken) {
                        const newToken = response.data.accessToken;

                        // Store new tokens
                        localStorage.setItem(TOKEN_KEY, newToken);
                        if (response.data.refreshToken) {
                            localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
                        }

                        // Notify waiting requests
                        onTokenRefreshed(newToken);
                        isRefreshing = false;

                        // Retry original request with new token
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    isRefreshing = false;

                    // Refresh failed - clear tokens and redirect to login
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(REFRESH_TOKEN_KEY);
                    localStorage.removeItem('nexus_user');

                    // Redirect to login
                    window.location.href = '/login';

                    return Promise.reject(refreshError);
                }
            } else if (isRefreshing) {
                // Wait for token refresh
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token: string) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        resolve(api(originalRequest));
                    });
                });
            }
        }

        return Promise.reject(error);
    }
);

export default api;
