/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Product, Review } from '../types';
import { 
  Star, Heart, ShoppingCart, Shield, Truck, 
  RotateCcw, ArrowLeft, Send, CheckCircle2, ChevronRight
} from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { 
    selectedProductId, 
    setSelectedProductId, 
    setActiveView, 
    addToCart, 
    toggleWishlist, 
    isWishlisted,
    token,
    showToast,
    setCheckoutOrderData,
    setActiveCategory
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Gallery
  const [activeImage, setActiveImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  // Quantity selection
  const [quantity, setQuantity] = useState(1);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product data on load
  useEffect(() => {
    if (!selectedProductId) return;
    setLoading(true);
    setQuantity(1);
    setReviewComment('');
    setReviewRating(5);

    fetch(`/api/products/${selectedProductId}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Product not found');
      })
      .then(data => {
        setProduct(data.product);
        setRelatedProducts(data.related || []);
        setActiveImage(data.product.images[0] || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showToast('Error loading product details.', 'error');
        setLoading(false);
      });
  }, [selectedProductId]);

  const handleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleZoomLeave = () => {
    setZoomStyle({
      transform: 'scale(1)',
      transformOrigin: 'center'
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    // Map single item checkout sequence
    const buyNowItems = [
      {
        productId: product.id,
        quantity: quantity
      }
    ];
    setCheckoutOrderData({ items: buyNowItems });
    setActiveView('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Please sign in to submit a product review.', 'warning');
      setActiveView('auth');
      return;
    }

    if (!reviewComment.trim()) {
      showToast('Please type a comment for your review.', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${selectedProductId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Thank you! Review submitted successfully.', 'success');
        setReviewComment('');
        setReviewRating(5);
        
        // Refresh product to display the new review
        fetch(`/api/products/${selectedProductId}`)
          .then(res => res.json())
          .then(data => {
            setProduct(data.product);
          });
      } else {
        showToast(data.message || 'Failed to submit review.', 'error');
      }
    } catch (err) {
      showToast('Error sending review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-[450px] bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div id="product-not-found-page" className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product details could not be found</h2>
        <button
          onClick={() => setActiveView('products')}
          className="mt-6 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const discPrice = product.price * (1 - product.discount/100);
  const isOut = product.stock === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left transition-all">
      
      {/* Breadcrumbs Navigation */}
      <div className="mb-6 flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
        <button onClick={() => setActiveView('landing')} className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => { setActiveCategory(product.category); setActiveView('products'); }} className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">{product.category}</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[160px]">{product.name}</span>
      </div>

      {/* Back button */}
      <button
        id="details-back-btn"
        onClick={() => setActiveView('products')}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to products</span>
      </button>

      {/* Product Information Section */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        
        {/* Left Column - Dynamic Gallery with Hover Zoom */}
        <div className="flex flex-col gap-4">
          
          {/* Large Image Viewport */}
          <div 
            id="details-large-image-frame"
            className="relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-950 aspect-square border border-gray-100 dark:border-gray-900 cursor-zoom-in"
            onMouseMove={handleZoom}
            onMouseLeave={handleZoomLeave}
          >
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 z-10 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                -{product.discount}% OFF
              </span>
            )}
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-100 ease-out"
              style={zoomStyle}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Thumbnails Row */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                id={`details-thumbnail-btn-${idx}`}
                onClick={() => setActiveImage(img)}
                className={`relative h-20 w-20 rounded-2xl overflow-hidden bg-gray-50 border-2 transition-all cursor-pointer shrink-0 ${
                  activeImage === img 
                    ? 'border-blue-600 ring-2 ring-blue-100 dark:border-blue-500 dark:ring-blue-950/50' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Product Purchase panel */}
        <div className="flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <span className="inline-block rounded-md bg-blue-50 text-blue-600 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider dark:bg-blue-950/50 dark:text-blue-400">
                {product.brand}
              </span>
              <h1 id="details-product-title" className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2 leading-tight">
                {product.name}
              </h1>
              
              {/* Star Rating summary */}
              <div className="flex items-center gap-1.5 mt-2.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 fill-current ${i < Math.floor(product.rating) ? 'opacity-100' : 'opacity-25'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{product.rating}</span>
                <span className="text-xs text-gray-400">({product.reviews.length} verified customer reviews)</span>
              </div>
            </div>

            {/* Pricing Panel */}
            <div className="rounded-2xl bg-gray-50 p-5 dark:bg-slate-900 border border-gray-100 dark:border-gray-800">
              <div className="flex items-baseline gap-3">
                <span id="details-discounted-price" className="text-4xl font-extrabold text-gray-900 dark:text-white">₹{discPrice.toLocaleString('en-IN')}</span>
                {product.discount > 0 && (
                  <span id="details-retail-price" className="text-lg text-gray-400 line-through font-medium">₹{product.price.toLocaleString('en-IN')}</span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1 font-semibold">Excludes 18% standard GST and shipping cost at checkout.</p>
            </div>

            {/* Product short description */}
            <p id="details-product-desc" className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed text-left">
              {product.description}
            </p>

            {/* Stock status indicator */}
            <div className="flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 pt-4 text-sm">
              <span className="font-semibold text-gray-400 uppercase tracking-wider text-xs">Availability:</span>
              <span id="details-stock-status" className={`font-bold ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} items remaining)` : 'Out of stock / Temp Backordered'}
              </span>
            </div>

            {/* Quantity selector and Action row */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              {product.stock > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Quantity:</span>
                    <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-slate-950">
                      <button
                        id="details-qty-dec"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-white font-bold cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span id="details-qty-value" className="px-5 text-sm font-bold text-gray-900 dark:text-white">{quantity}</span>
                      <button
                        id="details-qty-inc"
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-white font-bold cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      id="details-add-to-cart-submit"
                      onClick={() => addToCart(product, quantity)}
                      className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20 cursor-pointer transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Shopping Cart</span>
                    </button>
                    
                    <button
                      id="details-buy-now-submit"
                      onClick={handleBuyNow}
                      className="flex-1 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 font-bold py-3.5 text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                    >
                      <span>Buy Now</span>
                    </button>

                    <button
                      id="details-wishlist-toggle"
                      onClick={() => toggleWishlist(product)}
                      className={`p-3.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                        isWishlisted(product.id)
                          ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400'
                          : 'bg-white text-gray-400 hover:text-gray-600 dark:bg-slate-950'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id="details-sold-out-btn"
                  disabled
                  className="w-full rounded-2xl bg-gray-100 text-gray-400 py-3.5 text-sm font-bold dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}
            </div>

          </div>

          {/* Side perks list */}
          <div className="mt-8 border-t border-gray-100 dark:border-gray-800/80 pt-6 grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-[11px] font-bold text-gray-900 dark:text-white mt-1.5">Genuine Product</span>
              <span className="text-[9px] text-gray-400">100% Verified</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-[11px] font-bold text-gray-900 dark:text-white mt-1.5">VIP Logistics</span>
              <span className="text-[9px] text-gray-400">Swift Safe S&H</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-bold text-gray-900 dark:text-white mt-1.5">Refund Shield</span>
              <span className="text-[9px] text-gray-400">30-Day Guarantee</span>
            </div>
          </div>
        </div>

      </div>

      {/* Specifications & Reviews Section Tabs */}
      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
        
        {/* Specifications List Column */}
        <div className="lg:col-span-1 text-left space-y-4">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
            Technical Specifications
          </h3>
          <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50/50 dark:border-gray-800 dark:bg-slate-900/50 space-y-3">
            {Object.keys(product.specifications || {}).length > 0 ? (
              Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between items-start text-xs border-b border-gray-100/50 dark:border-gray-800/50 pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-gray-400 mr-2 shrink-0">{key}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-right">{val}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No special technical specs provided for this lifestyle product.</p>
            )}
          </div>
        </div>

        {/* Reviews Ledger & Review Submission Column */}
        <div className="lg:col-span-2 text-left space-y-6">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
            Customer Ledger Reviews ({product.reviews.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reviews list */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {product.reviews.length > 0 ? (
                product.reviews.map((rev: Review) => (
                  <div key={rev.id} className="p-4 rounded-xl border border-gray-50 bg-white dark:border-gray-800 dark:bg-slate-950 shadow-sm text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{rev.userName}</h4>
                      <span className="text-[10px] text-gray-400 font-semibold">{rev.date}</span>
                    </div>
                    {/* Stars */}
                    <div className="flex text-amber-400 gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 fill-current ${i < rev.rating ? 'opacity-100' : 'opacity-25'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-2.5">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-gray-50 dark:bg-slate-900 rounded-2xl">
                  <p className="text-sm text-gray-400 font-semibold">Be the first to leave a review!</p>
                  <p className="text-xs text-gray-400 mt-1">Submit your rating scores below after purchase.</p>
                </div>
              )}
            </div>

            {/* Submit a review */}
            <div className="rounded-2xl border border-gray-100 p-5 bg-white dark:border-gray-800 dark:bg-slate-950 text-left">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Post a verified review</h4>
              {token ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(stars => (
                        <button
                          key={stars}
                          type="button"
                          id={`post-review-star-${stars}`}
                          onClick={() => setReviewRating(stars)}
                          className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                            reviewRating >= stars 
                              ? 'bg-amber-50 border-amber-200 text-amber-500' 
                              : 'bg-gray-50 border-gray-200 text-gray-300 dark:border-gray-800'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review-comment-textarea" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Comments</label>
                    <textarea
                      id="review-comment-textarea"
                      placeholder="Type your authentic feedback regarding acoustics, build, or lifestyle comfort here..."
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    id="post-review-submit"
                    disabled={submittingReview}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                  </button>
                </form>
              ) : (
                <div className="p-6 text-center border border-dashed border-gray-100 dark:border-gray-800 rounded-xl space-y-4">
                  <p className="text-xs text-gray-400">You must be logged in to post an authentic verified review.</p>
                  <button
                    id="post-review-signin-btn"
                    onClick={() => setActiveView('auth')}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 shadow-sm cursor-pointer"
                  >
                    Sign In to Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Related Products list */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-gray-100 dark:border-gray-800/80 pt-10 text-left">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
            You May Also Like
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p: Product) => (
              <div
                key={p.id}
                id={`related-product-card-${p.id}`}
                onClick={() => setSelectedProductId(p.id)}
                className="group rounded-2xl border border-gray-50 bg-white p-4 shadow-sm hover:shadow-lg dark:border-gray-800 dark:bg-slate-900 transition-all cursor-pointer text-left"
              >
                <div className="h-44 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{p.brand}</span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h4>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">₹{(p.price * (1 - p.discount/100)).toLocaleString('en-IN')}</span>
                    {p.discount > 0 && (
                      <span className="text-[10px] text-gray-400 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
