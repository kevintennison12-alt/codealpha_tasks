/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Bell, Search, Sun, Moon, LogOut, Settings, User as UserIcon, Check, Trash2, FolderGit2
} from 'lucide-react';
import { User, Project, Notification } from '../types';

interface HeaderProps {
  currentUser: User | null;
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onLogout: () => void;
  onViewProfile: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({
  currentUser,
  projects,
  selectedProjectId,
  onProjectChange,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onDeleteNotification,
  onLogout,
  onViewProfile,
  onSearchChange,
  searchQuery,
  darkMode,
  onToggleDarkMode
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Close menus on outside click
  React.useEffect(() => {
    const handleOutsideClick = () => {
      setShowNotifications(false);
      setShowProfileMenu(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800/80 shrink-0 sticky top-0 z-20">
      {/* Project Selector & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Project Selector Dropdown */}
        {projects.length > 0 && (
          <div className="relative shrink-0">
            <label className="sr-only">Select Project</label>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <FolderGit2 className="h-3.5 w-3.5 text-indigo-500" />
              <select
                value={selectedProjectId}
                onChange={(e) => onProjectChange(e.target.value)}
                className="bg-transparent border-none text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none pr-1 max-w-[130px] truncate"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search projects, tasks, comments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-md text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:text-slate-200 transition-all"
          />
        </div>
      </div>

      {/* Right Header Icons */}
      <div className="flex items-center gap-2.5">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-all"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-600" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-all"
            title="Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden z-30">
              <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <span className="font-display font-bold text-slate-800 dark:text-slate-100 text-xs">
                  Notifications
                </span>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-slate-500 dark:text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3 flex flex-col gap-0.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/30 ${
                        !n.read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[11px] font-bold ${!n.read ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {n.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {!n.read && (
                            <button
                              onClick={() => onMarkNotificationRead(n.id)}
                              className="h-4 w-4 flex items-center justify-center rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                              title="Mark read"
                            >
                              <Check className="h-2.5 w-2.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteNotification(n.id)}
                            className="h-4 w-4 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 cursor-pointer"
                            title="Delete notification"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 rounded-md p-1 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-500/10 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-display font-extrabold text-[10px] border border-indigo-200 dark:border-indigo-900 shrink-0">
              {currentUser?.avatar}
            </div>
            <div className="hidden md:flex flex-col text-left pr-1 max-w-[90px]">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate leading-none">
                {currentUser?.name}
              </span>
              <span className="text-[9px] text-[#64748b] truncate leading-none mt-0.5 font-bold uppercase tracking-wider">
                {currentUser?.role}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1 z-30">
              <button
                onClick={onViewProfile}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold text-left cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                <span>My Profile</span>
              </button>
              <button
                onClick={onViewProfile}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold text-left cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 text-slate-500" />
                <span>Settings</span>
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-700 text-xs font-semibold text-left cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
