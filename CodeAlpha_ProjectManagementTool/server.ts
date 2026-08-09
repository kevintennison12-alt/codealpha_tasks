/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { 
  User, Project, Board, Task, Subtask, Comment, 
  Attachment, Notification, ActivityLog, ChatMessage, UserRole, TaskStatus 
} from './src/types';

// Ensure data and uploads directory exist
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

// Database State Type
interface DBState {
  users: User[];
  passwords: Record<string, string>; // userId -> password (stored plain or simple encrypted for sandbox demo)
  projects: Project[];
  boards: Board[];
  tasks: Task[];
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  chatMessages: ChatMessage[];
}

// Initial/Seed Database Data
const initialDB: DBState = {
  users: [
    { id: 'u1', email: 'admin@company.com', name: 'Kevin', role: 'Admin', avatar: 'K', bio: 'Platform administrator and organization owner.', skills: ['Governance', 'Systems', 'Strategic Planning'] },
    { id: 'u2', email: 'pm@company.com', name: 'John Manager', role: 'Project Manager', avatar: 'JM', bio: 'Experienced project manager. Specializes in Scrum & agile delivery.', skills: ['Agile', 'Scrum', 'Risk Management', 'Budgets'] },
    { id: 'u3', email: 'dev@company.com', name: 'Alex Developer', role: 'Team Member', avatar: 'AD', bio: 'Full stack software engineer passionate about beautiful frontends.', skills: ['TypeScript', 'React', 'Node.js', 'Tailwind'] },
    { id: 'u4', email: 'designer@company.com', name: 'Emma Designer', role: 'Team Member', avatar: 'ED', bio: 'Product & UX/UI Designer focusing on project management workflows.', skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping'] }
  ],
  passwords: {
    'u1': 'password123',
    'u2': 'password123',
    'u3': 'password123',
    'u4': 'password123'
  },
  projects: [
    {
      id: 'p1',
      name: 'Alpha Software Release',
      description: 'Main release cycle for the upcoming v1.0 of our flagship project management platform, including Kanban updates, UI refresh, and offline capabilities.',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      startDate: '2026-07-01',
      endDate: '2026-08-15',
      priority: 'High',
      status: 'Active',
      members: ['u1', 'u2', 'u3', 'u4'],
      managerId: 'u2',
      createdAt: '2026-07-01T08:00:00Z'
    },
    {
      id: 'p2',
      name: 'Enterprise Marketing Site Redesign',
      description: 'Rebuild of our public website to drive higher conversions, showcase our new interactive dashboard, and integrate a comprehensive support helpdesk.',
      coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
      startDate: '2026-07-10',
      endDate: '2026-09-01',
      priority: 'Medium',
      status: 'Active',
      members: ['u2', 'u4'],
      managerId: 'u2',
      createdAt: '2026-07-10T10:00:00Z'
    },
    {
      id: 'p3',
      name: 'Mobile App Wireframing & Prototype',
      description: 'Initial design phases for our iOS and Android mobile applet, including interactive Figma mocks and stakeholder review workshops.',
      coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
      startDate: '2026-06-01',
      endDate: '2026-07-05',
      priority: 'Critical',
      status: 'Completed',
      members: ['u2', 'u3', 'u4'],
      managerId: 'u2',
      createdAt: '2026-06-01T09:00:00Z'
    }
  ],
  boards: [
    { id: 'b1', projectId: 'p1', name: 'Backlog', order: 0 },
    { id: 'b2', projectId: 'p1', name: 'To Do', order: 1 },
    { id: 'b3', projectId: 'p1', name: 'In Progress', order: 2 },
    { id: 'b4', projectId: 'p1', name: 'Review', order: 3 },
    { id: 'b5', projectId: 'p1', name: 'Testing', order: 4 },
    { id: 'b6', projectId: 'p1', name: 'Completed', order: 5 }
  ],
  tasks: [
    {
      id: 't1',
      boardId: 'b1',
      projectId: 'p1',
      title: 'Integrate WebSockets for Real-time chat',
      description: 'Design the backend channel system to relay live chat messages to team members within a project room.',
      priority: 'Medium',
      dueDate: '2026-08-05',
      assignedUserId: 'u3',
      labels: ['Backend', 'Sockets'],
      status: 'Todo',
      progressBar: 0,
      order: 0,
      createdAt: '2026-07-02T12:00:00Z'
    },
    {
      id: 't2',
      boardId: 'b2',
      projectId: 'p1',
      title: 'Create light/dark theme CSS variables',
      description: 'Implement Tailwind-based dark/light theme options inside index.css and a clean state toggle button in header.',
      priority: 'Low',
      dueDate: '2026-07-20',
      assignedUserId: 'u4',
      labels: ['UI/UX', 'CSS'],
      status: 'Todo',
      progressBar: 100,
      order: 0,
      createdAt: '2026-07-02T13:00:00Z'
    },
    {
      id: 't3',
      boardId: 'b2',
      projectId: 'p1',
      title: 'Database connection optimization',
      description: 'Audit the data indexing and table structures to ensure rapid response times under load.',
      priority: 'High',
      dueDate: '2026-07-15',
      assignedUserId: 'u3',
      labels: ['Database', 'Performance'],
      status: 'Todo',
      progressBar: 50,
      order: 1,
      createdAt: '2026-07-03T09:00:00Z'
    },
    {
      id: 't4',
      boardId: 'b3',
      projectId: 'p1',
      title: 'Implement Interactive Kanban Drag & Drop UI',
      description: 'Build robust Kanban boards where users can seamlessly drag task cards across status lanes with instant state syncing to the server database.',
      priority: 'Critical',
      dueDate: '2026-07-18',
      assignedUserId: 'u3',
      labels: ['Frontend', 'DND'],
      status: 'In Progress',
      progressBar: 40,
      order: 0,
      createdAt: '2026-07-03T10:00:00Z'
    },
    {
      id: 't5',
      boardId: 'b4',
      projectId: 'p1',
      title: 'Review Project Management PDF Report Export',
      description: 'Verify report calculations for completed/pending tasks and render an elegant print view that prints/saves cleanly to PDF.',
      priority: 'Medium',
      dueDate: '2026-07-12',
      assignedUserId: 'u2',
      labels: ['Reporting', 'Export'],
      status: 'Review',
      progressBar: 75,
      order: 0,
      createdAt: '2026-07-04T11:00:00Z'
    },
    {
      id: 't6',
      boardId: 'b5',
      projectId: 'p1',
      title: 'QA testing for authentication authorization',
      description: 'Test session-based login and API route access protections to guarantee only Admins can manage core user settings.',
      priority: 'High',
      dueDate: '2026-07-10', // OVERDUE in future date (relative to 2026-07-11)
      assignedUserId: 'u3',
      labels: ['Security', 'QA'],
      status: 'Testing',
      progressBar: 66,
      order: 0,
      createdAt: '2026-07-04T15:00:00Z'
    },
    {
      id: 't7',
      boardId: 'b6',
      projectId: 'p1',
      title: 'User roles specification documentation',
      description: 'Document system capabilities and permissions map for Admins, PMs, and Team Members.',
      priority: 'Low',
      dueDate: '2026-07-05',
      assignedUserId: 'u2',
      labels: ['Docs'],
      status: 'Completed',
      progressBar: 100,
      order: 0,
      createdAt: '2026-07-01T10:00:00Z'
    }
  ],
  subtasks: [
    { id: 's1', taskId: 't3', title: 'Measure query latency', completed: true },
    { id: 's2', taskId: 't3', title: 'Add indexes to columns', completed: false },
    { id: 's3', taskId: 't4', title: 'Install motion/react library', completed: true },
    { id: 's4', taskId: 't4', title: 'Construct task card components', completed: true },
    { id: 's5', taskId: 't4', title: 'Implement drag event handlers', completed: false },
    { id: 's6', taskId: 't4', title: 'Optimize layouts for mobile devices', completed: false },
    { id: 's7', taskId: 't4', title: 'Sync with backend DB', completed: false },
    { id: 's8', taskId: 't5', title: 'Format table metrics', completed: true },
    { id: 's9', taskId: 't5', title: 'Add team velocity chart layout', completed: true },
    { id: 's10', taskId: 't5', title: 'Design beautiful print stylesheet', completed: true },
    { id: 's11', taskId: 't5', title: 'Implement CSV export structure', completed: false },
    { id: 's12', taskId: 't6', title: 'Verify Admin role restrictions', completed: true },
    { id: 's13', taskId: 't6', title: 'Verify Project Manager role restrictions', completed: true },
    { id: 's14', taskId: 't6', title: 'Check cross-site request token logic', completed: false }
  ],
  comments: [
    { id: 'c1', taskId: 't4', userId: 'u2', userName: 'John Manager', userAvatar: 'JM', text: 'Alex, the layout looks extremely clean! Let\'s make sure card transitions are super smooth.', createdAt: '2026-07-08T09:30:00Z' },
    { id: 'c2', taskId: 't4', userId: 'u3', userName: 'Alex Developer', userAvatar: 'AD', text: 'Absolutely, John. I\'m using motion animations for card hovering and dragging. It feels incredible.', createdAt: '2026-07-08T10:15:00Z', parentId: 'c1' },
    { id: 'c3', taskId: 't6', userId: 'u1', userName: 'Kevin', userAvatar: 'K', text: 'Security is critical for our launch. Please double-check password salting or verify hash comparisons.', createdAt: '2026-07-09T14:22:00Z' }
  ],
  attachments: [
    { id: 'a1', taskId: 't5', projectId: 'p1', fileName: 'reporting_spec_draft.pdf', filePath: '/api/attachments/download/seed-reporting_spec_draft.pdf', fileType: 'application/pdf', fileSize: 1024 * 342, uploadedBy: 'u2', uploadedByName: 'John Manager', createdAt: '2026-07-05T09:00:00Z' }
  ],
  notifications: [
    { id: 'n1', userId: 'u3', title: 'New Task Assigned', message: 'John Manager assigned you "Integrate WebSockets for Real-time chat".', type: 'task_assigned', read: false, createdAt: '2026-07-10T08:30:00Z' },
    { id: 'n2', userId: 'u3', title: 'Comment Received', message: 'John Manager commented on "Implement Interactive Kanban Drag & Drop UI".', type: 'comment_added', read: true, createdAt: '2026-07-08T09:31:00Z' },
    { id: 'n3', userId: 'u1', title: 'System Security Audit', message: 'Audit report is ready for download in your dashboard.', type: 'task_completed', read: false, createdAt: '2026-07-11T07:15:00Z' }
  ],
  activityLogs: [
    { id: 'al1', userId: 'u1', userName: 'Kevin', action: 'Logged in', createdAt: '2026-07-11T08:00:00Z' },
    { id: 'al2', userId: 'u2', userName: 'John Manager', action: 'Created project "Alpha Software Release"', projectId: 'p1', projectName: 'Alpha Software Release', createdAt: '2026-07-01T08:00:00Z' },
    { id: 'al3', userId: 'u2', userName: 'John Manager', action: 'Created task "Implement Interactive Kanban Drag & Drop UI"', projectId: 'p1', projectName: 'Alpha Software Release', taskId: 't4', taskTitle: 'Implement Interactive Kanban Drag & Drop UI', createdAt: '2026-07-03T10:00:00Z' },
    { id: 'al4', userId: 'u3', userName: 'Alex Developer', action: 'Updated task progress to 40% on "Implement Interactive Kanban Drag & Drop UI"', projectId: 'p1', projectName: 'Alpha Software Release', taskId: 't4', taskTitle: 'Implement Interactive Kanban Drag & Drop UI', createdAt: '2026-07-08T10:15:00Z' }
  ],
  chatMessages: [
    { id: 'ch1', projectId: 'global', userId: 'u1', userName: 'Kevin', userAvatar: 'K', text: 'Welcome team to the global project collaboration workspace!', createdAt: '2026-07-11T08:01:00Z' },
    { id: 'ch2', projectId: 'global', userId: 'u2', userName: 'John Manager', userAvatar: 'JM', text: 'Good morning Kevin! Excited to dive into the Alpha tasks today.', createdAt: '2026-07-11T08:05:00Z' },
    { id: 'ch3', projectId: 'p1', userId: 'u3', userName: 'Alex Developer', userAvatar: 'AD', text: 'Hey guys, I am actively working on the Kanban boards right now. Let me know if you want a live walkthrough!', createdAt: '2026-07-11T08:12:00Z' }
  ]
};

// Database utility functions
const loadDB = (): DBState => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content) as DBState;
    }
  } catch (error) {
    console.error('Error reading database file, returning seed data:', error);
  }
  // Initialize and write seed database
  saveDB(initialDB);
  return initialDB;
};

