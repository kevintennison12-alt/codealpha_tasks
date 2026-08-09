# BharatToday — Social Media App

A full-featured social media platform built with React, TypeScript, and Tailwind CSS, themed around Indian culture, news, and community. It runs entirely in the browser with state persisted to `localStorage` — no backend database required.

---

## Tech Stack

- React 19 + TypeScript
- Vite 6 (dev server & bundler)
- Tailwind CSS v4
- Framer Motion (`motion`) for animations
- Lucide React for icons
- Google Gemini AI (`@google/genai`) for AI-powered features
- Express (for optional server-side usage)

---

## Project Structure

```
src/
├── App.tsx               # Root component, routing between views
├── main.tsx              # Entry point
├── index.css             # Global styles
├── types.ts              # All TypeScript interfaces and types
├── components/
│   ├── Auth.tsx          # Login and registration screens
│   ├── Navbar.tsx        # Top header with search and notifications
│   ├── Sidebar.tsx       # Left navigation panel
│   ├── Feed.tsx          # Main post feed with create-post modal
│   ├── Explore.tsx       # Trending hashtags and content discovery
│   ├── Messaging.tsx     # Private direct messaging between users
│   ├── ProfileView.tsx   # User profile, followers, saved posts
│   ├── AdminDashboard.tsx# Admin-only moderation panel
│   ├── IndiaNews.tsx     # Curated India news feed with categories
│   └── Stories.tsx       # Stories bar component
└── data/
    ├── initialData.ts    # Seed data: users, posts, messages, etc.
    └── store.tsx         # Global state via React Context + localStorage
```

---

## Features

### Authentication
- Login with any seeded username (no password required in demo mode)
- Register a new account with username, email, and full name
- Role-based access: `user` and `admin`
- Blocked users cannot log in

### Feed
- View posts from followed users
- Create posts with captions, image URLs, hashtags, location, and visibility (`public` / `followers` / `private`)
- Like, comment, and reply to comments (nested threads)
- Save/bookmark posts
- Pin your own posts to the top of your profile
- Delete your own posts
- Report posts for spam, abuse, fake content, or inappropriate material

### Explore
- Discover trending hashtags
- Filter and browse public posts by tag

### India News
- Curated news articles across categories: Cricket, Bollywood, Politics, Tech
- Search within news
- Share a news article directly as a post to your feed
- Inline comment simulation per article

### Messaging
- Private one-to-one conversations
- Unread message indicators
- Messages marked as read when conversation is opened

### Notifications
- Real-time in-app notifications for likes, comments, replies, follows, and messages
- Mark all as read / clear all

### Profile
- View and edit your own profile: avatar, cover photo, bio, location, website, phone
- View follower and following lists
- Remove followers
- Browse saved posts tab

### Admin Dashboard
- Platform-wide stats: total users, posts, comments, likes, engagement rate
- User management: block/unblock accounts
- Content moderation: resolve pending reports by deleting content or dismissing
- Activity log viewer

### Dark Mode
- Toggle between light and dark themes, persisted across sessions

---

## Data Model

All state lives in React Context and is synced to `localStorage` under `sm_*` keys.

| Type | Description |
|---|---|
| `User` | Account info, role, block status |
| `Profile` | Display name, bio, avatar, cover, location |
| `Post` | Caption, media URLs, hashtags, visibility |
| `Like` | User ↔ Post like relationship |
| `Comment` | Post comments with optional `parentId` for replies |
| `Follow` | Follower ↔ Following relationship |
| `Message` | Direct messages between two users |
| `Notification` | Like, comment, follow, reply, message events |
| `SavedPost` | Bookmarked posts per user |
| `Report` | Content reports with reason and resolution status |
| `ActivityLog` | Audit trail of user and admin actions |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for AI features |
| `APP_URL` | The URL where the app is hosted |

### 3. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### 4. Build for production

```bash
npm run build
```

---

## Demo Accounts

These accounts are pre-seeded and ready to use on first launch:

| Username | Role | Description |
|---|---|---|
| `kevin` | user | Tech enthusiast, default login |
| `virat_kohli` | user | Cricket celebrity profile |
| `delhi_explorer` | user | Travel and heritage blogger |
| `ranveer_kitchen` | user | Food and chef content |
| `admin` | admin | Full admin dashboard access |

> Tip: To access the Admin Dashboard, log in as `admin` and click the shield icon in the sidebar.

---

## Resetting App Data

All data is stored in `localStorage`. To reset to the original seed data, open your browser's DevTools console and run:

```js
Object.keys(localStorage).filter(k => k.startsWith('sm_')).forEach(k => localStorage.removeItem(k));
location.reload();
```
