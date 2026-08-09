/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Task, Project } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
}

export default function CalendarView({ tasks, projects, onEditTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(() => new Date());
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in month logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Create calendars days grid array
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Group tasks by date string (YYYY-MM-DD)
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      }
    });
    return map;
  }, [tasks]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
      {/* Calendar Header Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-900/60">
        <div>
          <h1 className="font-display font-bold text-base tracking-tight text-slate-800 dark:text-white">
            Workspace Calendar
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Monitor delivery dates, project milestones, and upcoming sprint deadlines.
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded shadow-xs self-start">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-display font-bold text-[11px] text-slate-800 dark:text-slate-100 min-w-[100px] text-center uppercase tracking-wider">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid of the Month */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-xs">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 text-center py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Cells Grid */}
        <div className="grid grid-cols-7 grid-rows-5 divide-x divide-y divide-slate-100 dark:divide-slate-800/40 border-t-0 bg-transparent">
          {calendarCells.map((day, idx) => {
            const dateStr = day 
              ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : '';
            const dayTasks = dateStr ? tasksByDate[dateStr] || [] : [];
            const isToday = day !== null && 
              day === new Date().getDate() && 
              currentMonth === new Date().getMonth() && 
              currentYear === new Date().getFullYear();

            return (
              <div 
                key={idx} 
                className={`min-h-[85px] p-1.5 flex flex-col justify-between group transition-colors hover:bg-slate-50/30 dark:hover:bg-slate-900/10 ${
                  day === null ? 'bg-slate-50/10 dark:bg-slate-950/5 pointer-events-none' : ''
                } ${isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
              >
                {/* Day Digit Badge */}
                <div className="flex justify-between items-center mb-0.5">
                  {day && (
                    <span className={`text-[10px] font-bold font-display h-5 w-5 flex items-center justify-center rounded ${
                      isToday 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {day}
                    </span>
                  )}
                </div>

                {/* Task badges */}
                <div className="flex-1 space-y-0.5 overflow-y-auto no-scrollbar max-h-[60px]">
                  {dayTasks.map(task => {
                    const isCompleted = task.status === 'Completed';
                    const isCritical = task.priority === 'Critical';
                    
                    return (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`text-[9px] font-semibold p-0.5 px-1 rounded border truncate cursor-pointer transition-colors ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/20 line-through'
                            : isCritical
                            ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/20'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/10 dark:text-indigo-400 dark:border-indigo-900/20'
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