const saveDB = (db: DBState): void => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
};

// Helper to log user activities
const logActivity = (userId: string, userName: string, action: string, projectId?: string, projectName?: string, taskId?: string, taskTitle?: string) => {
  const db = loadDB();
  const newLog: ActivityLog = {
    id: 'al-' + Date.now() + '-' + Math.round(Math.random() * 1000),
    userId,
    userName,
    action,
    projectId,
    projectName,
    taskId,
    taskTitle,
    createdAt: new Date().toISOString()
  };
  db.activityLogs.unshift(newLog);
  // Cap logs at 200 items
  if (db.activityLogs.length > 200) {
    db.activityLogs = db.activityLogs.slice(0, 200);
  }
  saveDB(db);
};

// Start setting up Express App
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serve static uploaded files
  app.use('/data/uploads', express.static(UPLOADS_DIR));

  // Serve mock downloadable attachment for the seed attachment
  app.get('/api/attachments/download/seed-reporting_spec_draft.pdf', (req, res) => {
    // Generate an empty or small PDF mock in-memory for download safety
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporting_spec_draft.pdf');
    res.send(Buffer.from('%PDF-1.4 ... mockup pdf content for demo purposes ...'));
  });

  // Authentication Middleware
  const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Missing authorization token.' });
    }
    const userId = authHeader.split(' ')[1];
    const db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. User not found.' });
    }
    req.user = user;
    next();
  };

  // Auth Endpoint: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    // Verify password simple hashing/matching
    const savedPassword = db.passwords[user.id];
    if (savedPassword !== password) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    logActivity(user.id, user.name, 'Logged in');
    res.json({ token: user.id, user });
  });

  // Auth Endpoint: Register
  app.post('/api/auth/register', (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    const db = loadDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }
    const userId = 'u-' + Date.now() + '-' + Math.round(Math.random() * 1000);
    // Auto initials avatar
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const newUser: User = {
      id: userId,
      email,
      name,
      role: (role as UserRole) || 'Team Member',
      avatar: initials
    };
    db.users.push(newUser);
    db.passwords[userId] = password;
    saveDB(db);

    logActivity(userId, name, 'Registered new user account');
    res.json({ token: userId, user: newUser });
  });

  // Auth Endpoint: Fetch Profile
  app.get('/api/auth/profile', authenticate, (req, res) => {
    res.json({ user: req.user });
  });

  // Auth Endpoint: Update Profile
  app.put('/api/auth/profile', authenticate, (req, res) => {
    const { name, bio, skills } = req.body;
    const db = loadDB();
    const index = db.users.findIndex(u => u.id === req.user.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : db.users[index].avatar;
    db.users[index] = {
      ...db.users[index],
      name: name || db.users[index].name,
      avatar: initials,
      bio: bio !== undefined ? bio : db.users[index].bio,
      skills: skills !== undefined ? skills : db.users[index].skills
    };
    saveDB(db);
    logActivity(req.user.id, db.users[index].name, 'Updated user profile details');
    res.json({ user: db.users[index] });
  });

  // Auth Endpoint: Change Password
  app.put('/api/auth/change-password', authenticate, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    const db = loadDB();
    if (db.passwords[req.user.id] !== currentPassword) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }
    db.passwords[req.user.id] = newPassword;
    saveDB(db);
    logActivity(req.user.id, req.user.name, 'Changed password successfully');
    res.json({ message: 'Password changed successfully' });
  });

  // Auth Endpoint: Forgot / Reset Password
  app.post('/api/auth/reset-password-request', (req, res) => {
    const { email } = req.body;
    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Email not found.' });
    }
    // Simulation: generate link/code and allow instant updating
    res.json({ message: 'Reset password code has been simulated.', userId: user.id });
  });

  app.post('/api/auth/reset-password-confirm', (req, res) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    const db = loadDB();
    if (!db.passwords[userId]) return res.status(404).json({ error: 'User profile not found' });
    db.passwords[userId] = newPassword;
    saveDB(db);
    res.json({ message: 'Password reset successfully' });
  });

  // General User fetching (for assignment, team views)
  app.get('/api/users', authenticate, (req, res) => {
    const db = loadDB();
    res.json({ users: db.users });
  });

  // User Administration
  app.get('/api/admin/users', authenticate, (req, res) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden. Admin role required.' });
    }
    const db = loadDB();
    res.json({ users: db.users });
  });

  app.put('/api/admin/users/:userId', authenticate, (req, res) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden. Admin role required.' });
    }
    const { role } = req.body;
    const { userId } = req.params;
    const db = loadDB();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    db.users[index].role = role;
    saveDB(db);
    logActivity(req.user.id, req.user.name, `Changed user ${db.users[index].name} role to ${role}`);
    res.json({ user: db.users[index] });
  });

  app.delete('/api/admin/users/:userId', authenticate, (req, res) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden. Admin role required.' });
    }
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete yourself.' });
    }
    const db = loadDB();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    const deletedName = db.users[index].name;
    db.users.splice(index, 1);
    delete db.passwords[userId];
    saveDB(db);
    logActivity(req.user.id, req.user.name, `Deleted user account "${deletedName}"`);
    res.json({ message: 'User deleted successfully' });
  });

  // Projects Endpoints
  app.get('/api/projects', authenticate, (req, res) => {
    const db = loadDB();
    // Filter projects based on user assignment (or if Admin, show all)
    let projects = db.projects;
    if (req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
      projects = db.projects.filter(p => p.members.includes(req.user.id) || p.managerId === req.user.id);
    }
    res.json({ projects });
  });

  app.post('/api/projects', authenticate, (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
      return res.status(403).json({ error: 'Unauthorized to create projects.' });
    }
    const { name, description, coverImage, startDate, endDate, priority, members } = req.body;
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'Project name, start date and end date are required.' });
    }
    const db = loadDB();
    const projectId = 'p-' + Date.now();
    const newProject: Project = {
      id: projectId,
      name,
      description: description || '',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
      startDate,
      endDate,
      priority: priority || 'Medium',
      status: 'Active',
      members: members || [req.user.id],
      managerId: req.user.id,
      createdAt: new Date().toISOString()
    };
    db.projects.push(newProject);

    // Auto-create default boards for the new project
    const defaultBoardNames = ['To Do', 'In Progress', 'Completed'];
    defaultBoardNames.forEach((bName, index) => {
      db.boards.push({
        id: 'b-' + Date.now() + '-' + index,
        projectId,
        name: bName,
        order: index
      });
    });

    saveDB(db);
    logActivity(req.user.id, req.user.name, `Created project "${name}"`, projectId, name);
    res.json({ project: newProject });
  });

  app.put('/api/projects/:projectId', authenticate, (req, res) => {
    const { projectId } = req.params;
    const db = loadDB();
    const index = db.projects.findIndex(p => p.id === projectId);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });

    // Validate permission (Admin or manager of project)
    if (req.user.role !== 'Admin' && db.projects[index].managerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this project.' });
    }

    const { name, description, coverImage, startDate, endDate, priority, status, members } = req.body;
    db.projects[index] = {
      ...db.projects[index],
      name: name !== undefined ? name : db.projects[index].name,
      description: description !== undefined ? description : db.projects[index].description,
      coverImage: coverImage !== undefined ? coverImage : db.projects[index].coverImage,
      startDate: startDate !== undefined ? startDate : db.projects[index].startDate,
      endDate: endDate !== undefined ? endDate : db.projects[index].endDate,
      priority: priority !== undefined ? priority : db.projects[index].priority,
      status: status !== undefined ? status : db.projects[index].status,
      members: members !== undefined ? members : db.projects[index].members
    };
    saveDB(db);
    logActivity(req.user.id, req.user.name, `Updated project details for "${db.projects[index].name}"`, projectId, db.projects[index].name);
    res.json({ project: db.projects[index] });
  });

  app.delete('/api/projects/:projectId', authenticate, (req, res) => {
    const { projectId } = req.params;
    const db = loadDB();
    const index = db.projects.findIndex(p => p.id === projectId);
    if (index === -1) return res.status(404).json({ error: 'Project not found' });

    if (req.user.role !== 'Admin' && db.projects[index].managerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this project.' });
    }

    const deletedName = db.projects[index].name;
    db.projects.splice(index, 1);
    // Delete cascading boards, tasks, comments, etc.
    db.boards = db.boards.filter(b => b.projectId !== projectId);
    db.tasks = db.tasks.filter(t => t.projectId !== projectId);
    db.comments = db.comments.filter(c => !db.tasks.find(t => t.id === c.taskId && t.projectId === projectId));
    db.subtasks = db.subtasks.filter(s => !db.tasks.find(t => t.id === s.taskId && t.projectId === projectId));
    db.attachments = db.attachments.filter(a => a.projectId !== projectId);

    saveDB(db);
    logActivity(req.user.id, req.user.name, `Deleted project "${deletedName}"`);
    res.json({ message: 'Project and all related data deleted successfully' });
  });

  // Boards Endpoints
  app.get('/api/boards/:projectId', authenticate, (req, res) => {
    const { projectId } = req.params;
    const db = loadDB();
    const boards = db.boards
      .filter(b => b.projectId === projectId)
      .sort((a, b) => a.order - b.order);
    res.json({ boards });
  });

  app.post('/api/boards', authenticate, (req, res) => {
    const { projectId, name } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ error: 'Project ID and board name are required.' });
    }
    const db = loadDB();
    const order = db.boards.filter(b => b.projectId === projectId).length;
    const boardId = 'b-' + Date.now();
    const newBoard: Board = { id: boardId, projectId, name, order };
    db.boards.push(newBoard);
    saveDB(db);

    const project = db.projects.find(p => p.id === projectId);
    logActivity(req.user.id, req.user.name, `Created board list "${name}"`, projectId, project?.name);
    res.json({ board: newBoard });
  });

  app.put('/api/boards/:boardId', authenticate, (req, res) => {
    const { boardId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const db = loadDB();
    const index = db.boards.findIndex(b => b.id === boardId);
    if (index === -1) return res.status(404).json({ error: 'Board list not found' });

    db.boards[index].name = name;
    saveDB(db);
    res.json({ board: db.boards[index] });
  });

  app.delete('/api/boards/:boardId', authenticate, (req, res) => {
    const { boardId } = req.params;
    const db = loadDB();
    const index = db.boards.findIndex(b => b.id === boardId);
    if (index === -1) return res.status(404).json({ error: 'Board list not found' });

    const board = db.boards[index];
    db.boards.splice(index, 1);
    // Delete cascading tasks on this board
    const tasksToDelete = db.tasks.filter(t => t.boardId === boardId);
    db.tasks = db.tasks.filter(t => t.boardId !== boardId);
    tasksToDelete.forEach(t => {
      db.subtasks = db.subtasks.filter(s => s.taskId !== t.id);
      db.comments = db.comments.filter(c => c.taskId !== t.id);
      db.attachments = db.attachments.filter(a => a.taskId !== t.id);
    });

    saveDB(db);
    res.json({ message: 'Board list and its tasks deleted successfully' });
  });

  // Tasks Endpoints
  app.get('/api/tasks/:projectId', authenticate, (req, res) => {
    const { projectId } = req.params;
    const db = loadDB();
    const tasks = db.tasks.filter(t => t.projectId === projectId);
    res.json({ tasks });
  });

  app.post('/api/tasks', authenticate, (req, res) => {
    const { boardId, projectId, title, description, priority, dueDate, assignedUserId, labels, status } = req.body;
    if (!boardId || !projectId || !title) {
      return res.status(400).json({ error: 'Board ID, Project ID and title are required.' });
    }
    const db = loadDB();
    const order = db.tasks.filter(t => t.boardId === boardId).length;
    const taskId = 't-' + Date.now();
    const newTask: Task = {
      id: taskId,
      boardId,
      projectId,
      title,
      description: description || '',
      priority: priority || 'Medium',
      dueDate,
      assignedUserId,
      labels: labels || [],
      status: status || 'Todo',
      progressBar: 0,
      order,
      createdAt: new Date().toISOString()
    };
    db.tasks.push(newTask);
    saveDB(db);

    const project = db.projects.find(p => p.id === projectId);
    logActivity(req.user.id, req.user.name, `Created task "${title}"`, projectId, project?.name, taskId, title);

    // Notify assigned user
    if (assignedUserId && assignedUserId !== req.user.id) {
      const newNotification: Notification = {
        id: 'n-' + Date.now(),
        userId: assignedUserId,
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you the task "${title}".`,
        type: 'task_assigned',
        read: false,
        createdAt: new Date().toISOString()
      };
      db.notifications.unshift(newNotification);
      saveDB(db);
    }

    res.json({ task: newTask });
  });

  app.put('/api/tasks/:taskId', authenticate, (req, res) => {
    const { taskId } = req.params;
    const db = loadDB();
    const index = db.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    const previousTask = { ...db.tasks[index] };
    const { boardId, title, description, priority, dueDate, assignedUserId, labels, status } = req.body;

    db.tasks[index] = {
      ...db.tasks[index],
      boardId: boardId !== undefined ? boardId : db.tasks[index].boardId,
      title: title !== undefined ? title : db.tasks[index].title,
      description: description !== undefined ? description : db.tasks[index].description,
      priority: priority !== undefined ? priority : db.tasks[index].priority,
      dueDate: dueDate !== undefined ? dueDate : db.tasks[index].dueDate,
      assignedUserId: assignedUserId !== undefined ? assignedUserId : db.tasks[index].assignedUserId,
      labels: labels !== undefined ? labels : db.tasks[index].labels,
      status: status !== undefined ? status : db.tasks[index].status
    };

    saveDB(db);

    const project = db.projects.find(p => p.id === db.tasks[index].projectId);

    // If status changed to completed, notify manager or project admin
    if (status === 'Completed' && previousTask.status !== 'Completed') {
      logActivity(req.user.id, req.user.name, `Marked task "${db.tasks[index].title}" as Completed`, db.tasks[index].projectId, project?.name, taskId, db.tasks[index].title);
      // Notify PM
      if (project && project.managerId !== req.user.id) {
        db.notifications.unshift({
          id: 'n-' + Date.now(),
          userId: project.managerId,
          title: 'Task Completed',
          message: `${req.user.name} completed the task "${db.tasks[index].title}".`,
          type: 'task_completed',
          read: false,
          createdAt: new Date().toISOString()
        });
        saveDB(db);
      }
    } else {
      logActivity(req.user.id, req.user.name, `Updated task details for "${db.tasks[index].title}"`, db.tasks[index].projectId, project?.name, taskId, db.tasks[index].title);
    }

    // Handle new assignment notifications
    if (assignedUserId && assignedUserId !== previousTask.assignedUserId && assignedUserId !== req.user.id) {
      db.notifications.unshift({
        id: 'n-' + Date.now() + '-assign',
        userId: assignedUserId,
        title: 'Task Assigned',
        message: `${req.user.name} assigned you the task "${db.tasks[index].title}".`,
        type: 'task_assigned',
        read: false,
        createdAt: new Date().toISOString()
      });
      saveDB(db);
    }

    res.json({ task: db.tasks[index] });
  });

  // Task Move Endpoint (Drag & Drop Reordering and state sync)
  app.post('/api/tasks/move', authenticate, (req, res) => {
    const { taskId, destinationBoardId, newOrder } = req.body;
    if (!taskId || !destinationBoardId) {
      return res.status(400).json({ error: 'Missing taskId or destinationBoardId' });
    }
    const db = loadDB();
    const taskIndex = db.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

    const task = db.tasks[taskIndex];
    const sourceBoardId = task.boardId;
    const project = db.projects.find(p => p.id === task.projectId);

    // Update board ID
    task.boardId = destinationBoardId;

    // Get the destination board name to check if status needs auto updating
    const destBoard = db.boards.find(b => b.id === destinationBoardId);
    if (destBoard) {
      const mappedStatus: Record<string, TaskStatus> = {
        'Todo': 'Todo',
        'To Do': 'Todo',
        'In Progress': 'In Progress',
        'Review': 'Review',
        'Testing': 'Testing',
        'Completed': 'Completed'
      };
      if (mappedStatus[destBoard.name]) {
        task.status = mappedStatus[destBoard.name];
      }
    }

    // Reorder task list inside both boards
    const sourceTasks = db.tasks.filter(t => t.boardId === sourceBoardId && t.id !== taskId).sort((a, b) => a.order - b.order);
    const destTasks = db.tasks.filter(t => t.boardId === destinationBoardId && t.id !== taskId).sort((a, b) => a.order - b.order);

    // Insert task into destination tasks at specific newOrder index
    destTasks.splice(newOrder !== undefined ? newOrder : destTasks.length, 0, task);

    // Reassign orders
    sourceTasks.forEach((t, i) => t.order = i);
    destTasks.forEach((t, i) => t.order = i);

    saveDB(db);
    logActivity(req.user.id, req.user.name, `Moved task "${task.title}" to board "${destBoard ? destBoard.name : destinationBoardId}"`, task.projectId, project?.name, task.id, task.title);

    res.json({ success: true, tasks: db.tasks.filter(t => t.projectId === task.projectId) });
  });

  app.delete('/api/tasks/:taskId', authenticate, (req, res) => {
    const { taskId } = req.params;
    const db = loadDB();
    const index = db.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    const task = db.tasks[index];
    db.tasks.splice(index, 1);
    // Cascadings
    db.subtasks = db.subtasks.filter(s => s.taskId !== taskId);
    db.comments = db.comments.filter(c => c.taskId !== taskId);
    db.attachments = db.attachments.filter(a => a.taskId !== taskId);

    saveDB(db);
    const project = db.projects.find(p => p.id === task.projectId);
    logActivity(req.user.id, req.user.name, `Deleted task "${task.title}"`, task.projectId, project?.name);
    res.json({ message: 'Task deleted successfully' });
  });

  // Duplicate Task
  app.post('/api/tasks/:taskId/duplicate', authenticate, (req, res) => {
    const { taskId } = req.params;
    const db = loadDB();
    const task = db.tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const newId = 't-' + Date.now();
    const order = db.tasks.filter(t => t.boardId === task.boardId).length;
    const duplicated: Task = {
      ...task,
      id: newId,
      title: `${task.title} (Copy)`,
      order,
      createdAt: new Date().toISOString()
    };
    db.tasks.push(duplicated);

    // Duplicate subtasks
    const subtasks = db.subtasks.filter(s => s.taskId === taskId);
    subtasks.forEach(s => {
      db.subtasks.push({
        id: 's-' + Date.now() + '-' + Math.round(Math.random() * 1000),
        taskId: newId,
        title: s.title,
        completed: s.completed
      });
    });

    saveDB(db);
    const project = db.projects.find(p => p.id === task.projectId);
    logActivity(req.user.id, req.user.name, `Duplicated task "${task.title}"`, task.projectId, project?.name, newId, duplicated.title);

    res.json({ task: duplicated });
  });

  // Subtasks/Checklists Endpoints
  app.get('/api/subtasks/:taskId', authenticate, (req, res) => {
    const { taskId } = req.params;
    const db = loadDB();
    const subtasks = db.subtasks.filter(s => s.taskId === taskId);
    res.json({ subtasks });
  });

  app.post('/api/subtasks', authenticate, (req, res) => {
    const { taskId, title } = req.body;
    if (!taskId || !title) return res.status(400).json({ error: 'Task ID and title are required.' });

    const db = loadDB();
    const subtaskId = 's-' + Date.now();
    const newSub: Subtask = { id: subtaskId, taskId, title, completed: false };
    db.subtasks.push(newSub);

    // Recalculate progress bar
    const taskIndex = db.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const taskSubs = db.subtasks.filter(s => s.taskId === taskId);
      const completedCount = taskSubs.filter(s => s.completed).length;
      db.tasks[taskIndex].progressBar = Math.round((completedCount / taskSubs.length) * 100);
    }

    saveDB(db);
    res.json({ subtask: newSub });
  });

  app.put('/api/subtasks/:subtaskId', authenticate, (req, res) => {
    const { subtaskId } = req.params;
    const { completed, title } = req.body;
    const db = loadDB();
    const index = db.subtasks.findIndex(s => s.id === subtaskId);
    if (index === -1) return res.status(404).json({ error: 'Subtask not found' });

    const taskId = db.subtasks[index].taskId;
    db.subtasks[index].completed = completed !== undefined ? completed : db.subtasks[index].completed;
    db.subtasks[index].title = title !== undefined ? title : db.subtasks[index].title;

    // Recalculate progress bar
    const taskIndex = db.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const taskSubs = db.subtasks.filter(s => s.taskId === taskId);
      const completedCount = taskSubs.filter(s => s.completed).length;
      db.tasks[taskIndex].progressBar = Math.round((completedCount / taskSubs.length) * 100);
    }

    saveDB(db);
    res.json({ subtask: db.subtasks[index] });
  });

  app.delete('/api/subtasks/:subtaskId', authenticate, (req, res) => {
    const { subtaskId } = req.params;
    const db = loadDB();
    const index = db.subtasks.findIndex(s => s.id === subtaskId);
    if (index === -1) return res.status(404).json({ error: 'Subtask not found' });

    const taskId = db.subtasks[index].taskId;
    db.subtasks.splice(index, 1);

    // Recalculate progress bar
    const taskIndex = db.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const taskSubs = db.subtasks.filter(s => s.taskId === taskId);
      if (taskSubs.length === 0) {
        db.tasks[taskIndex].progressBar = 0;
      } else {
        const completedCount = taskSubs.filter(s => s.completed).length;
        db.tasks[taskIndex].progressBar = Math.round((completedCount / taskSubs.length) * 100);
      }
    }

    saveDB(db);
    res.json({ message: 'Subtask deleted successfully' });
  });

  // Comments Endpoints
  app.get('/api/comments/:taskId', authenticate, (req, res) => {
    const { taskId } = req.params;
    const db = loadDB();
    const comments = db.comments.filter(c => c.taskId === taskId);
    res.json({ comments });
  });

  app.post('/api/comments', authenticate, (req, res) => {
    const { taskId, text, parentId } = req.body;
    if (!taskId || !text) return res.status(400).json({ error: 'Task ID and text are required.' });

    const db = loadDB();
    const commentId = 'c-' + Date.now();
    const newComment: Comment = {
      id: commentId,
      taskId,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      text,
      createdAt: new Date().toISOString(),
      parentId
    };
    db.comments.push(newComment);

    const task = db.tasks.find(t => t.id === taskId);
    const project = db.projects.find(p => p.id === task?.projectId);
    logActivity(req.user.id, req.user.name, `Added comment on task "${task?.title}"`, task?.projectId, project?.name, taskId, task?.title);

    // Notify assignee if someone else comments
    if (task && task.assignedUserId && task.assignedUserId !== req.user.id) {
      db.notifications.unshift({
        id: 'n-' + Date.now(),
        userId: task.assignedUserId,
        title: 'New Comment',
        message: `${req.user.name} commented on "${task.title}".`,
        type: 'comment_added',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    // Check for mentions like @Kevin or @Alex Developer
    db.users.forEach(u => {
      if (u.id !== req.user.id && text.toLowerCase().includes(`@${u.name.toLowerCase()}`)) {
        db.notifications.unshift({
          id: 'n-mention-' + Date.now(),
          userId: u.id,
          title: 'Mentioned in comment',
          message: `${req.user.name} mentioned you in a comment on "${task?.title}".`,
          type: 'mention',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    saveDB(db);
    res.json({ comment: newComment });
  });

  app.delete('/api/comments/:commentId', authenticate, (req, res) => {
    const { commentId } = req.params;
    const db = loadDB();
    const index = db.comments.findIndex(c => c.id === commentId);
    if (index === -1) return res.status(404).json({ error: 'Comment not found' });

    // Restrict deletion to owner or admin
    if (db.comments[index].userId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment.' });
    }

    db.comments.splice(index, 1);
    saveDB(db);
    res.json({ message: 'Comment deleted successfully' });
  });

  // Attachments Endpoints
  app.get('/api/attachments/:projectId', authenticate, (req, res) => {
    const { projectId } = req.params;
    const db = loadDB();
    const attachments = db.attachments.filter(a => a.projectId === projectId);
    res.json({ attachments });
  });

  app.post('/api/attachments/upload', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { taskId, projectId } = req.body;
    if (!taskId || !projectId) {
      return res.status(400).json({ error: 'Task ID and Project ID are required' });
    }

    const db = loadDB();
    const attachmentId = 'a-' + Date.now();
    const newAttachment: Attachment = {
      id: attachmentId,
      taskId,
      projectId,
      fileName: req.file.originalname,
      filePath: `/data/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      uploadedByName: req.user.name,
      createdAt: new Date().toISOString()
    };
    db.attachments.push(newAttachment);

    const task = db.tasks.find(t => t.id === taskId);
    const project = db.projects.find(p => p.id === projectId);
    logActivity(req.user.id, req.user.name, `Uploaded file "${req.file.originalname}" to task "${task?.title}"`, projectId, project?.name, taskId, task?.title);

    saveDB(db);
    res.json({ attachment: newAttachment });
  });

  app.delete('/api/attachments/:attachmentId', authenticate, (req, res) => {
    const { attachmentId } = req.params;
    const db = loadDB();
    const index = db.attachments.findIndex(a => a.id === attachmentId);
    if (index === -1) return res.status(404).json({ error: 'Attachment not found' });

    const attachment = db.attachments[index];
    
    // Check permission
    if (attachment.uploadedBy !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
      return res.status(403).json({ error: 'Unauthorized to delete this attachment' });
    }

    // Try deleting physical file (unless it is a seed mockup)
    if (attachment.filePath.startsWith('/data/uploads/')) {
      const fileName = attachment.filePath.split('/').pop();
      if (fileName) {
        const fullPath = path.join(UPLOADS_DIR, fileName);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    db.attachments.splice(index, 1);
    saveDB(db);
    res.json({ message: 'Attachment deleted successfully' });
  });

  // Notifications Endpoints
  app.get('/api/notifications', authenticate, (req, res) => {
    const db = loadDB();
    const notifications = db.notifications.filter(n => n.userId === req.user.id);
    res.json({ notifications });
  });

  app.put('/api/notifications/:notificationId/read', authenticate, (req, res) => {
    const { notificationId } = req.params;
    const db = loadDB();
    const index = db.notifications.findIndex(n => n.id === notificationId && n.userId === req.user.id);
    if (index !== -1) {
      db.notifications[index].read = true;
      saveDB(db);
    }
    res.json({ success: true });
  });

  app.put('/api/notifications/read-all', authenticate, (req, res) => {
    const db = loadDB();
    db.notifications.forEach(n => {
      if (n.userId === req.user.id) {
        n.read = true;
      }
    });
    saveDB(db);
    res.json({ success: true });
  });

  app.delete('/api/notifications/:notificationId', authenticate, (req, res) => {
    const { notificationId } = req.params;
    const db = loadDB();
    db.notifications = db.notifications.filter(n => !(n.id === notificationId && n.userId === req.user.id));
    saveDB(db);
    res.json({ success: true });
  });

  // Chat/Collaboration Endpoints
  app.get('/api/chat/:projectId', authenticate, (req, res) => {
    const { projectId } = req.params;
    const db = loadDB();
    const messages = db.chatMessages.filter(m => m.projectId === projectId);
    res.json({ messages });
  });

  app.post('/api/chat', authenticate, (req, res) => {
    const { projectId, text } = req.body;
    if (!projectId || !text) return res.status(400).json({ error: 'Project ID and message text are required.' });

    const db = loadDB();
    const messageId = 'ch-' + Date.now();
    const newMessage: ChatMessage = {
      id: messageId,
      projectId,
      userId: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      text,
      createdAt: new Date().toISOString()
    };
    db.chatMessages.push(newMessage);
    saveDB(db);
    res.json({ message: newMessage });
  });

  // Activity Logs Endpoint
  app.get('/api/activity-logs', authenticate, (req, res) => {
    const db = loadDB();
    res.json({ activityLogs: db.activityLogs });
  });

  // Reporting and Statistics Endpoint
  app.get('/api/reports/:projectId', authenticate, (req, res) => {
    const { projectId } = req.params;
    const db = loadDB();

    const project = db.projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const projectTasks = db.tasks.filter(t => t.projectId === projectId);
    const completedTasks = projectTasks.filter(t => t.status === 'Completed');
    const testingTasks = projectTasks.filter(t => t.status === 'Testing');
    const reviewTasks = projectTasks.filter(t => t.status === 'Review');
    const progressTasks = projectTasks.filter(t => t.status === 'In Progress');
    const todoTasks = projectTasks.filter(t => t.status === 'Todo');

    // Productivity by team member (Count of completed tasks vs total assigned tasks)
    const productivity: Record<string, { name: string; completed: number; total: number }> = {};
    
    // Initialize for all project members
    project.members.forEach(mId => {
      const user = db.users.find(u => u.id === mId);
      if (user) {
        productivity[mId] = { name: user.name, completed: 0, total: 0 };
      }
    });

    projectTasks.forEach(task => {
      if (task.assignedUserId && productivity[task.assignedUserId]) {
        productivity[task.assignedUserId].total += 1;
        if (task.status === 'Completed') {
          productivity[task.assignedUserId].completed += 1;
        }
      }
    });

    const report = {
      projectId,
      projectName: project.name,
      stats: {
        total: projectTasks.length,
        todo: todoTasks.length,
        inProgress: progressTasks.length,
        review: reviewTasks.length,
        testing: testingTasks.length,
        completed: completedTasks.length
      },
      productivity: Object.values(productivity)
    };

    res.json({ report });
  });

  // Vite development or production routing
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

// Global typing extension to Express Request
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

startServer();
