/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, FolderKanban, Calendar, MessageSquare, 
  History, BarChart3, Users, LogOut, Settings, Bell, ChevronLeft, ChevronRight
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  unreadNotificationsCount: number;
}

export default function Sidebar({ 
  currentView, 
  onViewChange, 
  currentUser, 
  onLogout,
  unreadNotificationsCount 
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Project Manager', 'Team Member'] },
    { id: 'projects', name: 'Projects', icon: FolderKanban, roles: ['Admin', 'Project Manager', 'Team Member'] },
    { id: 'calendar', name: 'Calendar', icon: Calendar, roles: ['Admin', 'Project Manager', 'Team Member'] },
    { id: 'chat', name: 'Team Chat', icon: MessageSquare, roles: ['Admin', 'Project Manager', 'Team Member'] },
    { id: 'reports', name: 'Reports', icon: BarChart3, roles: ['Admin', 'Project Manager', 'Team Member'] },
    { id: 'logs', name: 'Activity Feed', icon: History, roles: ['Admin', 'Project Manager', 'Team Member'] },
    { id: 'admin', name: 'Team Members', icon: Users, roles: ['Admin'] },
  ];

  const visibleItems = navItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <aside 
      className={`relative flex flex-col bg-[#0f172a] border-r border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
      id="app-sidebar"
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-slate-800">
        <div className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500 text-white font-display font-extrabold text-xs shrink-0 shadow-sm">
            N
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-white text-xs tracking-wider leading-none uppercase">
                NEXUS PROJECT
              </span>
              <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider mt-0.5">
                Workspace
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md font-semibold text-xs transition-all duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-white/10 text-white border-l-2 border-indigo-500' 
                  : 'text-[#94a3b8] hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#64748b]'}`} />
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.name}</span>
              )}
              {item.id === 'chat' && !collapsed && (
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 flex h-5 w-5 items-center justify-center rounded-full border border-slate-800 bg-[#0f172a] text-[#64748b] hover:text-white hover:shadow-sm cursor-pointer z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* User Info / Profile Section */}
      {currentUser && (
        <div className="p-2.5 border-t border-slate-800 bg-[#0b0f19]/40">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-indigo-500/20 text-indigo-300 font-display font-extrabold text-xs border border-indigo-500/30">
              {currentUser.avatar}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-200 truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[9px] text-[#64748b] truncate leading-tight mt-0.5 font-medium">
                  {currentUser.role}
                </p>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <div className="mt-2.5 flex gap-1.5">
              <button
                onClick={() => onViewChange('profile')}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 transition-all cursor-pointer border border-white/5"
              >
                <Settings className="h-3 w-3 text-slate-400" />
                <span>Profile</span>
              </button>
              <button
                onClick={onLogout}
                className="flex h-5.5 w-5.5 items-center justify-center rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer border border-rose-500/20"
                title="Log Out"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
