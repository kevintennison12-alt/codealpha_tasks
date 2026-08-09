/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Product, Order } from '../types';
import { 
  BarChart3, Package, ShoppingBag, Plus, Edit, 
  Trash2, TrendingUp, AlertTriangle, Check, RefreshCw, X, Eye
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { token, user, showToast } = useApp();
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders'>('analytics');
  
  // Data lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // UI states
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form states - Add/Edit Product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  
  // Form fields
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('Electronics');
  const [prodPrice, setProdPrice] = useState(199.99);
  const [prodDiscount, setProdDiscount] = useState(10);
  const [prodStock, setProdStock] = useState(50);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodSpecsText, setProdSpecsText] = useState('{"Warranty": "1 Year", "Color": "Standard Matte Black"}');

  // Fetch all products
  useEffect(() => {
    setLoadingProducts(true);
    fetch('/api/products?limit=100')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error('Error fetching products admin', err);
        setLoadingProducts(false);
      });
  }, [refreshTrigger]);

  // Fetch all orders
  useEffect(() => {
    if (!token) return;
    setLoadingOrders(true);
    fetch('/api/admin/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data || []);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error('Error fetching orders admin', err);
        setLoadingOrders(false);
      });
  }, [token, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    showToast('Dashboard metrics re-synchronized with cloud.', 'success');
  };

  // CRUD Product Actions
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!prodName.trim() || !prodBrand.trim() || !prodDescription.trim()) {
      showToast('Please fulfill all critical product specifications.', 'warning');
      return;
    }

    try {
      let specifications = {};
      try {
        specifications = JSON.parse(prodSpecsText);
      } catch (e) {
        showToast('Specifications must be in valid JSON key-value format.', 'error');
        return;
      }

      const imgUrl = prodImageUrl.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

      const payload = {
        name: prodName,
        brand: prodBrand,
        category: prodCategory,
        price: prodPrice,
        discount: prodDiscount,
        stock: prodStock,
        description: prodDescription,
        images: [imgUrl],
        specifications
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Catalog product "${data.product.name}" added successfully.`, 'success');
        setIsAddFormOpen(false);
        // Reset form
        setProdName('');
        setProdBrand('');
        setProdDescription('');
        setProdImageUrl('');
        setRefreshTrigger(prev => prev + 1);
      } else {
        showToast(data.message || 'Error creating catalog item.', 'error');
      }
    } catch (err) {
      showToast('Network error adding product.', 'error');
    }
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdBrand(prod.brand);
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdDiscount(prod.discount);
    setProdStock(prod.stock);
    setProdDescription(prod.description);
    setProdImageUrl(prod.images[0] || '');
    setProdSpecsText(JSON.stringify(prod.specifications || {}, null, 2));
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct) return;

    try {
      let specifications = {};
      try {
        specifications = JSON.parse(prodSpecsText);
      } catch (e) {
        showToast('Specifications must be in valid JSON key-value format.', 'error');
        return;
      }

      const imgUrl = prodImageUrl.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

      const payload = {
        name: prodName,
        brand: prodBrand,
        category: prodCategory,
        price: prodPrice,
        discount: prodDiscount,
        stock: prodStock,
        description: prodDescription,
        images: [imgUrl],
        specifications
      };

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Catalog item "${data.product.name}" updated successfully.`, 'success');
        setEditingProduct(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        showToast(data.message || 'Error updating product.', 'error');
      }
    } catch (err) {
      showToast('Network error saving updates.', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you absolutely sure you want to permanently delete this item from the store catalog? This action is irreversible.')) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Catalog item deleted successfully.', 'success');
        setRefreshTrigger(prev => prev + 1);
      } else {
        showToast(data.message || 'Error deleting product.', 'error');
      }
    } catch (err) {
      showToast('Error connecting to deletion services.', 'error');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`Order status updated to "${nextStatus}".`, 'success');
        setRefreshTrigger(prev => prev + 1);
      } else {
        showToast(data.message || 'Failed to update order status.', 'error');
      }
    } catch (err) {
      showToast('Error changing order status.', 'error');
    }
  };

  // Analytics helper aggregates
  const calculateTotalRevenue = () => {
    return orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
  };

  const activeOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Shipped').length;
  const criticalStockList = products.filter(p => p.stock <= 10);
  
  // Category share distribution data
  const getCategoryCountDistribution = () => {
    const counts: { [cat: string]: number } = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  };

  const categoryShare = getCategoryCountDistribution();

  if (!user || user.role !== 'admin') {
    return (
      <div id="admin-unauthorized" className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin access restricted</h2>
        <p className="text-xs text-gray-400 mt-2">You must log in with administrative privileges to manage inventory.</p>
      </div>
    );
  }

  const totalRevenue = calculateTotalRevenue();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left transition-all">
      
      {/* Page Title & Resync */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Administrative Management Terminal
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure global store inventory catalog, adjust pricing formulas, and track logistics.</p>
        </div>

        <button
          id="admin-sync-btn"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Synchronize Ledger</span>
        </button>
      </div>

      {/* DASHBOARD TAB SELECTOR BAR */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 mb-8 gap-4 overflow-x-auto">
        {[
          { id: 'analytics', label: 'Consignment Analytics', icon: BarChart3 },
          { id: 'products', label: 'Catalog Inventory Manager', icon: Package },
          { id: 'orders', label: 'Logistics Fulfillment Orders', icon: ShoppingBag }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`admin-tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEWPORT CONTROLS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* STATS STRIP */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aggregate Sales</span>
                <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <p id="admin-sales-revenue" className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-gray-400">Total verified funds generated</span>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logistics Queue</span>
              <p id="admin-orders-pending" className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                {activeOrdersCount} <span className="text-xs text-gray-400 font-semibold">items</span>
              </p>
              <span className="text-[10px] text-gray-400">Orders currently in transit/pending</span>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Stock Items</span>
              <p id="admin-total-catalog" className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
                {products.length} <span className="text-xs text-gray-400 font-semibold">products</span>
              </p>
              <span className="text-[10px] text-gray-400">Total items active in catalogue</span>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stock Out Alerts</span>
                <AlertTriangle className={`w-4.5 h-4.5 ${criticalStockList.length > 0 ? 'text-amber-500 animate-pulse' : 'text-gray-300'}`} />
              </div>
              <p id="admin-alerts-stock" className="text-2xl font-extrabold text-amber-500 mt-2">
                {criticalStockList.length} <span className="text-xs text-gray-400 font-semibold">low stock</span>
              </p>
              <span className="text-[10px] text-gray-400">Items with stock count under 10</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* Category distribution visual custom bar graph */}
            <div className="lg:col-span-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-left">Category Stock Shares</h3>
              
              <div className="space-y-4">
                {Object.entries(categoryShare).map(([cat, val]) => {
                  const percentage = ((val / products.length) * 100).toFixed(0);
                  return (
                    <div key={cat} className="space-y-1.5 text-left">
                      <div className="flex justify-between text-xs font-semibold text-gray-500">
                        <span className="text-gray-700 dark:text-gray-300">{cat}</span>
                        <span>{val} items ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critical Low Stock alert items table */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-left">Critical Stock Alerts (Items under 10 stock)</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-50 dark:border-gray-800/80 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="pb-2.5">Thumbnail</th>
                      <th className="pb-2.5">Product Name</th>
                      <th className="pb-2.5 text-center">Remaining Stock</th>
                      <th className="pb-2.5 text-right">Standard Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalStockList.length > 0 ? (
                      criticalStockList.map(item => (
                        <tr key={item.id} className="border-b border-gray-50 dark:border-gray-800/40 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-950/20">
                          <td className="py-2.5">
                            <img src={item.images[0]} alt={item.name} className="w-8 h-8 rounded-lg object-cover bg-gray-50 border" />
                          </td>
                          <td className="py-2.5">
                            <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{item.name}</p>
                            <span className="text-[9px] uppercase font-bold text-gray-400">{item.brand}</span>
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`rounded px-1.5 py-0.5 font-bold ${
                              item.stock === 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {item.stock} left
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-extrabold text-gray-900 dark:text-white">
                            ₹{item.price.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-gray-400 font-semibold">All products safely over stocked levels. Good job!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header manager row */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Products Catalog Database ({products.length})</h3>
            
            <button
              id="admin-add-prod-toggle-btn"
              onClick={() => {
                setEditingProduct(null);
                setIsAddFormOpen(!isAddFormOpen);
              }}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Catalog Product</span>
            </button>
          </div>

          {/* ADD / EDIT PRODUCT FORM FORM */}
          {(isAddFormOpen || editingProduct) && (
            <form 
              onSubmit={editingProduct ? handleUpdateProductSubmit : handleAddProduct}
              className="rounded-2xl border border-gray-150 p-6 bg-gray-50/50 dark:border-gray-800 dark:bg-slate-950/40 text-left space-y-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 relative"
            >
              <button
                type="button"
                id="admin-close-form-btn"
                onClick={() => {
                  setIsAddFormOpen(false);
                  setEditingProduct(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-bold text-sm text-gray-900 dark:text-white md:col-span-3 mb-2 pb-1 border-b border-gray-100 dark:border-gray-800">
                {editingProduct ? `Edit product specifications of "${editingProduct.name}"` : 'Upload a brand new premium listing'}
              </h4>

              <div>
                <label htmlFor="prod-name-input" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Product Title</label>
                <input
                  id="prod-name-input"
                  type="text"
                  placeholder="e.g. AeroPods Premium Pro"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="prod-brand-input" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Brand Name</label>
                <input
                  id="prod-brand-input"
                  type="text"
                  placeholder="e.g. AeroSound"
                  value={prodBrand}
                  onChange={(e) => setProdBrand(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="prod-category-select" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Department Category</label>
                <select
                  id="prod-category-select"
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                >
                  {['Electronics', 'Fashion', 'Home & Living', 'Fitness & Wellness', 'Accessories', 'Beauty & Wellness'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="prod-price-input" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Retail Price (₹)</label>
                <input
                  id="prod-price-input"
                  type="number"
                  step="1"
                  placeholder="14999"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(Number(e.target.value) || 0)}
                  required
                  className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="prod-discount-input" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Active Promo Discount (%)</label>
                <input
                  id="prod-discount-input"
                  type="number"
                  placeholder="15"
                  value={prodDiscount}
                  onChange={(e) => setProdDiscount(Number(e.target.value) || 0)}
                  required
                  className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="prod-stock-input" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Inventory Stock Units</label>
                <input
                  id="prod-stock-input"
                  type="number"
                  placeholder="50"
                  value={prodStock}
                  onChange={(e) => setProdStock(Number(e.target.value) || 0)}
                  required
                  className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-3">
                <label htmlFor="prod-image-input" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Display Image (URL Link)</label>
                <input
                  id="prod-image-input"
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-3">
                <label htmlFor="prod-desc-textarea" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Product Description</label>
                <textarea
                  id="prod-desc-textarea"
                  placeholder="Enter deep description details regarding materials, ergonomics, sensory sound profile..."
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-250 bg-white p-3 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-3">
                <label htmlFor="prod-specs-textarea" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">JSON Specifications Keys</label>
                <textarea
                  id="prod-specs-textarea"
                  placeholder='{"Warranty": "1 Year", "Color": "Standard Matte Black"}'
                  rows={2}
                  value={prodSpecsText}
                  onChange={(e) => setProdSpecsText(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-250 bg-white p-3 text-xs outline-none focus:border-blue-500 font-mono dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-3 pt-2">
                <button
                  type="submit"
                  id="admin-submit-prod-btn"
                  className="rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold py-2.5 px-6 text-xs hover:scale-105 transition-transform cursor-pointer"
                >
                  {editingProduct ? 'Save Specifications Updates' : 'Add Product to Shop'}
                </button>
              </div>
            </form>
          )}

          {/* Catalog Database Grid Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-slate-900 p-4">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800/80 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Details</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Retail Price</th>
                  <th className="pb-3">Active Promo</th>
                  <th className="pb-3 text-center">Remaining Stock</th>
                  <th className="pb-3 text-right pr-2">Control Options</th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 font-bold animate-pulse">Syncing catalog inventory with cloud run...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">Inventory completely empty. Click 'Add New' to begin.</td>
                  </tr>
                ) : (
                  products.map(p => {
                    return (
                      <tr key={p.id} id={`admin-prod-row-${p.id}`} className="border-b border-gray-50 dark:border-gray-850 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-950/10">
                        <td className="py-3.5 pl-2 flex items-center gap-3">
                          <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-gray-50 border" />
                          <div>
                            <p className="font-extrabold text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{p.brand}</span>
                          </div>
                        </td>
                        <td className="py-3.5 font-semibold text-gray-500">{p.category}</td>
                        <td className="py-3.5 font-bold text-gray-800 dark:text-gray-200">₹{p.price.toLocaleString('en-IN')}</td>
                        <td className="py-3.5">
                          {p.discount > 0 ? (
                            <span className="rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 font-bold text-[10px] uppercase">
                              -{p.discount}% OFF
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium italic">Standard</span>
                          )}
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`rounded-full px-2 py-0.5 font-bold text-[10px] ${
                            p.stock === 0 
                              ? 'bg-rose-50 text-rose-600' 
                              : p.stock <= 10
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`admin-edit-prod-${p.id}`}
                              onClick={() => {
                                setIsAddFormOpen(false);
                                handleEditProductClick(p);
                              }}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 cursor-pointer transition-colors"
                              title="Edit Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`admin-delete-prod-${p.id}`}
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 cursor-pointer transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white pb-3 border-b border-gray-50 dark:border-gray-800">
            Fulfillment Queue & Shipping Logs ({orders.length})
          </h3>

          <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-slate-900 p-4 space-y-4">
            {loadingOrders ? (
              <p className="text-center py-12 text-gray-400 font-bold animate-pulse">Synchronizing logistics logs with main database...</p>
            ) : orders.length === 0 ? (
              <p className="text-center py-12 text-gray-400">No customer purchases logged in the database yet.</p>
            ) : (
              orders.map(o => {
                return (
                  <div
                    key={o.id}
                    id={`admin-order-row-${o.id}`}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-gray-850 dark:bg-slate-950/40 text-left flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left detailed specs info */}
                    <div className="space-y-1.5 flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-700 dark:text-gray-300">ID: {o.id}</span>
                        <span className="text-[10px] text-gray-400">{o.date}</span>
                      </div>
                      
                      <div className="font-semibold text-gray-500 space-y-0.5">
                        <p>Customer: <span className="font-bold text-gray-700 dark:text-gray-300">{o.userName} ({o.userEmail})</span></p>
                        <p>Destination: <span className="font-bold text-gray-700 dark:text-gray-300">{o.shippingAddress}</span></p>
                        <p>Payment: <span className="font-bold text-gray-700 dark:text-gray-300 uppercase">{o.paymentMethod}</span></p>
                      </div>

                      {/* Items row list */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-850/60 mt-2">
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Ordered Catalog Items</span>
                        <div className="grid grid-cols-1 gap-1 mt-1 font-semibold text-gray-600 dark:text-gray-400 text-[11px]">
                          {o.items.map((item, index) => (
                            <span key={index}>{item.name} (Qty {item.quantity})</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right action control metrics */}
                    <div className="flex flex-col items-start md:items-end gap-3 md:shrink-0 text-right text-xs">
                      <div>
                        <span className="text-gray-400">Grand Total Invoice</span>
                        <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">₹{o.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                          o.status === 'Delivered' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : o.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-500'
                            : o.status === 'Shipped'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {o.status}
                        </span>

                        {/* Status updating selects */}
                        {o.status !== 'Cancelled' && o.status !== 'Delivered' && (
                          <select
                            id={`admin-order-status-select-${o.id}`}
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] font-extrabold outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
};
