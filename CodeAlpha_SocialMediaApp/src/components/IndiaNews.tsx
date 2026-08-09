import React, { useState, useEffect } from 'react';
import { useSocialMedia } from '../data/store';
import { 
  Newspaper, Share2, MessageSquare, Flame, TrendingUp, 
  Tv, Radio, Award, Eye, ThumbsUp, Send, CheckCircle, Search, Clock, MapPin
} from 'lucide-react';

interface NewsArticle {
  id: string;
  category: 'cricket' | 'bollywood' | 'politics' | 'tech' | 'all';
  title: string;
  source: string;
  time: string;
  imageUrl: string;
  summary: string;
  bullets: string[];
  views: string;
  trendingScore: number;
}

export const IndiaNews: React.FC = () => {
  const { createPost, currentUser, addSystemLog } = useSocialMedia();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cricket' | 'bollywood' | 'politics' | 'tech'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sharedStatus, setSharedStatus] = useState<string | null>(null);
  
  // Interactive comments simulation for news articles
  const [articleComments, setArticleComments] = useState<Record<string, { username: string; text: string; time: string }[]>>({
    'news_1': [
      { username: 'virat_kohli', text: 'Stellar performance by the boys! We are ready for the test series.', time: '10m ago' },
      { username: 'ranveer_kitchen', text: 'Celebrations call for a grand feast! Incredible win.', time: '35m ago' }
    ],
    'news_2': [
      { username: 'delhi_explorer', text: 'This UPI system is a savior during busy travel seasons in Rajasthan!', time: '1h ago' }
    ]
  });
  
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});

  // Real-time news flash items
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
  }, [BREAKING_FLASHES.length]);

  const newsArticles: NewsArticle[] = [
    {
      id: 'news_1',
      category: 'cricket',
      title: "Team India Clinches Thrilling Victory in Bengaluru; Seans T20 Series Clean Sweep",
      source: "BHARAT CRICKET DESK",
      time: "20m ago",
      imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=600",
      summary: "In a nail-biting final over thriller, India defended 12 runs to defeat Australia in Bengaluru, securing a complete 3-0 series victory. The team displayed phenomenal bowling grit.",
      bullets: [
        "Jasprit Bumrah bowled a masterclass 19th over yielding only 3 runs.",
        "Young batsman Shubman Gill awarded Man of the Series with 240 runs.",
        "Head coach emphasizes the team’s strong bench strength ahead of the main world championship tournament."
      ],
      views: "1.2M",
      trendingScore: 98
    },
    {
      id: 'news_2',
      category: 'tech',
      title: "UPI Records Historic Milestone: 15.2 Billion Digital Transactions Clocked in June",
      source: "INDIA TODAY BUSINESS",
      time: "45m ago",
      imageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=600",
      summary: "The National Payments Corporation of India (NPCI) revealed that unified payments interface transactions surged past the 15 billion mark, marking India as the global leader in real-time digital payments.",
      bullets: [
        "Small merchants and rural retail outlets comprise over 68% of total transaction density.",
        "Cross-border UPI services expand to 5 new countries in Europe and Middle East.",
        "NPCI plans to launch offline voice-activated payments next quarter to target remote regions."
      ],
      views: "850K",
      trendingScore: 94
    },
    {
      id: 'news_3',
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
      trendingScore: 82
    },
    {
      id: 'news_4',
      category: 'bollywood',
      title: "Bollywood Mega Epic 'Samrat' Unveils First Visual Teaser; Breaks YouTube Viewing Records",
      source: "ENTERTAINMENT TODAY",
      time: "3h ago",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600",
      summary: "The upcoming multi-starrer historical drama teaser has crossed 45 million views in less than 12 hours, capturing national excitement for its high-budget action sequences and beautiful classical soundtrack.",
      bullets: [
        "Directed by an award-winning director with an estimated record production budget.",
        "Features custom designed traditional Indian wear and handcrafted silver jewelry from Jaipur artisans.",
        "Releasing in Hindi, Tamil, Telugu, and Kannada with global distribution partners."
      ],
      views: "2.1M",
      trendingScore: 99
    },
    {
      id: 'news_5',
      category: 'tech',
      title: "Bengaluru Startups Dominate National Funding Rounds with Green-Tech Solutions",
      source: "TECH SINDH",
      time: "5h ago",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
      summary: "India’s Silicon Valley sees a new surge of seed funding flowing directly into electric vehicle smart batteries and agricultural drone technology startups.",
      bullets: [
        "Green battery startup secures $40M from global venture capitalists.",
        "Drones assisting farmers in Maharashtra with precision pesticide spray technology showed 30% water saving.",
        "Karnataka government announces local subsidy extensions for clean energy R&D hubs."
      ],
      views: "310K",
      trendingScore: 78
    },
    {
      id: 'news_6',
      category: 'politics',
      title: "India Re-elected to Lead International Solar Alliance; Proposes Global Grid Expansion",
      source: "CLIMATE NEWSROOM",
      time: "8h ago",
      imageUrl: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=600",
      summary: "In a resounding vote of support, member nations elected India to steer the renewable ISA. New projects will seek to deploy rural microgrids across developing countries.",
      bullets: [
        "Aim to hook up over 100 million solar-ready homes with battery storage modules.",
        "Significant focus on domestic solar cell manufacturing capability in Gujarat and Tamil Nadu.",
        "Over $2 Billion dedicated funding mobilized through partner banking institutions."
      ],
      views: "150K",
      trendingScore: 71
    }
  ];

  const handleShareToFeed = (article: NewsArticle) => {
    const postCaption = `🚨 [IND-TODAY REPORT] ${article.title}\n\n"${article.summary}"\n\n📌 Key Updates:\n${article.bullets.map(b => `• ${b}`).join('\n')}\n\n#IndiaToday #BharatToday #NewsIndia #${article.category} #KevinNews`;
    
    // Create the social post!
    createPost(
      postCaption, 
      [article.imageUrl], 
      "India Today Newsroom", 
      ['indiatoday', 'bharattoday', 'newsindia', article.category, 'kevinnews'],
      'public'
    );

    // Notify user with elegant UI feedback
    setSharedStatus(article.id);
    addSystemLog(currentUser?.id || 'kevin', `Shared breaking news article: "${article.title}" directly to the social timeline.`);
    
    setTimeout(() => {
      setSharedStatus(null);
    }, 3000);
  };

  const handleAddComment = (articleId: string) => {
    const text = newCommentText[articleId]?.trim();
    if (!text) return;

    const newComment = {
      username: currentUser?.username || 'kevin',
      text,
      time: 'Just now'
    };

    setArticleComments(prev => ({
      ...prev,
      [articleId]: [newComment, ...(prev[articleId] || [])]
    }));

    setNewCommentText(prev => ({ ...prev, [articleId]: '' }));
    addSystemLog(currentUser?.id || 'kevin', `Added news room comment to article: ${articleId}`);
  };

  const filteredArticles = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="india_news_root">
      
      {/* INDIA TODAY STYLE BREAKING NEWS FLASH BANNER */}
      <div className="bg-red-700 text-white overflow-hidden py-3 px-4 rounded-2xl flex items-center shadow-lg border border-red-600 gap-3">
        <div className="bg-white text-red-700 font-black text-xs px-2.5 py-1 rounded-md animate-pulse uppercase shrink-0 flex items-center gap-1.5 tracking-wider">
          <Flame className="w-3.5 h-3.5 fill-red-700" />
          BREAKING
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold truncate transition-all duration-500 ease-in-out font-sans">
            {BREAKING_FLASHES[activeFlashIndex]}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-red-100 font-mono">
          <Clock className="w-3.5 h-3.5 text-red-100" />
          LIVE 24/7
        </div>
      </div>

      {/* HEADER SECTION WITH INDIA BRANDING */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 rounded-3xl p-6 border border-red-900/40 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full border border-orange-500/20 tracking-wider">
                🇮🇳 BHARAT EXCLUSIVE
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 tracking-wider">
                MEMBER AREA
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Newspaper className="w-8 h-8 text-red-500" />
              BharatToday <span className="text-red-500 font-medium text-2xl font-mono">NEWSROOM</span>
            </h1>
            <p className="text-gray-300 text-sm mt-1 max-w-xl">
              India's premium digital reporting desk. Providing hyper-focused, real-time national bulletins, Bollywood inside stories, and cricket stats curated specially for Kevin.
            </p>
          </div>

          {/* SIMULATED LIVE STREAM BLOCK */}
          <div className="bg-slate-900/90 border border-red-900/50 rounded-2xl p-3 shadow-2xl flex items-center gap-3 shrink-0 max-w-xs">
            <div className="relative w-16 h-12 bg-black rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1540747737956-378724044432?auto=format&fit=crop&q=80&w=150" 
                alt="Live" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                <Tv className="w-5 h-5 text-red-500 animate-bounce" />
              </div>
              <span className="absolute top-1 left-1 bg-red-600 text-[8px] font-bold px-1 rounded-xs uppercase animate-pulse text-white">
                LIVE
              </span>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase text-red-500 tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                INDIA TODAY DEBATE
              </p>
              <h4 className="text-xs font-bold text-white leading-tight truncate w-40">
                Are local startups winning over global tech?
              </h4>
              <p className="text-[10px] text-gray-400 mt-0.5">
                84k watching now
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TOPICS CATEGORIES BAR & SEARCH */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
        
        {/* Categories Tab Selector */}
        <div className="flex flex-wrap gap-1.5" id="news_category_selector">
          {[
            { id: 'all', label: '🔴 All Bulletins' },
            { id: 'cricket', label: '🏏 Cricket & IPL' },
            { id: 'bollywood', label: '🎬 Bollywood Today' },
            { id: 'politics', label: '🇮🇳 National Affairs' },
            { id: 'tech', label: '💻 Tech & Digital India' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Local News Search Input */}
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search news headline or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-red-600 placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* ARTICLES CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="news_articles_grid">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-12 text-center">
            <Newspaper className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-md font-bold text-zinc-300">No matching news articles found</h3>
            <p className="text-zinc-500 text-xs mt-1">Try selecting a different topic category or adjusting your search term.</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <article 
              key={article.id} 
              className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden hover:border-red-900/30 transition-all flex flex-col shadow-lg"
              id={`news_card_${article.id}`}
            >
              
              {/* Cover Photo */}
              <div className="relative h-48 w-full overflow-hidden bg-zinc-900 shrink-0">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay Tags */}
                <span className="absolute top-3 left-3 bg-red-600 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-md">
                  {article.category === 'all' ? 'breaking' : article.category}
                </span>

                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-zinc-300 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                  Score: {article.trendingScore}
                </span>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-2">
                  <span className="text-red-400 font-black">{article.source}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {article.time}
                  </span>
                </div>

                <h3 className="font-bold text-md text-white tracking-tight leading-snug mb-2 hover:text-red-400 cursor-pointer">
                  {article.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {article.summary}
                </p>

                {/* Key Bullet Points */}
                <div className="bg-zinc-900/60 rounded-2xl p-3 border border-zinc-800 mb-4 flex-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-orange-400" />
                    Key Bullet Bulletins
                  </h4>
                  <ul className="space-y-1.5">
                    {article.bullets.map((bullet, i) => (
                      <li key={i} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                        <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-[10px] text-zinc-500 border-t border-zinc-900 pt-3 mb-4 font-mono">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-zinc-600" /> {article.views} reads
                  </span>
                  <span>•</span>
                  <span>Real-time Indian Curation Desk</span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2">
                  
                  {/* Share to social feed */}
                  <button
                    onClick={() => handleShareToFeed(article)}
                    disabled={sharedStatus === article.id}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                      sharedStatus === article.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/10'
                    }`}
                  >
                    {sharedStatus === article.id ? (
                      <>
                        <CheckCircle className="w-4 h-4 animate-bounce" />
                        Shared to Feed!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        Share on BharatToday Feed
                      </>
                    )}
                  </button>

                  <button 
                    className="p-2 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-xl transition-all cursor-pointer"
                    title="Read comments"
                    onClick={() => {
                      // Simple toggle behavior or scroll to comments
                      const el = document.getElementById(`comments_section_${article.id}`);
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>

                {/* SIMULATED COMMENTS SECTION */}
                <div 
                  id={`comments_section_${article.id}`}
                  className="mt-4 border-t border-zinc-900 pt-4 space-y-3"
                >
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                    Newsroom Reactions ({articleComments[article.id]?.length || 0})
                  </h4>

                  {/* Add feedback comment */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Type a reaction..."
                      value={newCommentText[article.id] || ''}
                      onChange={(e) => setNewCommentText(prev => ({ ...prev, [article.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(article.id)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-white"
                    />
                    <button
                      onClick={() => handleAddComment(article.id)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-red-500 rounded-lg cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {(articleComments[article.id] || []).length === 0 ? (
                      <p className="text-[10px] text-zinc-600 italic">No reactions yet. Be the first to comment!</p>
                    ) : (
                      (articleComments[article.id] || []).map((comm, index) => (
                        <div key={index} className="bg-zinc-900/40 p-2 rounded-xl text-[11px] border border-zinc-900">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="font-bold text-zinc-300">@{comm.username}</span>
                            <span className="text-zinc-600 font-mono">{comm.time}</span>
                          </div>
                          <p className="text-zinc-400 leading-snug">{comm.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </article>
          ))
        )}
      </div>

    </div>
  );
};
