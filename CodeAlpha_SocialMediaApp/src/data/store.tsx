import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Profile, Post, Like, Comment, Follow, 
  Notification, Message, SavedPost, Report, ActivityLog, ReportReason 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_PROFILES, INITIAL_POSTS, INITIAL_FOLLOWS, 
  INITIAL_LIKES, INITIAL_COMMENTS, INITIAL_SAVED_POSTS, 
  INITIAL_NOTIFICATIONS, INITIAL_MESSAGES, INITIAL_REPORTS, INITIAL_ACTIVITY_LOGS 
} from './initialData';

interface SocialMediaContextType {
  currentUser: User | null;
  currentProfile: Profile | null;
  users: User[];
  profiles: Profile[];
  posts: Post[];
  likes: Like[];
  comments: Comment[];
  follows: Follow[];
  notifications: Notification[];
  messages: Message[];
  savedPosts: SavedPost[];
  reports: Report[];
  activityLogs: ActivityLog[];
  darkMode: boolean;
  
  // Auth actions
  login: (username: string, role: 'user' | 'admin') => boolean;
  register: (username: string, email: string, fullName: string, role: 'user' | 'admin') => boolean;
  logout: () => void;
  updateProfile: (profileData: Partial<Profile>) => void;
  setDarkMode: (dark: boolean) => void;

  // Post Actions
  createPost: (caption: string, media: string[], location: string, hashtags: string[], visibility: 'public' | 'followers' | 'private') => void;
  deletePost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
  pinPost: (postId: string) => void;

  // Comment Actions
  addComment: (postId: string, content: string, parentId?: string) => void;
  deleteComment: (commentId: string) => void;
  toggleLikeComment: (commentId: string) => void;

  // Follow Actions
  toggleFollow: (targetUserId: string) => void;
  removeFollower: (followerUserId: string) => void;

  // Saved Actions
  toggleSavePost: (postId: string) => void;

  // Messaging Actions
  sendMessage: (receiverId: string, content: string, media?: string) => void;
  markMessagesAsRead: (senderId: string) => void;

  // Notification Actions
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Report Actions
  reportContent: (targetType: 'post' | 'comment' | 'user', targetId: string, reason: ReportReason) => void;

  // Admin Actions
  toggleBlockUser: (userId: string) => void;
  resolveReport: (reportId: string, actionTaken: 'delete' | 'ignore') => void;
  addSystemLog: (userId: string, action: string) => void;
}

const SocialMediaContext = createContext<SocialMediaContextType | undefined>(undefined);

