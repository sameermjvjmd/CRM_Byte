import { useState, useEffect } from 'react';
import { productsApi, type Product } from '../api/productsApi';
import { Package, Plus, Search, MoreVertical, DollarSign, Tag, ToggleLeft, ToggleRight, Edit2, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [billingFrequencies, setBillingFrequencies] = useState<string[]>([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        sku: '',
        category: 'Software',
        description: '',
        price: 0,
        cost: 0,
        currency: 'USD',
        isTaxable: true,
        taxRate: 18,
        billingFrequency: 'One-time',
        isActive: true,
        trackInventory: false,
        stockQuantity: 0,
    });

    useEffect(() => {
        fetchProducts();
        fetchMetadata();
    }, [categoryFilter, showActiveOnly]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productsApi.getAll({
                search: searchTerm || undefined,
                category: categoryFilter || undefined,
                activeOnly: showActiveOnly || undefined,
            });
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const [cats, freqs] = await Promise.all([
                productsApi.getCategories(),
                productsApi.getBillingFrequencies(),
            ]);
            setCategories(cats);
            setBillingFrequencies(freqs);
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleToggleActive = async (id: number) => {
        try {
            await productsApi.toggleActive(id);
            setProducts(prev =>
                prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p))
            );
            toast.success('Product status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await productsApi.delete(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success('Product deleted');
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            sku: '',
            category: 'Software',
            description: '',
            price: 0,
            cost: 0,
            currency: 'USD',
            isTaxable: true,
            taxRate: 18,
            billingFrequency: 'One-time',
            isActive: true,
            trackInventory: false,
            stockQuantity: 0,
        });
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData(product);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await productsApi.update(editingProduct.id, { ...editingProduct, ...formData } as Product);
                toast.success('Product updated');
            } else {
                await productsApi.create(formData as Omit<Product, 'id' | 'createdAt' | 'lastModifiedAt'>);
                toast.success('Product created');
            }
            setShowModal(false);
            fetchProducts();
        } catch (error) {
            toast.error('Failed to save product');
        }
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    return (
        <div className="p-6 bg-[#F8FAFC] min-h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your products and services for quotes</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} />
                    NEW PRODUCT
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                    >
                        Search
                    </button>
                </form>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <button
                    onClick={() => setShowActiveOnly(!showActiveOnly)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${showActiveOnly
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    {showActiveOnly ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    Active Only
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    [...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                            <div className="h-12 w-12 bg-slate-100 rounded-lg mb-4" />
                            <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                    ))
                ) : products.length === 0 ? (
                    <div className="col-span-full py-16 text-center">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No products found</p>
                        <button onClick={openCreateModal} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">
                            Create your first product
                        </button>
                    </div>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className={`bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all group relative ${!product.isActive ? 'opacity-60' : ''
                                }`}
                        >
                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${product.isActive
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Icon */}
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                                <Package size={22} className="text-white" />
                            </div>

                            {/* Info */}
                            <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                                {product.name}
                            </h3>
                            {product.sku && (
                                <p className="text-xs text-slate-400 mt-0.5">SKU: {product.sku}</p>
                            )}

                            {/* Category & Price */}
                            <div className="flex items-center gap-2 mt-3">
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">
                                    <Tag size={10} />
                                    {product.category || 'Uncategorized'}
                                </span>
                            </div>

                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-xl font-black text-slate-900">
                                    {formatCurrency(product.price, product.currency)}
                                </span>
                                {product.billingFrequency && product.billingFrequency !== 'One-time' && (
                                    <span className="text-xs text-slate-400">/{product.billingFrequency.toLowerCase()}</span>
                                )}
                            </div>

                            {/* Tax Info */}
                            {product.isTaxable && (
                                <p className="text-[10px] text-slate-400 mt-1">
                                    + {product.taxRate || 0}% Tax
                                </p>
                            )}

                            {/* Description Preview */}
                            {product.description && (
                                <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                                    {product.description}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(product.id)}
                                        className="p-2 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                                        title={product.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {product.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                                    <MoreVertical size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Stats */}
            <div className="mt-4 px-2 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <div>Total Products: {products.length}</div>
                <div>Active: {products.filter(p => p.isActive).length}</div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600">
                            <h2 className="text-lg font-bold text-white">
                                {editingProduct ? 'Edit Product' : 'Create New Product'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter product name"
                                    />
                                </div>

                                {/* SKU */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        SKU
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.sku || ''}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g., PROD-001"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category || ''}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Price *
                                    </label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price || 0}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Cost */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Cost (Optional)
                                    </label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.cost || 0}
                                            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Billing Frequency */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Billing Frequency
                                    </label>
                                    <select
                                        value={formData.billingFrequency || 'One-time'}
                                        onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                    >
                                        {billingFrequencies.map((freq) => (
                                            <option key={freq} value={freq}>{freq}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Currency */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Currency
                                    </label>
                                    <select
                                        value={formData.currency || 'USD'}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                </div>

                                {/* Tax Rate */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Tax Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.taxRate || 0}
                                        onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                {/* Checkboxes */}
                                <div className="md:col-span-2 flex flex-wrap gap-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isTaxable || false}
                                            onChange={(e) => setFormData({ ...formData, isTaxable: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Taxable</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive || false}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Active</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.trackInventory || false}
                                            onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Track Inventory</span>
                                    </label>
                                </div>

                                {/* Stock Quantity (conditional) */}
                                {formData.trackInventory && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Stock Quantity
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.stockQuantity || 0}
                                            onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                )}

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                        placeholder="Describe your product..."
                                    />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                                >
                                    <Check size={16} />
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
