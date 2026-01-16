import api from './api';

// Types
export interface Product {
    id: number;
    name: string;
    sku?: string;
    category?: string;
    description?: string;
    price: number;
    cost?: number;
    currency: string;
    isTaxable: boolean;
    taxRate?: number;
    billingFrequency?: string;
    isActive: boolean;
    stockQuantity?: number;
    trackInventory: boolean;
    imageUrl?: string;
    externalId?: string;
    tags?: string;
    createdAt: string;
    lastModifiedAt?: string;
}

export interface ProductSearchResult {
    id: number;
    name: string;
    sku?: string;
    price: number;
    category?: string;
    isTaxable: boolean;
    taxRate?: number;
}

// API Functions
export const productsApi = {
    // Get all products with optional filters
    getAll: async (params?: {
        search?: string;
        category?: string;
        activeOnly?: boolean;
    }): Promise<Product[]> => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.activeOnly !== undefined) queryParams.append('activeOnly', String(params.activeOnly));

        const response = await api.get(`/products?${queryParams.toString()}`);
        return response.data;
    },

    // Get single product by ID
    getById: async (id: number): Promise<Product> => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Get available categories
    getCategories: async (): Promise<string[]> => {
        const response = await api.get('/products/categories');
        return response.data;
    },

    // Get billing frequencies
    getBillingFrequencies: async (): Promise<string[]> => {
        const response = await api.get('/products/billing-frequencies');
        return response.data;
    },

    // Create a new product
    create: async (product: Omit<Product, 'id' | 'createdAt' | 'lastModifiedAt'>): Promise<Product> => {
        const response = await api.post('/products', product);
        return response.data;
    },

    // Update an existing product
    update: async (id: number, product: Product): Promise<void> => {
        await api.put(`/products/${id}`, product);
    },

    // Delete a product
    delete: async (id: number): Promise<void> => {
        await api.delete(`/products/${id}`);
    },

    // Toggle product active status
    toggleActive: async (id: number): Promise<{ id: number; isActive: boolean }> => {
        const response = await api.patch(`/products/${id}/toggle-active`);
        return response.data;
    },

    // Quick search for product picker
    search: async (query: string): Promise<ProductSearchResult[]> => {
        const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },
};

export default productsApi;
