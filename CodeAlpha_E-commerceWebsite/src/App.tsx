/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './components/AppContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './components/LandingPage';
import { ProductListingPage } from './components/ProductListingPage';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AuthPage } from './components/AuthPage';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ShoppingBag, HelpCircle, ShieldAlert, Heart, Info, Globe, Smartphone } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, theme } = useApp();

  // Keep theme class in sync with document root element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle scroll reset on view transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return <LandingPage />;
      case 'products':
        return <ProductListingPage />;
      case 'details':
        return <ProductDetailsPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'auth':
        return <AuthPage />;
      case 'dashboard':
        return <UserDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 dark:bg-slate-950 dark:text-gray-100 flex flex-col justify-between transition-colors duration-200">
      
      {/* Dynamic Navbar */}
      <Navbar />

      {/* Slide Toast alert notifications */}
      <ToastContainer />

      {/* Main viewport area */}
      <main className="flex-grow pt-20">
        {renderActiveView()}
      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-gray-100 bg-white pt-16 pb-8 dark:border-gray-850 dark:bg-slate-900 text-left transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* About Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-black text-blue-600 dark:text-blue-500">
                <ShoppingBag className="h-6 w-6 stroke-[2.5]" />
                <span>Modern<span className="text-gray-950 dark:text-white">Store</span></span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We design and engineer bespoke, premium lifestyle and tech accessories aimed at elevating your daily productivity, aesthetics, and audio immersion.
              </p>
            </div>

            {/* Quick Navigation Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Discover Collection</h4>
              <div className="grid grid-cols-1 gap-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <button onClick={() => { window.location.reload(); }} className="hover:text-blue-600 text-left cursor-pointer">Best Sellers</button>
                <button onClick={() => { window.location.reload(); }} className="hover:text-blue-600 text-left cursor-pointer">Seasonal Sales</button>
                <button onClick={() => { window.location.reload(); }} className="hover:text-blue-600 text-left cursor-pointer">Featured Acoustics</button>
                <button onClick={() => { window.location.reload(); }} className="hover:text-blue-600 text-left cursor-pointer">Leather Crafts</button>
              </div>
            </div>

            {/* Customer Protection Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Customer Shield</h4>
              <div className="grid grid-cols-1 gap-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> <span>Help Center Support</span></span>
                <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> <span>Secure SSL Payments</span></span>
                <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> <span>30-Day Refund Guarantee</span></span>
                <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> <span>VIP Delivery Tracking</span></span>
              </div>
            </div>

            {/* Platform Credentials */}
            <div className="space-y-4 text-xs text-gray-500">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 font-bold">VIP Logistics Hub</h4>
              <p className="leading-relaxed">All ordered consignments are processed and tracked from our automated smart fulfillment facility.</p>
              
              <div className="flex gap-4 pt-1.5">
                <span className="flex items-center gap-1 font-semibold text-gray-400"><Globe className="w-4 h-4" /> Global S&H</span>
                <span className="flex items-center gap-1 font-semibold text-gray-400"><Smartphone className="w-4 h-4" /> App Support</span>
              </div>
            </div>

          </div>

          {/* Copying lines */}
          <div className="border-t border-gray-50 pt-8 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-semibold text-gray-400">
            <p>© 2026 ModernStore Premium. All rights reserved. Handcrafted for pristine daily routines.</p>
            <div className="flex gap-4">
              <span className="hover:text-gray-600 cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-gray-600 cursor-pointer">GST Invoices</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
