/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Product } from '../types';
import { 
  Trash2, Heart, ArrowLeft, ShieldCheck, Tag, 
  ChevronRight, Ticket, Receipt, ShoppingBag
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    wishlist,
    updateCartQuantity,
    removeFromCart,
    toggleWishlist,
    isWishlisted,
    setActiveView,
    showToast,
    setCheckoutOrderData,
    token,
    setSelectedProductId
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Calculate Subtotal (price after product-specific discounts)
  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => {
      const discPrice = item.product.price * (1 - item.product.discount/100);
      return acc + (discPrice * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Re-validate coupon if subtotal changes below threshold
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minSpend) {
      setAppliedCoupon(null);
      showToast(`Coupon ${appliedCoupon.code} removed because subtotal fell below ₹${appliedCoupon.minSpend.toLocaleString('en-IN')}.`, 'warning');
    }
  }, [subtotal, appliedCoupon]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponInput)}&amount=${subtotal}`);
      const data = await res.json();

      if (res.ok) {
        setAppliedCoupon(data);
        showToast(`Coupon "${data.code}" applied! You saved ${data.discountPercent}%.`, 'success');
        setCouponInput('');
      } else {
        showToast(data.message || 'Invalid coupon code.', 'error');
      }
    } catch (err) {
      showToast('Error validating coupon.', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon code removed.', 'info');
  };

  // Saved addresses / shipping costs logic
  const discountAmount = appliedCoupon ? Number((subtotal * (appliedCoupon.discountPercent / 100)).toFixed(2)) : 0;
  const remaining = subtotal - discountAmount;
  const gstAmount = Number((remaining * 0.18).toFixed(2));
  const shippingCost = remaining > 4999 || remaining === 0 ? 0 : 149;
  const grandTotal = Number((remaining + gstAmount + shippingCost).toFixed(2));

  const handleSaveForLater = (product: Product) => {
    // Add to wishlist
    if (!isWishlisted(product.id)) {
      toggleWishlist(product);
    } else {
      showToast('Item is already saved in your wishlist.', 'info');
    }
    // Remove from cart
    removeFromCart(product.id);
  };

  const handleProceedToCheckout = () => {
    if (!token) {
      showToast('Please sign in to proceed with your checkout.', 'warning');
      setActiveView('auth');
      return;
    }

    // Set order items
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    setCheckoutOrderData({
      items: orderItems,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined
    });

    setActiveView('checkout');
  };

  if (cart.length === 0) {
    return (
      <div id="empty-cart-page" className="mx-auto max-w-7xl px-4 py-20 text-center flex flex-col items-center">
        <div className="h-16 w-16 bg-blue-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Your shopping cart is empty</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">Looks like you haven't added any premium essentials to your shopping list yet.</p>
        <button
          id="cart-continue-shopping-empty"
          onClick={() => setActiveView('products')}
          className="mt-8 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left transition-all">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column - List of Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-slate-900 space-y-4">
            
            {cart.map(item => {
              const product = item.product;
              const discPrice = product.price * (1 - product.discount/100);
              return (
                <div
                  key={product.id}
                  id={`cart-item-${product.id}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
                >
                  {/* Thumbnail and Title */}
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-20 w-20 rounded-xl object-cover bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{product.brand}</span>
                      <h4 
                        onClick={() => { setSelectedProductId(product.id); setActiveView('details'); }}
                        className="font-bold text-sm text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          id={`cart-save-later-${product.id}`}
                          onClick={() => handleSaveForLater(product)}
                          className="text-[11px] font-bold text-gray-400 hover:text-blue-500 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Heart className="w-3 h-3" />
                          <span>Save for Later</span>
                        </button>
                        <span className="text-gray-200">|</span>
                        <button
                          id={`cart-remove-${product.id}`}
                          onClick={() => removeFromCart(product.id)}
                          className="text-[11px] font-bold text-gray-400 hover:text-rose-500 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Price info */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:shrink-0">
                    
                    {/* Qty Selector */}
                    <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-slate-950">
                      <button
                        id={`cart-qty-dec-${product.id}`}
                        onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                        className="px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-white font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span id={`cart-qty-val-${product.id}`} className="px-3 text-xs font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                      <button
                        id={`cart-qty-inc-${product.id}`}
                        onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                        className="px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-white font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                     <div className="text-right flex flex-col">
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                        ₹{(discPrice * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{(product.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

          </div>

          <button
            id="cart-continue-shopping-main"
            onClick={() => setActiveView('products')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Right Column - Billing Summary */}
        <div className="space-y-6">
          
          {/* Apply Coupon Code */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mb-3">
              <Ticket className="w-4.5 h-4.5 text-blue-500" />
              <span>Promo Codes</span>
            </h4>
            
            {appliedCoupon ? (
              <div id="applied-coupon-badge" className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                <div>
                  <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 tracking-wider">CODE: {appliedCoupon.code}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold">{appliedCoupon.description}</p>
                </div>
                <button
                  id="cart-remove-coupon-btn"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  id="coupon-code-input"
                  type="text"
                  placeholder="e.g. WELCOME20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                />
                <button
                  type="submit"
                  id="apply-coupon-submit"
                  disabled={validatingCoupon}
                  className="rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 text-xs font-bold hover:scale-105 cursor-pointer transition-transform whitespace-nowrap"
                >
                  {validatingCoupon ? 'Check...' : 'Apply'}
                </button>
              </form>
            )}

            <div className="mt-3 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-[10px] text-gray-400 font-semibold">Try copying <span className="text-blue-500">WELCOME20</span> or <span className="text-blue-500">SAVE10</span> for instant savings!</p>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
              <Receipt className="w-4.5 h-4.5 text-blue-500" />
              <span>Checkout Invoice</span>
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between font-semibold text-gray-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-gray-500">
                <span>Calculated GST (18%)</span>
                <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between font-semibold text-gray-500">
                <span>Shipping Fees</span>
                <span>{shippingCost === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">FREE</span> : `₹${shippingCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
              </div>

              {shippingCost > 0 && (
                <p className="text-[10px] text-gray-400 font-semibold italic bg-gray-50 dark:bg-gray-950 p-2 rounded-lg">Add ₹{(4999 - remaining).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more of items to unlock free premium shipping!</p>
              )}

              <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white pt-4 border-t border-gray-100 dark:border-gray-800">
                <span>Grand Total</span>
                <span id="cart-grand-total">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              id="cart-proceed-checkout-btn"
              onClick={handleProceedToCheckout}
              className="w-full mt-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 text-sm flex items-center justify-center gap-1.5 shadow-lg hover:shadow-blue-500/20 cursor-pointer transition-all"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Secure lock */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Secure 256-bit SSL encrypted invoice</span>
          </div>

        </div>

      </div>

    </div>
  );
};
