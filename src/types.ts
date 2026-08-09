/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Project Manager' | 'Team Member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string; // URL or Initials code
  bio?: string;
  skills?: string[];
  organizationId?: string;
}

export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectStatus = 'Active' | 'Completed' | 'Archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  members: string[]; // User IDs
  managerId: string; // User ID
  createdAt: string;
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
  order: number;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Testing' | 'Completed';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  boardId: string;
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: string;
  assignedUserId?: string;
  labels: string[];
  status: TaskStatus;
  progressBar: number; // 0-100
  order: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  parentId?: string; // For nested replies
}

export interface Attachment {
  id: string;
  taskId: string;
  projectId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string; // User ID
  uploadedByName: string;
  createdAt: string;
}

export type NotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'due_reminder'
  | 'comment_added'
  | 'mention'
  | 'project_invitation';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  projectId: string; // 'global' for main team chat
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}
