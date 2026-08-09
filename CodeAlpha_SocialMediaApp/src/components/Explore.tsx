import React from 'react';
import { useSocialMedia } from '../data/store';
import { 
  Compass, TrendingUp, Users, CheckCircle, 
  MapPin, Hash, Image, MessageCircle, Heart 
} from 'lucide-react';

interface ExploreProps {
  onSelectHashtag: (tag: string) => void;
  setActiveTab: (tab: string) => void;
  setSelectedProfileId: (userId: string | null) => void;
}

export const Explore: React.FC<ExploreProps> = ({ 
  onSelectHashtag, 
  setActiveTab,
  setSelectedProfileId
}) => {
  const { posts, users, profiles, follows, toggleFollow, currentUser, likes, comments } = useSocialMedia();

  // Pick popular hashtags
  const trendingTags = [
    { tag: 'coding', count: 142, category: 'Technology' },
    { tag: 'travel', count: 98, category: 'Lifestyle' },
    { tag: 'react', count: 75, category: 'Coding' },
    { tag: 'bali', count: 64, category: 'Adventure' },
    { tag: 'baking', count: 43, category: 'Culinary' },
    { tag: 'tailwindcss', count: 32, category: 'Design' }
  ];

  // Pick suggested popular profiles to follow (who current user doesn't follow yet)
  const suggestedProfiles = users
    .filter(u => u.id !== currentUser?.id && u.role !== 'admin')
    .map(u => {
      const prof = profiles.find(p => p.userId === u.id);
      const isFollowing = follows.some(f => f.followerId === currentUser?.id && f.followingId === u.id);
      const followersCount = follows.filter(f => f.followingId === u.id).length;
      return { user: u, profile: prof, isFollowing, followersCount };
    })
    .sort((a, b) => b.followersCount - a.followersCount);

  // List recently joined users
  const recentUsers = [...users]
    .filter(u => u.role !== 'admin')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleHashtagClick = (tag: string) => {
    onSelectHashtag(`#${tag}`);
    setActiveTab('feed');
  };

  const handleProfileClick = (userId: string) => {
    setSelectedProfileId(userId);
    setActiveTab('profile');
  };

  return (
    <div className="flex-1 space-y-6" id="explore_page_module">
      
      {/* Search Header Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-pink-500 via-purple-600 to-indigo-500 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-md space-y-2">
          <span className="bg-white/20 text-white font-mono text-[10px] font-bold py-1 px-3 rounded-full uppercase tracking-widest backdrop-blur-md">
            Explore Tab
          </span>
          <h2 className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none">
            Discover What's Trending
          </h2>
          <p className="text-xs text-white/80 leading-relaxed">
            Connect with verified creators, search coding tags, and view scenic media curated across the platform.
          </p>
        </div>
        <div className="absolute right-[-10%] bottom-[-20%] text-white/10 select-none pointer-events-none">
          <Compass className="w-56 h-56 stroke-[1]" />
        </div>
      </div>

      {/* Grid: Left column (Trending topics / Grid), Right Column (Suggested users) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: TRENDING & GALLERY */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trending tags section */}
          <section className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-purple-600" />
              Popular Hashtags
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {trendingTags.map((item) => (
                <button
                  key={item.tag}
                  onClick={() => handleHashtagClick(item.tag)}
                  className="p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-900/50 hover:border-purple-300 dark:hover:border-purple-900 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                      {item.category}
                    </p>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-purple-600 mt-1">
                      #{item.tag}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 py-1 px-2.5 rounded-lg shrink-0">
                    {item.count}k
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Bento Visual Media Stream */}
          <section className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Image className="w-4.5 h-4.5 text-pink-500" />
              Scenic Gallery Explore
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {posts.filter(p => p.media && p.media.length > 0).map((post) => {
                const postLikes = likes.filter(l => l.postId === post.id).length;
                const postComments = comments.filter(c => c.postId === post.id).length;
                
                return (
                  <div 
                    key={post.id}
                    onClick={() => { setSelectedProfileId(post.userId); setActiveTab('profile'); }}
                    className="relative rounded-xl overflow-hidden aspect-square border border-gray-100 dark:border-gray-900 group cursor-pointer"
                  >
                    <img
                      src={post.media[0]}
                      alt="visual explore"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Hover Stats overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 text-white text-xs font-bold transition-opacity duration-200">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 fill-white" />
                        {postLikes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 fill-white" />
                        {postComments}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: SUGGESTED CREATORS & ACTIVITY */}
        <div className="space-y-6">
          {/* Suggested creators lists */}
          <section className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-blue-500" />
              Suggested Creators
            </h3>

            <div className="space-y-3.5">
              {suggestedProfiles.map(({ user, profile, isFollowing, followersCount }) => (
                <div key={user.id} className="flex justify-between items-center p-1 hover:bg-gray-50 dark:hover:bg-gray-900/40 rounded-xl">
                  <div 
                    onClick={() => handleProfileClick(user.id)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <img
                      src={profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=50'}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                        {profile?.fullName}
                        {profile?.isVerified && (
                          <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-white shrink-0" />
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">@{user.username} • {followersCount} followers</p>
                    </div>
                  </div>

                  {currentUser?.id !== user.id && (
                    <button
                      onClick={() => toggleFollow(user.id)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        isFollowing 
                          ? 'bg-gray-100 dark:bg-gray-900 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20' 
                          : 'bg-purple-600 text-white shadow-xs hover:opacity-95'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Recently joined log lists */}
          <section className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-orange-500" />
              Recently Joined Users
            </h3>
            
            <div className="space-y-3">
              {recentUsers.map((recUser) => {
                const recProfile = profiles.find(p => p.userId === recUser.id);
                return (
                  <div 
                    key={recUser.id}
                    onClick={() => handleProfileClick(recUser.id)}
                    className="flex items-center gap-2.5 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-xl cursor-pointer"
                  >
                    <img
                      src={recProfile?.avatar}
                      alt="recent"
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">@{recUser.username}</p>
                      <p className="text-[9px] text-gray-400 font-mono">Member since: {new Date(recUser.createdAt).toLocaleDateString([], {month:'short', year:'numeric'})}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

      </div>

    </div>
  );
};
