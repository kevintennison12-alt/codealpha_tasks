/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Product } from '../types';
import { 
  ArrowRight, ShieldCheck, Truck, RotateCcw, Clock, 
  Sparkles, Star, Copy, Check, ChevronRight, Gift, Tag, ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const { setActiveView, setSelectedProductId, setActiveCategory, setSearchQuery, showToast } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products?limit=4&sort=popularity')
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching featured products', err);
        setLoading(false);
      });
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    showToast(`Coupon "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setSearchQuery('');
    setActiveView('products');
  };

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setActiveView('details');
  };

  const stats = [
    { value: '30+', label: 'Premium Products', desc: 'Curated world-class items' },
    { value: '99.8%', label: 'Happy Customers', desc: 'Based on verified reviews' },
    { value: '24/7', label: 'VIP Support', desc: 'Real humans, immediate replies' },
    { value: '150k+', label: 'Orders Shipped', desc: 'Secure worldwide logistics' }
  ];

  const categories = [
    { name: 'Electronics', count: '6 Items', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop', color: 'bg-blue-500/10 text-blue-600' },
    { name: 'Fashion', count: '6 Items', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop', color: 'bg-purple-500/10 text-purple-600' },
    { name: 'Home & Living', count: '6 Items', image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=500&auto=format&fit=crop', color: 'bg-emerald-500/10 text-emerald-600' },
    { name: 'Fitness & Wellness', count: '5 Items', image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&auto=format&fit=crop', color: 'bg-amber-500/10 text-amber-600' }
  ];

  const testimonials = [
    { name: 'Sarah Jenkins', role: 'Tech Journalist', comment: 'The AeroSound headphones blew my expectations away. Better soundstage than brands costing twice as much. Extremely swift delivery too!', rating: 5, avatar: 'SJ' },
    { name: 'Marcus Sterling', role: 'Architect', comment: 'Minimalist, functional, and gorgeous. The ErgoComfort chair cured my desk posture pain entirely. High-quality stoneware mugs are also beautiful.', rating: 5, avatar: 'MS' },
    { name: 'Elena Rostova', role: 'Fitness Coach', comment: 'The Smart Hydrate UV water bottle is a complete lifesaver. Pure water on the go, and the battery lasts forever. Outstanding service!', rating: 5, avatar: 'ER' }
  ];

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-950 to-indigo-950 py-20 lg:py-32 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(124,58,237,0.15),transparent_50%)]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            
            {/* Left Column Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-start gap-6"
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400 border border-blue-500/20 backdrop-blur-md">
                <Sparkles className="h-4.5 w-4.5" />
                <span>Summer Launch Collection 2026</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-left leading-[1.1]">
                Redefining the <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Aesthetic of Living.
                </span>
              </h1>

              <p className="text-lg text-gray-300 text-left max-w-lg leading-relaxed">
                Discover over 30+ premium, hand-curated electronic gears, athletic wear, and minimalist lifestyle essentials engineered to blend style with top-tier performance.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  id="hero-shop-all-btn"
                  onClick={() => { setActiveCategory('All'); setActiveView('products'); }}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 hover:shadow-blue-500/20 transition-all cursor-pointer group"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  id="hero-offers-btn"
                  onClick={() => {
                    document.getElementById('coupon-offers-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <span>View Hot Offers</span>
                </button>
              </div>
            </motion.div>

            {/* Right Column Product Promo Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-blue-500 to-purple-600 opacity-20 blur-2xl" />
              <div className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop"
                  alt="Featured AeroSound Headphones"
                  className="w-full h-96 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating detail tag */}
                <div className="absolute bottom-10 left-10 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-md flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center font-bold">15%</div>
                  <div>
                    <h3 className="font-bold text-sm">AeroSound Pro</h3>
                    <p className="text-xs text-gray-300">Premium ANC Audio • $169.99</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Feature Badges Section */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div className="flex items-center gap-3.5 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Truck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Free Fast Delivery</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Free shipping for orders over $100</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Secure Payments</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">SSL encrypted bank integrations</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">30-Day Returns</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">No hassle money back guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">VIP Support Line</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Instant connection to real people</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Curated Categories</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Find precision-engineered gear tailored for your specific lifestyle</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, index) => (
              <div
                key={index}
                id={`landing-category-card-${index}`}
                onClick={() => handleCategorySelect(cat.name)}
                className="group relative h-72 w-full overflow-hidden rounded-2xl shadow-md border border-gray-100 dark:border-gray-900 cursor-pointer"
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 z-10 transition-colors" />
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Text Content */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white`}>
                      {cat.count}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-1">
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coupon Offers section */}
      <section id="coupon-offers-section" className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-3">
              <Gift className="w-5 h-5 animate-bounce" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Active Offers & Deals</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">Copy these checkout coupon codes to unlock premium discounts on your order</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { code: 'WELCOME20', disc: '20% OFF', desc: 'Orders above $100', bg: 'from-blue-600 to-indigo-600' },
              { code: 'SAVE10', disc: '10% OFF', desc: 'Orders above $50', bg: 'from-purple-600 to-violet-600' },
              { code: 'SUPER30', disc: '30% OFF', desc: 'Orders above $200', bg: 'from-pink-600 to-rose-600' },
              { code: 'FREESHIP', disc: 'FREE S&H', desc: 'Orders above $30', bg: 'from-emerald-600 to-teal-600' }
            ].map(cop => (
              <div
                key={cop.code}
                className="relative rounded-2xl bg-white p-5 border border-gray-100 dark:bg-slate-900 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col justify-between"
              >
                {/* Decorative circle */}
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800" />
                
                <div className="relative text-left">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3">
                    <Tag className="w-3.5 h-3.5" />
                    <span>STORE COUPON</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{cop.disc}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{cop.desc}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between gap-2">
                  <div className="font-mono text-sm font-extrabold tracking-wider text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                    {cop.code}
                  </div>
                  <button
                    onClick={() => handleCopyCoupon(cop.code)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:scale-105 transition-transform cursor-pointer"
                    aria-label="Copy code"
                  >
                    {copiedCoupon === cop.code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <div className="text-left">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Best Selling Favorites</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Verified crowd favorites backed by stellar client feedback</p>
            </div>
            <button
              onClick={() => { setActiveCategory('All'); setActiveView('products'); }}
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:gap-2 transition-all cursor-pointer"
            >
              <span>Explore all 30+ products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="animate-pulse flex flex-col gap-3">
                  <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((p: Product) => {
                const discPrice = p.price * (1 - p.discount/100);
                return (
                  <div
                    key={p.id}
                    id={`featured-product-${p.id}`}
                    onClick={() => handleProductClick(p.id)}
                    className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-xl dark:border-gray-800 dark:bg-slate-950 transition-all cursor-pointer hover:-translate-y-1.5 duration-300"
                  >
                    {/* Image Area */}
                    <div className="relative h-60 w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900">
                      {p.discount > 0 && (
                        <span className="absolute top-2.5 left-2.5 z-10 rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                          -{p.discount}% OFF
                        </span>
                      )}
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 flex-1 text-left flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{p.brand}</span>
                        <h3 className="font-bold text-base text-gray-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                        
                        {/* Rating block */}
                        <div className="flex items-center gap-1 mt-1.5">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 fill-current ${i < Math.floor(p.rating) ? 'opacity-100' : 'opacity-25'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{p.rating}</span>
                          <span className="text-[10px] text-gray-400 font-medium">({p.reviews.length})</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-900 pt-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold text-gray-900 dark:text-white">₹{discPrice.toLocaleString('en-IN')}</span>
                          {p.discount > 0 && (
                            <span className="text-xs text-gray-400 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Animated Statistics Banner */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((st, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <span className="text-3xl font-extrabold sm:text-4xl lg:text-5xl bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  {st.value}
                </span>
                <span className="text-sm font-semibold mt-2 text-gray-200">{st.label}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">{st.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Voices of Satisfaction</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">What verified customers are saying about our premium shopping experience</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-slate-900 text-left flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
              >
                <div>
                  {/* Stars */}
                  <div className="flex text-amber-400 gap-0.5 mb-4">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    "{test.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3.5 mt-6 pt-5 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    {test.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{test.name}</h4>
                    <p className="text-xs text-gray-400 font-medium">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-3xl">Unlock Exclusive VIP Perks</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-500 dark:text-gray-400">
            Sign up to receive early launch announcements, premium discounts, and custom editorial collection logs direct to your inbox.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); showToast('Subscribed successfully! Thank you.', 'success'); }}
            className="mt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your personal email..."
              required
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
            />
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 cursor-pointer whitespace-nowrap transition-colors"
            >
              Sign Up
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 text-gray-400 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            
            {/* Column 1: Info */}
            <div className="text-left">
              <div className="flex items-center gap-2 text-xl font-extrabold text-white">
                <ShoppingBag className="h-6 w-6 text-blue-500" />
                <span>Modern<span className="text-blue-500">Store</span></span>
              </div>
              <p className="mt-4 text-xs text-gray-400 leading-relaxed max-w-xs">
                A premium full-stack shopping marketplace delivering top-tier components, designer clothing apparel, and minimalist accessories with unparalleled service.
              </p>
            </div>

            {/* Column 2: Links */}
            <div className="text-left">
              <h4 className="font-bold text-sm text-white tracking-wider uppercase">Shop Categories</h4>
              <ul className="mt-4 space-y-2.5 text-xs">
                {['Electronics', 'Fashion', 'Home & Living', 'Fitness & Wellness'].map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategorySelect(cat)}
                      className="hover:text-white cursor-pointer transition-colors"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Policy */}
            <div className="text-left">
              <h4 className="font-bold text-sm text-white tracking-wider uppercase">Helpful Info</h4>
              <ul className="mt-4 space-y-2.5 text-xs">
                {['Track Order', 'Shipping Info', 'Standard Returns', 'Terms & Conditions', 'Privacy Protection'].map(lnk => (
                  <li key={lnk}>
                    <button onClick={() => showToast(`Opening "${lnk}" details page.`, 'info')} className="hover:text-white cursor-pointer transition-colors">
                      {lnk}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="text-left">
              <h4 className="font-bold text-sm text-white tracking-wider uppercase">Customer Support</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-gray-400">
                <li>VIP Support Line: <span className="text-white">+1 (800) 555-0199</span></li>
                <li>Support Email: <span className="text-white">care@modernstore.com</span></li>
                <li>Global HQ: <span className="text-white">123 Cloud Avenue, CA 94016</span></li>
              </ul>
            </div>

          </div>

          <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 ModernStore Platform. All rights reserved. Registered under standard commercial trade code.</p>
            <p>Designed and Built with Full-Stack Express and React</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
