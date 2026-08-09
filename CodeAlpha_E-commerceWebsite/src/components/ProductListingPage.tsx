/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Product } from '../types';
import { 
  Star, Heart, ShoppingCart, SlidersHorizontal, Eye, 
  X, Check, AlertCircle, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';

export const ProductListingPage: React.FC = () => {
  const { 
    addToCart, 
    toggleWishlist, 
    isWishlisted, 
    setActiveView, 
    setSelectedProductId,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery
  } = useApp();

  // Filter States
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);

  // Fetch products from API when filters change
  useEffect(() => {
    setLoading(true);
    let url = `/api/products?page=${page}&limit=8&sort=${sortBy}`;
    
    if (activeCategory && activeCategory !== 'All') {
      url += `&category=${encodeURIComponent(activeCategory)}`;
    }
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    if (selectedBrand) {
      url += `&brand=${encodeURIComponent(selectedBrand)}`;
    }
    if (minRating > 0) {
      url += `&rating=${minRating}`;
    }
    if (minPrice > 0) {
      url += `&minPrice=${minPrice}`;
    }
    if (maxPrice < 100000) {
      url += `&maxPrice=${maxPrice}`;
    }
    if (availableOnly) {
      url += `&availableOnly=true`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products', err);
        setLoading(false);
      });
  }, [page, activeCategory, searchQuery, selectedBrand, minRating, minPrice, maxPrice, availableOnly, sortBy]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery, selectedBrand, minRating, minPrice, maxPrice, availableOnly, sortBy]);

  const handleResetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setSelectedBrand('');
    setMinPrice(0);
    setMaxPrice(100000);
    setMinRating(0);
    setAvailableOnly(false);
    setSortBy('newest');
    setPage(1);
  };

  const handleProductDetails = (id: string) => {
    setSelectedProductId(id);
    setActiveView('details');
  };

  const handleQuickViewClose = () => {
    setQuickViewProduct(null);
    setQuickViewQty(1);
  };

  const handleQuickViewAddToCart = () => {
    if (quickViewProduct) {
      addToCart(quickViewProduct, quickViewQty);
      handleQuickViewClose();
    }
  };

  const categories = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Fitness & Wellness', 'Accessories', 'Beauty & Wellness'];
  const brands = ['AeroSound', 'Velocity', 'Voyager', 'MinimalLabel', 'OrganicGlow', 'Lumina', 'Chronos', 'PureAir', 'EarthyClay'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left relative min-h-screen">
      
      {/* Page Title & Search Details */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {activeCategory === 'All' ? 'Complete Collection' : activeCategory}
          </h1>
          {searchQuery && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing search results for "<span className="font-semibold text-blue-600 dark:text-blue-400">{searchQuery}</span>" ({totalProducts} found)
            </p>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="sort-by-select" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort By</label>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        
        {/* Left Side Filter Panel (Desktop) */}
        <div className="hidden lg:block space-y-6">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800/80 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </span>
              <button
                id="reset-filters-btn"
                onClick={handleResetFilters}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div className="py-5 border-b border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-3.5">Category</h4>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    id={`filter-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left text-sm rounded-lg py-1 px-2.5 transition-colors cursor-pointer ${
                      activeCategory === cat 
                        ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/40 dark:text-blue-400' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="py-5 border-b border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-3.5">Popular Brands</h4>
              <div className="space-y-2">
                <button
                  id="filter-brand-all"
                  onClick={() => setSelectedBrand('')}
                  className={`w-full text-left text-sm py-1 px-2.5 rounded-lg ${
                    selectedBrand === '' 
                      ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/40 dark:text-blue-400' 
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                  }`}
                >
                  All Brands
                </button>
                {brands.map(b => (
                  <button
                    key={b}
                    id={`filter-brand-${b.toLowerCase()}`}
                    onClick={() => setSelectedBrand(b)}
                    className={`w-full text-left text-sm py-1 px-2.5 rounded-lg truncate ${
                      selectedBrand === b 
                        ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/40 dark:text-blue-400' 
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3.5">
                <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Price Range</h4>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="space-y-4">
                <input
                  id="filter-price-slider"
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-gray-100 rounded-lg dark:bg-gray-800"
                />
                <div className="flex items-center gap-2">
                  <input
                    id="filter-min-price-input"
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                    className="w-1/2 text-center rounded-lg border border-gray-200 py-1 text-xs dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    id="filter-max-price-input"
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value) || 100000)}
                    className="w-1/2 text-center rounded-lg border border-gray-200 py-1 text-xs dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="py-5 border-b border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-3.5">Minimum Rating</h4>
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl dark:bg-gray-950">
                {[0, 3, 4, 4.5].map(r => (
                  <button
                    key={r}
                    id={`filter-rating-${r}`}
                    onClick={() => setMinRating(r)}
                    className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                      minRating === r 
                        ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {r === 0 ? 'All' : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  id="filter-availability-checkbox"
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-100 h-4.5 w-4.5 dark:border-gray-800"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">In Stock Only</span>
              </label>
            </div>

          </div>
        </div>

        {/* Right Side Product Catalog Grid */}
        <div className="lg:col-span-3">
          
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="animate-pulse flex flex-col gap-3">
                  <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div id="no-products-found" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-16 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No products match your criteria</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">Try widening your price range, clearing some active filter tags, or searching for a different keyword.</p>
              <button
                id="no-products-clear-filters"
                onClick={handleResetFilters}
                className="mt-6 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div>
              {/* Grid of Product Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p: Product) => {
                  const discPrice = p.price * (1 - p.discount/100);
                  const isOut = p.stock === 0;
                  return (
                    <div
                      key={p.id}
                      id={`product-card-${p.id}`}
                      className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-xl dark:border-gray-800 dark:bg-slate-900 transition-all hover:-translate-y-1"
                    >
                      {/* Image Frame */}
                      <div className="relative h-60 w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-950">
                        
                        {/* Discount Tag */}
                        {p.discount > 0 && (
                          <span className="absolute top-2.5 left-2.5 z-10 rounded-md bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                            -{p.discount}% OFF
                          </span>
                        )}

                        {/* Stock Alert Tag */}
                        {isOut ? (
                          <span className="absolute top-2.5 right-2.5 z-10 rounded-md bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                            SOLD OUT
                          </span>
                        ) : p.stock <= 15 && (
                          <span className="absolute top-2.5 right-2.5 z-10 rounded-md bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                            ONLY {p.stock} LEFT
                          </span>
                        )}

                        <img
                          onClick={() => handleProductDetails(p.id)}
                          src={p.images[0]}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                          referrerPolicy="no-referrer"
                        />

                        {/* Hover Overlay Buttons */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            id={`quickview-btn-${p.id}`}
                            onClick={() => setQuickViewProduct(p)}
                            className="p-2.5 rounded-full bg-white text-gray-900 hover:bg-gray-100 shadow-md cursor-pointer transition-transform hover:scale-110"
                            title="Quick View"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          
                          <button
                            id={`wishlist-toggle-${p.id}`}
                            onClick={() => toggleWishlist(p)}
                            className={`p-2.5 rounded-full shadow-md cursor-pointer transition-transform hover:scale-110 ${
                              isWishlisted(p.id) 
                                ? 'bg-rose-500 text-white hover:bg-rose-600' 
                                : 'bg-white text-gray-900 hover:bg-gray-100'
                            }`}
                            title="Add to Wishlist"
                          >
                            <Heart className={`w-4.5 h-4.5 ${isWishlisted(p.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="pt-4 flex-1 text-left flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{p.brand}</span>
                          <h3 
                            onClick={() => handleProductDetails(p.id)}
                            className="font-bold text-base text-gray-900 dark:text-white mt-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-1"
                          >
                            {p.name}
                          </h3>

                          {/* Ratings */}
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 fill-current ${i < Math.floor(p.rating) ? 'opacity-100' : 'opacity-25'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{p.rating}</span>
                            <span className="text-[10px] text-gray-400">({p.reviews.length})</span>
                          </div>
                        </div>

                        {/* Action Row */}
                        <div className="mt-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-800/80 pt-3">
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-extrabold text-gray-900 dark:text-white">₹{discPrice.toLocaleString('en-IN')}</span>
                              {p.discount > 0 && (
                                <span className="text-xs text-gray-400 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">Excl. 18% GST</span>
                          </div>

                          <button
                            id={`add-to-cart-btn-${p.id}`}
                            onClick={() => !isOut && addToCart(p)}
                            disabled={isOut}
                            className={`rounded-xl px-3.5 py-2 flex items-center gap-1 text-xs font-bold shadow-sm transition-all cursor-pointer ${
                              isOut 
                                ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div id="catalog-pagination-box" className="mt-12 flex items-center justify-center gap-1.5 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <button
                    id="pagination-prev-btn"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        id={`pagination-page-btn-${pageNum}`}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                          page === pageNum 
                            ? 'bg-blue-600 text-white' 
                            : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    id="pagination-next-btn"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* QUICK VIEW MODAL OVERLAY */}
      {quickViewProduct && (
        <div id="quickview-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-2xl dark:border-gray-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            <button
              id="quickview-close-btn"
              onClick={handleQuickViewClose}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column Image */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950 aspect-square">
                <img
                  src={quickViewProduct.images[0]}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Right Column details */}
              <div className="flex flex-col justify-between text-left">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-gray-400">{quickViewProduct.brand}</span>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{quickViewProduct.name}</h2>
                  
                  {/* Rating Block */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 fill-current ${i < Math.floor(quickViewProduct.rating) ? 'opacity-100' : 'opacity-25'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{quickViewProduct.rating}</span>
                    <span className="text-xs text-gray-400">({quickViewProduct.reviews.length} customer reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-2.5">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      ₹{(quickViewProduct.price * (1 - quickViewProduct.discount/100)).toLocaleString('en-IN')}
                    </span>
                    {quickViewProduct.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">₹{quickViewProduct.price.toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-4 leading-relaxed">
                    {quickViewProduct.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Availability:</span>
                    <span className={`text-xs font-bold ${quickViewProduct.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                      {quickViewProduct.stock > 0 ? `${quickViewProduct.stock} units left in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800">
                  {quickViewProduct.stock > 0 ? (
                    <div className="flex items-center gap-4">
                      {/* Qty Selector */}
                      <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <button
                          id="quickview-qty-dec"
                          onClick={() => setQuickViewQty(q => Math.max(1, q - 1))}
                          className="px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-4 text-sm font-bold text-gray-900 dark:text-white">{quickViewQty}</span>
                        <button
                          id="quickview-qty-inc"
                          onClick={() => setQuickViewQty(q => Math.min(quickViewProduct.stock, q + 1))}
                          className="px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        id="quickview-add-to-cart-submit"
                        onClick={handleQuickViewAddToCart}
                        className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Shopping Cart</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      id="quickview-out-of-stock-btn"
                      disabled
                      className="w-full rounded-2xl bg-gray-100 text-gray-400 py-3 text-sm font-bold dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                    >
                      Temporarily Unavailable
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
