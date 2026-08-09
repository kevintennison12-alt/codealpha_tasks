/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Plus, MoreHorizontal, Calendar, Trash2, Edit2, Copy, Paperclip, MessageSquare, 
  CheckSquare, ArrowRight, User, AlertCircle, X, Check, Eye, Trash, Download, Clock
} from 'lucide-react';
import { 
  Project, Board, Task, Subtask, Comment, Attachment, User as UserType, TaskPriority, TaskStatus 
} from '../types';
import { api } from '../utils/api';

interface KanbanViewProps {
  project: Project | null;
  boards: Board[];
  tasks: Task[];
  users: UserType[];
  currentUser: UserType | null;
  onAddBoard: (projectId: string, name: string) => Promise<void>;
  onUpdateBoard: (boardId: string, name: string) => Promise<void>;
  onDeleteBoard: (boardId: string) => Promise<void>;
  onAddTask: (taskData: Partial<Task>) => Promise<void>;
  onUpdateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onMoveTask: (taskId: string, destBoardId: string, order?: number) => Promise<void>;
  onRefreshTasks: () => void;
}

export default function KanbanView({
  project,
  boards,
  tasks,
  users,
  currentUser,
  onAddBoard,
  onUpdateBoard,
  onDeleteBoard,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onRefreshTasks
}: KanbanViewProps) {
  const [showAddBoardInput, setShowAddBoardInput] = React.useState(false);
  const [newBoardName, setNewBoardName] = React.useState('');
  
  // Board editing
  const [editingBoardId, setEditingBoardId] = React.useState<string | null>(null);
  const [editingBoardName, setEditingBoardName] = React.useState('');

  // Quick Task Adding
  const [addingTaskToBoardId, setAddingTaskToBoardId] = React.useState<string | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = React.useState('');

  // Active Task Modal Details
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [taskSubtasks, setTaskSubtasks] = React.useState<Subtask[]>([]);
  const [taskComments, setTaskComments] = React.useState<Comment[]>([]);
  const [taskAttachments, setTaskAttachments] = React.useState<Attachment[]>([]);
  
  // Modal interaction fields
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [newCommentText, setNewCommentText] = React.useState('');
  const [replyToCommentId, setReplyToCommentId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');
  
  // Task Editing fields (inside modal)
  const [editTaskTitle, setEditTaskTitle] = React.useState('');
  const [editTaskDesc, setEditTaskDesc] = React.useState('');
  const [editTaskPriority, setEditTaskPriority] = React.useState<TaskPriority>('Medium');
  const [editTaskDueDate, setEditTaskDueDate] = React.useState('');
  const [editTaskAssignee, setEditTaskAssignee] = React.useState('');
  const [editTaskLabel, setEditTaskLabel] = React.useState('');
  const [editTaskLabels, setEditTaskLabels] = React.useState<string[]>([]);
  
  // Drag and Drop active indicators
  const [draggedOverBoardId, setDraggedOverBoardId] = React.useState<string | null>(null);

  // Load Task details when a task is opened
  const handleOpenTaskModal = async (task: Task) => {
    setSelectedTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description);
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(task.dueDate || '');
    setEditTaskAssignee(task.assignedUserId || '');
    setEditTaskLabels(task.labels || []);
    setEditTaskLabel('');
    setReplyToCommentId(null);
    setReplyText('');

    try {
      // Fetch details from backend parallelized
      const [subs, comms, atts] = await Promise.all([
        api.subtasks.getByTask(task.id),
        api.comments.getByTask(task.id),
        api.attachments.getByProject(task.projectId)
      ]);
      setTaskSubtasks(subs);
      setTaskComments(comms);
      // Filter attachments specifically for this task
      setTaskAttachments(atts.filter(a => a.taskId === task.id));
    } catch (err) {
      console.error('Failed to load task details:', err);
    }
  };

  // HTML5 Drag and Drop event handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, boardId: string) => {
    e.preventDefault();
    if (draggedOverBoardId !== boardId) {
      setDraggedOverBoardId(boardId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverBoardId(null);
  };

  const handleDrop = async (e: React.DragEvent, destBoardId: string) => {
    e.preventDefault();
    setDraggedOverBoardId(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    try {
      await onMoveTask(taskId, destBoardId);
    } catch (err) {
      alert('Failed to move task');
    }
  };

  // Task Detail form submit
  const handleSaveTaskDetails = async () => {
    if (!selectedTask || !editTaskTitle.trim()) return;

    const updatedData: Partial<Task> = {
      title: editTaskTitle,
      description: editTaskDesc,
      priority: editTaskPriority,
      dueDate: editTaskDueDate || undefined,
      assignedUserId: editTaskAssignee || undefined,
      labels: editTaskLabels
    };

    try {
      await onUpdateTask(selectedTask.id, updatedData);
      // Update selectedTask locally
      setSelectedTask(prev => prev ? { ...prev, ...updatedData } as Task : null);
      onRefreshTasks();
    } catch (err) {
      alert('Failed to update task details');
    }
  };

  const handleAddLabel = () => {
    if (!editTaskLabel.trim()) return;
    if (!editTaskLabels.includes(editTaskLabel.trim())) {
      const nextLabels = [...editTaskLabels, editTaskLabel.trim()];
      setEditTaskLabels(nextLabels);
      setEditTaskLabel('');
      // Save instantly
      if (selectedTask) {
        onUpdateTask(selectedTask.id, { labels: nextLabels }).then(() => onRefreshTasks());
      }
    }
  };

  const handleRemoveLabel = (label: string) => {
    const nextLabels = editTaskLabels.filter(l => l !== label);
    setEditTaskLabels(nextLabels);
    if (selectedTask) {
      onUpdateTask(selectedTask.id, { labels: nextLabels }).then(() => onRefreshTasks());
    }
  };

  // Boards actions
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newBoardName.trim()) return;

    try {
      await onAddBoard(project.id, newBoardName.trim());
      setNewBoardName('');
      setShowAddBoardInput(false);
    } catch (err) {
      alert('Failed to create board');
    }
  };

  const handleStartEditBoard = (board: Board) => {
    setEditingBoardId(board.id);
    setEditingBoardName(board.name);
  };

  const handleSaveBoardName = async (boardId: string) => {
    if (!editingBoardName.trim()) return;
    try {
      await onUpdateBoard(boardId, editingBoardName.trim());
      setEditingBoardId(null);
    } catch (err) {
      alert('Failed to update board');
    }
  };

  const handleDeleteBoardClick = async (boardId: string) => {
    if (confirm('Are you sure you want to delete this list and all tasks inside?')) {
      try {
        await onDeleteBoard(boardId);
      } catch (err) {
        alert('Failed to delete board');
      }
    }
  };

  // Quick task actions
  const handleQuickAddTask = async (boardId: string) => {
    if (!project || !quickTaskTitle.trim()) return;

    try {
      await onAddTask({
        projectId: project.id,
        boardId,
        title: quickTaskTitle.trim(),
        status: 'Todo'
      });
      setQuickTaskTitle('');
      setAddingTaskToBoardId(null);
    } catch (err) {
      alert('Failed to create task');
    }
  };

  // Checklist subtask handlers
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubtaskTitle.trim()) return;

    try {
      const added = await api.subtasks.create(selectedTask.id, newSubtaskTitle.trim());
      setTaskSubtasks(prev => [...prev, added]);
      setNewSubtaskTitle('');
      onRefreshTasks();
    } catch (err) {
      alert('Failed to add checklist item');
    }
  };

  const handleToggleSubtask = async (sub: Subtask) => {
    try {
      const updated = await api.subtasks.update(sub.id, !sub.completed);
      setTaskSubtasks(prev => prev.map(s => s.id === sub.id ? updated : s));
      onRefreshTasks();
    } catch (err) {
      alert('Failed to update check status');
    }
  };

  const handleDeleteSubtask = async (subId: string) => {
    try {
      await api.subtasks.delete(subId);
      setTaskSubtasks(prev => prev.filter(s => s.id !== subId));
      onRefreshTasks();
    } catch (err) {
      alert('Failed to delete checklist item');
    }
  };

  // Comments handlers
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentText.trim()) return;

    try {
      const added = await api.comments.create(selectedTask.id, newCommentText.trim());
      setTaskComments(prev => [...prev, added]);
      setNewCommentText('');
      onRefreshTasks();
    } catch (err) {
      alert('Failed to post comment');
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!selectedTask || !replyText.trim()) return;

    try {
      const added = await api.comments.create(selectedTask.id, replyText.trim(), commentId);
      setTaskComments(prev => [...prev, added]);
      setReplyToCommentId(null);
      setReplyText('');
      onRefreshTasks();
    } catch (err) {
      alert('Failed to reply to comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.comments.delete(commentId);
      setTaskComments(prev => prev.filter(c => c.id !== commentId));
      onRefreshTasks();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  // Attachment upload handler
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTask || !project || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      const added = await api.attachments.upload(selectedTask.id, project.id, file);
      setTaskAttachments(prev => [...prev, added]);
      onRefreshTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'File upload failed');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await api.attachments.delete(attachmentId);
      setTaskAttachments(prev => prev.filter(a => a.id !== attachmentId));
      onRefreshTasks();
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  // Duplicate task button
  const handleDuplicateTask = async () => {
    if (!selectedTask) return;
    try {
      await api.tasks.duplicate(selectedTask.id);
      onRefreshTasks();
      setSelectedTask(null);
    } catch (err) {
      alert('Failed to duplicate task');
    }
  };

  // Delete task button (from modal)
  const handleDeleteTaskClick = async () => {
    if (selectedTask && confirm('Are you sure you want to delete this task card?')) {
      try {
        await onDeleteTask(selectedTask.id);
        setSelectedTask(null);
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#0b0f19]">
        <AlertCircle className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
          Select or create a project to display the Kanban board.
        </p>
      </div>
    );
  }

  const isProjectManager = project.managerId === currentUser?.id;
  const canManageBoards = currentUser?.role === 'Admin' || isProjectManager;
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0b0f19] overflow-hidden">
      {/* Board Header Details */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800/80 px-4 py-2.5 shrink-0 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 truncate leading-none">
              {project.name}
            </h1>
            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded mt-0.5 uppercase tracking-wider ${
              project.priority === 'Critical' 
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                : project.priority === 'High'
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20'
            }`}>
              {project.priority}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {project.description || 'No description provided.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex -space-x-1 overflow-hidden items-center mr-1">
            {project.members.map((mId) => {
              const u = users.find(user => user.id === mId);
              return (
                <div 
                  key={mId} 
                  className="h-5.5 w-5.5 rounded bg-indigo-50 dark:bg-indigo-950 border border-white dark:border-[#111827] flex items-center justify-center text-[8px] font-bold text-indigo-700 dark:text-indigo-300"
                  title={u?.name}
                >
                  {u?.avatar || '??'}
                </div>
              );
            })}
          </div>
          
          {canManageBoards && (
            <button
              onClick={() => setShowAddBoardInput(!showAddBoardInput)}
              className="flex items-center gap-1 py-1 px-2 rounded border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
            >
              <Plus className="h-3 w-3 text-indigo-500" />
              <span>Add List</span>
            </button>
          )}
        </div>
      </div>

      {/* Board Scroll Container */}
      <div className="flex-1 overflow-x-auto p-3 flex gap-3 items-start select-none">
        {/* Kanban Columns */}
        {boards.map((board) => {
          const boardTasks = tasks.filter(t => t.boardId === board.id).sort((a, b) => a.order - b.order);
          const isQuickAdding = addingTaskToBoardId === board.id;
          const isDraggedOver = draggedOverBoardId === board.id;
          const isEditingBoard = editingBoardId === board.id;

          return (
            <div
              key={board.id}
              onDragOver={(e) => handleDragOver(e, board.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, board.id)}
              className={`w-64 shrink-0 bg-[#f1f5f9]/70 dark:bg-[#111827]/40 border rounded p-2.5 flex flex-col max-h-full transition-all ${
                isDraggedOver 
                  ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/10 dark:bg-indigo-950/10' 
                  : 'border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              {/* Board Title Header */}
              <div className="flex items-center justify-between pb-2 shrink-0">
                {isEditingBoard ? (
                  <div className="flex items-center gap-1 flex-1 mr-1.5">
                    <input
                      type="text"
                      value={editingBoardName}
                      onChange={(e) => setEditingBoardName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveBoardName(board.id)}
                      autoFocus
                      className="w-full px-1.5 py-0.5 border border-slate-300 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <button
                      onClick={() => handleSaveBoardName(board.id)}
                      className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <h3 
                      onClick={() => canManageBoards && handleStartEditBoard(board)}
                      className="font-display font-bold text-[11px] text-slate-800 dark:text-slate-200 tracking-wider uppercase truncate cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      {board.name}
                    </h3>
                    <span className="text-[9px] bg-slate-200 dark:bg-[#111827] text-slate-600 dark:text-slate-400 font-bold h-4 px-1 rounded flex items-center justify-center shrink-0">
                      {boardTasks.length}
                    </span>
                  </div>
                )}

                {canManageBoards && !isEditingBoard && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleStartEditBoard(board)}
                      className="h-5 w-5 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Rename list"
                    >
                      <Edit2 className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBoardClick(board.id)}
                      className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 cursor-pointer"
                      title="Delete list"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 py-0.5 min-h-[80px] no-scrollbar">
                {boardTasks.map((task) => {
                  const assignedUser = users.find(u => u.id === task.assignedUserId);
                  const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'Completed';
                  
                  return (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => handleOpenTaskModal(task)}
                      className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 rounded p-2.5 shadow-sm hover:shadow cursor-grab active:cursor-grabbing transition-all relative group"
                    >
                      {/* Priority tag & indicators */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[8px] font-bold px-1 rounded uppercase tracking-wider ${
                          task.priority === 'Critical'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                            : task.priority === 'High'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                            : task.priority === 'Medium'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20'
                            : 'bg-slate-50 text-slate-600 dark:bg-slate-950/20'
                        }`}>
                          {task.priority}
                        </span>
                        
                        {isOverdue && (
                          <span className="flex items-center gap-0.5 text-[8px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-1 py-0.2 rounded">
                            <Clock className="h-2.5 w-2.5" />
                            <span>Overdue</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                        {task.title}
                      </h4>

                      {/* Description */}
                      {task.description && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 font-normal leading-normal">
                          {task.description}
                        </p>
                      )}

                      {/* Labels */}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {task.labels.slice(0, 3).map(l => (
                            <span key={l} className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold px-1 py-0.2 rounded">
                              {l}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar (if checklists exist) */}
                      {task.progressBar > 0 && (
                        <div className="space-y-0.5 mt-2">
                          <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Checklist Progress</span>
                            <span>{task.progressBar}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${task.progressBar}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Footer: User & count metrics */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-1.5 mt-2">
                        <div className="flex items-center gap-1.5">
                          {assignedUser ? (
                            <div className="h-5 w-5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 rounded text-[8px] font-bold flex items-center justify-center shrink-0" title={assignedUser.name}>
                              {assignedUser.avatar}
                            </div>
                          ) : (
                            <div className="h-5 w-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-400 flex items-center justify-center shrink-0" title="Unassigned">
                              <User className="h-2.5 w-2.5" />
                            </div>
                          )}

                          {task.dueDate && (
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                              {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>

                        {/* Visual Indicators Counts */}
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                          {/* Attachments */}
                          <div className="flex items-center gap-0.5">
                            <Paperclip className="h-2.5 w-2.5 text-slate-400" />
                          </div>
                          {/* Comments */}
                          <div className="flex items-center gap-0.5">
                            <MessageSquare className="h-2.5 w-2.5 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {boardTasks.length === 0 && !isQuickAdding && (
                  <div className="py-4 border border-dashed border-slate-200 dark:border-slate-800 rounded text-center">
                    <p className="text-[9px] text-slate-400 dark:text-slate-600 font-semibold uppercase tracking-wider">
                      Empty Lane
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Task Adding area */}
              <div className="pt-2 shrink-0">
                {isQuickAdding ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Enter task title..."
                      value={quickTaskTitle}
                      onChange={(e) => setQuickTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTask(board.id)}
                      autoFocus
                      className="w-full text-xs font-semibold px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 dark:text-white focus:outline-none"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuickAddTask(board.id)}
                        className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded cursor-pointer"
                      >
                        Add Card
                      </button>
                      <button
                        onClick={() => setAddingTaskToBoardId(null)}
                        className="p-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500 rounded cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingTaskToBoardId(board.id);
                      setQuickTaskTitle('');
                    }}
                    className="w-full flex items-center justify-center gap-1 py-1 hover:bg-slate-200/50 dark:hover:bg-[#1e293b]/40 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Create Card</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Board Creation Input Lane */}
        {showAddBoardInput && (
          <form 
            onSubmit={handleCreateBoard}
            className="w-64 shrink-0 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 rounded shadow-lg space-y-2.5"
          >
            <h4 className="font-display font-bold text-[10px] text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Create New List
            </h4>
            <input
              type="text"
              required
              placeholder="e.g. Testing, Backlog..."
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded dark:text-white focus:outline-none"
              autoFocus
            />
            <div className="flex items-center gap-1.5">
              <button
                type="submit"
                className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowAddBoardInput(false)}
                className="px-2 py-1 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-[10px] font-bold rounded cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Elegant Task Details Popup Modal */}
      {selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs z-50 p-2">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded w-full max-w-3xl p-4 shadow-xl flex flex-col md:flex-row gap-4 max-h-[92vh] overflow-y-auto scrollbar-thin">
            {/* Modal Left Column: Primary details, subtasks checklist, attachments & comments */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-2 justify-between">
                <div className="flex-1">
                  {/* Task Board Indicator */}
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">
                    Task in list: {boards.find(b => b.id === selectedTask.boardId)?.name || 'Loading'}
                  </span>
                  
                  {/* Edit Task Title */}
                  <input
                    type="text"
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                    onBlur={handleSaveTaskDetails}
                    className="w-full font-display font-bold text-sm text-slate-800 dark:text-slate-100 border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-indigo-500 focus:outline-none pb-0.5 bg-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Description
                </label>
                <textarea
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                  onBlur={handleSaveTaskDetails}
                  placeholder="Outline task deliverables, reference links, and key instructions..."
                  rows={3}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-900 focus:outline-none dark:text-slate-100 leading-normal"
                />
              </div>

              {/* Subtask Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-1.5">
                  <div className="flex items-center gap-1">
                    <CheckSquare className="h-4 w-4 text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Subtasks Checklist
                    </span>
                  </div>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold px-1.5 py-0.2 rounded">
                    {taskSubtasks.filter(s => s.completed).length} / {taskSubtasks.length} Done
                  </span>
                </div>

                {/* Checklist progress bar */}
                {taskSubtasks.length > 0 && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded overflow-hidden">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-400 h-full rounded transition-all duration-300"
                      style={{ width: `${Math.round((taskSubtasks.filter(s => s.completed).length / taskSubtasks.length) * 100)}%` }}
                    ></div>
                  </div>
                )}

                {/* Subtasks Items Grid */}
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {taskSubtasks.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-1 px-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/30 rounded group">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={sub.completed}
                          onChange={() => handleToggleSubtask(sub)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                        />
                        <span className={`text-xs font-semibold transition-colors ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {sub.title}
                        </span>
                      </label>
                      <button
                        onClick={() => handleDeleteSubtask(sub.id)}
                        className="h-5.5 w-5.5 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {taskSubtasks.length === 0 && (
                    <p className="text-[9px] text-slate-400 font-medium italic">
                      No subtasks added yet.
                    </p>
                  )}
                </div>

                {/* Add Subtask Form */}
                <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Add a checklist item..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 text-xs font-semibold px-2 py-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded focus:outline-none dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* File Sharing & Attachments */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800/40 pb-1.5">
                  <Paperclip className="h-4 w-4 text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Uploaded File Attachments
                  </span>
                </div>

                {/* Files Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                  {taskAttachments.map((att) => (
                    <div key={att.id} className="p-1.5 border border-slate-200 dark:border-slate-800 rounded flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/30">
                      <div className="h-7 w-7 rounded bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[9px] font-bold shrink-0">
                        {att.fileName.split('.').pop()?.toUpperCase() || 'FILE'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate leading-none">
                          {att.fileName}
                        </p>
                        <p className="text-[8px] text-slate-400 font-medium mt-0.5">
                          {Math.round(att.fileSize / 1024)} KB · {att.uploadedByName}
                        </p>
                      </div>
                      <div className="flex items-center shrink-0">
                        <a
                          href={att.filePath}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="h-5 w-5 flex items-center justify-center rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                        >
                          <Download className="h-3 w-3" />
                        </a>
                        <button
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-50 text-red-500 cursor-pointer"
                        >
                          <Trash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {taskAttachments.length === 0 && (
                    <p className="text-[9px] text-slate-400 font-medium italic sm:col-span-2">
                      No attachments shared.
                    </p>
                  )}
                </div>

                {/* Drag and Drop File Upload Area */}
                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded p-2 text-center hover:border-indigo-500/40 transition-colors relative cursor-pointer group bg-slate-50/20 dark:bg-slate-900/20">
                  <input
                    type="file"
                    onChange={handleAttachmentUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Paperclip className="h-4.5 w-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-none">
                    Drag and drop file or click to upload
                  </p>
                </div>
              </div>

              {/* Comments Feed & Mentions */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/40 pb-1.5">
                  <MessageSquare className="h-4 w-4 text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Comments & Mentions Feed
                  </span>
                </div>

                {/* Comments List */}
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {taskComments.filter(c => !c.parentId).map((comm) => {
                    const replies = taskComments.filter(r => r.parentId === comm.id);
                    return (
                      <div key={comm.id} className="space-y-1">
                        {/* Parent Comment */}
                        <div className="p-2 bg-slate-50/60 dark:bg-[#111827] rounded border border-slate-100 dark:border-slate-800/80 flex gap-2 text-[11px]">
                          <div className="h-6 w-6 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold rounded flex items-center justify-center shrink-0">
                            {comm.userAvatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {comm.userName}
                              </span>
                              <span className="text-[8px] text-slate-400">
                                {new Date(comm.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-normal break-words">
                              {comm.text}
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setReplyToCommentId(comm.id);
                                  setReplyText('');
                                }}
                                className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 cursor-pointer"
                              >
                                Reply
                              </button>
                              {(comm.userId === currentUser?.id || currentUser?.role === 'Admin') && (
                                <button
                                  onClick={() => handleDeleteComment(comm.id)}
                                  className="text-[9px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Nested Replies */}
                        {replies.map(rep => (
                          <div key={rep.id} className="ml-6 p-2 bg-slate-50/30 dark:bg-slate-900/20 rounded border border-slate-100 dark:border-slate-850 flex gap-2 text-[11px]">
                            <div className="h-5.5 w-5.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-500 dark:text-indigo-400 font-bold rounded flex items-center justify-center shrink-0">
                              {rep.userAvatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {rep.userName}
                                </span>
                                <span className="text-[8px] text-slate-400">
                                  {new Date(rep.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 leading-normal break-words">
                                {rep.text}
                              </p>
                              {(rep.userId === currentUser?.id || currentUser?.role === 'Admin') && (
                                <button
                                  onClick={() => handleDeleteComment(rep.id)}
                                  className="text-[9px] font-bold text-red-500 hover:text-red-700 mt-0.5 cursor-pointer"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Active Reply box */}
                        {replyToCommentId === comm.id && (
                          <div className="ml-6 flex items-center gap-1.5 mt-1">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1 text-[11px] px-2 py-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded outline-none"
                            />
                            <button
                              onClick={() => handleAddReply(comm.id)}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-bold cursor-pointer shrink-0"
                            >
                              Post
                            </button>
                            <button
                              onClick={() => setReplyToCommentId(null)}
                              className="px-1.5 py-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500 rounded text-[9px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {taskComments.length === 0 && (
                    <p className="text-[9px] text-slate-400 font-medium italic">
                      No comments yet.
                    </p>
                  )}
                </div>

                {/* Post New Comment Box */}
                <form onSubmit={handleAddComment} className="flex items-start gap-2 pt-1">
                  <div className="h-6 w-6 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold rounded flex items-center justify-center shrink-0">
                    {currentUser?.avatar}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="Add comment..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded focus:outline-none dark:text-white"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Right Column: Controls, priority settings, labels & metadata attributes */}
            <div className="w-full md:w-52 space-y-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/60 pt-3 md:pt-0 md:pl-4 font-semibold text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1">
                <span className="font-display font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Task Settings
                </span>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="h-5 w-5 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="uppercase tracking-wider text-[9px] text-slate-400">
                  Priority Level
                </label>
                <select
                  value={editTaskPriority}
                  onChange={(e) => {
                    setEditTaskPriority(e.target.value as TaskPriority);
                    onUpdateTask(selectedTask.id, { priority: e.target.value as TaskPriority }).then(() => onRefreshTasks());
                  }}
                  className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded text-xs focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Assignee */}
              <div className="space-y-1">
                <label className="uppercase tracking-wider text-[9px] text-slate-400">
                  Assigned Member
                </label>
                <select
                  value={editTaskAssignee}
                  onChange={(e) => {
                    setEditTaskAssignee(e.target.value);
                    onUpdateTask(selectedTask.id, { assignedUserId: e.target.value || undefined }).then(() => onRefreshTasks());
                  }}
                  className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded text-xs focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {project.members.map((mId) => {
                    const u = users.find(user => user.id === mId);
                    return (
                      <option key={mId} value={mId}>
                        {u ? u.name : 'Unknown User'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="uppercase tracking-wider text-[9px] text-slate-400">
                  Due Deadline
                </label>
                <input
                  type="date"
                  value={editTaskDueDate}
                  onChange={(e) => {
                    setEditTaskDueDate(e.target.value);
                    onUpdateTask(selectedTask.id, { dueDate: e.target.value || undefined }).then(() => onRefreshTasks());
                  }}
                  className="w-full px-2 py-1.2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded text-xs focus:outline-none"
                />
              </div>

              {/* Labels & Tags */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-[9px] text-slate-400 block">
                  Labels & Tags
                </label>
                
                {/* Visual Label indicators */}
                <div className="flex flex-wrap gap-1 mb-1">
                  {editTaskLabels.map(l => (
                    <span 
                      key={l} 
                      className="text-[8px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 rounded flex items-center gap-1"
                    >
                      <span>{l}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveLabel(l)}
                        className="hover:text-indigo-950 dark:hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {editTaskLabels.length === 0 && (
                    <span className="text-[9px] text-slate-400 italic">No tags.</span>
                  )}
                </div>

                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={editTaskLabel}
                    onChange={(e) => setEditTaskLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                    className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddLabel}
                    className="px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 cursor-pointer text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions Button lists */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3 mt-1">
                <span className="uppercase tracking-wider text-[9px] text-slate-400 block">
                  Actions
                </span>
                
                <button
                  type="button"
                  onClick={handleDuplicateTask}
                  className="w-full flex items-center gap-1.5 px-2.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded text-left cursor-pointer transition-colors"
                >
                  <Copy className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Duplicate Card</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteTaskClick}
                  className="w-full flex items-center gap-1.5 px-2.5 py-2 border border-red-200 dark:border-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/10 text-red-500 hover:text-red-600 rounded text-left cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Delete Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
