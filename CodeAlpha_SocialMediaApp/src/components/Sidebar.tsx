import React from 'react';
import { useSocialMedia } from '../data/store';
import { 
  Home, Compass, Mail, Bookmark, Shield, 
  User, PlusCircle, CheckCircle, Newspaper
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSelectedProfileId: (userId: string | null) => void;
  openCreatePostModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  setSelectedProfileId,
  openCreatePostModal
}) => {
  const { currentUser, currentProfile, messages } = useSocialMedia();

  if (!currentUser) return null;

  const unreadMsgCount = messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;

  const menuItems = [
    { id: 'feed', label: 'News Feed', icon: Home, color: 'hover:text-purple-600 dark:hover:text-purple-400' },
    { id: 'explore', label: 'Explore Topics', icon: Compass, color: 'hover:text-pink-600 dark:hover:text-pink-400' },
    { id: 'messages', label: 'Private Messages', icon: Mail, badgeCount: unreadMsgCount, color: 'hover:text-blue-600 dark:hover:text-blue-400' },
    { id: 'saved', label: 'Saved Posts', icon: Bookmark, color: 'hover:text-amber-600 dark:hover:text-amber-400' },
  ];

  const handleProfileClick = () => {
    setSelectedProfileId(currentUser.id);
    setActiveTab('profile');
  };

  return (
    <aside className="w-full md:w-64 shrink-0" id="sidebar_container">
      {/* Mini Profile Card */}
      <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl p-4 mb-4 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src={currentProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
            alt="avatar"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100 dark:ring-purple-950"
          />
          <div className="min-w-0">
            <h4 
              onClick={handleProfileClick}
              className="font-bold text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:underline truncate flex items-center gap-1"
            >
              {currentProfile?.fullName}
              {currentProfile?.isVerified && (
                <CheckCircle className="w-4 h-4 fill-blue-500 text-white shrink-0" />
              )}
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-600 truncate">
              @{currentUser.username}
            </p>
          </div>
        </div>

        {/* Action Quick Post */}
        <button
          onClick={openCreatePostModal}
          className="mt-4 w-full bg-linear-to-r from-pink-500 via-purple-600 to-indigo-500 text-white hover:opacity-95 font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Share New Post
        </button>
      </div>

      {/* Main Navigation Sidebar Links */}
      <nav className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl p-3 shadow-xs space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedProfileId(null);
              }}
              className={`w-full flex items-center justify-between p-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' 
                  : `text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/40 ${item.color}`
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Profile Link */}
        <button
          onClick={handleProfileClick}
          className={`w-full flex items-center p-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile' 
              ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/40 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          <User className={`w-4 h-4 mr-3 ${activeTab === 'profile' ? 'stroke-[2.5px]' : ''}`} />
          <span>My Profile</span>
        </button>

        {/* Admin Link (Only visible if Admin) */}
        {currentUser.role === 'admin' && (
          <button
            onClick={() => {
              setActiveTab('admin');
              setSelectedProfileId(null);
            }}
            className={`w-full flex items-center p-3 text-xs font-semibold rounded-xl transition-all cursor-pointer border-t border-dashed border-gray-100 dark:border-gray-800/80 mt-2 pt-3 ${
              activeTab === 'admin' 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold'
            }`}
          >
            <Shield className={`w-4 h-4 mr-3 text-indigo-500 ${activeTab === 'admin' ? 'stroke-[2.5px]' : ''}`} />
            <span>Admin Console</span>
          </button>
        )}
      </nav>

      {/* Suggested Users Shortcut */}
      <div className="mt-4 text-center p-2 text-[10px] text-gray-400 dark:text-gray-600 font-mono">
        Active Environment: Node Container
        <br />
        Session Secured • Port 3000
      </div>
    </aside>
  );
};
