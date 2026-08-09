/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { 
  ShoppingBag, Heart, Search, Moon, Sun, User as UserIcon, 
  Menu, X, LogOut, ChevronDown, LayoutDashboard, Shield, Package, Bell
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    cart,
    wishlist,
    theme,
    toggleTheme,
    logout,
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    setActiveCategory,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  
  // Search Autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Sync internal search input with global searchQuery
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetch(`/api/products/suggestions?search=${encodeURIComponent(searchInput)}`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data.suggestions || []);
        })
        .catch(err => console.error(err));
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setActiveCategory('All');
    setActiveView('products');
    setSuggestionsOpen(false);
  };

  const handleSuggestionClick = (val: string) => {
    setSearchInput(val);
    setSearchQuery(val);
    setActiveCategory('All');
    setActiveView('products');
    setSuggestionsOpen(false);
  };

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setSearchInput('');
    setActiveView('products');
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const categories = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Fitness & Wellness', 'Accessories', 'Beauty & Wellness'];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/80 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center">
            <button 
              id="navbar-logo"
              onClick={() => { setActiveView('landing'); setSearchQuery(''); setSearchInput(''); }}
              className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-blue-600 dark:text-blue-500 cursor-pointer"
            >
              <ShoppingBag className="h-6 w-6 stroke-[2.5]" />
              <span>Modern<span className="text-gray-900 dark:text-white">Store</span></span>
            </button>
          </div>

          {/* Categories Dropdown (Desktop) */}
          <div className="hidden md:block relative" ref={categoriesRef}>
            <button
              id="navbar-categories-btn"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500 cursor-pointer py-2 transition-colors"
            >
              <span>Categories</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {categoriesOpen && (
              <div id="navbar-categories-dropdown" className="absolute left-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                {categories.map(cat => (
                  <button
                    key={cat}
                    id={`category-item-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg relative hidden sm:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  id="navbar-search-input"
                  type="text"
                  placeholder="Search over 30 premium products..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSuggestionsOpen(true);
                  }}
                  onFocus={() => setSuggestionsOpen(true)}
                  className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-500 dark:focus:bg-gray-950 dark:focus:ring-blue-950/50"
                />
                <button type="submit" id="navbar-search-submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 cursor-pointer">
                  <Search className="h-4.5 w-4.5" />
                </button>
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {suggestionsOpen && suggestions.length > 0 && (
              <div id="search-suggestions-box" className="absolute left-0 right-0 mt-2 z-50 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900 max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 dark:border-gray-800 mb-1">
                  Suggestions
                </div>
                {suggestions.map((val, idx) => (
                  <button
                    key={idx}
                    id={`suggestion-item-${idx}`}
                    onClick={() => handleSuggestionClick(val)}
                    className="flex items-center gap-2 w-full text-left rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{val}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 md:gap-3">
            
            {/* Theme Toggle */}
            <button
              id="navbar-theme-toggle"
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white cursor-pointer transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Wishlist Icon */}
            <button
              id="navbar-wishlist-btn"
              onClick={() => setActiveView('dashboard')} // Wishlist sits in the user dashboard
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white cursor-pointer transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span id="wishlist-badge" className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              id="navbar-cart-btn"
              onClick={() => setActiveView('cart')}
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white cursor-pointer transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span id="cart-badge" className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notification Bell (Visual element) */}
            <div className="relative hidden md:block">
              <button 
                id="navbar-bell-btn"
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white cursor-pointer transition-colors"
              >
                <Bell className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              {user ? (
                <div>
                  <button
                    id="navbar-profile-btn"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1.5 rounded-full p-1 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400 uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                  </button>

                  {profileOpen && (
                    <div id="navbar-profile-dropdown" className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                      <div className="px-3 py-2 border-b border-gray-50 dark:border-gray-800 mb-1">
                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                      </div>

                      <button
                        id="profile-dropdown-dashboard"
                        onClick={() => { setActiveView('dashboard'); setProfileOpen(false); }}
                        className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-4.5 h-4.5 text-gray-400" />
                        <span>My Dashboard</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          id="profile-dropdown-admin"
                          onClick={() => { setActiveView('admin'); setProfileOpen(false); }}
                          className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-sm text-blue-600 hover:bg-blue-50/50 dark:text-blue-400 dark:hover:bg-blue-950/20 font-medium transition-colors cursor-pointer"
                        >
                          <Shield className="w-4.5 h-4.5 text-blue-500" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <button
                        id="profile-dropdown-logout"
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50/50 dark:text-rose-400 dark:hover:bg-rose-950/20 font-medium border-t border-gray-50 dark:border-gray-800 mt-1 pt-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4.5 h-4.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="navbar-signin-btn"
                  onClick={() => setActiveView('auth')}
                  className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              id="navbar-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white md:hidden cursor-pointer transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div id="navbar-mobile-menu" className="md:hidden border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 p-4 transition-all animate-in fade-in slide-in-from-top-4 duration-200">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="mb-4 sm:hidden">
            <div className="relative">
              <input
                id="navbar-mobile-search-input"
                type="text"
                placeholder="Search premium products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-sm outline-none dark:border-gray-800 dark:bg-gray-900/50 dark:text-white focus:bg-white focus:border-blue-500"
              />
              <button type="submit" id="navbar-mobile-search-submit" className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Categories list */}
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">Shop Categories</p>
          <div className="flex flex-col gap-1 mb-4">
            {categories.map(cat => (
              <button
                key={cat}
                id={`mobile-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleCategorySelect(cat)}
                className="w-full text-left rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-900 transition-colors cursor-pointer"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* General routes */}
          {user && (
            <div className="border-t border-gray-100 dark:border-gray-900 pt-3 flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">My Account</p>
              <button
                id="mobile-menu-dashboard"
                onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full text-left rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900 transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                <span>My Dashboard / Orders</span>
              </button>
              {user.role === 'admin' && (
                <button
                  id="mobile-menu-admin"
                  onClick={() => { setActiveView('admin'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full text-left rounded-xl px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 font-medium transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Admin Dashboard</span>
                </button>
              )}
              <button
                id="mobile-menu-logout"
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full text-left rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50/50 dark:text-rose-400 dark:hover:bg-rose-950/20 font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
