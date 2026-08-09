import React, { useState, useEffect } from 'react';
import { useSocialMedia } from '../data/store';
import { Post, Comment, User } from '../types';
import { Stories } from './Stories';
import { 
  Heart, MessageCircle, Bookmark, Share2, Pin, MapPin, 
  Globe, Users, EyeOff, MoreHorizontal, Send, Trash2, 
  AlertTriangle, Check, Smile, CheckCircle, RefreshCw 
} from 'lucide-react';

interface FeedProps {
  searchQuery: string;
  setActiveTab: (tab: string) => void;
  setSelectedProfileId: (userId: string | null) => void;
  createPostOpen: boolean;
  setCreatePostOpen: (open: boolean) => void;
}

export const Feed: React.FC<FeedProps> = ({ 
  searchQuery, 
  setActiveTab, 
  setSelectedProfileId,
  createPostOpen,
  setCreatePostOpen
}) => {
  const { 
    currentUser, 
    posts, 
    likes, 
    comments, 
    users, 
    profiles, 
    follows,
    createPost, 
    deletePost, 
    toggleLikePost, 
    pinPost,
    addComment, 
    deleteComment, 
    toggleLikeComment,
    toggleSavePost, 
    savedPosts,
    reportContent,
    toggleFollow
  } = useSocialMedia();

  const [sortBy, setSortBy] = useState<'latest' | 'liked' | 'commented'>('latest');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Real-time news flash items for India Today context
  const BREAKING_FLASHES = [
    "🔴 BREAKING: India finishes clean sweep of T20 Series against Australia; Virat Kohli praises team depth",
    "🚀 SPACE: ISRO gears up for Gaganyaan spacecraft launch validation flights next month from Sriharikota",
    "📱 FINTECH: UPI monthly volumes soar to historic 15.2 Billion transactions, representing 45% YoY growth",
    "🍿 BOLLYWOOD: Highly anticipated historical epic officially announces national release date with record advance bookings",
    "💻 BENGALURU: Government announces new AI Innovation hub with ₹10,000 Crore initial funding"
  ];
  const [activeFlashIndex, setActiveFlashIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlashIndex((prev) => (prev + 1) % BREAKING_FLASHES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // India Today Simulated Verified Posts
  const newsBulletins = [
    {
      id: 'news_bulletin_1',
      isNews: true as const,
      category: 'cricket',
      title: "Team India Clinches Thrilling Victory in Bengaluru; Seals T20 Series Clean Sweep",
      source: "INDIA TODAY SPORTS",
      time: "20m ago",
      imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=600",
      summary: "In a nail-biting final over thriller, India defended 12 runs to defeat Australia in Bengaluru, securing a complete 3-0 series victory. The team displayed phenomenal bowling grit.",
      bullets: [
        "Jasprit Bumrah bowled a masterclass 19th over yielding only 3 runs.",
        "Young batsman Shubman Gill awarded Man of the Series with 240 runs.",
        "Head coach emphasizes the team’s strong bench strength ahead of the main world championship tournament."
      ],
      views: "1.2M",
      likesCount: 5420,
      hashtags: ['cricket', 'india', 'ahmedabad', 'victory', 'grateful']
    },
    {
      id: 'news_bulletin_2',
      isNews: true as const,
      category: 'tech',
      title: "UPI Records Historic Milestone: 15.2 Billion Digital Transactions Clocked in June",
      source: "INDIA TODAY BUSINESS",
      time: "45m ago",
      imageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=600",
      summary: "The National Payments Corporation of India (NPCI) revealed that unified payments interface transactions surged past the 15 billion mark, marking India as the leader in real-time digital payments.",
      bullets: [
        "Small merchants and rural retail outlets comprise over 68% of total transaction density.",
        "Cross-border UPI services expand to 5 new countries in Europe and Middle East.",
        "NPCI plans to launch offline voice-activated payments next quarter to target remote regions."
      ],
      views: "850K",
      likesCount: 3950,
      hashtags: ['digitalindia', 'fintech', 'upi', 'tech', 'indiatoday']
    },
    {
      id: 'news_bulletin_3',
      isNews: true as const,
      category: 'politics',
      title: "New National Education Expansion Project Launched to Build 5,000 Next-Gen Classrooms",
      source: "DELHI BUREAU",
      time: "2h ago",
      imageUrl: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=600",
      summary: "The government has approved a grand budget allocated for high-tech digital classrooms, targeting science and computing education across public schools in secondary towns.",
      bullets: [
        "All classrooms will be equipped with solar power backups, smart projectors, and internet connectivity.",
        "Specialized focus on artificial intelligence, data science, and local vocational training modules.",
        "Bengaluru and Pune tech centers will coordinate curriculum development under national teachers' guidance."
      ],
      views: "420K",
      likesCount: 1205,
      hashtags: ['education', 'digitalclassrooms', 'politics', 'delhibureau']
    },
    {
      id: 'news_bulletin_4',
      isNews: true as const,
      category: 'bollywood',
      title: "Bollywood Mega Epic 'Samrat' Unveils First Visual Teaser; Breaks YouTube Viewing Records",
      source: "ENTERTAINMENT TODAY",
      time: "3h ago",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600",
      summary: "The upcoming multi-starrer historical drama teaser has crossed 45 million views in less than 12 hours, capturing excitement for its high-budget action sequences and beautiful classical soundtrack.",
      bullets: [
        "Directed by an award-winning director with an estimated record production budget.",
        "Features custom designed traditional Indian wear and handcrafted silver jewelry from Jaipur artisans.",
        "Releasing in Hindi, Tamil, Telugu, and Kannada with global distribution partners."
      ],
      views: "2.1M",
      likesCount: 9430,
      hashtags: ['bollywood', 'samrat', 'teaser', 'entertainment']
    }
  ];

  const [likedBulletins, setLikedBulletins] = useState<string[]>([]);
  const [bulletinComments, setBulletinComments] = useState<Record<string, { username: string; text: string; time: string }[]>>({
    'news_bulletin_1': [
      { username: 'virat_kohli', text: 'Stellar performance by the boys! We are ready for the test series.', time: '10m ago' },
      { username: 'ranveer_kitchen', text: 'Celebrations call for a grand feast! Incredible win.', time: '35m ago' }
    ],
    'news_bulletin_2': [
      { username: 'delhi_explorer', text: 'This UPI system is a savior during busy travel seasons in Rajasthan!', time: '1h ago' }
    ]
  });
  const [bulletinCommentInputs, setBulletinCommentInputs] = useState<Record<string, string>>({});
  
  // Post Creator State
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [mediaUrls, setMediaUrls] = useState<string[]>(['']);
  
  // Interactions state
  const [activePostOptionsId, setActivePostOptionsId] = useState<string | null>(null);
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  
  // Report Modal state
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<'spam' | 'abuse' | 'fake' | 'inappropriate'>('spam');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  // Active Likers modal
  const [showLikersPostId, setShowLikersPostId] = useState<string | null>(null);

  // Parse hashtags
  const extractHashtags = (text: string): string[] => {
    const matched = text.match(/#\w+/g);
    return matched ? matched.map(h => h.replace('#', '').toLowerCase()) : [];
  };

  // Simulate skeleton load on sort change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [sortBy]);

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    const parsedTags = extractHashtags(caption + ' ' + hashtags);
    createPost(caption, mediaUrls, location, parsedTags, visibility);
    
    // Reset form
    setCaption('');
    setLocation('');
    setHashtags('');
    setMediaUrls(['']);
    setVisibility('public');
    setCreatePostOpen(false);
  };

  const handleAddMediaUrlInput = () => {
    if (mediaUrls.length < 5) {
      setMediaUrls([...mediaUrls, '']);
    }
  };

  const handleMediaUrlChange = (idx: number, val: string) => {
    const updated = [...mediaUrls];
    updated[idx] = val;
    setMediaUrls(updated);
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const inputVal = commentInputs[postId];
    if (!inputVal || !inputVal.trim()) return;
    addComment(postId, inputVal.trim());
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleReplySubmit = (postId: string, commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    addComment(postId, replyInput.trim(), commentId);
    setReplyInput('');
    setReplyingCommentId(null);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId) return;
    reportContent('post', reportingPostId, reportReason);
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportingPostId(null);
    }, 1800);
  };

  const handleSharePost = (post: Post) => {
    // Copy fake share link
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    alert('Shareable post link copied to clipboard!');
  };

  const handleUserClick = (userId: string) => {
    setSelectedProfileId(userId);
    setActiveTab('profile');
  };

  // Filter posts based on global search & visibility permissions
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      users.find(u => u.id === post.userId)?.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Check visibility permissions
    if (post.userId === currentUser?.id) return true;
    if (post.visibility === 'private') return false;
    if (post.visibility === 'followers') {
      // Check if current user follows the creator
      return follows.some(f => f.followerId === currentUser?.id && f.followingId === post.userId);
    }
    return true;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    // Pin logic (pinned posts always at the top of the feed)
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === 'liked') {
      const aLikes = likes.filter(l => l.postId === a.id).length;
      const bLikes = likes.filter(l => l.postId === b.id).length;
      return bLikes - aLikes;
    }
    if (sortBy === 'commented') {
      const aComments = comments.filter(c => c.postId === a.id).length;
      const bComments = comments.filter(c => c.postId === b.id).length;
      return bComments - aComments;
    }
    // Latest default
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex-1 max-w-2xl" id="news_feed_module">
      
      {/* Stories Widget */}
      <Stories />

      {/* INDIA TODAY STYLE BREAKING NEWS FLASH BANNER */}
      <div className="bg-red-700 text-white overflow-hidden py-3 px-4 rounded-2xl flex items-center shadow-md border border-red-600 gap-3 mb-6">
        <div className="bg-white text-red-700 font-black text-[10px] px-2 py-0.5 rounded-sm animate-pulse uppercase shrink-0 flex items-center gap-1 tracking-wider font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-red-700"></span>
          BREAKING
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-bold truncate transition-all duration-500 ease-in-out font-sans">
            {BREAKING_FLASHES[activeFlashIndex]}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-red-100 font-mono shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
          LIVE 24/7
        </div>
      </div>

      {/* Posting Filter Bars */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-950 p-3 rounded-2xl border border-gray-100 dark:border-gray-900 mb-6 shadow-xs">
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1 font-mono">
          Feed Order
        </span>
        <div className="flex bg-gray-50 dark:bg-gray-900/60 p-1 rounded-xl">
          {(['latest', 'liked', 'commented'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortBy(mode)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all capitalize ${
                sortBy === mode 
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-xs' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* FEED LIST */}
      <div className="space-y-6" id="feed_posts_list">
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                  <div className="h-2.5 w-1/6 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                </div>
              </div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
              <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
            </div>
          ))
        ) : sortedPosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-12 text-center text-gray-400 dark:text-gray-500">
            <p className="text-sm font-semibold">No matching posts found.</p>
            <p className="text-xs mt-1">Be the first to share an update with the community!</p>
          </div>
        ) : (
          sortedPosts.map((post, index) => {
            const author = users.find(u => u.id === post.userId);
            const profile = profiles.find(p => p.userId === post.userId);
            const isLikedByMe = likes.some(l => l.userId === currentUser?.id && l.postId === post.id);
            const postLikesCount = likes.filter(l => l.postId === post.id).length;
            const postComments = comments.filter(c => c.postId === post.id && !c.parentId);
            const isSavedByMe = savedPosts.some(s => s.userId === currentUser?.id && s.postId === post.id);

            const correspondingBulletin = newsBulletins[index];

            return (
              <React.Fragment key={post.id}>
              <article 
                key={post.id} 
                className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 p-5 relative"
                id={`post_card_${post.id}`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <img
                      src={profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      onClick={() => handleUserClick(post.userId)}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span 
                          onClick={() => handleUserClick(post.userId)}
                          className="font-bold text-sm text-gray-900 dark:text-gray-100 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          {profile?.fullName}
                          {profile?.isVerified && (
                            <CheckCircle className="w-4 h-4 fill-blue-500 text-white" />
                          )}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          @{author?.username}
                        </span>
                      </div>
                      
                      {/* Meta context info */}
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 dark:text-gray-600 font-medium">
                        <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        {post.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-pink-500" />
                            {post.location}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          {post.visibility === 'public' && <Globe className="w-2.5 h-2.5 text-blue-400" />}
                          {post.visibility === 'followers' && <Users className="w-2.5 h-2.5 text-purple-400" />}
                          {post.visibility === 'private' && <EyeOff className="w-2.5 h-2.5 text-neutral-400" />}
                          <span className="capitalize">{post.visibility}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Options Menu Dropdown trigger */}
                  <div className="relative">
                    <button 
                      onClick={() => setActivePostOptionsId(activePostOptionsId === post.id ? null : post.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {activePostOptionsId === post.id && (
                      <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-xl shadow-lg z-30 py-1">
                        {post.userId === currentUser?.id && (
                          <button
                            onClick={() => { pinPost(post.id); setActivePostOptionsId(null); }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-2 cursor-pointer"
                          >
                            <Pin className="w-3.5 h-3.5 text-blue-500" />
                            {post.isPinned ? 'Unpin Post' : 'Pin to Profile'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => { setReportingPostId(post.id); setActivePostOptionsId(null); }}
                          className="w-full text-left px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 flex items-center gap-2 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          Report Content
                        </button>

                        {(post.userId === currentUser?.id || currentUser?.role === 'admin') && (
                          <button
                            onClick={() => { deletePost(post.id); setActivePostOptionsId(null); }}
                            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Delete Post
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Caption / Content Text */}
                <div className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                  {post.caption}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.hashtags.map((tag) => (
                      <span 
                        key={tag}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-md hover:underline cursor-pointer"
                        onClick={() => setSelectedProfileId(null)} // Reset, will search tags
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Media Files Display (Multiple images bento grids!) */}
                {post.media && post.media.length > 0 && (
                  <div className={`grid gap-2 mb-4 overflow-hidden rounded-2xl border border-gray-100/50 dark:border-gray-900/50 ${
                    post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  }`} id={`media_grid_${post.id}`}>
                    {post.media.map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt={`Media_${i}`}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-96 object-cover aspect-video hover:scale-101 transition-transform duration-300"
                      />
                    ))}
                  </div>
                )}

                {/* Pinned Tag Banner */}
                {post.isPinned && (
                  <div className="absolute top-4 right-12 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-blue-100 dark:ring-blue-900/50 shadow-xs">
                    <Pin className="w-3 h-3 rotate-45" />
                    Pinned
                  </div>
                )}

                {/* Action Buttons Bar */}
                <div className="flex items-center justify-between border-y border-gray-100 dark:border-gray-900 py-3 mb-4">
                  <div className="flex gap-4 sm:gap-6">
                    {/* Like button */}
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => toggleLikePost(post.id)}
                        className={`p-1.5 rounded-full cursor-pointer transition-colors hover:bg-pink-50 dark:hover:bg-pink-950/20 group`}
                      >
                        <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                          isLikedByMe ? 'fill-pink-500 text-pink-500' : 'text-gray-400 dark:text-gray-500 hover:text-pink-500'
                        }`} />
                      </button>
                      <span 
                        onClick={() => postLikesCount > 0 && setShowLikersPostId(post.id)}
                        className={`text-xs font-bold text-gray-500 dark:text-gray-400 ${postLikesCount > 0 ? 'hover:underline cursor-pointer' : ''}`}
                      >
                        {postLikesCount}
                      </span>
                    </div>

                    {/* Comment count */}
                    <div className="flex items-center gap-1.5">
                      <div className="p-1.5 text-gray-400 dark:text-gray-500">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {comments.filter(c => c.postId === post.id).length}
                      </span>
                    </div>

                    {/* Share Button */}
                    <button 
                      onClick={() => handleSharePost(post)}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-500 rounded-full cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/10"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button 
                    onClick={() => toggleSavePost(post.id)}
                    className="p-1.5 rounded-full cursor-pointer transition-colors"
                  >
                    <Bookmark className={`w-5 h-5 ${
                      isSavedByMe ? 'fill-amber-500 text-amber-500' : 'text-gray-400 dark:text-gray-500 hover:text-amber-500'
                    }`} />
                  </button>
                </div>

                {/* Comment Section Board */}
                <div className="space-y-4" id={`comments_section_${post.id}`}>
                  {/* List of comments */}
                  {postComments.length > 0 && (
                    <div className="space-y-3 pt-1 divide-y divide-gray-50 dark:divide-gray-900/40">
                      {postComments.map((comment) => {
                        const commenter = users.find(u => u.id === comment.userId);
                        const commenterProfile = profiles.find(p => p.userId === comment.userId);
                        const commentReplies = comments.filter(c => c.parentId === comment.id);
                        const isCommentLikedByMe = comment.likes.includes(currentUser?.id || '');

                        return (
                          <div key={comment.id} className="pt-3 first:pt-0">
                            {/* Comment Core Card */}
                            <div className="flex gap-2.5 items-start">
                              <img
                                src={commenterProfile?.avatar}
                                alt="commenter"
                                referrerPolicy="no-referrer"
                                onClick={() => handleUserClick(comment.userId)}
                                className="w-7 h-7 rounded-full object-cover cursor-pointer mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="bg-gray-50 dark:bg-gray-900/40 px-3 py-2 rounded-2xl inline-block max-w-full">
                                  <div className="flex items-center gap-1">
                                    <span 
                                      onClick={() => handleUserClick(comment.userId)}
                                      className="font-bold text-xs text-gray-900 dark:text-gray-100 hover:underline cursor-pointer"
                                    >
                                      {commenterProfile?.fullName}
                                    </span>
                                    {commenterProfile?.isVerified && (
                                      <CheckCircle className="w-3 h-3 fill-blue-500 text-white" />
                                    )}
                                    <span className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">
                                      @{commenter?.username}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 leading-relaxed break-words">
                                    {comment.content}
                                  </p>
                                </div>

                                {/* Comment Actions */}
                                <div className="flex items-center gap-3 mt-1 ml-2 text-[10px] text-gray-400 dark:text-gray-500 font-bold">
                                  <button 
                                    onClick={() => toggleLikeComment(comment.id)}
                                    className={`hover:underline cursor-pointer ${isCommentLikedByMe ? 'text-pink-500' : ''}`}
                                  >
                                    Like {comment.likes.length > 0 && `(${comment.likes.length})`}
                                  </button>
                                  <button 
                                    onClick={() => { setReplyingCommentId(comment.id); setReplyInput(''); }}
                                    className="hover:underline cursor-pointer text-purple-600 dark:text-purple-400"
                                  >
                                    Reply
                                  </button>
                                  {(comment.userId === currentUser?.id || currentUser?.role === 'admin') && (
                                    <button 
                                      onClick={() => deleteComment(comment.id)}
                                      className="text-red-500 hover:underline cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  )}
                                  <span className="text-[9px] font-normal font-mono">
                                    {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Nested replies list */}
                            {commentReplies.length > 0 && (
                              <div className="ml-9 mt-3 space-y-2.5 border-l-2 border-gray-50 dark:border-gray-900 pl-3">
                                {commentReplies.map((reply) => {
                                  const replier = users.find(u => u.id === reply.userId);
                                  const replierProfile = profiles.find(p => p.userId === reply.userId);

                                  return (
                                    <div key={reply.id} className="flex gap-2 items-start">
                                      <img
                                        src={replierProfile?.avatar}
                                        alt="replier"
                                        referrerPolicy="no-referrer"
                                        onClick={() => handleUserClick(reply.userId)}
                                        className="w-6 h-6 rounded-full object-cover cursor-pointer"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="bg-gray-50 dark:bg-gray-900/30 px-3 py-1.5 rounded-xl inline-block max-w-full">
                                          <div className="flex items-center gap-1">
                                            <span 
                                              onClick={() => handleUserClick(reply.userId)}
                                              className="font-bold text-xs text-gray-900 dark:text-gray-100 hover:underline cursor-pointer"
                                            >
                                              {replierProfile?.fullName}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">
                                              @{replier?.username}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed break-words">
                                            {reply.content}
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-2 mt-0.5 ml-1 text-[10px] text-gray-400 font-bold">
                                          {(reply.userId === currentUser?.id || currentUser?.role === 'admin') && (
                                            <button 
                                              onClick={() => deleteComment(reply.id)}
                                              className="text-red-500 hover:underline cursor-pointer"
                                            >
                                              Delete
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Inline reply editor box */}
                            {replyingCommentId === comment.id && (
                              <form 
                                onSubmit={(e) => handleReplySubmit(post.id, comment.id, e)}
                                className="ml-9 mt-2.5 flex gap-2"
                              >
                                <input
                                  type="text"
                                  value={replyInput}
                                  onChange={(e) => setReplyInput(e.target.value)}
                                  placeholder={`Reply to @${commenter?.username}...`}
                                  className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 px-3 py-1.5 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                                />
                                <button 
                                  type="submit" 
                                  className="px-3 py-1.5 bg-purple-600 text-white font-semibold text-xs rounded-xl hover:opacity-90 cursor-pointer"
                                >
                                  Reply
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => setReplyingCommentId(null)}
                                  className="px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl text-xs cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </form>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add main post comment */}
                  <form 
                    onSubmit={(e) => handleCommentSubmit(post.id, e)}
                    className="flex gap-2 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCommentInputs(prev => ({ ...prev, [post.id]: val }));
                      }}
                      className="flex-1 bg-gray-50 dark:bg-gray-900 text-xs border border-gray-100 dark:border-gray-900 rounded-xl px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500"
                    />
                    <button 
                      type="submit" 
                      className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-xl transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </article>

              {/* Interleaved News Bulletin Card */}
              {correspondingBulletin && (
                <article 
                  className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 p-5 relative mt-6"
                  id={`bulletin_card_${correspondingBulletin.id}`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center font-black text-white text-sm border-2 border-red-500 shadow-md shrink-0">
                        IT
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                            India Today Bulletins
                            <CheckCircle className="w-4 h-4 fill-blue-500 text-white shrink-0 inline" />
                          </span>
                          <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-mono">
                            OFFICIAL
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            @indiatoday
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 dark:text-gray-600 font-medium flex-wrap">
                          <span className="text-red-500 font-black">{correspondingBulletin.source}</span>
                          <span>•</span>
                          <span className="font-mono">{correspondingBulletin.time}</span>
                          <span>•</span>
                          <span className="text-emerald-500 font-bold capitalize">🇮🇳 Verified News</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* News Headline */}
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-50 leading-snug mb-2 font-sans tracking-tight">
                    {correspondingBulletin.title}
                  </h3>

                  {/* News Image Cover */}
                  <div className="relative overflow-hidden rounded-2xl border border-gray-100/50 dark:border-gray-900/50 mb-4 bg-zinc-900">
                    <img
                      src={correspondingBulletin.imageUrl}
                      alt={correspondingBulletin.title}
                      referrerPolicy="no-referrer"
                      className="w-full max-h-96 object-cover aspect-video hover:scale-101 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-red-600 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-md">
                      {correspondingBulletin.category}
                    </span>
                  </div>

                  {/* News Summary Content */}
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3">
                    {correspondingBulletin.summary}
                  </p>

                  {/* Key Bullet Points Box */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl p-3.5 border border-zinc-100 dark:border-zinc-900 mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                      KEY NEWS BULLETINS
                    </h4>
                    <ul className="space-y-2">
                      {correspondingBulletin.bullets.map((b, i) => (
                        <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                          <span className="text-red-500 font-black shrink-0 mt-0.5">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {correspondingBulletin.hashtags.map((tag) => (
                      <span 
                        key={tag}
                        className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2.5 py-0.5 rounded-md hover:underline cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons Bar */}
                  <div className="flex items-center justify-between border-y border-gray-100 dark:border-gray-900 py-3 mb-4">
                    <div className="flex gap-4 sm:gap-6">
                      {/* Like button */}
                      <div className="flex items-center gap-1.5">
                        <button 
                          type="button"
                          onClick={() => {
                            const isLiked = likedBulletins.includes(correspondingBulletin.id);
                            if (isLiked) {
                              setLikedBulletins(likedBulletins.filter(id => id !== correspondingBulletin.id));
                            } else {
                              setLikedBulletins([...likedBulletins, correspondingBulletin.id]);
                            }
                          }}
                          className="p-1.5 rounded-full cursor-pointer transition-colors hover:bg-pink-50 dark:hover:bg-pink-950/20 group"
                        >
                          <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                            likedBulletins.includes(correspondingBulletin.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-400 dark:text-gray-500 hover:text-pink-500'
                          }`} />
                        </button>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {correspondingBulletin.likesCount + (likedBulletins.includes(correspondingBulletin.id) ? 1 : 0)}
                        </span>
                      </div>

                      {/* Comment count */}
                      <div className="flex items-center gap-1.5">
                        <div className="p-1.5 text-gray-400 dark:text-gray-500">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {bulletinComments[correspondingBulletin.id]?.length || 0}
                        </span>
                      </div>

                      {/* Share Button */}
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/bulletin/${correspondingBulletin.id}`);
                          alert('Breaking news link copied to clipboard!');
                        }}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 rounded-full cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/10"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* News Comment Section Board */}
                  <div className="space-y-4">
                    {/* List of comments */}
                    {(bulletinComments[correspondingBulletin.id] || []).length > 0 && (
                      <div className="space-y-3 pt-1 divide-y divide-gray-50 dark:divide-gray-900/40">
                        {(bulletinComments[correspondingBulletin.id] || []).map((comment, i) => (
                          <div key={i} className="pt-3 first:pt-0 flex gap-2.5 items-start">
                            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0 uppercase font-mono">
                              {comment.username.slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-50 dark:bg-gray-900/40 px-3 py-2 rounded-2xl inline-block max-w-full">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-xs text-gray-900 dark:text-gray-100">
                                    @{comment.username}
                                  </span>
                                  <span className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">
                                    {comment.time}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 leading-relaxed break-words font-sans">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add main post comment */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const txt = bulletinCommentInputs[correspondingBulletin.id]?.trim();
                        if (!txt) return;
                        const newComm = {
                          username: currentUser?.username || 'kevin',
                          text: txt,
                          time: 'Just now'
                        };
                        setBulletinComments({
                          ...bulletinComments,
                          [correspondingBulletin.id]: [...(bulletinComments[correspondingBulletin.id] || []), newComm]
                        });
                        setBulletinCommentInputs({
                          ...bulletinCommentInputs,
                          [correspondingBulletin.id]: ''
                        });
                      }}
                      className="flex gap-2 items-center"
                    >
                      <input
                        type="text"
                        placeholder="Discuss this bulletin..."
                        value={bulletinCommentInputs[correspondingBulletin.id] || ''}
                        onChange={(e) => {
                          setBulletinCommentInputs({
                            ...bulletinCommentInputs,
                            [correspondingBulletin.id]: e.target.value
                          });
                        }}
                        className="flex-1 bg-gray-50 dark:bg-gray-900 text-xs border border-gray-100 dark:border-gray-900 rounded-xl px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-500"
                      />
                      <button 
                        type="submit" 
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </article>
              )}
            </React.Fragment>
          );
        })
        )}
      </div>

      {/* REPORT MODAL */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Report Inappropriate Post
            </h4>
            
            {reportSuccess ? (
              <div className="bg-green-50 dark:bg-green-950/20 text-green-600 p-4 border border-green-100 dark:border-green-900/50 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                <Check className="w-4 h-4" />
                Report logged for Admin review. Thank you!
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select a category that best describes how this post violates site guidelines:
                </p>
                <div className="space-y-2">
                  {(['spam', 'abuse', 'fake', 'inappropriate'] as const).map((r) => (
                    <label key={r} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/50 text-xs text-gray-700 dark:text-gray-300 capitalize cursor-pointer">
                      <input
                        type="radio"
                        name="report_reason"
                        checked={reportReason === r}
                        onChange={() => setReportReason(r)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      {r}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2.5 bg-linear-to-r from-amber-500 to-orange-600 hover:opacity-95 text-white text-xs font-bold rounded-xl cursor-pointer">
                    Submit Report
                  </button>
                  <button type="button" onClick={() => setReportingPostId(null)} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded-xl cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE POST MODAL */}
      {createPostOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-900 mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Create New Post</h3>
              <button onClick={() => setCreatePostOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs p-1">Cancel</button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              <div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What is on your mind today? (Use #coding, #react, etc.)"
                  rows={4}
                  className="w-full text-xs sm:text-sm bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-2xl p-3 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500"
                  required
                />
              </div>

              {/* Dynamic Media URLs Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Image Attachments (Simulated URLs)</label>
                {mediaUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleMediaUrlChange(i, e.target.value)}
                      placeholder="Paste any image URL (Unsplash, etc.)"
                      className="flex-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-hidden"
                    />
                    {i === mediaUrls.length - 1 && mediaUrls.length < 4 && (
                      <button 
                        type="button" 
                        onClick={handleAddMediaUrlInput}
                        className="px-2 py-1 text-[10px] font-bold bg-purple-50 dark:bg-purple-950/30 text-purple-600 rounded-lg border border-purple-100"
                      >
                        Add URL
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tag location, hashtags */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Add Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Paris, London"
                    className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Post Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-xl px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-hidden"
                  >
                    <option value="public">Public</option>
                    <option value="followers">Followers Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100 dark:border-gray-900">
                <button type="submit" className="px-5 py-2.5 bg-linear-to-r from-pink-500 via-purple-600 to-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-purple-500/10">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIKERS LIST MODAL */}
      {showLikersPostId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-900 mb-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Likes ({likes.filter(l => l.postId === showLikersPostId).length})</h4>
              <button onClick={() => setShowLikersPostId(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs">Close</button>
            </div>
            
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {likes.filter(l => l.postId === showLikersPostId).map((like) => {
                const userObj = users.find(u => u.id === like.userId);
                const profileObj = profiles.find(p => p.userId === like.userId);
                const amIFollowing = follows.some(f => f.followerId === currentUser?.id && f.followingId === like.userId);

                return (
                  <div key={like.id} className="flex justify-between items-center p-1.5 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-xl">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { handleUserClick(like.userId); setShowLikersPostId(null); }}>
                      <img
                        src={profileObj?.avatar}
                        alt="avatar"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                          {profileObj?.fullName}
                          {profileObj?.isVerified && (
                            <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-white shrink-0" />
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400">@{userObj?.username}</p>
                      </div>
                    </div>
                    {currentUser?.id !== like.userId && (
                      <button 
                        onClick={() => toggleFollow(like.userId)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                          amIFollowing 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' 
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        {amIFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
