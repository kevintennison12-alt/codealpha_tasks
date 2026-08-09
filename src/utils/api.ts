/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, Project, Board, Task, Subtask, Comment, 
  Attachment, Notification, ActivityLog, ChatMessage 
} from '../types';

// API Configuration
const API_URL = ''; // Relative path because backend proxies requests via Vite in dev and hosts static in prod

// Retrieve local token
export const getToken = (): string | null => {
  return localStorage.getItem('pm_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('pm_token', token);
};

export const clearToken = (): void => {
  localStorage.removeItem('pm_token');
};

// Generic authenticated fetch wrapper
const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

// API Services
export const api = {
  setToken,

  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      const data = await request<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setToken(data.token);
      return data;
    },
    register: async (email: string, password: string, name: string, role: string) => {
      const data = await request<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role })
      });
      setToken(data.token);
      return data;
    },
    getProfile: async () => {
      return request<{ user: User }>('/api/auth/profile');
    },
    updateProfile: async (name: string, bio?: string, skills?: string[]) => {
      return request<{ user: User }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, bio, skills })
      });
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
      return request<{ message: string }>('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
    },
    resetPasswordRequest: async (email: string) => {
      return request<{ message: string; userId: string }>('/api/auth/reset-password-request', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },
    resetPasswordConfirm: async (userId: string, newPassword: string) => {
      return request<{ message: string }>('/api/auth/reset-password-confirm', {
        method: 'POST',
        body: JSON.stringify({ userId, newPassword })
      });
    }
  },

  // Projects
  projects: {
    getAll: async () => {
      const data = await request<{ projects: Project[] }>('/api/projects');
      return data.projects;
    },
    create: async (projectData: Partial<Project>) => {
      const data = await request<{ project: Project }>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });
      return data.project;
    },
    update: async (projectId: string, projectData: Partial<Project>) => {
      const data = await request<{ project: Project }>(`/api/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(projectData)
      });
      return data.project;
    },
    delete: async (projectId: string) => {
      return request<{ message: string }>(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });
    }
  },

  // Boards
  boards: {
    getByProject: async (projectId: string) => {
      const data = await request<{ boards: Board[] }>(`/api/boards/${projectId}`);
      return data.boards;
    },
    create: async (projectId: string, name: string) => {
      const data = await request<{ board: Board }>('/api/boards', {
        method: 'POST',
        body: JSON.stringify({ projectId, name })
      });
      return data.board;
    },
    update: async (boardId: string, name: string) => {
      const data = await request<{ board: Board }>(`/api/boards/${boardId}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
      return data.board;
    },
    delete: async (boardId: string) => {
      return request<{ message: string }>(`/api/boards/${boardId}`, {
        method: 'DELETE'
      });
    }
  },

  // Tasks
  tasks: {
    getByProject: async (projectId: string) => {
      const data = await request<{ tasks: Task[] }>(`/api/tasks/${projectId}`);
      return data.tasks;
    },
    create: async (taskData: Partial<Task>) => {
      const data = await request<{ task: Task }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
      return data.task;
    },
    update: async (taskId: string, taskData: Partial<Task>) => {
      const data = await request<{ task: Task }>(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData)
      });
      return data.task;
    },
    move: async (taskId: string, destinationBoardId: string, newOrder?: number) => {
      const data = await request<{ success: boolean; tasks: Task[] }>('/api/tasks/move', {
        method: 'POST',
        body: JSON.stringify({ taskId, destinationBoardId, newOrder })
      });
      return data.tasks;
    },
    delete: async (taskId: string) => {
      return request<{ message: string }>(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
    },
    duplicate: async (taskId: string) => {
      const data = await request<{ task: Task }>(`/api/tasks/${taskId}/duplicate`, {
        method: 'POST'
      });
      return data.task;
    }
  },

  // Subtasks
  subtasks: {
    getByTask: async (taskId: string) => {
      const data = await request<{ subtasks: Subtask[] }>(`/api/subtasks/${taskId}`);
      return data.subtasks;
    },
    create: async (taskId: string, title: string) => {
      const data = await request<{ subtask: Subtask }>('/api/subtasks', {
        method: 'POST',
        body: JSON.stringify({ taskId, title })
      });
      return data.subtask;
    },
    update: async (subtaskId: string, completed: boolean, title?: string) => {
      const data = await request<{ subtask: Subtask }>(`/api/subtasks/${subtaskId}`, {
        method: 'PUT',
        body: JSON.stringify({ completed, title })
      });
      return data.subtask;
    },
    delete: async (subtaskId: string) => {
      return request<{ message: string }>(`/api/subtasks/${subtaskId}`, {
        method: 'DELETE'
      });
    }
  },

  // Comments
  comments: {
    getByTask: async (taskId: string) => {
      const data = await request<{ comments: Comment[] }>(`/api/comments/${taskId}`);
      return data.comments;
    },
    create: async (taskId: string, text: string, parentId?: string) => {
      const data = await request<{ comment: Comment }>('/api/comments', {
        method: 'POST',
        body: JSON.stringify({ taskId, text, parentId })
      });
      return data.comment;
    },
    delete: async (commentId: string) => {
      return request<{ message: string }>(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });
    }
  },

  // Attachments
  attachments: {
    getByProject: async (projectId: string) => {
      const data = await request<{ attachments: Attachment[] }>(`/api/attachments/${projectId}`);
      return data.attachments;
    },
    upload: async (taskId: string, projectId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId);
      formData.append('projectId', projectId);

      const data = await request<{ attachment: Attachment }>('/api/attachments/upload', {
        method: 'POST',
        body: formData
      });
      return data.attachment;
    },
    delete: async (attachmentId: string) => {
      return request<{ message: string }>(`/api/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
    }
  },

  // Notifications
  notifications: {
    getAll: async () => {
      const data = await request<{ notifications: Notification[] }>('/api/notifications');
      return data.notifications;
    },
    markRead: async (notificationId: string) => {
      return request<{ success: boolean }>(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
    },
    markAllRead: async () => {
      return request<{ success: boolean }>('/api/notifications/read-all', {
        method: 'PUT'
      });
    },
    delete: async (notificationId: string) => {
      return request<{ success: boolean }>(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
    }
  },

  // Chat / Conversations
  chat: {
    getMessages: async (projectId: string) => {
      const data = await request<{ messages: ChatMessage[] }>(`/api/chat/${projectId}`);
      return data.messages;
    },
    sendMessage: async (projectId: string, text: string) => {
      const data = await request<{ message: ChatMessage }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ projectId, text })
      });
      return data.message;
    }
  },

  // Users
  users: {
    getAll: async () => {
      const data = await request<{ users: User[] }>('/api/users');
      return data.users;
    },
    updateRole: async (userId: string, role: string) => {
      const data = await request<{ user: User }>(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
      return data.user;
    },
    delete: async (userId: string) => {
      return request<{ message: string }>(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
    }
  },

  // Activity Logs
  activityLogs: {
    getAll: async () => {
      const data = await request<{ activityLogs: ActivityLog[] }>('/api/activity-logs');
      return data.activityLogs;
    }
  },

  // Alias for activityLogs
  logs: {
    getAll: async () => {
      const data = await request<{ activityLogs: ActivityLog[] }>('/api/activity-logs');
      return data.activityLogs;
    }
  },

  // Reports
  reports: {
    getProjectStats: async (projectId: string) => {
      const data = await request<{ 
        report: { 
          projectId: string; 
          projectName: string; 
          stats: { total: number; todo: number; inProgress: number; review: number; testing: number; completed: number }; 
          productivity: { name: string; completed: number; total: number }[] 
        } 
      }>(`/api/reports/${projectId}`);
      return data.report;
    }
  },

  // Administration (Admin role only)
  admin: {
    getUsers: async () => {
      const data = await request<{ users: User[] }>('/api/admin/users');
      return data.users;
    },
    updateUserRole: async (userId: string, role: string) => {
      const data = await request<{ user: User }>(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
      return data.user;
    },
    deleteUser: async (userId: string) => {
      return request<{ message: string }>(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
    }
  }
};
