# 🗂️ ProManage — Project Management Tool

> A full-stack project management web app built with React, TypeScript, Express, and Tailwind CSS — featuring AI-powered chat, Kanban boards, team collaboration, and real-time activity tracking.

---

## ✨ Features

### 🔐 Authentication & Role-Based Access
- Secure JWT-based login and session management
- Three user roles: **Admin**, **Project Manager**, and **Team Member**
- Profile management with bio and skills

### 📊 Dashboard
- Live overview of active projects, pending tasks, and overdue items
- Tasks-by-status donut chart with percentage breakdown
- Weekly productivity bar chart
- Team performance leaderboard ranked by task completion rate
- Per-project progress bars with priority indicators
- Recent activity feed

### 📁 Projects
- Create, edit, and delete projects with cover images
- Set priority levels: Low, Medium, High, Critical
- Track project status: Active, Completed, Archived
- Assign team members and project managers
- Start and end date scheduling

### 📌 Kanban Board
- Drag-and-drop task management across custom columns
- Task detail panel with description, labels, due dates, and assignees
- Subtask checklists with progress tracking
- File attachments with upload support
- Comments and threaded replies
- Task priority and status badges

### 📅 Calendar View
- Monthly calendar with task due date visualization
- Click-through to task details directly from calendar events

### 💬 Team Chat
- Project-scoped messaging channels
- Global team chat room
- Real-time message feed per project context

### 📈 Reports
- Project completion analytics
- Task distribution summaries
- Exportable insights per project

### 🛡️ Admin Panel
- User management: view, assign roles, and remove members
- Organization-wide control for admins

### 🔔 Notifications
- In-app notifications for task assignments, comments, due reminders, and mentions
- Mark individual or all notifications as read

### 📋 Activity Logs
- Full audit trail of all workspace actions
- Timestamped records per user and project

### 🌙 Dark Mode
- Persistent light/dark theme toggle stored per user session

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Backend | Node.js, Express |
| AI Integration | Google Gemini (`@google/genai`) |
| File Uploads | Multer |
| Database | JSON flat-file (`data/db.json`) |
| Build Tool | Vite |
| Runtime | tsx (dev), esbuild (prod) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/kevintennison12-alt/codealpha_tasks.git
cd codealpha_tasks

# Install dependencies
npm install
```

### Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
# .env
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Run in Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── data/
│   └── db.json              # Flat-file JSON database
├── src/
│   ├── components/
│   │   ├── AdminView.tsx    # Admin user management panel
│   │   ├── AuthView.tsx     # Login / registration / profile
│   │   ├── CalendarView.tsx # Calendar with task due dates
│   │   ├── ChatView.tsx     # Team messaging
│   │   ├── DashboardView.tsx# Analytics & overview
│   │   ├── Header.tsx       # Top navigation bar
│   │   ├── KanbanView.tsx   # Drag-and-drop task board
│   │   ├── LogsView.tsx     # Activity audit log
│   │   ├── ProjectsView.tsx # Project management
│   │   ├── ReportsView.tsx  # Analytics & reports
│   │   └── Sidebar.tsx      # Navigation sidebar
│   ├── utils/
│   │   └── api.ts           # API client utility
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Root application component
│   └── main.tsx             # Entry point
├── server.ts                # Express backend server
└── vite.config.ts           # Vite configuration
```

---

## 👤 User Roles

| Role | Capabilities |
|------|-------------|
| Admin | Full access — manage users, roles, all projects |
| Project Manager | Create/manage projects, assign tasks, view reports |
| Team Member | View assigned tasks, update task status, comment |

---

## 📸 Views at a Glance

- **Dashboard** — your workspace at a glance with stats and charts
- **Projects** — manage all your projects in one place
- **Kanban** — drag tasks across columns, track progress visually
- **Calendar** — see what's due and when
- **Chat** — communicate with your team per project or globally
- **Reports** — measure team and project performance
- **Logs** — full history of every action in the workspace
- **Admin** — manage your team and their access levels

---

## 📄 License

This project is licensed under the Apache-2.0 License.

---

> Built as part of the **CodeAlpha** internship task series.
