/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Project, Board, Task, User, Notification, ActivityLog, UserRole 
} from './types';
import { api } from './utils/api';

// View components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import ChatView from './components/ChatView';
import LogsView from './components/LogsView';
import ReportsView from './components/ReportsView';
import AdminView from './components/AdminView';
import AuthView from './components/AuthView';

export default function App() {
  // Authentication State
  const [token, setToken] = React.useState<string | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [authChecked, setAuthChecked] = React.useState(false);

  // App Layout States
  const [activeView, setActiveView] = React.useState<string>('dashboard');
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  // Database Data States
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [activityLogs, setActivityLogs] = React.useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');

  // Kanban Detail Callback anchor
  const [openTaskTrigger, setOpenTaskTrigger] = React.useState<Task | null>(null);

  // 1. Initial Authentication & Theme Load
  React.useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem('pm_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Token
    const savedToken = localStorage.getItem('pm_token');
    if (savedToken) {
      api.setToken(savedToken);
      setToken(savedToken);
      // Fetch profile
      api.auth.getProfile()
        .then(data => {
          setCurrentUser(data.user);
          setAuthChecked(true);
        })
        .catch(err => {
          console.error('Session expired:', err);
          handleLogout();
          setAuthChecked(true);
        });
    } else {
      setAuthChecked(true);
    }
  }, []);

  // 2. Load Core Application Data on Auth success
  const loadWorkspaceData = async () => {
    if (!token) return;
    try {
      const [projs, usrList, logs, notifs] = await Promise.all([
        api.projects.getAll(),
        api.users.getAll(),
        api.logs.getAll(),
        api.notifications.getAll()
      ]);

      setProjects(projs);
      setUsers(usrList);
      setActivityLogs(logs);
      setNotifications(notifs);

      // Restore last selected project or default to first
      const savedProjId = localStorage.getItem('pm_selected_project_id');
      const activeProj = projs.find(p => p.id === savedProjId) || projs[0] || null;
      setSelectedProject(activeProj);

      if (activeProj) {
        localStorage.setItem('pm_selected_project_id', activeProj.id);
        const [bList, tList] = await Promise.all([
          api.boards.getByProject(activeProj.id),
          api.tasks.getByProject(activeProj.id)
        ]);
        setBoards(bList);
        setTasks(tList);
      } else {
        setBoards([]);
        setTasks([]);
      }
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  };

  React.useEffect(() => {
    if (token) {
      loadWorkspaceData();
    }
  }, [token]);

  // Handle Switch project
  const handleSelectProject = async (project: Project) => {
    setSelectedProject(project);
    localStorage.setItem('pm_selected_project_id', project.id);
    try {
      const [bList, tList] = await Promise.all([
        api.boards.getByProject(project.id),
        api.tasks.getByProject(project.id)
      ]);
      setBoards(bList);
      setTasks(tList);
    } catch (err) {
      console.error('Failed to load project details:', err);
    }
  };

  // Auth Callbacks
  const handleAuthSuccess = (newToken: string, user: User) => {
    localStorage.setItem('pm_token', newToken);
    api.setToken(newToken);
    setToken(newToken);
    setCurrentUser(user);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('pm_token');
    api.setToken('');
    setToken(null);
    setCurrentUser(null);
    setProjects([]);
    setSelectedProject(null);
    setBoards([]);
    setTasks([]);
    setNotifications([]);
  };

  // Theme Toggle
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('pm_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 3. Modifying resources callbacks (Project, Board, Tasks)
  // Project operations
  const handleAddProject = async (projectData: Partial<Project>) => {
    try {
      const added = await api.projects.create(projectData);
      setProjects(prev => [...prev, added]);
      await handleSelectProject(added);
      loadWorkspaceData();
    } catch (err) {
      alert('Failed to create project');
    }
  };

  const handleUpdateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const updated = await api.projects.update(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
      if (selectedProject?.id === id) {
        setSelectedProject(updated);
      }
      loadWorkspaceData();
    } catch (err) {
      alert('Failed to update project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await api.projects.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
        setBoards([]);
        setTasks([]);
      }
      loadWorkspaceData();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  // Board list operations
  const handleAddBoard = async (projectId: string, name: string) => {
    try {
      const added = await api.boards.create(projectId, name);
      setBoards(prev => [...prev, added]);
      loadWorkspaceData();
    } catch (err) {
      alert('Failed to add board column');
    }
  };

  const handleUpdateBoard = async (boardId: string, name: string) => {
    try {
      const updated = await api.boards.update(boardId, name);
      setBoards(prev => prev.map(b => b.id === boardId ? updated : b));
      loadWorkspaceData();
    } catch (err) {
      alert('Failed to update column');
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await api.boards.delete(boardId);
      setBoards(prev => prev.filter(b => b.id !== boardId));
      setTasks(prev => prev.filter(t => t.boardId !== boardId));
      loadWorkspaceData();
    } catch (err) {
      alert('Failed to delete column');
    }
  };

  // Task operations
  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const added = await api.tasks.create(taskData);
      setTasks(prev => [...prev, added]);
      loadWorkspaceData();
    } catch (err) {
      alert('Failed to add task');
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      const updated = await api.tasks.update(taskId, taskData);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      loadWorkspaceData();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.tasks.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      loadWorkspaceData();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleMoveTask = async (taskId: string, destBoardId: string, order?: number) => {
    try {
      const updatedTasks = await api.tasks.move(taskId, destBoardId, order);
      setTasks(updatedTasks);
      loadWorkspaceData();
    } catch (err) {
      console.error('Move error:', err);
    }
  };

  // Admin user operations
  const handleUpdateUserRole = async (userId: string, role: UserRole) => {
    try {
      const updated = await api.users.updateRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      if (currentUser?.id === userId) {
        setCurrentUser(updated);
      }
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.users.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert('User deletion failed');
    }
  };

  // Notifications operations
  const handleMarkNotifRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Notification read error:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all read notification error:', err);
    }
  };

  // Wait for session resolve
  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f19] space-y-4">
        <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-display font-bold text-lg flex items-center justify-center animate-bounce">
          P
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider animate-pulse">
          Establishing workspace session...
        </p>
      </div>
    );
  }

  // Not Logged In screen
  if (!token) {
    return (
      <AuthView 
        currentUser={null}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
      />
    );
  }

  // Filter tasks based on top Header Search input
  const filteredTasks = searchQuery.trim() 
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())))
    : tasks;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0b0f19] font-sans antialiased">
      {/* Sidebar navigation */}
      <Sidebar 
        currentView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
        currentUser={currentUser}
        unreadNotificationsCount={notifications.filter(n => !n.read).length}
      />

      {/* Main Core shell container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navbar details */}
        <Header 
          currentUser={currentUser}
          projects={projects}
          selectedProjectId={selectedProject?.id || ''}
          onProjectChange={(id) => {
            const proj = projects.find(p => p.id === id);
            if (proj) handleSelectProject(proj);
          }}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotifRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onDeleteNotification={async (id) => {
            try {
              await api.notifications.delete(id);
              loadWorkspaceData();
            } catch (err) {
              console.error(err);
            }
          }}
          onLogout={handleLogout}
          onViewProfile={() => setActiveView('profile')}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          darkMode={theme === 'dark'}
          onToggleDarkMode={handleToggleTheme}
        />

        {/* View switching panel routes */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {activeView === 'dashboard' && (
            <DashboardView 
              projects={projects}
              tasks={tasks}
              users={users}
              logs={activityLogs}
              currentUser={currentUser}
              onViewChange={setActiveView}
              onSelectProject={(id) => {
                const proj = projects.find(p => p.id === id);
                if (proj) handleSelectProject(proj);
                setActiveView('kanban');
              }}
            />
          )}

          {activeView === 'projects' && (
            <ProjectsView 
              projects={projects}
              currentUser={currentUser}
              users={users}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onSelectProject={(id) => {
                const proj = projects.find(p => p.id === id);
                if (proj) handleSelectProject(proj);
                setActiveView('kanban');
              }}
              onViewChange={setActiveView}
            />
          )}

          {activeView === 'kanban' && (
            <KanbanView 
              project={selectedProject}
              boards={boards}
              tasks={filteredTasks}
              users={users}
              currentUser={currentUser}
              onAddBoard={handleAddBoard}
              onUpdateBoard={handleUpdateBoard}
              onDeleteBoard={handleDeleteBoard}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onMoveTask={handleMoveTask}
              onRefreshTasks={loadWorkspaceData}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView 
              tasks={tasks}
              projects={projects}
              onEditTask={(task) => {
                setActiveView('kanban');
                setOpenTaskTrigger(task);
              }}
            />
          )}

          {activeView === 'chat' && (
            <ChatView 
              projects={projects}
              currentUser={currentUser}
            />
          )}

          {activeView === 'logs' && (
            <LogsView 
              logs={activityLogs}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView 
              projects={projects}
              tasks={tasks}
              users={users}
            />
          )}

          {activeView === 'admin' && (
            <AdminView 
              users={users}
              currentUser={currentUser}
              onUpdateUserRole={handleUpdateUserRole}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeView === 'profile' && (
            <AuthView 
              currentUser={currentUser}
              onAuthSuccess={handleAuthSuccess}
              onLogout={handleLogout}
              isProfileView={true}
            />
          )}

        </div>
      </div>
    </div>
  );
}
