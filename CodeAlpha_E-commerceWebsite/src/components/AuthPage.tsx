/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2, Sparkles, ShoppingBag } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, showToast, setActiveView } = useApp();
  
  const [isLoginView, setIsLoginView] = useState(true);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleToggleView = () => {
    setIsLoginView(!isLoginView);
    setIsForgotPasswordView(false);
    setPassword('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Form Val
    if (!email.trim() || !password.trim()) {
      showToast('Please type a valid email and password.', 'warning');
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      showToast('Password should be at least 4 characters long.', 'warning');
      setLoading(false);
      return;
    }

    if (isLoginView) {
      // Login
      const success = await login(email, password);
      if (success) {
        setActiveView('landing');
      }
    } else {
      // Register
      if (!name.trim()) {
        showToast('Please provide your name.', 'warning');
        setLoading(false);
        return;
      }
      const success = await register(name, email, password, phone, address);
      if (success) {
        setActiveView('landing');
      }
    }
    setLoading(false);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your email.', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast(`We have mock-dispatched password recovery coordinates to "${email}".`, 'info');
      setIsForgotPasswordView(false);
      setIsLoginView(true);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex items-center justify-center min-h-[80vh] transition-all">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-slate-900 overflow-hidden text-left relative">
        {/* Top visual graphic strip */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" />
        
        <div className="p-8 md:p-10">
          
          {/* Logo element */}
          <div className="flex items-center gap-2 mb-6 text-xl font-extrabold text-blue-600 dark:text-blue-500">
            <ShoppingBag className="h-6 w-6 stroke-[2.5]" />
            <span>Modern<span className="text-gray-900 dark:text-white">Store</span></span>
          </div>

          {isForgotPasswordView ? (
            /* FORGOT PASSWORD FORM */
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Recover Password</h2>
              <p className="text-xs text-gray-400 mt-1 mb-6">Enter your authorized email to receive self-reset instructions.</p>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email-input" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Registered Email</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="forgot-email-input"
                      type="email"
                      placeholder="e.g. care@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="forgot-submit-btn"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Recover Password</span>
                </button>
              </form>

              <button
                id="forgot-back-to-login"
                onClick={() => setIsForgotPasswordView(false)}
                className="w-full text-center mt-6 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* LOGIN & REGISTRATION FORMS */
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {isLoginView ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-gray-400 mt-1 mb-6">
                {isLoginView 
                  ? 'Access your saved address, wishlist, and order trackers.' 
                  : 'Register now to unlock exclusive coupons and rapid checkouts.'}
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Name (Registration Only) */}
                {!isLoginView && (
                  <div>
                    <label htmlFor="register-name-input" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-gray-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="register-name-input"
                        type="text"
                        placeholder="Alex Customer"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!isLoginView}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label htmlFor="auth-email-input" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="auth-email-input"
                      type="email"
                      placeholder="e.g. user@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    />
                  </div>
                </div>

                {/* Phone & Address (Registration Only) */}
                {!isLoginView && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="register-phone-input" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-gray-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          id="register-phone-input"
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="register-address-input" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Default Address</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-gray-400">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <input
                          id="register-address-input"
                          type="text"
                          placeholder="456 Shoppers Ave"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="auth-password-input" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Password</label>
                    {isLoginView && (
                      <button
                        type="button"
                        id="auth-forgot-password-trigger"
                        onClick={() => setIsForgotPasswordView(true)}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="auth-password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isLoginView ? '••••••••' : 'At least 4 chars'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    />
                    <button
                      type="button"
                      id="auth-password-mask-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                {isLoginView && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      id="auth-remember-me-checkbox"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600 h-4.5 w-4.5 dark:border-gray-800"
                    />
                    <label htmlFor="auth-remember-me-checkbox" className="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer">Remember me next session</label>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  id="auth-submit-btn"
                  disabled={loading}
                  className="w-full mt-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isLoginView ? 'Sign In' : 'Register Profile'}</span>
                </button>
              </form>

              {/* Toggle switch */}
              <div className="mt-8 border-t border-gray-150 dark:border-gray-800 pt-6 text-center">
                <p className="text-xs text-gray-500">
                  {isLoginView ? "Don't have an account?" : "Already registered?"}{' '}
                  <button
                    id="auth-view-toggle-btn"
                    onClick={handleToggleView}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {isLoginView ? 'Create Account' : 'Sign In Now'}
                  </button>
                </p>
              </div>

              {/* Easy demo hints */}
              <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-xl dark:bg-gray-950 dark:border-gray-850">
                <p className="text-[10px] text-gray-400 leading-normal text-center">
                  💡 <span className="font-bold">Developer Sandbox:</span> Access custom user with <span className="font-bold text-gray-700 dark:text-gray-300">user@gmail.com</span> / <span className="font-bold text-gray-700 dark:text-gray-300">user123</span> or admin panel with <span className="font-bold text-gray-700 dark:text-gray-300">admin@gmail.com</span> / <span className="font-bold text-gray-700 dark:text-gray-300">admin123</span>.
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
