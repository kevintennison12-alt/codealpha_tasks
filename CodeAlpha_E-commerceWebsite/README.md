# ModernStore — Full-Stack E-Commerce Platform

A fully featured e-commerce web application built with React, TypeScript, Express, and Tailwind CSS. It simulates a real-world online store with a complete shopping experience for customers and a management dashboard for administrators.

---

## What Is This Project?

ModernStore is a single-page application (SPA) that covers the entire e-commerce lifecycle — from browsing products to placing an order — backed by a lightweight Node.js/Express server that handles authentication, order management, and data persistence via a local JSON file (`db.json`).

The app ships with 31 pre-seeded products across 6 categories and two demo accounts (a regular user and an admin), so you can run it and explore every feature immediately.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Backend | Express.js (Node.js) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Dev Server | Vite 6 (served via Express in dev) |
| AI Integration | Google Generative AI (`@google/genai`) |
| Build | esbuild (server), Vite (client) |

---

## Project Structure

```
Ecommerce-Website-main/
├── server.ts              # Express API server (auth, products, orders, admin)
├── db.json                # File-based database (users, products, orders, coupons)
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component + footer
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── index.css          # Global styles
│   └── components/
│       ├── AppContext.tsx        # Global state (auth, cart, wishlist, routing)
│       ├── Navbar.tsx            # Navigation bar with search, cart, theme toggle
│       ├── LandingPage.tsx       # Hero section, featured products, categories
│       ├── ProductListingPage.tsx# Browse, filter, sort, and search products
│       ├── ProductDetailsPage.tsx# Full product view with images, specs, reviews
│       ├── CartPage.tsx          # Cart management with coupon codes
│       ├── CheckoutPage.tsx      # Multi-step checkout with payment forms
│       ├── AuthPage.tsx          # Login and registration forms
│       ├── UserDashboard.tsx     # Order history, profile, wishlist management
│       ├── AdminDashboard.tsx    # Product/order/user management + analytics
│       └── Toast.tsx             # Slide-in notification system
├── .env                   # Environment variables (JWT secret, etc.)
├── vite.config.ts
└── package.json
```

---

## Core Features

### Storefront
- Landing page with hero banner, featured products, and category quick-links
- Product listing page with search, category filters, and sort options (price, rating, discount)
- Product detail page with image gallery, specifications, star ratings, and customer reviews
- Dark mode support with smooth theme transitions

### Shopping
- Add to cart with quantity control
- Wishlist (save products for later)
- Coupon code system with percentage discounts and minimum spend requirements
- Cart persists across sessions via JWT-based server sync

### Checkout
- Multi-step checkout flow: address → payment → confirmation
- Three payment methods: Credit Card, UPI, Cash on Delivery
- GST calculation and dynamic shipping cost
- Saved addresses from user profile auto-populate
- Order confirmation screen with order ID and summary

### Authentication
- JWT-based login and registration
- Password hashing with bcrypt
- Persistent sessions via localStorage token
- Role-based access (`user` / `admin`)

### User Dashboard
- View full order history with status tracking (Pending → Processing → Shipped → Delivered → Cancelled)
- Edit profile: name, phone, and saved delivery addresses
- Delete account

### Admin Dashboard
- Product management: add, edit, and delete products
- Order management: view all orders and update order status
- User management: view all registered users
- Sales analytics: revenue charts, category share breakdown, and platform stats

---

## Product Categories

The store ships with 31 products across these categories:

- **Electronics** — Headphones, smartwatch, keyboard, laptop, projector, speaker
- **Fashion** — Jackets, shoes, hoodies, sunglasses, athletic wear
- **Home & Living** — Espresso machine, desk lamp, office chair, air purifier, candles, mugs
- **Fitness & Wellness** — Yoga mat, water bottle, massage gun, dumbbells, diffuser
- **Accessories** — Cardholder, travel backpack, duffel bag, laptop sleeve, umbrella
- **Beauty & Wellness** — Skincare kit, hair dryer, facial roller

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
cd Ecommerce-Website-main
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and set your variables:

```bash
JWT_SECRET=your_secret_key_here
```

### Run in Development

```bash
npm run dev
```

This starts the Express server at `http://localhost:3000`. Vite is served through Express in dev mode, so you only need one terminal.

### Production Build

```bash
npm run build
npm start
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Customer | user@gmail.com | password123 |
| Admin | admin@gmail.com | admin123 |

> Passwords shown above are the seeded defaults. Check `db.json` for current hashed values if they have been changed.

---

## API Overview

The Express server exposes a REST API under `/api`:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Authenticate and receive JWT |
| GET | `/api/products` | Fetch all products |
| GET | `/api/products/:id` | Fetch single product |
| GET | `/api/cart` | Get user's server-synced cart |
| POST | `/api/cart/sync` | Sync cart items |
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders` | Get current user's orders |
| GET | `/api/coupons/validate` | Validate a coupon code |
| GET | `/api/profile` | Get current user profile |
| PUT | `/api/profile` | Update profile |
| DELETE | `/api/profile` | Delete account |
| GET | `/api/admin/products` | Admin: all products |
| POST | `/api/admin/products` | Admin: create product |
| PUT | `/api/admin/products/:id` | Admin: update product |
| DELETE | `/api/admin/products/:id` | Admin: delete product |
| GET | `/api/admin/orders` | Admin: all orders |
| PUT | `/api/admin/orders/:id` | Admin: update order status |
| GET | `/api/admin/users` | Admin: all users |
| GET | `/api/admin/stats` | Admin: sales statistics |

Protected routes require an `Authorization: Bearer <token>` header. Admin routes additionally verify the `admin` role.

---

## License

Apache-2.0
