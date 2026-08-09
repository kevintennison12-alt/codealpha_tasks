/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Order, OrderItem } from '../types';
import { 
  User, MapPin, Phone, Mail, ShoppingBag, 
  Trash2, CreditCard, ChevronRight, CheckCircle, RefreshCw
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const {
    user,
    token,
    updateProfile,
    showToast,
    setActiveView,
    setSelectedProductId
  } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [newAddressInput, setNewAddressInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync profile fields from loaded user state
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Fetch user orders on mount
  const fetchUserOrders = () => {
    if (!token) return;
    setLoadingOrders(true);

    fetch('/api/orders', {
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
        console.error('Error fetching user orders', err);
        setLoadingOrders(false);
      });
  };

  useEffect(() => {
    fetchUserOrders();
  }, [token]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }

    setSavingProfile(true);
    const success = await updateProfile({
      name,
      phone,
      address,
      savedAddresses: user?.savedAddresses || []
    });
    setSavingProfile(false);
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressInput.trim() || !user) return;

    if (user.savedAddresses.includes(newAddressInput)) {
      showToast('Address is already listed in your presets.', 'warning');
      return;
    }

    const updatedAddresses = [...user.savedAddresses, newAddressInput];
    const success = await updateProfile({
      name: user.name,
      phone: user.phone || '',
      address: user.address || '',
      savedAddresses: updatedAddresses
    });

    if (success) {
      setNewAddressInput('');
    }
  };

  const handleRemoveSavedAddress = async (addrToRemove: string) => {
    if (!user) return;
    const updatedAddresses = user.savedAddresses.filter(addr => addr !== addrToRemove);
    updateProfile({
      name: user.name,
      phone: user.phone || '',
      address: user.address || '',
      savedAddresses: updatedAddresses
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!token) return;
    if (!window.confirm('Are you absolutely sure you want to cancel this pending order? This action will immediately reverse the authorization and trigger standard fund returns.')) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Order was cancelled successfully.', 'success');
        fetchUserOrders(); // Reload orders
      } else {
        showToast(data.message || 'Failed to cancel order.', 'error');
      }
    } catch (err) {
      showToast('Error cancelling order.', 'error');
    }
  };

  const handleProductDetails = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('details');
  };

  // Calculate high-level stats
  const totalSpend = orders.reduce((acc, o) => acc + (o.orderStatus !== 'Cancelled' ? o.totalAmount : 0), 0);
  const activeOrdersCount = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Shipped').length;

  if (!user) {
    return (
      <div id="dashboard-unauthorized-page" className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in to view your dashboard portal</h2>
        <button
          onClick={() => setActiveView('auth')}
          className="mt-6 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left transition-all">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
        Customer Account Dashboard
      </h1>

      {/* STATS OVERVIEW ROW */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Purchases</span>
          <p id="dashboard-stat-total-orders" className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            {orders.length} <span className="text-xs text-gray-400 font-semibold">orders</span>
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Money Saved/Spent</span>
          <p id="dashboard-stat-total-spend" className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Consignments</span>
          <p id="dashboard-stat-active-orders" className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {activeOrdersCount} <span className="text-xs text-gray-400 font-semibold">in transit</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Columns - Profile updates & saved addresses */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-50 dark:border-gray-800">
              <User className="w-5 h-5 text-blue-500" />
              <span>Contact Credentials</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="profile-name-input" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                <input
                  id="profile-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="profile-email-readonly" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Email Address (Locked)</label>
                <input
                  id="profile-email-readonly"
                  type="text"
                  value={user.email}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-400 dark:border-gray-850 dark:bg-gray-950/40 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="profile-phone-input" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Phone Number</label>
                <input
                  id="profile-phone-input"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="profile-address-input" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Default Shipping Address</label>
                <textarea
                  id="profile-address-input"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                id="profile-save-submit"
                disabled={savingProfile}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 text-xs cursor-pointer"
              >
                {savingProfile ? 'Saving...' : 'Update Account Info'}
              </button>
            </form>
          </div>

          {/* Saved addresses presets management */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-50 dark:border-gray-800">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span>Saved Addresses ({user.savedAddresses.length})</span>
            </h3>

            <form onSubmit={handleAddNewAddress} className="flex gap-2 mb-4">
              <input
                id="profile-add-address-input"
                type="text"
                placeholder="Add new shipping address..."
                value={newAddressInput}
                onChange={(e) => setNewAddressInput(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              />
              <button
                type="submit"
                id="profile-add-address-submit"
                className="rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 text-xs font-bold hover:scale-105 transition-transform"
              >
                Add
              </button>
            </form>

            <div className="space-y-2">
              {user.savedAddresses.length > 0 ? (
                user.savedAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    id={`profile-saved-addr-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/30"
                  >
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 pr-4 line-clamp-2 text-left">{addr}</p>
                    <button
                      type="button"
                      id={`profile-remove-addr-btn-${idx}`}
                      onClick={() => handleRemoveSavedAddress(addr)}
                      className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">No address presets configured yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column - Order tracker history */}
        <div className="lg:col-span-2">
          
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 min-h-[400px]">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center justify-between mb-6 pb-2 border-b border-gray-50 dark:border-gray-800">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
                <span>Purchase Ledger History</span>
              </span>
              
              <button
                id="refresh-orders-btn"
                onClick={fetchUserOrders}
                disabled={loadingOrders}
                className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
              </button>
            </h3>

            {loadingOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="animate-pulse flex flex-col gap-3 p-4 border border-gray-100 dark:border-gray-850 rounded-xl">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div id="no-orders-box" className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                <p className="text-sm text-gray-400 font-semibold">You haven't placed any orders yet.</p>
                <button
                  id="dashboard-go-shopping"
                  onClick={() => setActiveView('products')}
                  className="mt-4 rounded-full bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
                >
                  Start Exploring Essentials
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord: Order) => {
                  return (
                    <div
                      key={ord.id}
                      id={`order-row-${ord.id}`}
                      className="p-4 rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-slate-950 shadow-sm text-left relative flex flex-col justify-between"
                    >
                      {/* Top status bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 dark:border-gray-800/60 pb-3 mb-3 text-xs">
                        <div>
                          <p className="text-gray-400 font-semibold">
                            ID: <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{ord.id}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{new Date(ord.orderDate).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                            ord.orderStatus === 'Delivered' 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              : ord.orderStatus === 'Shipped'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}>
                            {ord.orderStatus}
                          </span>

                          {/* Cancellation active only for Pending */}
                          {ord.orderStatus === 'Pending' && (
                            <button
                              id={`cancel-order-btn-${ord.id}`}
                              onClick={() => handleCancelOrder(ord.id)}
                              className="rounded-lg bg-rose-50 text-rose-600 px-2 py-1 text-[9px] font-bold hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Purchased products info */}
                      <div className="space-y-2.5">
                        {ord.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-2 max-w-[70%]">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-8 h-8 rounded-lg object-cover bg-gray-50 border shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <p 
                                onClick={() => handleProductDetails(item.id)}
                                className="font-bold text-gray-800 dark:text-gray-200 truncate hover:text-blue-600 cursor-pointer"
                              >
                                {item.name}
                              </p>
                            </div>
                            <span className="font-semibold text-gray-400 shrink-0">Qty {item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer billing line */}
                      <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <p className="text-gray-400">
                          Destination: <span className="font-bold text-gray-600 dark:text-gray-300">{ord.shippingAddress}</span>
                        </p>
                        <p className="font-extrabold text-gray-900 dark:text-white">
                          Paid: <span className="text-base font-black">₹{ord.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
