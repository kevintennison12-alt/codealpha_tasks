import React from 'react';
import { useSocialMedia } from '../data/store';
import { 
  ShieldAlert, Users, Image, MessageSquare, Heart, 
  Trash2, Check, RefreshCw, Star, ShieldCheck, Activity 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    users, 
    posts, 
    comments, 
    likes, 
    reports, 
    activityLogs, 
    resolveReport, 
    toggleBlockUser,
    profiles
  } = useSocialMedia();

  // Calculations for live metrics
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const totalComments = comments.length;
  const totalLikes = likes.length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
  const activeUsersCount = Math.round(totalUsers * 0.8); // 80% active simulator
  
  // Dynamic engagement rate: (likes + comments) / posts
  const engagementRate = totalPosts > 0 
    ? (((totalLikes + totalComments) / totalPosts)).toFixed(1)
    : '0.0';

  // SVG Custom Charts Data points (User Growth: 5 months)
  const growthData = [10, 24, 45, 68, totalUsers]; // Simulated trend leading to live total
  const dailyPostsData = [3, 8, 12, 18, totalPosts]; // Weekly posts count trend

  return (
    <div className="flex-1 space-y-6" id="admin_dashboard_module">
      
      {/* Banner */}
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold tracking-widest font-mono uppercase">
            <Star className="w-4 h-4 text-indigo-500 fill-indigo-500 shrink-0" />
            Control Center
          </div>
          <h2 className="font-extrabold text-lg sm:text-xl tracking-tight">System Admin Console</h2>
          <p className="text-xs text-slate-400 max-w-md">
            Review overall platform statistics, monitor database records, review reports, and take moderator actions in real time.
          </p>
        </div>
        <div className="absolute right-0 bottom-[-10%] opacity-15 select-none pointer-events-none">
          <Activity className="w-40 h-40 stroke-[1]" />
        </div>
      </div>

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="kpi_grid">
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Total Users</span>
              <p className="text-lg sm:text-2xl font-black text-gray-950 dark:text-gray-50 mt-1">{totalUsers}</p>
            </div>
            <span className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-xl"><Users className="w-4 h-4" /></span>
          </div>
          <p className="text-[9px] text-green-500 font-bold mt-2 flex items-center gap-0.5">🚀 +14% growth month-over-month</p>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Total Posts</span>
              <p className="text-lg sm:text-2xl font-black text-gray-950 dark:text-gray-50 mt-1">{totalPosts}</p>
            </div>
            <span className="p-2 bg-pink-50 dark:bg-pink-950/40 text-pink-500 rounded-xl"><Image className="w-4 h-4" /></span>
          </div>
          <p className="text-[9px] text-green-500 font-bold mt-2 flex items-center gap-0.5">📈 +8% daily publishing spike</p>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Engagement</span>
              <p className="text-lg sm:text-2xl font-black text-gray-950 dark:text-gray-50 mt-1">{engagementRate}x</p>
            </div>
            <span className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-500 rounded-xl"><Heart className="w-4 h-4" /></span>
          </div>
          <p className="text-[9px] text-purple-500 font-bold mt-2 flex items-center gap-0.5">🔥 High interaction density</p>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 p-4 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Pending Reports</span>
              <p className="text-lg sm:text-2xl font-black text-gray-950 dark:text-gray-50 mt-1">{pendingReportsCount}</p>
            </div>
            <span className="p-2 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-xl"><ShieldAlert className="w-4 h-4" /></span>
          </div>
          <p className="text-[9px] text-red-500 font-bold mt-2 flex items-center gap-0.5">⚠️ Moderation actions required</p>
        </div>
      </div>

      {/* DYNAMIC SVG CHARTS SECTION (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard_charts">
        
        {/* Chart 1: User Growth Area Chart */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 font-mono">User Growth Curve (Active Registrations)</h3>
          
          <div className="h-44 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="4" className="dark:stroke-gray-900" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeDasharray="4" className="dark:stroke-gray-900" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="4" className="dark:stroke-gray-900" />
              
              {/* Sparkline curve */}
              <path
                d={`M 10,130 C 120,110 240,65 370,45 490,${140 - (growthData[4] * 18)}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Fill area beneath */}
              <path
                d={`M 10,130 C 120,110 240,65 370,45 490,${140 - (growthData[4] * 18)} L 490,150 L 10,150 Z`}
                fill="url(#areaGrad)"
              />
              
              {/* Data points */}
              <circle cx="10" cy="130" r="5" fill="#4f46e5" />
              <circle cx="120" cy="110" r="5" fill="#4f46e5" />
              <circle cx="240" cy="65" r="5" fill="#4f46e5" />
              <circle cx="370" cy="45" r="5" fill="#4f46e5" />
              <circle cx="490" cy={140 - (growthData[4] * 18)} r="6" fill="#8b5cf6" />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[9px] text-gray-400 font-mono font-bold uppercase">
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul (Live: {totalUsers})</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Daily Posts Bar Chart */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 font-mono">Daily Publishing Volumes</h3>

          <div className="h-44 w-full flex items-end justify-between gap-4 relative pt-4">
            {dailyPostsData.map((val, idx) => {
              const heightPercent = Math.max(10, Math.min(100, (val / 20) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">{val}</span>
                  <div 
                    className="w-full rounded-t-xl bg-linear-to-t from-pink-500 to-purple-600 hover:opacity-90 transition-all duration-500"
                    style={{ height: `${heightPercent}px` }}
                  ></div>
                  <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">Day {idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* REPORT MODERATION & USER BLOCKS CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column Left (2 cols width): Moderation Reports List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 shadow-xs">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-red-500" />
            Reports Moderation Queue
          </h3>

          <div className="divide-y divide-gray-100 dark:divide-gray-900 space-y-4">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">No user reports logged. Platform safe!</div>
            ) : (
              reports.map((rep) => {
                const reporter = users.find(u => u.id === rep.reporterId);
                const isPending = rep.status === 'pending';

                return (
                  <div key={rep.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Report ID: {rep.id}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          rep.reason === 'spam' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {rep.reason}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPending ? 'bg-orange-50 text-orange-500 border border-orange-100' : 'bg-green-50 text-green-500 border border-green-100'
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Reporter: <span className="font-semibold text-gray-700 dark:text-gray-300">@{reporter?.username || 'anonymous'}</span> • Target Type: <span className="capitalize font-semibold">{rep.targetType}</span> (ID: {rep.targetId})
                      </p>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => resolveReport(rep.id, 'delete')}
                          className="px-3 py-1.5 bg-red-600 text-white font-bold text-[10px] rounded-xl hover:opacity-95 cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Content
                        </button>
                        <button
                          onClick={() => resolveReport(rep.id, 'ignore')}
                          className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold text-[10px] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column Right (1 col width): Users Moderation list */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 shadow-xs">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-indigo-500" />
            Users Control
          </h3>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {users.filter(u => u.role !== 'admin').map((u) => {
              const profObj = profiles.find(p => p.userId === u.id);
              return (
                <div key={u.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={profObj?.avatar}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">@{u.username}</p>
                      <p className="text-[10px] text-gray-400">{u.isBlocked ? '🔴 Blocked' : '🟢 Active'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBlockUser(u.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                      u.isBlocked 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {u.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* LIVE ACTIVITY TICKER STREAM */}
      <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl p-5 shadow-xs">
        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-emerald-500" />
          Live Security & Session Activity Log
        </h3>

        <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1 divide-y divide-gray-50 dark:divide-gray-900/30">
          {activityLogs.map((log) => {
            const userObj = users.find(u => u.id === log.userId);
            const profObj = profiles.find(p => p.userId === log.userId);

            return (
              <div key={log.id} className="pt-3.5 first:pt-0 flex justify-between items-start text-xs">
                <div className="flex gap-2.5">
                  <img
                    src={profObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=50'}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      <span className="font-bold">@{userObj?.username || 'system'}</span> {log.action}
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                      Activity ID: {log.id}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-mono shrink-0 pl-2">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
