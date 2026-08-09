/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  KeyRound, Mail, User, Eye, EyeOff, ShieldCheck, BadgeHelp, CheckCircle2, UserCog, Settings, LogOut, Code, Award
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { api } from '../utils/api';

interface AuthViewProps {
  currentUser: UserType | null;
  onAuthSuccess: (token: string, user: UserType) => void;
  onLogout: () => void;
  // If rendering inside profile tab instead of login screen
  isProfileView?: boolean;
}

export default function AuthView({ 
  currentUser, 
  onAuthSuccess, 
  onLogout,
  isProfileView = false 
}: AuthViewProps) {
  // Navigation states: 'login' | 'register' | 'forgot' | 'reset'
  const [mode, setMode] = React.useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  
  // Login / Register fields
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('Team Member');
  const [rememberMe, setRememberMe] = React.useState(false);
  
  // Password Visibility
  const [showPassword, setShowPassword] = React.useState(false);

  // Status indicators
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [simulatedResetUserId, setSimulatedResetUserId] = React.useState('');

  // Profile Settings / Password Change fields (only if logged in & profile view is active)
  const [profName, setProfName] = React.useState('');
  const [profBio, setProfBio] = React.useState('');
  const [profSkills, setProfSkills] = React.useState<string[]>([]);
  const [newSkillText, setNewSkillText] = React.useState('');
  const [curPassword, setCurPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');

  // Load profile defaults if active
  React.useEffect(() => {
    if (currentUser && isProfileView) {
      setProfName(currentUser.name);
      setProfBio(currentUser.bio || '');
      setProfSkills(currentUser.skills || []);
    }
  }, [currentUser, isProfileView]);

  // Load preconfigured Remembered Email if available on startup
  React.useEffect(() => {
    const saved = localStorage.getItem('pm_remember_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email || !password) return;

    try {
      const data = await api.auth.login(email.trim(), password);
      if (rememberMe) {
        localStorage.setItem('pm_remember_email', email.trim());
      } else {
        localStorage.removeItem('pm_remember_email');
      }
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    }
  };

  // Submit Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email || !password || !name) return;

    try {
      const data = await api.auth.register(email.trim(), password, name.trim(), role);
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  // Submit Forgot Password (Simulated reset trigger)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) return;

    try {
      const data = await api.auth.resetPasswordRequest(email.trim());
      setMessage('Password reset has been simulated. Code generated successfully!');
      setSimulatedResetUserId(data.userId);
      setMode('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email search failed');
    }
  };

  // Submit Password reset confirmation (Simulated confirming code)
  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!password) return;

    try {
      await api.auth.resetPasswordConfirm(simulatedResetUserId, password);
      setMessage('Password reset verified! Please sign in with your new password.');
      setMode('login');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    }
  };

  // Update profile handler (inside profile view)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!profName.trim()) return;

    try {
      await api.auth.updateProfile(profName.trim(), profBio.trim(), profSkills);
      setMessage('Profile settings updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  // Change password handler (inside profile view)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!curPassword || !newPassword) return;

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await api.auth.changePassword(curPassword, newPassword);
      setMessage('Password changed successfully!');
      setCurPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  const handleAddSkill = () => {
    const cleanSkill = newSkillText.trim();
    if (!cleanSkill) return;
    if (!profSkills.includes(cleanSkill)) {
      setProfSkills(prev => [...prev, cleanSkill]);
      setNewSkillText('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfSkills(prev => prev.filter(s => s !== skill));
  };

  // Render PROFILE Settings View
  if (isProfileView && currentUser) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
            My Workspace Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Customize your professional bio card, add skill tags, and change passwords.
          </p>
        </div>

        {/* Global Notifications Panel banner */}
        {(error || message) && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold ${
            error 
              ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20'
          }`}>
            {error || message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Block: Bio Settings */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm lg:col-span-7 space-y-5">
            <h2 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              Profile Customization
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="space-y-1">
                <label className="uppercase tracking-wider">Full Display Name</label>
                <input
                  type="text"
                  required
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase tracking-wider">Professional Bio Description</label>
                <textarea
                  value={profBio}
                  onChange={(e) => setProfBio(e.target.value)}
                  placeholder="Outline your background, sprint methodologies, or operational objectives..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>

              {/* Skills Tags Generator */}
              <div className="space-y-2">
                <label className="uppercase tracking-wider">Professional Skills & Capabilities</label>
                
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {profSkills.map(skill => (
                    <span key={skill} className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-indigo-100/40 dark:border-indigo-900/30">
                      <span>{skill}</span>
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-indigo-950 dark:hover:text-white">×</button>
                    </span>
                  ))}
                  {profSkills.length === 0 && (
                    <span className="text-[10px] text-slate-400 font-medium italic">No tags listed. Add below.</span>
                  )}
                </div>

                <div className="flex gap-1.5 max-w-sm">
                  <input
                    type="text"
                    placeholder="e.g. Figma, Scrum, Agile..."
                    value={newSkillText}
                    onChange={(e) => setNewSkillText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          </div>

          {/* Right Block: Password Settings */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm lg:col-span-5 space-y-5">
            <h2 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              Update Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="space-y-1">
                <label className="uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  required
                  value={curPassword}
                  onChange={(e) => setCurPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render PUBLIC AUTH PORTAL (Login, Register, Forgot, Reset)
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0b0f19] select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Brand Banner */}
        <div className="text-center space-y-1.5 relative z-10">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none font-display font-bold text-xl mb-2">
            P
          </div>
          <h2 className="font-display font-bold text-xl tracking-tight text-slate-800 dark:text-white leading-none">
            PROFLOW Workspace
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {mode === 'login' ? 'Sign in to your dashboard' : mode === 'register' ? 'Register seat invitation' : 'Secure pass restoration'}
          </p>
        </div>

        {/* Auth error/notifications bar */}
        {(error || message) && (
          <div className={`p-3.5 rounded-2xl border text-xs font-semibold ${
            error 
              ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20'
          }`}>
            {error || message}
          </div>
        )}

        {/* LOGIN PORTAL */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="space-y-1">
              <label className="uppercase tracking-wider">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="uppercase tracking-wider">Secret Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot Code?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-colors"
            >
              Log In
            </button>

            <div className="text-center pt-2">
              <p className="text-[11px]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Sign Up Here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* REGISTER PORTAL */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="space-y-1">
              <label className="uppercase tracking-wider">Full Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Developer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider">Work Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider">Create Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider">Select Organization Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none"
              >
                <option value="Team Member">Team Member</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-colors"
            >
              Sign Up Workspace
            </button>

            <div className="text-center pt-2">
              <p className="text-[11px]">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Log In Here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="space-y-1">
              <label className="uppercase tracking-wider">Enter Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-colors"
            >
              Request Simulated Code
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* PASSWORD RESET (Restoration code verification simulation) */}
        {mode === 'reset' && (
          <form onSubmit={handleResetConfirm} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-2xl text-[10px] flex items-start gap-2">
              <BadgeHelp className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
              <p>
                Reset authorization accepted for this demo. Enter your new desired workspace password below to verify instantly!
              </p>
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider">Choose New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl dark:text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-colors"
            >
              Verify & Set Password
            </button>
          </form>
        )}

        {/* Demo Accounts Quick-Links (Hidden during profile page settings) */}
        <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 text-center">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
            Quick-Login Demo Accounts
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Admin', email: 'admin@company.com' },
              { label: 'Project Mgr', email: 'pm@company.com' },
              { label: 'Developer', email: 'dev@company.com' }
            ].map(ac => (
              <button
                key={ac.label}
                onClick={() => {
                  setEmail(ac.email);
                  setPassword('password123');
                }}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/20 text-slate-500 hover:text-indigo-600 rounded-lg cursor-pointer transition-colors"
              >
                {ac.label}
              </button>
            ))}
          </div>
        </div>

        {/* Backdrops elements */}
        <div className="absolute top-0 right-0 h-28 w-28 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl -z-10"></div>
        <div className="absolute bottom-0 left-0 h-28 w-28 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl -z-10"></div>
      </div>
    </div>
  );
}