export const SocialMediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to Initial Data
  const [users, setUsers] = useState<User[]>(() => {
    const data = localStorage.getItem('sm_users');
    return data ? JSON.parse(data) : INITIAL_USERS;
  });

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const data = localStorage.getItem('sm_profiles');
    return data ? JSON.parse(data) : INITIAL_PROFILES;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const data = localStorage.getItem('sm_posts');
    return data ? JSON.parse(data) : INITIAL_POSTS;
  });

  const [likes, setLikes] = useState<Like[]>(() => {
    const data = localStorage.getItem('sm_likes');
    return data ? JSON.parse(data) : INITIAL_LIKES;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const data = localStorage.getItem('sm_comments');
    return data ? JSON.parse(data) : INITIAL_COMMENTS;
  });

  const [follows, setFollows] = useState<Follow[]>(() => {
    const data = localStorage.getItem('sm_follows');
    return data ? JSON.parse(data) : INITIAL_FOLLOWS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const data = localStorage.getItem('sm_notifications');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const data = localStorage.getItem('sm_messages');
    return data ? JSON.parse(data) : INITIAL_MESSAGES;
  });

  const [savedPosts, setSavedPosts] = useState<SavedPost[]>(() => {
    const data = localStorage.getItem('sm_saved_posts');
    return data ? JSON.parse(data) : INITIAL_SAVED_POSTS;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const data = localStorage.getItem('sm_reports');
    return data ? JSON.parse(data) : INITIAL_REPORTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const data = localStorage.getItem('sm_activity_logs');
    return data ? JSON.parse(data) : INITIAL_ACTIVITY_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const data = localStorage.getItem('sm_current_user');
    // Default to tech_guru for beautiful initial interactive layout, or load saved session
    if (data) {
      return JSON.parse(data);
    }
    const techUser = INITIAL_USERS.find(u => u.id === 'user_tech');
    return techUser || null;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('sm_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const currentProfile = currentUser 
    ? profiles.find(p => p.userId === currentUser.id) || null 
    : null;

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('sm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sm_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('sm_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('sm_likes', JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    localStorage.setItem('sm_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('sm_follows', JSON.stringify(follows));
  }, [follows]);

  useEffect(() => {
    localStorage.setItem('sm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('sm_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('sm_saved_posts', JSON.stringify(savedPosts));
  }, [savedPosts]);

  useEffect(() => {
    localStorage.setItem('sm_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('sm_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sm_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sm_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sm_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // SYSTEM LOG helper
  const addSystemLog = (userId: string, action: string) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      action,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // AUTH ACTIONS
  const login = (username: string, role: 'user' | 'admin'): boolean => {
    const lowerUsername = username.toLowerCase().trim();
    const existingUser = users.find(u => u.username.toLowerCase() === lowerUsername);
    
    if (existingUser) {
      if (existingUser.isBlocked) {
        return false;
      }
      setCurrentUser(existingUser);
      addSystemLog(existingUser.id, `User securely logged in (Session Authenticated). Role: ${existingUser.role.toUpperCase()}`);
      return true;
    }
    return false;
  };

  const register = (username: string, email: string, fullName: string, role: 'user' | 'admin'): boolean => {
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    const existingUser = users.find(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return false; // username or email already taken
    }

    const newUserId = `user_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      username: cleanUsername,
      email: email.trim(),
      role,
      createdAt: new Date().toISOString(),
      isBlocked: false
    };

    const newProfile: Profile = {
      userId: newUserId,
      fullName: fullName.trim(),
      bio: 'Welcome to my new profile!',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      cover: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800',
      phone: '',
      location: '',
      website: '',
      isVerified: false
    };

    setUsers(prev => [...prev, newUser]);
    setProfiles(prev => [...prev, newProfile]);
    setCurrentUser(newUser);

    addSystemLog(newUserId, `Registered new account and initialized profile. Full Name: ${fullName.trim()}`);
    return true;
  };

  const logout = () => {
    if (currentUser) {
      addSystemLog(currentUser.id, `User logged out successfully.`);
    }
    setCurrentUser(null);
  };

  const updateProfile = (profileData: Partial<Profile>) => {
    if (!currentUser) return;
    setProfiles(prev => prev.map(p => {
      if (p.userId === currentUser.id) {
        const updated = { ...p, ...profileData };
        addSystemLog(currentUser.id, `Updated profile settings (Bio, Website, or Photos)`);
        return updated;
      }
      return p;
    }));
  };

  // POST ACTIONS
  const createPost = (
    caption: string, 
    media: string[], 
    location: string, 
    hashtags: string[], 
    visibility: 'public' | 'followers' | 'private'
  ) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      caption,
      media: media.filter(url => url.trim() !== ''),
      hashtags,
      location,
      visibility,
      createdAt: new Date().toISOString(),
      isPinned: false
    };
    setPosts(prev => [newPost, ...prev]);
    addSystemLog(currentUser.id, `Created post: "${caption.substring(0, 30)}..." with ${media.length} image files.`);
  };

  const deletePost = (postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.filter(p => p.id !== postId));
    setLikes(prev => prev.filter(l => l.postId !== postId));
    setComments(prev => prev.filter(c => c.postId !== postId));
    setSavedPosts(prev => prev.filter(s => s.postId !== postId));
    addSystemLog(currentUser.id, `Deleted post ID: ${postId}`);
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) return;
    const existingLike = likes.find(l => l.userId === currentUser.id && l.postId === postId);
    const post = posts.find(p => p.id === postId);

    if (existingLike) {
      setLikes(prev => prev.filter(l => l.id !== existingLike.id));
      addSystemLog(currentUser.id, `Unliked post ID: ${postId}`);
    } else {
      const newLike: Like = {
        id: `like_${Date.now()}`,
        userId: currentUser.id,
        postId
      };
      setLikes(prev => [...prev, newLike]);
      addSystemLog(currentUser.id, `Liked post ID: ${postId}`);

      // Generate notification to the post creator
      if (post && post.userId !== currentUser.id) {
        const newNotif: Notification = {
          id: `notif_${Date.now()}`,
          userId: post.userId,
          senderId: currentUser.id,
          type: 'like',
          postId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    }
  };

  const pinPost = (postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId && p.userId === currentUser.id) {
        return { ...p, isPinned: !p.isPinned };
      }
      return p;
    }));
    addSystemLog(currentUser.id, `Toggled pinned status on post: ${postId}`);
  };

  // COMMENT ACTIONS
  const addComment = (postId: string, content: string, parentId?: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      userId: currentUser.id,
      postId,
      parentId,
      content,
      createdAt: new Date().toISOString(),
      likes: []
    };
    setComments(prev => [...prev, newComment]);
    addSystemLog(currentUser.id, `Added comment: "${content.substring(0, 30)}..." to Post ID: ${postId}`);

    // Notify post creator or parent comment creator
    const post = posts.find(p => p.id === postId);
    if (parentId) {
      const parentComment = comments.find(c => c.id === parentId);
      if (parentComment && parentComment.userId !== currentUser.id) {
        const newNotif: Notification = {
          id: `notif_${Date.now()}`,
          userId: parentComment.userId,
          senderId: currentUser.id,
          type: 'reply',
          postId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    } else {
      if (post && post.userId !== currentUser.id) {
        const newNotif: Notification = {
          id: `notif_${Date.now()}`,
          userId: post.userId,
          senderId: currentUser.id,
          type: 'comment',
          postId,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    }
  };

  const deleteComment = (commentId: string) => {
    if (!currentUser) return;
    // Also delete any replies to this comment
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
    addSystemLog(currentUser.id, `Deleted comment ID: ${commentId}`);
  };

  const toggleLikeComment = (commentId: string) => {
    if (!currentUser) return;
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const liked = c.likes.includes(currentUser.id);
        const newLikes = liked 
          ? c.likes.filter(id => id !== currentUser.id)
          : [...c.likes, currentUser.id];
        return { ...c, likes: newLikes };
      }
      return c;
    }));
  };

  // FOLLOW ACTIONS
  const toggleFollow = (targetUserId: string) => {
    if (!currentUser || currentUser.id === targetUserId) return;
    const existingFollow = follows.find(f => f.followerId === currentUser.id && f.followingId === targetUserId);

    if (existingFollow) {
      setFollows(prev => prev.filter(f => f.id !== existingFollow.id));
      addSystemLog(currentUser.id, `Unfollowed user ID: ${targetUserId}`);
    } else {
      const newFollow: Follow = {
        id: `follow_${Date.now()}`,
        followerId: currentUser.id,
        followingId: targetUserId
      };
      setFollows(prev => [...prev, newFollow]);
      addSystemLog(currentUser.id, `Followed user ID: ${targetUserId}`);

      // Send follower notification
      const newNotif: Notification = {
        id: `notif_${Date.now()}`,
        userId: targetUserId,
        senderId: currentUser.id,
        type: 'follow',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const removeFollower = (followerUserId: string) => {
    if (!currentUser) return;
    setFollows(prev => prev.filter(f => !(f.followerId === followerUserId && f.followingId === currentUser.id)));
    addSystemLog(currentUser.id, `Removed follower ID: ${followerUserId}`);
  };

  // SAVED POSTS
  const toggleSavePost = (postId: string) => {
    if (!currentUser) return;
    const existingSave = savedPosts.find(s => s.userId === currentUser.id && s.postId === postId);

    if (existingSave) {
      setSavedPosts(prev => prev.filter(s => s.id !== existingSave.id));
      addSystemLog(currentUser.id, `Removed post ${postId} from saved bookmarks.`);
    } else {
      const newSave: SavedPost = {
        id: `save_${Date.now()}`,
        userId: currentUser.id,
        postId
      };
      setSavedPosts(prev => [...prev, newSave]);
      addSystemLog(currentUser.id, `Saved post ${postId} to bookmarks.`);
    }
  };

  // MESSAGING ACTIONS
  const sendMessage = (receiverId: string, content: string, media?: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      content,
      media,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
    addSystemLog(currentUser.id, `Sent private message to user ${receiverId}`);

    // Create message notification
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      userId: receiverId,
      senderId: currentUser.id,
      type: 'message',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markMessagesAsRead = (senderId: string) => {
    if (!currentUser) return;
    setMessages(prev => prev.map(m => {
      if (m.senderId === senderId && m.receiverId === currentUser.id) {
        return { ...m, isRead: true };
      }
      return m;
    }));
  };

  // NOTIFICATION ACTIONS
  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => {
      if (n.userId === currentUser.id) {
        return { ...n, isRead: true };
      }
      return n;
    }));
  };

  const clearNotifications = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.filter(n => n.userId !== currentUser.id));
  };

  // REPORT CONTENT
  const reportContent = (targetType: 'post' | 'comment' | 'user', targetId: string, reason: ReportReason) => {
    if (!currentUser) return;
    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      targetType,
      targetId,
      reason,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setReports(prev => [newReport, ...prev]);
    addSystemLog(currentUser.id, `Reported ${targetType} (ID: ${targetId}) for: ${reason.toUpperCase()}`);
  };

  // ADMIN ACTIONS
  const toggleBlockUser = (userId: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const blockedState = !u.isBlocked;
        addSystemLog(currentUser.id, `${blockedState ? 'Blocked' : 'Unblocked'} user account: ${u.username}`);
        return { ...u, isBlocked: blockedState };
      }
      return u;
    }));
  };

  const resolveReport = (reportId: string, actionTaken: 'delete' | 'ignore') => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (actionTaken === 'delete') {
      if (report.targetType === 'post') {
        setPosts(prev => prev.filter(p => p.id !== report.targetId));
      } else if (report.targetType === 'comment') {
        setComments(prev => prev.filter(c => c.id !== report.targetId));
      } else if (report.targetType === 'user') {
        setUsers(prev => prev.map(u => u.id === report.targetId ? { ...u, isBlocked: true } : u));
      }
      addSystemLog(currentUser.id, `Resolved report ${reportId} with action: DELETED content/account`);
    } else {
      addSystemLog(currentUser.id, `Resolved report ${reportId} with action: DISMISSED report`);
    }

    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' as const } : r));
  };

  return (
    <SocialMediaContext.Provider value={{
      currentUser,
      currentProfile,
      users,
      profiles,
      posts,
      likes,
      comments,
      follows,
      notifications,
      messages,
      savedPosts,
      reports,
      activityLogs,
      darkMode,

      login,
      register,
      logout,
      updateProfile,
      setDarkMode,

      createPost,
      deletePost,
      toggleLikePost,
      pinPost,

      addComment,
      deleteComment,
      toggleLikeComment,

      toggleFollow,
      removeFollower,

      toggleSavePost,

      sendMessage,
      markMessagesAsRead,

      markAllNotificationsRead,
      clearNotifications,

      reportContent,

      toggleBlockUser,
      resolveReport,
      addSystemLog
    }}>
      {children}
    </SocialMediaContext.Provider>
  );
};

export const useSocialMedia = () => {
  const context = useContext(SocialMediaContext);
  if (context === undefined) {
    throw new Error('useSocialMedia must be used within a SocialMediaProvider');
  }
  return context;
};
