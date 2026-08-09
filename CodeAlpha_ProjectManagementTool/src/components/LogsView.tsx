/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History, Search, Filter, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ActivityLog } from '../types';

interface LogsViewProps {
  logs: ActivityLog[];
}

export default function LogsView({ logs }: LogsViewProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredLogs = logs.filter(log => {
    const term = searchQuery.toLowerCase();
    return (
      log.userName.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      (log.projectName && log.projectName.toLowerCase().includes(term)) ||
      (log.taskTitle && log.taskTitle.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
            Workspace Activity Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            System audit trail recording project actions, task moves, logins, and comments.
          </p>
        </div>

        {/* Filter / Search logs input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity trails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs placeholder-slate-400 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Logs Table / Timeline Card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
        <div className="relative border-l border-slate-100 dark:border-slate-850 pl-6 space-y-6">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative group text-xs">
              {/* Timeline Bullet Anchor */}
              <div className="absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white dark:bg-[#111827] border-2 border-indigo-500 group-hover:scale-110 transition-transform">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
              </div>

              {/* Log text card content */}
              <div className="p-3 border border-slate-100 dark:border-slate-800/40 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {log.userName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {log.action}
                </p>

                {log.projectName && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-block bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      Project: {log.projectName}
                    </span>
                    {log.taskTitle && (
                      <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">
                        Task: {log.taskTitle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 pl-0">
              No recorded logs found matching "{searchQuery}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
