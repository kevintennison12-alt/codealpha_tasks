/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, CartItem, WishlistItem, Coupon } from '../types';

interface AppContextType {
  user: User | null;
  token: string | null;
  cart: { product: Product; quantity: number }[];
  wishlist: Product[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string, address?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { name: string; phone?: string; address?: string; savedAddresses?: string[] }) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  syncCart: (items: { productId: string; quantity: number }[]) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  activeView: 'landing' | 'products' | 'details' | 'cart' | 'checkout' | 'auth' | 'dashboard' | 'admin';
  setActiveView: (view: 'landing' | 'products' | 'details' | 'cart' | 'checkout' | 'auth' | 'dashboard' | 'admin') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  checkoutOrderData: any;
  setCheckoutOrderData: (data: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ecom_token'));
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>((localStorage.getItem('ecom_theme') as 'light' | 'dark') || 'light');
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }[]>([]);
  
  // Navigation states
  const [activeView, setActiveView] = useState<'landing' | 'products' | 'details' | 'cart' | 'checkout' | 'auth' | 'dashboard' | 'admin'>('landing');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [checkoutOrderData, setCheckoutOrderData] = useState<any>(null);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ecom_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toast System
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch Profile if Token exists
  useEffect(() => {
    if (token) {
      fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Stale token');
      })
      .then((data: User) => {
        setUser(data);
        fetchCartAndWishlist(token);
      })
      .catch(() => {
        localStorage.removeItem('ecom_token');
        setToken(null);
        setUser(null);
      });
    }
  }, [token]);

  const fetchCartAndWishlist = async (authToken: string) => {
    try {
      // Fetch Cart
      const cartRes = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCart(cartData);
      }

      // Fetch Wishlist
      const wlRes = await fetch('/api/wishlist', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (wlRes.ok) {
        const wlData = await wlRes.json();
        setWishlist(wlData);
      }
    } catch (err) {
      console.error('Error fetching cart/wishlist', err);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('ecom_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        await fetchCartAndWishlist(data.token);
        return true;
      } else {
        showToast(data.message || 'Login failed. Please check your credentials.', 'error');
        return false;
      }
    } catch (e) {
      showToast('A connection error occurred. Please try again.', 'error');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string, address?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, address })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('ecom_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(`Registration successful! Welcome, ${data.user.name}.`, 'success');
        await fetchCartAndWishlist(data.token);
        return true;
      } else {
        showToast(data.message || 'Registration failed.', 'error');
        return false;
      }
    } catch (e) {
      showToast('A connection error occurred.', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('ecom_token');
    setToken(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
    setActiveView('landing');
    showToast('Logged out successfully.', 'info');
  };

  const updateProfile = async (data: { name: string; phone?: string; address?: string; savedAddresses?: string[] }): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const updatedUser = await res.json();

      if (res.ok) {
        setUser(updatedUser);
        showToast('Profile updated successfully!', 'success');
        return true;
      } else {
        showToast(updatedUser.message || 'Failed to update profile.', 'error');
        return false;
      }
    } catch (e) {
      showToast('Error updating profile.', 'error');
      return false;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        logout();
        showToast('Your account was deleted successfully.', 'info');
        return true;
      } else {
        showToast('Failed to delete account.', 'error');
        return false;
      }
    } catch (e) {
      showToast('Error deleting account.', 'error');
      return false;
    }
  };

  // Cart Operations
  const syncCart = async (currentCart: { productId: string; quantity: number }[]) => {
    if (!token) return;
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: currentCart })
      });
    } catch (e) {
      console.error('Error syncing cart with server:', e);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      let newCart;
      if (existingIndex > -1) {
        newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
      } else {
        newCart = [...prev, { product, quantity }];
      }

      // Sync with DB asynchronously
      const itemsToSync = newCart.map(item => ({ productId: item.product.id, quantity: item.quantity }));
      syncCart(itemsToSync);
      return newCart;
    });
    showToast(`Added ${quantity} x "${product.name}" to your cart.`, 'success');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => {
      const newCart = prev.map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity };
        }
        return item;
      });

      const itemsToSync = newCart.map(item => ({ productId: item.product.id, quantity: item.quantity }));
      syncCart(itemsToSync);
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      const itemsToSync = newCart.map(item => ({ productId: item.product.id, quantity: item.quantity }));
      syncCart(itemsToSync);
      return newCart;
    });
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    syncCart([]);
  };

  // Wishlist Operations
  const syncWishlist = async (productIds: string[]) => {
    if (!token) return;
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productIds })
      });
    } catch (e) {
      console.error('Error syncing wishlist with server:', e);
    }
  };

  const toggleWishlist = (product: Product) => {
    if (!token) {
      showToast('Please sign in to add items to your wishlist.', 'warning');
      setActiveView('auth');
      return;
    }

    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      let newWishlist;
      if (exists) {
        newWishlist = prev.filter(p => p.id !== product.id);
        showToast('Removed from wishlist.', 'info');
      } else {
        newWishlist = [...prev, product];
        showToast('Added to wishlist!', 'success');
      }

      syncWishlist(newWishlist.map(p => p.id));
      return newWishlist;
    });
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        cart,
        wishlist,
        theme,
        toggleTheme,
        toasts,
        showToast,
        removeToast,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        syncCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        activeView,
        setActiveView,
        selectedProductId,
        setSelectedProductId,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        checkoutOrderData,
        setCheckoutOrderData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
