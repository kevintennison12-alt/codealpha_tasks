/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Product, OrderItem, Order } from '../types';
import { 
  CreditCard, ShieldCheck, CheckCircle, Package, 
  MapPin, ChevronRight, Receipt, Loader2, ArrowLeft, ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const CheckoutPage: React.FC = () => {
  const {
    user,
    token,
    cart,
    clearCart,
    checkoutOrderData,
    setCheckoutOrderData,
    setActiveView,
    showToast,
    updateProfile
  } = useApp();

  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'CreditCard' | 'UPI' | 'COD'>('CreditCard');
  
  // Credit Card Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // UPI Form
  const [upiId, setUpiId] = useState('');

  // States
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [orderItemsDetails, setOrderItemsDetails] = useState<OrderItem[]>([]);
  
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<Order | null>(null);

  // Sync address if user profile loaded
  useEffect(() => {
    if (user) {
      setShippingAddress(user.address || '');
      setBillingAddress(user.address || '');
    }
  }, [user]);

  // Sync addresses if sameAsBilling toggled
  useEffect(() => {
    if (sameAsBilling) {
      setBillingAddress(shippingAddress);
    }
  }, [shippingAddress, sameAsBilling]);

  // Load and calculate checkout values
  useEffect(() => {
    if (!checkoutOrderData || !checkoutOrderData.items || checkoutOrderData.items.length === 0) {
      // Fallback: load current cart
      if (cart.length > 0) {
        const fallbackItems = cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }));
        setCheckoutOrderData({ items: fallbackItems });
      } else {
        showToast('Your checkout queue is empty.', 'warning');
        setActiveView('cart');
      }
      return;
    }

    // Fetch pricing and detailed information from server simulation
    const calculateTotals = async () => {
      try {
        let computedSubtotal = 0;
        const detailsList: OrderItem[] = [];

        // We can fetch complete product info from database locally by hitting /api/products
        const prodRes = await fetch('/api/products?limit=100');
        const prodData = await prodRes.json();
        const allProducts: Product[] = prodData.products || [];

        for (const checkoutItem of checkoutOrderData.items) {
          const product = allProducts.find(p => p.id === checkoutItem.productId);
          if (product) {
            const discPrice = product.price * (1 - product.discount/100);
            computedSubtotal += discPrice * checkoutItem.quantity;
            detailsList.push({
              id: product.id,
              name: product.name,
              image: product.images[0],
              price: product.price,
              discount: product.discount,
              quantity: checkoutItem.quantity
            });
          }
        }

        setSubtotal(computedSubtotal);
        setOrderItemsDetails(detailsList);

        // Coupon validation if applied
        let computedDiscount = 0;
        if (checkoutOrderData.couponCode) {
          const coupRes = await fetch(`/api/coupons/validate?code=${checkoutOrderData.couponCode}&amount=${computedSubtotal}`);
          if (coupRes.ok) {
            const coupon = await coupRes.json();
            computedDiscount = computedSubtotal * (coupon.discountPercent / 100);
          }
        }

        setDiscountAmount(computedDiscount);
        const remaining = computedSubtotal - computedDiscount;
        const computedGst = Number((remaining * 0.18).toFixed(2));
        const computedShipping = remaining > 100 || remaining === 0 ? 0 : 9.99;
        const computedGrandTotal = Number((remaining + computedGst + computedShipping).toFixed(2));

        setGstAmount(computedGst);
        setShippingCost(computedShipping);
        setGrandTotal(computedGrandTotal);
      } catch (err) {
        console.error('Error calculating checkout prices', err);
      }
    };

    calculateTotals();
  }, [checkoutOrderData]);

  // Place Order API call
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!shippingAddress.trim()) {
      showToast('Please type a valid shipping address.', 'warning');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderPayload = {
        items: checkoutOrderData.items,
        shippingAddress,
        billingAddress,
        paymentMethod,
        couponCode: checkoutOrderData.couponCode,
        cardDetails: paymentMethod === 'CreditCard' ? { cardNumber, cardName, cardExpiry, cardCvv } : undefined,
        upiId: paymentMethod === 'UPI' ? upiId : undefined
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (res.ok) {
        setPlacedOrderDetails(data.order);
        showToast('Your order was placed successfully!', 'success');
        
        // If user wants to save this address to profile
        if (user && !user.savedAddresses.includes(shippingAddress)) {
          updateProfile({
            name: user.name,
            address: shippingAddress,
            savedAddresses: [...user.savedAddresses, shippingAddress]
          });
        }

        // Clear cart if we checked out from cart
        const orderProductIds = checkoutOrderData.items.map((i: any) => i.productId);
        const isCartCheckout = cart.some(item => orderProductIds.includes(item.product.id));
        if (isCartCheckout) {
          clearCart();
        }
      } else {
        showToast(data.message || 'Failed to authorize checkout transaction.', 'error');
      }
    } catch (err) {
      showToast('Connection error processing payment.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
    if (val.length <= 19) setCardNumber(val);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    if (val.length <= 5) setCardExpiry(val);
  };

  const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 4) setCardCvv(val);
  };

  // SUCCESS ANIMATED SCREEN
  if (placedOrderDetails) {
    return (
      <div id="checkout-success-screen" className="mx-auto max-w-2xl px-4 py-16 text-center text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-gray-100 bg-white p-8 md:p-10 shadow-2xl dark:border-gray-800 dark:bg-slate-900"
        >
          {/* Celebrating checkmark scale-in */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="h-16 w-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="w-9 h-9 stroke-[2.5]" />
            </motion.div>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Order Placed Successfully!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Your transaction was authorized securely. Receipt order reference id is <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{placedOrderDetails.id}</span>.
          </p>

          {/* Delivery Tracker Simulation */}
          <div className="mt-8 p-5 rounded-2xl bg-gray-50 dark:bg-slate-950 text-left border border-gray-100 dark:border-gray-800">
            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Delivery Track Timeline</h4>
            <div className="relative pl-6 space-y-6">
              {/* Tracker vertical line */}
              <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-gray-800" />
              
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-5 h-4.5 w-4.5 rounded-full border-4 border-white bg-blue-600 dark:border-slate-950 ring-2 ring-blue-100" />
                <div>
                  <h5 className="font-bold text-sm text-gray-900 dark:text-white">Order Received (Pending)</h5>
                  <p className="text-xs text-gray-500 mt-0.5">Your package is being securely packed and dispatched. Est. shipping in 12 hours.</p>
                </div>
              </div>
              <div className="relative flex items-start gap-4 opacity-50">
                <div className="absolute -left-5 h-4.5 w-4.5 rounded-full border-4 border-white bg-gray-300 dark:border-slate-950" />
                <div>
                  <h5 className="font-bold text-sm text-gray-500">Processing & In transit</h5>
                  <p className="text-xs text-gray-400 mt-0.5">Awaiting courier sorting sweep.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6 text-left space-y-3 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Shipped To:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-right">{placedOrderDetails.shippingAddress}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Payment Channel:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 uppercase">{placedOrderDetails.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white pt-3 border-t border-gray-50 dark:border-gray-850">
              <span>Paid Total:</span>
              <span>₹{placedOrderDetails.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              id="success-dashboard-btn"
              onClick={() => setActiveView('dashboard')}
              className="flex-1 rounded-2xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:scale-105 font-bold py-3 text-sm shadow-md cursor-pointer transition-transform"
            >
              My Order History
            </button>
            <button
              id="success-shopping-btn"
              onClick={() => setActiveView('landing')}
              className="flex-1 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 text-sm shadow-md cursor-pointer transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left transition-all">
      
      {/* Back to Cart button */}
      <button
        id="checkout-back-btn"
        onClick={() => setActiveView('cart')}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping Cart</span>
      </button>

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
        Checkout Shipping & Payment
      </h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Columns - Form input options */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address fields */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-50 dark:border-gray-800">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>Shipping Destination</span>
              </h3>

              {user && user.savedAddresses && user.savedAddresses.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Saved Address Presets</label>
                  <div className="grid grid-cols-1 gap-2">
                    {user.savedAddresses.map((addr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        id={`saved-addr-btn-${idx}`}
                        onClick={() => {
                          setShippingAddress(addr);
                          if (sameAsBilling) setBillingAddress(addr);
                        }}
                        className={`text-left p-3 text-xs rounded-xl border transition-all cursor-pointer ${
                          shippingAddress === addr 
                            ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900' 
                            : 'bg-white border-gray-150 hover:bg-gray-50 dark:bg-slate-950 dark:border-gray-850 dark:text-gray-300'
                        }`}
                      >
                        {addr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="shipping-address-textarea" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Delivery Shipping Address</label>
                  <textarea
                    id="shipping-address-textarea"
                    placeholder="Enter full address details (House/Suite number, Street Name, City, State, ZIP code)"
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    id="same-billing-checkbox"
                    type="checkbox"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-100 h-4.5 w-4.5 dark:border-gray-800"
                  />
                  <label htmlFor="same-billing-checkbox" className="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer">Billing Address is same as Shipping</label>
                </div>

                {!sameAsBilling && (
                  <div>
                    <label htmlFor="billing-address-textarea" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Billing Address</label>
                    <textarea
                      id="billing-address-textarea"
                      placeholder="Enter billing billing credentials"
                      rows={2}
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-50 dark:border-gray-800">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span>Authorize Payment</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-6 bg-gray-50 p-1 rounded-2xl dark:bg-gray-950">
                {[
                  { id: 'CreditCard', label: 'Credit Card' },
                  { id: 'UPI', label: 'UPI Wallet' },
                  { id: 'COD', label: 'Cash on Delivery' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    id={`pay-method-btn-${opt.id}`}
                    onClick={() => setPaymentMethod(opt.id as any)}
                    className={`text-center py-2 text-xs font-extrabold rounded-xl cursor-pointer transition-all ${
                      paymentMethod === opt.id 
                        ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* CARD DETAILS FORM WITH VIRTUAL CARD */}
              {paymentMethod === 'CreditCard' && (
                <div className="space-y-6">
                  
                  {/* Interactive Virtual Card Display */}
                  <div className="mx-auto w-full max-w-sm rounded-2xl bg-gradient-to-br from-slate-900 via-gray-800 to-blue-950 p-6 text-white shadow-xl flex flex-col justify-between h-48 relative overflow-hidden">
                    {/* Deco sphere */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-blue-500/10 blur-xl" />
                    
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">Secure Issuer</span>
                        <span className="text-sm font-extrabold">Modern Bank</span>
                      </div>
                      <CreditCard className="w-8 h-8 text-white/50" />
                    </div>

                    <div className="font-mono text-lg font-bold tracking-widest text-center py-2 text-gray-200">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end text-xs">
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] uppercase text-gray-400">Cardholder</span>
                        <span className="font-bold truncate max-w-[150px] uppercase">{cardName || 'ALEX CUSTOMER'}</span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase text-gray-400">Expiry</span>
                          <span className="font-bold font-mono">{cardExpiry || 'MM/YY'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase text-gray-400">CVV</span>
                          <span className="font-bold font-mono">{cardCvv ? '•••' : '•••'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="card-number-input" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Card Number</label>
                      <input
                        id="card-number-input"
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        required={paymentMethod === 'CreditCard'}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="card-name-input" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Cardholder Name</label>
                      <input
                        id="card-name-input"
                        type="text"
                        placeholder="Alex Customer"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required={paymentMethod === 'CreditCard'}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="card-expiry-input" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Expiry Date</label>
                        <input
                          id="card-expiry-input"
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleCardExpiryChange}
                          required={paymentMethod === 'CreditCard'}
                          className="w-full text-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="card-cvv-input" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">CVV Code</label>
                        <input
                          id="card-cvv-input"
                          type="password"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={handleCardCvvChange}
                          required={paymentMethod === 'CreditCard'}
                          className="w-full text-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI WALLET DETAILS */}
              {paymentMethod === 'UPI' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400 leading-relaxed">Enter your Virtual Payment Address (VPA) / UPI address to receive a secure approval request on your authorized mobile UPI application.</p>
                  <div>
                    <label htmlFor="upi-id-input" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">UPI ID (VPA)</label>
                    <input
                      id="upi-id-input"
                      type="text"
                      placeholder="e.g. customer@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required={paymentMethod === 'UPI'}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* CASH ON DELIVERY DETAILS */}
              {paymentMethod === 'COD' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl dark:bg-amber-950/20 dark:border-amber-900/50">
                  <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-semibold">Cash On Delivery Selected</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed mt-1">Please pay cash directly to the dispatch logistics courier when delivering this order to your doorstep. Make sure to have exact change ready.</p>
                </div>
              )}

            </div>

          </div>

          {/* Right Column - Order Review Summary */}
          <div className="space-y-6">
            
            {/* Review list */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-gray-800 mb-4">
                <Package className="w-4.5 h-4.5 text-blue-500" />
                <span>Review Cart ({orderItemsDetails.reduce((a, i) => a + i.quantity, 0)})</span>
              </h4>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-2">
                {orderItemsDetails.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-50 border shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{item.quantity} x ₹{(item.price * (1 - item.discount/100)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white shrink-0">₹{((item.price * (1 - item.discount/100)) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total invoice details */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-gray-800 mb-4">
                <Receipt className="w-4.5 h-4.5 text-blue-500" />
                <span>Authorized Invoice</span>
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between font-semibold text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Coupon Savings</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-gray-500">
                  <span>GST Taxes (18%)</span>
                  <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between font-semibold text-gray-500">
                  <span>Shipping Cost</span>
                  <span>{shippingCost === 0 ? <span className="text-emerald-600 font-bold dark:text-emerald-400">FREE</span> : `₹${shippingCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span>Grand Total</span>
                  <span id="checkout-grand-total">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                id="checkout-place-order-submit"
                disabled={placingOrder}
                className="w-full mt-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20 cursor-pointer disabled:bg-gray-400 transition-all"
              >
                {placingOrder ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Verifying Funds...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span>Place Secure Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>

            {/* Shield protection details */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>SSL bank protected transaction</span>
            </div>

          </div>

        </div>
      </form>

    </div>
  );
};
