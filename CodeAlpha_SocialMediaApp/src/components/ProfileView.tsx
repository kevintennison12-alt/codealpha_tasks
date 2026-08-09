import React, { useState } from 'react';
import { useSocialMedia } from '../data/store';
import { 
  MapPin, Link as LinkIcon, Calendar, Phone, Mail, 
  Settings, Grid, Bookmark, CheckCircle, Share2, 
  UserPlus, UserMinus, ShieldAlert, Heart, MessageCircle 
} from 'lucide-react';

interface ProfileViewProps {
  profileId: string | null;
  setActiveTab: (tab: string) => void;
  setSelectedProfileId: (userId: string | null) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  profileId, 
  setActiveTab,
  setSelectedProfileId
}) => {
  const { 
    currentUser, 
    profiles, 
    users, 
    posts, 
    follows, 
    toggleFollow, 
    updateProfile,
    savedPosts,
    likes,
    comments
  } = useSocialMedia();

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile edit states
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  
  const [shareSuccess, setShareSuccess] = useState(false);

  // Fallback to current user if profileId is empty
  const targetUserId = profileId || currentUser?.id;
  if (!targetUserId) return null;

  const userObj = users.find(u => u.id === targetUserId);
  const profileObj = profiles.find(p => p.userId === targetUserId);
  
  if (!userObj || !profileObj) return null;

  const isMyProfile = currentUser?.id === targetUserId;

  // Stats calculations
  const targetUserPosts = posts.filter(p => p.userId === targetUserId);
  const targetFollowers = follows.filter(f => f.followingId === targetUserId);
  const targetFollowing = follows.filter(f => f.followerId === targetUserId);
  const isFollowingTarget = follows.some(f => f.followerId === currentUser?.id && f.followingId === targetUserId);

  // Mutual connections calculations
  const myFollowingIds = follows.filter(f => f.followerId === currentUser?.id).map(f => f.followingId);
  const theirFollowingIds = follows.filter(f => f.followerId === targetUserId).map(f => f.followingId);
  const mutualFollowerIds = myFollowingIds.filter(id => theirFollowingIds.includes(id));
  const mutualProfiles = profiles.filter(p => mutualFollowerIds.includes(p.userId));

  const handleEditOpen = () => {
    setEditFullName(profileObj.fullName);
    setEditBio(profileObj.bio);
    setEditPhone(profileObj.phone);
    setEditLocation(profileObj.location);
    setEditWebsite(profileObj.website);
    setIsEditing(true);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: editFullName,
      bio: editBio,
      phone: editPhone,
      location: editLocation,
      website: editWebsite
    });
    setIsEditing(false);
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${userObj.username}`);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  // Switch to preset cover & profile images mock options
  const handleSwapAvatarPreset = () => {
    const avatarPresets = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150'
    ];
    const nextAv = avatarPresets[Math.floor(Math.random() * avatarPresets.length)];
    updateProfile({ avatar: nextAv });
  };

  const handleSwapCoverPreset = () => {
    const coverPresets = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1472214222541-d510753a49fa?auto=format&fit=crop&q=80&w=800'
    ];
    const nextCov = coverPresets[Math.floor(Math.random() * coverPresets.length)];
    updateProfile({ cover: nextCov });
  };

  // Filter bookmarked saved posts for current profile (visible only on own profile)
  const myBookmarks = posts.filter(post => 
    savedPosts.some(s => s.userId === currentUser?.id && s.postId === post.id)
  );

  return (
    <div className="flex-1 space-y-6" id="profile_details_view">
      
      {/* Cover / Header section */}
      <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl overflow-hidden shadow-xs relative">
        {/* Cover Photo Canvas */}
        <div className="h-44 sm:h-60 bg-linear-to-tr from-purple-200 to-indigo-100 dark:from-purple-950 dark:to-indigo-950 relative group">
          <img
            src={profileObj.cover}
            alt="cover"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {isMyProfile && (
            <button 
              onClick={handleSwapCoverPreset}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[10px] font-bold py-1.5 px-3 rounded-xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Change Cover Preset
            </button>
          )}
        </div>

        {/* Profile Stats Meta Row */}
        <div className="px-6 pb-6 pt-20 relative">
          
          {/* Avatar floating */}
          <div className="absolute top-0 left-6 -translate-y-1/2 group">
            <img
              src={profileObj.avatar}
              alt="avatar"
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-gray-950 shadow-md"
            />
            {isMyProfile && (
              <button 
                onClick={handleSwapAvatarPreset}
                className="absolute inset-0 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                Swap Face
              </button>
            )}
          </div>

          {/* Action buttons top-right */}
          <div className="absolute top-4 right-6 flex items-center gap-2">
            {isMyProfile ? (
              <>
                <button 
                  onClick={handleEditOpen}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => toggleFollow(userObj.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isFollowingTarget 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' 
                      : 'bg-purple-600 text-white hover:opacity-95'
                  }`}
                >
                  {isFollowingTarget ? (
                    <>
                      <UserMinus className="w-3.5 h-3.5" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow
                    </>
                  )}
                </button>
                <button 
                  onClick={() => { setSelectedProfileId(userObj.id); setActiveTab('messages'); }}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer"
                >
                  Message
                </button>
              </>
            )}

            <button 
              onClick={handleShareProfile}
              className="p-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-500 rounded-xl cursor-pointer"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Shared Profile Link Notice */}
          {shareSuccess && (
            <span className="absolute top-16 right-6 text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-950/40 border border-green-100 py-1 px-3 rounded-lg animate-bounce">
              Profile link copied to clipboard!
            </span>
          )}

          {/* Profile Identity */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                {profileObj.fullName}
                {profileObj.isVerified && (
                  <CheckCircle className="w-5 h-5 fill-blue-500 text-white shrink-0" />
                )}
                {userObj.role === 'admin' && (
                  <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono text-[9px] font-bold py-0.5 px-2 rounded-full border border-indigo-100">
                    ADMIN
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-600 font-mono mt-0.5">
                @{userObj.username} • {userObj.email}
              </p>
            </div>

            {/* Bio Content */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
              {profileObj.bio}
            </p>

            {/* Profile specifications list */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 dark:text-gray-500 font-medium pt-1">
              {profileObj.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" />
                  {profileObj.location}
                </span>
              )}
              {profileObj.website && (
                <span className="flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-purple-500" />
                  <a href={`https://${profileObj.website}`} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">
                    {profileObj.website}
                  </a>
                </span>
              )}
              {profileObj.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  {profileObj.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Joined {new Date(userObj.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Statistics Row Counts */}
            <div className="flex items-center gap-6 border-t border-gray-100 dark:border-gray-900 pt-4">
              <div className="text-center sm:text-left">
                <span className="block font-black text-base text-gray-950 dark:text-gray-50">
                  {targetUserPosts.length}
                </span>
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Posts</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block font-black text-base text-gray-950 dark:text-gray-50">
                  {targetFollowers.length}
                </span>
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Followers</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block font-black text-base text-gray-950 dark:text-gray-50">
                  {targetFollowing.length}
                </span>
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Following</span>
              </div>
            </div>

            {/* Mutual Connections lookup layout */}
            {!isMyProfile && mutualProfiles.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-900 pt-3 flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {mutualProfiles.slice(0, 3).map((mP) => (
                    <img
                      key={mP.userId}
                      src={mP.avatar}
                      alt="mutual avatar"
                      referrerPolicy="no-referrer"
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-950 object-cover"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">
                  Followed by{' '}
                  <span className="font-bold text-gray-600 dark:text-gray-400">
                    {mutualProfiles.map(mP => mP.fullName.split(' ')[0]).join(', ')}
                  </span>{' '}
                  and {mutualProfiles.length > 3 ? `${mutualProfiles.length - 3} others` : 'you know'}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Profile post tabs navigation */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-900">
        <button
          onClick={() => setActiveSubTab('posts')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer border-b-2 transition-all ${
            activeSubTab === 'posts' 
              ? 'border-purple-600 text-purple-600 dark:text-purple-400' 
              : 'border-transparent text-gray-400'
          }`}
        >
          <Grid className="w-4 h-4" />
          Posts ({targetUserPosts.length})
        </button>

        {isMyProfile && (
          <button
            onClick={() => setActiveSubTab('saved')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer border-b-2 transition-all ${
              activeSubTab === 'saved' 
                ? 'border-purple-600 text-purple-600 dark:text-purple-400' 
                : 'border-transparent text-gray-400'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Bookmarked Bookmarks ({myBookmarks.length})
          </button>
        )}
      </div>

      {/* Grid posts rendering */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeSubTab === 'posts' ? (
          targetUserPosts.length === 0 ? (
            <div className="sm:col-span-2 text-center py-12 text-gray-400 text-xs">No posts shared yet.</div>
          ) : (
            targetUserPosts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl p-4 space-y-3 shadow-xs">
                {post.media && post.media.length > 0 && (
                  <img
                    src={post.media[0]}
                    alt="post preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-32 object-cover rounded-xl"
                  />
                )}
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{post.caption}</p>
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono pt-1">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> {likes.filter(l => l.postId === post.id).length}</span>
                    <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3 text-gray-400" /> {comments.filter(c => c.postId === post.id).length}</span>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          myBookmarks.length === 0 ? (
            <div className="sm:col-span-2 text-center py-12 text-gray-400 text-xs">No saved bookmarks.</div>
          ) : (
            myBookmarks.map((post) => {
              const authorProfile = profiles.find(p => p.userId === post.userId);
              return (
                <div key={post.id} className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl p-4 space-y-3 shadow-xs">
                  {post.media && post.media.length > 0 && (
                    <img
                      src={post.media[0]}
                      alt="saved preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  )}
                  <div>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">@{authorProfile?.fullName}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 mt-1">{post.caption}</p>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-100 dark:border-gray-900 mb-4">Edit Profile Settings</h3>
            
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bio Summary</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-gray-100 mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Website URL</label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="e.g. blog.dev"
                  className="w-full text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 mt-1"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100 dark:border-gray-900">
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:opacity-95 cursor-pointer">
                  Save Settings
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded-xl cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
