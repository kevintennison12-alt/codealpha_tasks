/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FolderKanban, CheckSquare, Clock, AlertTriangle, Users, ClipboardList, CalendarDays, ArrowRight, UserCheck
} from 'lucide-react';
import { Project, Task, ActivityLog, User } from '../types';

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  logs: ActivityLog[];
  currentUser: User | null;
  onViewChange: (view: string) => void;
  onSelectProject: (id: string) => void;
}

export default function DashboardView({
  projects,
  tasks,
  users,
  logs,
  currentUser,
  onViewChange,
  onSelectProject
}: DashboardViewProps) {
  // Statistics computation
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const archivedProjects = projects.filter(p => p.status === 'Archived').length;

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  
  // Overdue tasks (due date is in the past, and task is not completed)
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasksCount = tasks.filter(t => {
    if (t.status === 'Completed' || !t.dueDate) return false;
    return t.dueDate < todayStr;
  }).length;

  // Assigned tasks (to current user)
  const assignedTasksCount = currentUser 
    ? tasks.filter(t => t.assignedUserId === currentUser.id && t.status !== 'Completed').length 
    : 0;

  // Chart Data: Tasks by status
  const taskStatusDistribution = {
    Todo: tasks.filter(t => t.status === 'Todo').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    Review: tasks.filter(t => t.status === 'Review').length,
    Testing: tasks.filter(t => t.status === 'Testing').length,
    Completed: tasks.filter(t => t.status === 'Completed').length
  };

  // Chart Data: Team performance (completed tasks per member)
  const teamStats = users.map(u => {
    const userCompleted = tasks.filter(t => t.assignedUserId === u.id && t.status === 'Completed').length;
    const userTotal = tasks.filter(t => t.assignedUserId === u.id).length;
    return {
      name: u.name,
      avatar: u.avatar,
      completed: userCompleted,
      total: userTotal,
      role: u.role
    };
  }).sort((a, b) => b.completed - a.completed);

  // Weekly productivity: mock task completions per day of the week
  // Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
  const weekdayCounts = [1, 3, 5, 4, 7, 6, 2]; // seeded counts
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxWeeklyCount = Math.max(...weekdayCounts, 1);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0b0f19]">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <h1 className="font-display font-bold text-lg tracking-tight text-slate-800 dark:text-white">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Here is your snapshot. You have <span className="text-indigo-600 dark:text-indigo-400 font-bold">{assignedTasksCount} tasks</span> assigned to you today.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 z-10">
          <button
            onClick={() => onViewChange('projects')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-700 cursor-pointer transition-all"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            <span>View Projects</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Active Projects */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-3 rounded-lg flex items-center gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
            <FolderKanban className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Active Projects
            </p>
            <h3 className="text-lg font-display font-bold text-slate-800 dark:text-slate-100 leading-none mt-0.5">
              {activeProjects} <span className="text-xs text-slate-400 font-normal">/ {totalProjects}</span>
            </h3>
          </div>
        </div>

        {/* Card 2: Pending Tasks */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-3 rounded-lg flex items-center gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckSquare className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Pending Tasks
            </p>
            <h3 className="text-lg font-display font-bold text-slate-800 dark:text-slate-100 leading-none mt-0.5">
              {pendingTasks} <span className="text-xs text-slate-400 font-normal">/ {totalTasks}</span>
            </h3>
          </div>
        </div>

        {/* Card 3: Overdue Tasks */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-3 rounded-lg flex items-center gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className={`flex h-9 w-9 items-center justify-center rounded shrink-0 ${
            overdueTasksCount > 0 
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 animate-pulse' 
              : 'bg-slate-50 dark:bg-slate-900 text-slate-500'
          }`}>
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Overdue Tasks
            </p>
            <h3 className={`text-lg font-display font-bold leading-none mt-0.5 ${overdueTasksCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {overdueTasksCount}
            </h3>
          </div>
        </div>

        {/* Card 4: My Pending */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-3 rounded-lg flex items-center gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
            <UserCheck className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Assigned to Me
            </p>
            <h3 className="text-lg font-display font-bold text-slate-800 dark:text-slate-100 leading-none mt-0.5">
              {assignedTasksCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Tasks by Status (Lanes) */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-4 rounded-lg shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div>
            <h2 className="font-display font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
              Tasks by Status
            </h2>
            
            {/* Custom Visual Distribution Indicator */}
            {totalTasks === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400">
                No tasks created yet.
              </div>
            ) : (
              <div className="py-4 flex flex-col items-center justify-center">
                {/* SVG Radial Progress Bars stacked or pie representation */}
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                    {/* Ring background */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--color-slate-100)" strokeWidth="3" className="dark:stroke-slate-800" />
                    
                    {/* Ring segmented pieces */}
                    {(() => {
                      let accumulatedPercentage = 0;
                      return Object.entries(taskStatusDistribution).map(([status, count], idx) => {
                        if (count === 0) return null;
                        const percentage = (count / totalTasks) * 100;
                        const strokeDasharray = `${percentage} ${100 - percentage}`;
                        const strokeDashoffset = 100 - accumulatedPercentage;
                        accumulatedPercentage += percentage;

                        const colors = {
                          Todo: '#94a3b8',       
                          'In Progress': '#3b82f6', 
                          Review: '#f59e0b',      
                          Testing: '#ec4899',     
                          Completed: '#10b981'    
                        };

                        return (
                          <circle
                            key={status}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke={colors[status as keyof typeof colors] || '#3b82f6'}
                            strokeWidth="3.2"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="text-center">
                    <span className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">
                      {totalTasks}
                    </span>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                      Total Tasks
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend Details */}
          <div className="space-y-1.5 mt-2">
            {Object.entries(taskStatusDistribution).map(([status, count]) => {
              const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              const statusColors = {
                Todo: 'bg-slate-400',
                'In Progress': 'bg-indigo-500',
                Review: 'bg-amber-500',
                Testing: 'bg-pink-500',
                Completed: 'bg-emerald-500'
              };
              return (
                <div key={status} className="flex items-center justify-between text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`}></span>
                    <span className="text-slate-600 dark:text-slate-400">{status}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-750 dark:text-slate-300">
                    <span>{count}</span>
                    <span className="text-[9px] text-slate-400 font-normal">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Weekly Productivity */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-4 rounded-lg shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="font-display font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Weekly Productivity
              </h2>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                +18% completions vs last week
              </span>
            </div>

            {/* Custom Bar Chart SVG Layout */}
            <div className="py-4">
              <div className="h-32 w-full flex items-end justify-between gap-3 px-1">
                {weekdayCounts.map((count, index) => {
                  const percentage = (count / maxWeeklyCount) * 100;
                  return (
                    <div key={weekdays[index]} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                      <div className="relative w-full flex justify-center">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none z-10 whitespace-nowrap">
                          {count} completed
                        </div>
                      </div>
                      
                      {/* Active bar container */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded overflow-hidden h-full flex items-end">
                        <div 
                          style={{ height: `${percentage}%` }}
                          className="w-full bg-indigo-600 dark:bg-indigo-500 rounded-t group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400 transition-all duration-300 ease-out cursor-pointer"
                        ></div>
                      </div>
                      
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                        {weekdays[index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded border border-slate-100 dark:border-slate-800/40 text-[11px]">
            <CalendarDays className="h-4 w-4 text-indigo-500 shrink-0" />
            <p className="text-slate-600 dark:text-slate-400 font-semibold leading-normal">
              Productivity peak occurred on <span className="font-bold text-slate-800 dark:text-white">Thursday</span>. A total of <span className="font-bold text-slate-800 dark:text-white">28 tasks</span> have been completed within this current weekly iteration.
            </p>
          </div>
        </div>
      </div>

      {/* Projects Completion & Team Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Team Leaderboard Performance */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-4 rounded-lg shadow-sm lg:col-span-5 flex flex-col">
          <h2 className="font-display font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
            Team Performance Rank
          </h2>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
            {teamStats.map((member, index) => {
              const score = member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0;
              return (
                <div key={member.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-3">
                        {index + 1}
                      </span>
                      <div className="h-6 w-6 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[9px] font-bold shrink-0">
                        {member.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-800 dark:text-slate-200 font-bold truncate text-[11px] leading-tight">
                          {member.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-normal truncate leading-tight mt-0.5">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-800 dark:text-slate-200 text-[11px] font-bold">
                        {member.completed} <span className="text-[9px] text-slate-400 font-normal">/ {member.total} tasks</span>
                      </span>
                    </div>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(member.total > 0 ? score : 0, 8))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Lists and Completeness */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-4 rounded-lg shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <h2 className="font-display font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              My Active Projects Progress
            </h2>
            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {projects.filter(p => p.status === 'Active').length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active projects available.
                </div>
              ) : (
                projects.filter(p => p.status === 'Active').map(p => {
                  const projTasks = tasks.filter(t => t.projectId === p.id);
                  const completedProjTasks = projTasks.filter(t => t.status === 'Completed').length;
                  const ratio = projTasks.length > 0 ? Math.round((completedProjTasks / projTasks.length) * 100) : 0;
                  
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p.id);
                        onViewChange('kanban');
                      }}
                      className="group p-2 border border-slate-100 dark:border-slate-800/30 hover:border-indigo-500/20 rounded hover:bg-slate-50/50 dark:hover:bg-indigo-950/10 cursor-pointer transition-all duration-150"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <div className="min-w-0">
                          <p className="text-slate-800 dark:text-slate-200 font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-[11px] leading-none">
                            {p.name}
                          </p>
                          <span className={`inline-block text-[8px] font-bold px-1.5 py-0.2 rounded mt-1 uppercase tracking-wider ${
                            p.priority === 'Critical' 
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                              : p.priority === 'High'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                              : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20'
                          }`}>
                            {p.priority} Priority
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-slate-800 dark:text-slate-200 text-[11px] font-bold">{ratio}%</span>
                          <p className="text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                            {completedProjTasks} / {projTasks.length} Done
                          </p>
                        </div>
                      </div>
                      
                      {/* Micro Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${ratio}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onViewChange('projects')}
            className="w-full mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150 cursor-pointer border border-slate-100 dark:border-slate-800/40"
          >
            <span>Manage All Projects</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Recent Activities Feed */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
          <h2 className="font-display font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Recent Activities
          </h2>
          <button
            onClick={() => onViewChange('logs')}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
          >
            View all history
          </button>
        </div>
        <div className="space-y-3">
          {logs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex gap-2 text-[11px] items-start">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {log.userName}
                </span>{' '}
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {log.action}
                </span>
                {log.projectName && (
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 ml-1">
                    in project "{log.projectName}"
                  </span>
                )}
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">
              No recorded logs in workspace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
