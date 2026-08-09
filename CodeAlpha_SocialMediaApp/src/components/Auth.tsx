import React, { useState } from 'react';
import { useSocialMedia } from '../data/store';
import { Shield, Lock, User, Mail, Check, Star, AlertCircle } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register, users } = useSocialMedia();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<'user' | 'admin'>('user');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('All authentication fields are required.');
      return;
    }

    const success = login(loginUsername, loginUsername.toLowerCase() === 'admin' ? 'admin' : 'user');
    if (!success) {
      setLoginError('Invalid security credentials or account blocked.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);

    if (!regUsername.trim() || !regEmail.trim() || !regFullName.trim()) {
      setRegError('All fields must be completed.');
      return;
    }

    const cleanUsername = regUsername.trim().toLowerCase();
    if (cleanUsername.includes(' ')) {
      setRegError('Username must not contain whitespace.');
      return;
    }

    const success = register(cleanUsername, regEmail, regFullName, regRole);
    if (success) {
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        setActiveTab('login');
        // Clear inputs
        setRegUsername('');
        setRegEmail('');
        setRegFullName('');
      }, 1500);
    } else {
      setRegError('Username or email has already been taken.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setForgotEmail('');
      setActiveTab('login');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200" id="auth_container_page">
      
      {/* Brand logo display */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 mb-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-linear-to-tr from-pink-500 via-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-purple-500/20">
          S
        </div>
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-50">
          SOCIALLINK GATEWAY
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-600 font-mono">
          Secure Session-Based Token Authentication Simulated
        </p>
      </div>

      {/* Main card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 shadow-xl rounded-3xl p-6 sm:p-8" id="auth_card">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-900 mb-6">
          <button
            onClick={() => { setActiveTab('login'); setLoginError(''); }}
            className={`flex-1 pb-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === 'login' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setRegError(''); }}
            className={`flex-1 pb-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === 'register' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setActiveTab('forgot')}
            className={`flex-1 pb-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === 'forgot' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Recover Pass
          </button>
        </div>

        {/* 1. LOGIN SCREEN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. tech_guru"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-xs sm:text-sm border border-gray-250 dark:border-gray-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-xs sm:text-sm border border-gray-250 dark:border-gray-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            {/* Remember me check */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-sm border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                Remember my login session
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-linear-to-r from-pink-500 via-purple-600 to-indigo-500 text-white hover:opacity-95 text-xs font-black rounded-xl transition-all shadow-md shadow-purple-500/10 cursor-pointer"
            >
              Sign In Securely
            </button>

            {/* Demo Accounts Panel */}
            <div className="bg-purple-50/50 dark:bg-purple-950/25 border border-dashed border-purple-100 dark:border-purple-900/50 rounded-2xl p-4 mt-6">
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold text-xs">
                <Shield className="w-4 h-4" />
                BharatToday Access Credentials:
              </div>
              <ul className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 space-y-1.5 list-disc pl-4">
                <li>
                  <span className="font-bold">Standard Account:</span> Username: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded-sm text-purple-600 font-bold">kevin</code>, Password: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded-sm text-purple-600">kevin</code>
                </li>
                <li>
                  <span className="font-bold">Platform Admin:</span> Username: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded-sm text-purple-600 font-bold">admin</code>, Password: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded-sm text-purple-600">admin</code>
                </li>
              </ul>
              <p className="text-[9px] text-gray-400 mt-2 font-medium">
                Tip: Swapping users or roles dynamically is also supported in the navigation profile menu at any time!
              </p>
            </div>
          </form>
        )}

        {/* 2. REGISTRATION SCREEN */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {regError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 border border-green-100 dark:border-green-900/50 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <Check className="w-4 h-4 text-green-500" />
                Account created successfully! Switching to Login...
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username (Unique, no spaces)</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. wanderer_99"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-xs sm:text-sm border border-gray-250 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-xs sm:text-sm border border-gray-250 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-xs sm:text-sm border border-gray-250 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            {/* Simulated Select user role */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Default Platform Role</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setRegRole('user')}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${
                    regRole === 'user' 
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-600' 
                      : 'border-gray-200 dark:border-gray-850 text-gray-500'
                  }`}
                >
                  Standard User
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('admin')}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${
                    regRole === 'admin' 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600' 
                      : 'border-gray-200 dark:border-gray-850 text-gray-500'
                  }`}
                >
                  Platform Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-linear-to-r from-pink-500 via-purple-600 to-indigo-500 text-white hover:opacity-95 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Secure Register Account
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            {forgotSuccess ? (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-600 border border-green-100 dark:border-green-900/50 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-pulse">
                <Check className="w-4 h-4 text-green-500" />
                Password recovery token dispatched! Check your mock email client.
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enter your registered email address below, and we will dispatch a password recovery link with a hashed single-use authorization token.
                </p>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-xs sm:text-sm border border-gray-250 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-linear-to-r from-pink-500 via-purple-600 to-indigo-500 text-white hover:opacity-95 text-xs font-black rounded-xl cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </div>
            )}
          </form>
        )}

      </div>

    </div>
  );
};
