import React, { useState, useRef, useEffect } from 'react';
import { useSocialMedia } from '../data/store';
import { 
  Search, Bell, Mail, Sun, Moon, LogOut, 
  User, Shield, CheckCircle, RefreshCw, X 
} from 'lucide-react';

interface NavbarProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSelectedProfileId: (userId: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onSearchChange, 
  searchQuery, 
  activeTab, 
  setActiveTab,
  setSelectedProfileId
}) => {
  const { 
    currentUser, 
    currentProfile, 
    users, 
    profiles,
    logout, 
    login,
    notifications, 
    messages, 
    darkMode, 
    setDarkMode,
    markAllNotificationsRead
  } = useSocialMedia();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setShowUserSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;
  const unreadMsgCount = messages.filter(m => currentUser ? (m.receiverId === currentUser.id && !m.isRead) : false).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markAllNotificationsRead();
    }
  };

  const handleUserSelect = (username: string) => {
    login(username, username === 'admin' ? 'admin' : 'user');
    setShowUserSwitcher(false);
    setShowUserDropdown(false);
    setActiveTab('feed');
    setSelectedProfileId(null);
  };

  const handleProfileClick = () => {
    if (currentUser) {
      setSelectedProfileId(currentUser.id);
      setActiveTab('profile');
      setShowUserDropdown(false);
    }
  };

  const handleAdminDashboardClick = () => {
    setActiveTab('admin');
    setShowUserDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md transition-colors duration-200" id="app_header">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* BRAND */}
        <div 
          className="flex items-center space-x-2 cursor-pointer shrink-0" 
          id="brand_logo"
          onClick={() => {
            setActiveTab('feed');
            setSelectedProfileId(null);
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-pink-500 via-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-purple-500/20">
            S
          </div>
          <span className="font-bold text-xl tracking-tight bg-linear-to-r from-pink-500 via-purple-600 to-indigo-500 bg-clip-text text-transparent hidden sm:inline-block">
            SOCIALLINK
          </span>
        </div>

        {/* SEARCH BAR */}
        <div className="flex-1 max-w-md relative" id="search_container">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search users, hashtags (#coding), location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-4" id="nav_actions">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full cursor-pointer transition-colors"
            title="Toggle Theme"
            id="theme_toggle"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>

          {currentUser && (
            <>
              {/* Messages Shortcut */}
              <button
                onClick={() => setActiveTab('messages')}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full cursor-pointer transition-all relative ${
                  activeTab === 'messages' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
                }`}
                title="Private Messages"
                id="msg_nav_btn"
              >
                <Mail className="w-5 h-5" />
                {unreadMsgCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadMsgCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Container */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleNotificationClick}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full cursor-pointer transition-all relative ${
                    showNotifications ? 'text-purple-600 dark:text-purple-400 bg-gray-50 dark:bg-gray-900' : 'text-gray-500 dark:text-gray-400'
                  }`}
                  title="Notifications"
                  id="notif_nav_btn"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150" id="notification_dropdown">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</span>
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                        {notifications.length} Total
                      </span>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-900">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 dark:text-gray-600 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const actor = users.find(u => u.id === notif.senderId);
                          const actorProfile = users.find(u => u.id === notif.senderId)
                            ? profiles.find(p => p.userId === notif.senderId)
                            : null;
                          
                          let messageText = '';
                          if (notif.type === 'follow') messageText = 'started following you';
                          if (notif.type === 'like') messageText = 'liked your post';
                          if (notif.type === 'comment') messageText = 'commented on your post';
                          if (notif.type === 'reply') messageText = 'replied to your comment';
                          if (notif.type === 'message') messageText = 'sent you a private message';

                          return (
                            <div 
                              key={notif.id} 
                              className={`p-3 flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors ${
                                !notif.isRead ? 'bg-purple-50/20 dark:bg-purple-950/10' : ''
                              }`}
                            >
                              <img
                                src={actorProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=50'}
                                alt="avatar"
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-900 dark:text-gray-100">
                                  <span className="font-semibold">@{actor?.username || 'someone'}</span>{' '}
                                  <span className="text-gray-600 dark:text-gray-400">{messageText}</span>
                                </p>
                                <span className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown Ref */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  id="profile_dropdown_trigger"
                >
                  <img
                    src={currentProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/30"
                  />
                  <span className="hidden md:inline-block font-medium text-sm text-gray-700 dark:text-gray-300">
                    {currentProfile?.fullName.split(' ')[0]}
                  </span>
                  {currentUser.role === 'admin' && (
                    <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  )}
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl shadow-xl z-50 py-1" id="user_dropdown_menu">
                    {/* User Summary Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-900">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {currentProfile?.fullName}
                        </p>
                        {currentProfile?.isVerified && (
                          <CheckCircle className="w-4 h-4 fill-blue-500 text-white shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-600 truncate">
                        @{currentUser.username} ({currentUser.role})
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        My Profile
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={handleAdminDashboardClick}
                          className="w-full text-left px-4 py-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-indigo-500" />
                          Admin Console
                        </button>
                      )}

                      <button
                        onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-2 cursor-pointer border-t border-gray-100 dark:border-gray-900"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                        Switch Demo Accounts
                      </button>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-900 py-1">
                      <button
                        onClick={() => logout()}
                        className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Secure Log Out
                      </button>
                    </div>
                  </div>
                )}

                {/* Switcher Dropdown Modal */}
                {showUserSwitcher && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl shadow-xl z-50 p-3" ref={switcherRef} id="demo_user_switcher">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1 flex justify-between items-center">
                      <span>Quick User Swap</span>
                      <RefreshCw className="w-3.5 h-3.5 text-purple-500 animate-spin-slow" />
                    </p>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {users.map((u) => {
                        const prof = profiles.find(p => p.userId === u.id);
                        return (
                          <button
                            key={u.id}
                            onClick={() => handleUserSelect(u.username)}
                            className={`w-full text-left p-2 rounded-xl flex items-center gap-2 transition-all hover:bg-purple-50 dark:hover:bg-purple-950/30 ${
                              currentUser?.id === u.id ? 'bg-purple-50/80 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50' : 'border border-transparent'
                            }`}
                          >
                            <img
                              src={prof?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=50'}
                              alt="avatar"
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1">
                                {prof?.fullName}
                                {prof?.isVerified && (
                                  <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-white shrink-0" />
                                )}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                @{u.username} • {u.role.toUpperCase()}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
