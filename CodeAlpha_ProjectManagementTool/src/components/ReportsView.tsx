/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart3, FileText, Download, Printer, Percent, ClipboardCheck, Clock, Users, FolderGit2
} from 'lucide-react';
import { Project, Task, User } from '../types';
import { api } from '../utils/api';

interface ReportsViewProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
}

export default function ReportsView({ projects, tasks, users }: ReportsViewProps) {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(projects[0]?.id || '');
  const [reportData, setReportData] = React.useState<{
    projectName: string;
    stats: { total: number; todo: number; inProgress: number; review: number; testing: number; completed: number };
    productivity: { name: string; completed: number; total: number }[];
  } | null>(null);

  const [loading, setLoading] = React.useState(false);

  const loadReport = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const data = await api.reports.getProjectStats(selectedProjectId);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load project report:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadReport();
  }, [selectedProjectId, tasks]);

  // Download CSV helper
  const handleExportCSV = () => {
    if (!reportData) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Project Report,${reportData.projectName}\n`;
    csvContent += `Generated At,${new Date().toLocaleDateString()}\n\n`;

    // Task stats table
    csvContent += "Task Status,Count,Percentage\n";
    const total = reportData.stats.total || 1;
    csvContent += `To Do,${reportData.stats.todo},${Math.round((reportData.stats.todo / total) * 100)}%\n`;
    csvContent += `In Progress,${reportData.stats.inProgress},${Math.round((reportData.stats.inProgress / total) * 100)}%\n`;
    csvContent += `Review,${reportData.stats.review},${Math.round((reportData.stats.review / total) * 100)}%\n`;
    csvContent += `Testing,${reportData.stats.testing},${Math.round((reportData.stats.testing / total) * 100)}%\n`;
    csvContent += `Completed,${reportData.stats.completed},${Math.round((reportData.stats.completed / total) * 100)}%\n`;
    csvContent += `Total,${reportData.stats.total},100%\n\n`;

    // Productivity Table
    csvContent += "Team Member,Completed Tasks,Total Assigned Tasks,Velocity Score\n";
    reportData.productivity.forEach(p => {
      const score = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
      csvContent += `"${p.name}",${p.completed},${p.total},${score}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportData.projectName.replace(/\s+/g, '_')}_Progress_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print window (which can save as PDF)
  const handlePrintReport = () => {
    window.print();
  };

  if (projects.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <BarChart3 className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
        <p className="text-slate-500 text-sm font-semibold">
          Create a project to unlock the Reports generation suite.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 print:bg-white print:p-0 print:m-0">
      {/* Header (Hidden during printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
            Analytical Reports Generator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Review delivery statistics, calculate productivity matrices, and export formatted worksheets.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm self-start">
          <FolderGit2 className="h-4 w-4 text-indigo-500" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="text-slate-800 dark:text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {reportData && (
        <div className="space-y-6">
          {/* Controls toolbar (Hidden during printing) */}
          <div className="flex items-center justify-end gap-3 print:hidden">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors shadow-sm"
            >
              <Download className="h-4 w-4 text-indigo-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors shadow-sm"
            >
              <Printer className="h-4 w-4 text-indigo-500" />
              <span>Print Report / PDF</span>
            </button>
          </div>

          {/* Primary Report Sheet Container */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6.5 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Header branding info */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/60 pb-5">
              <div>
                <h2 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">
                  Project Completion progress sheet
                </h2>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                  Project: {reportData.projectName}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Analytical Audit · Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="text-right">
                <span className="font-display font-bold text-3xl text-indigo-600 dark:text-indigo-400 block">
                  {reportData.stats.total > 0 
                    ? Math.round((reportData.stats.completed / reportData.stats.total) * 100) 
                    : 0}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Completion Rate
                </span>
              </div>
            </div>

            {/* Quick Metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10">
                <ClipboardCheck className="h-4.5 w-4.5 text-indigo-500 mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Tasks
                </span>
                <span className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">
                  {reportData.stats.total}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10">
                <Percent className="h-4.5 w-4.5 text-emerald-500 mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Completed Tasks
                </span>
                <span className="font-display font-bold text-xl text-emerald-600 dark:text-emerald-400">
                  {reportData.stats.completed}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10">
                <Clock className="h-4.5 w-4.5 text-amber-500 mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pending Tasks
                </span>
                <span className="font-display font-bold text-xl text-amber-600 dark:text-amber-400">
                  {reportData.stats.total - reportData.stats.completed}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10">
                <Users className="h-4.5 w-4.5 text-indigo-500 mb-2" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Team Members
                </span>
                <span className="font-display font-bold text-xl text-slate-800 dark:text-slate-100">
                  {reportData.productivity.length}
                </span>
              </div>
            </div>

            {/* Layout Split: Status distributions vs Productivity sheets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Task statuses breaksheet */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                  Distribution of Tasks Status
                </h3>
                
                <div className="space-y-3">
                  {[
                    { label: 'To Do', count: reportData.stats.todo, color: 'bg-slate-400' },
                    { label: 'In Progress', count: reportData.stats.inProgress, color: 'bg-indigo-500' },
                    { label: 'Review', count: reportData.stats.review, color: 'bg-amber-500' },
                    { label: 'Testing', count: reportData.stats.testing, color: 'bg-pink-500' },
                    { label: 'Completed', count: reportData.stats.completed, color: 'bg-emerald-500' }
                  ].map(item => {
                    const pct = reportData.stats.total > 0 ? Math.round((item.count / reportData.stats.total) * 100) : 0;
                    return (
                      <div key={item.label} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                          <span className="text-slate-800 dark:text-slate-200">{item.count} <span className="text-[10px] text-slate-400 font-medium">({pct}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team members velocities sheet */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                  Team Members Productivity matrix
                </h3>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {reportData.productivity.map(p => {
                    const score = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
                    return (
                      <div key={p.name} className="flex flex-col gap-1.5 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-700 dark:text-slate-300 font-bold">{p.name}</span>
                          <span className="text-slate-800 dark:text-slate-200">
                            {p.completed} / {p.total} completed <span className="text-emerald-600 dark:text-emerald-400">({score}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${p.total > 0 ? score : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
