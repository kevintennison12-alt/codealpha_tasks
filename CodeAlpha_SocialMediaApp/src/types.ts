export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isBlocked: boolean;
}

export interface Profile {
  userId: string;
  fullName: string;
  bio: string;
  avatar: string;
  cover: string;
  phone: string;
  location: string;
  website: string;
  isVerified: boolean;
}

export interface Post {
  id: string;
  userId: string;
  caption: string;
  media: string[]; // Image/video URLs
  hashtags: string[];
  location: string;
  visibility: 'public' | 'followers' | 'private';
  createdAt: string;
  isPinned: boolean;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  parentId?: string; // For nested replies
  content: string;
  createdAt: string;
  likes: string[]; // List of userIds who liked the comment
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  senderId: string; // Actor
  type: 'follow' | 'like' | 'comment' | 'reply' | 'mention' | 'message';
  postId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  media?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SavedPost {
  id: string;
  userId: string;
  postId: string;
}

export type ReportReason = 'spam' | 'abuse' | 'fake' | 'inappropriate';

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: ReportReason;
  createdAt: string;
  status: 'pending' | 'resolved';
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}
