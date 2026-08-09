/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Plus, Calendar, ShieldAlert, Edit3, Trash2, Archive, UserPlus, Eye, Users, FileText, FolderKanban
} from 'lucide-react';
import { Project, User, ProjectPriority, ProjectStatus } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  users: User[];
  currentUser: User | null;
  onSelectProject: (id: string) => void;
  onAddProject: (project: Partial<Project>) => Promise<void>;
  onUpdateProject: (id: string, project: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onViewChange: (view: string) => void;
}

export default function ProjectsView({
  projects,
  users,
  currentUser,
  onSelectProject,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onViewChange
}: ProjectsViewProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('All');

  // Form Fields
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [priority, setPriority] = React.useState<ProjectPriority>('Medium');
  const [status, setStatus] = React.useState<ProjectStatus>('Active');
  const [assignedMembers, setAssignedMembers] = React.useState<string[]>([]);

  // Initialize fields for add/edit
  React.useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description);
      setCoverImage(editingProject.coverImage || '');
      setStartDate(editingProject.startDate);
      setEndDate(editingProject.endDate);
      setPriority(editingProject.priority);
      setStatus(editingProject.status);
      setAssignedMembers(editingProject.members);
    } else {
      setName('');
      setDescription('');
      setCoverImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setPriority('Medium');
      setStatus('Active');
      setAssignedMembers(currentUser ? [currentUser.id] : []);
    }
  }, [editingProject, showAddModal, currentUser]);

  const canCreate = currentUser?.role === 'Admin' || currentUser?.role === 'Project Manager';

  // Filters application
  const filteredProjects = projects.filter(p => {
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || p.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const projectData: Partial<Project> = {
      name,
      description,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      startDate,
      endDate,
      priority,
      status,
      members: assignedMembers
    };

    try {
      if (editingProject) {
        await onUpdateProject(editingProject.id, projectData);
        setEditingProject(null);
      } else {
        await onAddProject(projectData);
        setShowAddModal(false);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setAssignedMembers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleDelete = async (projectId: string) => {
    if (confirm('Are you absolutely sure you want to delete this project? This will permanently delete all related boards, tasks, comments, and file attachments.')) {
      try {
        await onDeleteProject(projectId);
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  const handleArchive = async (project: Project) => {
    try {
      await onUpdateProject(project.id, { status: project.status === 'Archived' ? 'Active' : 'Archived' });
    } catch (err) {
      alert('Failed to archive project');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-900/60">
        <div>
          <h1 className="font-display font-bold text-base tracking-tight text-slate-800 dark:text-white">
            Workspace Projects
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Manage your project lifecycles, assign team boards, and track progress deadlines.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold shadow-xs cursor-pointer transition-colors shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Status:
          </span>
          <div className="flex bg-slate-50 dark:bg-slate-900 p-0.5 rounded border border-slate-100 dark:border-slate-800">
            {['All', 'Active', 'Completed', 'Archived'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  statusFilter === st 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Priority:
          </span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 rounded p-1 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Grid of Projects */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded text-center">
          <FolderKanban className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
            No projects found matching the current filter options.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((project) => {
            const isManager = project.managerId === currentUser?.id;
            const canManage = currentUser?.role === 'Admin' || isManager;
            const manager = users.find(u => u.id === project.managerId);
            
            return (
              <div 
                key={project.id}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between"
              >
                {/* Cover Image */}
                <div 
                  className="h-24 bg-slate-100 dark:bg-slate-900 bg-cover bg-center relative cursor-pointer group"
                  style={{ backgroundImage: `url(${project.coverImage})` }}
                  onClick={() => {
                    onSelectProject(project.id);
                    onViewChange('kanban');
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                  
                  {/* Status Overlay Tag */}
                  <span className={`absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.2 rounded text-white shadow-xs uppercase tracking-wider ${
                    project.status === 'Active' 
                      ? 'bg-emerald-600' 
                      : project.status === 'Completed'
                      ? 'bg-indigo-600'
                      : 'bg-slate-600'
                  }`}>
                    {project.status}
                  </span>

                  {/* Priority tag */}
                  <span className={`absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.2 rounded text-white shadow-xs uppercase tracking-wider ${
                    project.priority === 'Critical' 
                      ? 'bg-rose-600' 
                      : project.priority === 'High'
                      ? 'bg-amber-600'
                      : project.priority === 'Medium'
                      ? 'bg-indigo-600'
                      : 'bg-slate-600'
                  }`}>
                    {project.priority}
                  </span>

                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <h3 className="font-display font-bold text-xs tracking-tight truncate group-hover:underline">
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-3 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>

                  <div className="space-y-1.5">
                    {/* Dates */}
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                      <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{project.startDate} to {project.endDate}</span>
                    </div>

                    {/* Team Members List */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Manager
                        </span>
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold truncate max-w-[110px]">
                          {manager ? manager.name : 'Unknown PM'}
                        </span>
                      </div>

                      <div className="flex -space-x-1.5 overflow-hidden items-center">
                        {project.members.slice(0, 4).map((mId) => {
                          const mUser = users.find(u => u.id === mId);
                          return (
                            <div 
                              key={mId} 
                              className="h-5.5 w-5.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold border border-white dark:border-slate-950 flex items-center justify-center text-slate-600 dark:text-slate-300"
                              title={mUser?.name}
                            >
                              {mUser?.avatar || '??'}
                            </div>
                          );
                        })}
                        {project.members.length > 4 && (
                          <div className="h-5.5 w-5.5 rounded bg-indigo-50 dark:bg-indigo-950 text-[9px] font-bold border border-white dark:border-slate-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            +{project.members.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectProject(project.id);
                      onViewChange('kanban');
                    }}
                    className="flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Open Board</span>
                  </button>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingProject(project)}
                        className="h-6 w-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(project)}
                        className={`h-6 w-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                          project.status === 'Archived' ? 'text-indigo-600' : 'text-slate-500'
                        }`}
                        title={project.status === 'Archived' ? 'Unarchive Project' : 'Archive Project'}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Project Modal */}
      {(showAddModal || editingProject) && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs z-50 p-2">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded w-full max-w-md p-4 space-y-3.5 shadow-xl max-h-[92vh] overflow-y-auto scrollbar-thin">
            <h2 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-850 pb-1.5">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-[11px] font-semibold">
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign v2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Description
                </label>
                <textarea
                  placeholder="Outline project deliverables, team objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2.5}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-slate-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  placeholder="URL link to cover graphic..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 focus:outline-none dark:text-slate-200"
                />
              </div>

              {/* Assign Team Members Checkboxes */}
              <div className="space-y-1.5">
                <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Assign Team Members
                </label>
                <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded p-2 max-h-28 overflow-y-auto space-y-1.5">
                  {users.map((u) => (
                    <label key={u.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={assignedMembers.includes(u.id)}
                        onChange={() => toggleMemberSelection(u.id)}
                        className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[8px] rounded flex items-center justify-center">
                          {u.avatar}
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {u.name} <span className="text-[9px] text-slate-400">({u.role})</span>
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/40 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProject(null);
                  }}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
