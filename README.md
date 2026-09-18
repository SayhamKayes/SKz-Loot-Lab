# 🎮 SKz Top Up Lab — Full-Stack E-Commerce Gaming Hub

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-Fullstack-FF4154?logo=tanstack&logoColor=white)](https://tanstack.com/start)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**SKz Top Up Lab** is a modern, high-performance, full-stack e-commerce gaming web application built for instant game top-ups (PUBG UC, Free Fire Diamonds, MLBB Diamonds, Valorant VP, eFootball Coins, Roblox Robux, Digital Gift Cards) and gaming gadgets.

The platform is powered by **TanStack Start**, **React 19**, and a **PostgreSQL** relational database. It features a dedicated **User Panel** (`/user`), a secured **Admin Control Portal** (`/admin`), dynamic game/package CMS, and a streamlined 3-step checkout flow with Bangladeshi Mobile Financial Services (**bKash, Nagad, Rocket**) and Transaction ID (TrxID) verification.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
  - [High-Level Architecture](#1-high-level-architecture)
  - [Order & Payment Verification Lifecycle](#2-order--payment-verification-lifecycle)
  - [Database Entity-Relationship (ER) Diagram](#3-database-entity-relationship-er-diagram)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Database Schema](#-database-schema)
- [Getting Started & Installation](#-getting-started--installation)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Database Setup (Local or Cloud)](#database-setup-local-or-cloud)
- [Environment Configuration (`.env`)](#-environment-configuration-env)
- [Admin Portal (`/admin`) Guide](#-admin-portal-admin-guide)
- [User Panel (`/user`) Guide](#-user-panel-user-guide)
- [Production Build & Deployment](#-production-build--deployment)
- [License & Authors](#-license--authors)

---

## 🚀 Key Features

### 🛒 1. Dynamic Public Storefront
- **Instant Game Top-Ups**: Live catalog featuring popular titles like PUBG Mobile, Free Fire BD, Valorant, Mobile Legends, eFootball, Roblox, and Gift Cards.
- **Gaming Gadgets**: Catalog for physical mobile triggers, finger sleeves, RGB coolers, and peripherals.
- **Dynamic CMS Fetching**: Games, active tags (`HOT`, `NEW`, `TOP`), and pricing are fetched dynamically from PostgreSQL with instant server-side fallbacks.

### 👤 2. Dedicated User Panel (`/user`)
- **Seamless Navigation**: Clicking the **Account** button on the header immediately routes to `/user`.
- **Authentication**: Email/Phone and password login, and instant account registration with secure password hashing (`bcryptjs`).
- **Live Order Tracker**: Tracks orders in real-time with responsive visual status badges:
  - 🟡 **Pending Verification**: Awaiting admin verification of MFS TrxID.
  - 🔵 **Processing**: Top-up in progress.
  - 🟢 **Completed**: In-game currency successfully delivered.
  - 🔴 **Cancelled**: Order cancelled with explanatory admin notes.
- **Order Details**: In-game player ID, server ID, transaction ID, payment method, order date, and total paid in ৳ BDT.

### 🛡️ 3. Separate Admin Control Center (`/admin`)
- **Security Gate**: Independent login page authenticating against server environment credentials (`ADMIN_USERNAME` & `ADMIN_PASSWORD`).
- **Order Management & Fulfillment**:
  - Filter orders by status (`All`, `Pending`, `Processing`, `Completed`, `Cancelled`).
  - Search by Order ID, Phone, Player ID, Game Name, or TrxID.
  - **One-Click Copy Player ID**: For fast in-game delivery via top-up tools or official portals.
  - **One-Click Copy TrxID**: For cross-referencing against bKash/Nagad merchant statements.
  - **Instant Status Changer**: Update order status with optional custom admin notes.
  - **Direct WhatsApp Chat**: One-click button that pre-populates a WhatsApp message to the customer with their order details.
- **Games & Coin CMS**:
  - Add new games with cover art, slug, categories, delivery times, and required player fields (Player ID, Server ID, Character Name, etc.).
  - Edit or delete existing games.
  - Manage Coin/Diamond Packages: Add new denominations, adjust prices in ৳ BDT, and mark packages with the `POPULAR` badge.
- **MFS Payment Settings**:
  - Update official bKash, Nagad, Rocket, and WhatsApp support numbers displayed to customers during checkout without rebuilding code.

### 💳 4. Streamlined 3-Step Checkout Flow
1. **Step 1: Select Package**: Clean card selection showing coin quantity, price in ৳ BDT, and popular tags.
2. **Step 2: In-Game Details & Contact**: Input for Player ID, Server ID, and contact details (auto-filled if the user is logged in).
3. **Step 3: MFS Payment Verification**:
   - Choose between **bKash**, **Nagad**, or **Rocket**.
   - View official account number with a one-click **Copy Number** button and Send Money instructions.
   - Enter **Sender Mobile Number** and **Transaction ID (TrxID)**.
4. **Order Confirmation**: Generates a unique tracking ID (`SKZ-XXXXXX`), commits directly to PostgreSQL, and provides a direct link to track order progress in `/user`.

---

## 📐 System Architecture

### 1. High-Level Architecture

```mermaid
graph TD
    Client[End-User / Gamer Browser] -->|Browse Storefront & Top-Ups| PublicRoutes["Public Routes (/, /products, /product/:slug)"]
    Client -->|Clicks Account Button| UserPanel["User Panel (/user)"]
    Admin[Admin Manager] -->|Direct URL Login| AdminPanel["Admin Security Portal (/admin)"]

    subgraph Client-Side State
        UserPanel --> AuthContext[AuthContext / useAuth]
        AdminPanel --> AuthContext
        AuthContext --> LocalStorage[localStorage Tokens]
    end

    subgraph TanStack Start Full-Stack Layer
        PublicRoutes --> RPC[Type-Safe Server Functions RPC /src/api]
        UserPanel --> RPC
        AdminPanel --> RPC
    end

    subgraph Server & Business Logic Layer
        RPC --> AuthEngine[Auth & Session Engine (JWT + bcryptjs)]
        RPC --> GameService[Games & Coin Packages CMS]
        RPC --> OrderService[Order Placement & State Engine]
        RPC --> SettingsService[MFS Settings Service]
    end

    subgraph Database Layer
        AuthEngine --> PostgresPool[(PostgreSQL Connection Pool)]
        GameService --> PostgresPool
        OrderService --> PostgresPool
        SettingsService --> PostgresPool
        PostgresPool --> Tables[users | games | game_packages | orders | settings]
    end
```

---

### 2. Order & Payment Verification Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Gamer (Customer)
    participant UI as Product / Checkout UI
    participant Server as TanStack Start RPC (/src/api)
    participant DB as PostgreSQL Database
    actor Admin as Admin Manager
    
    Customer->>UI: Selects game (e.g., PUBG Mobile 660 UC)
    Customer->>UI: Enters Player ID & Contact Info
    Customer->>UI: Sends Money via bKash/Nagad and enters TrxID
    Customer->>UI: Clicks "Confirm & Place Top-Up Order"
    UI->>Server: createOrderFn(orderPayload)
    Server->>DB: INSERT INTO orders (status = 'pending')
    DB-->>Server: Generates Order ID (SKZ-XXXXXX)
    Server-->>UI: Returns { success: true, orderId }
    UI-->>Customer: Displays Order Confirmation Card & link to /user

    Admin->>Server: adminGetAllOrdersFn()
    Server->>DB: SELECT * FROM orders ORDER BY created_at DESC
    DB-->>Server: Order records
    Server-->>Admin: Displays order with TrxID & Player ID
    Admin->>Admin: Copies TrxID & verifies on MFS App/SMS
    Admin->>Admin: Copies Player ID & delivers UC in-game
    Admin->>Server: adminUpdateOrderStatusFn(orderId, 'completed')
    Server->>DB: UPDATE orders SET order_status = 'completed'
    
    Customer->>UI: Visits /user panel
    UI->>Server: getUserOrdersFn()
    Server->>DB: Fetch orders for Customer Phone / ID
    DB-->>UI: Returns order with status 'completed'
    UI-->>Customer: Shows green "COMPLETED" status badge
```

---

### 3. Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    GAMES ||--|{ GAME_PACKAGES : contains
    GAMES ||--o{ ORDERS : referenced_in

    USERS {
        serial id PK
        varchar name
        varchar email UK
        varchar phone UK
        text password_hash
        varchar role
        timestamptz created_at
        timestamptz updated_at
    }

    GAMES {
        serial id PK
        varchar slug UK
        varchar name
        varchar tagline
        text image
        varchar badge
        varchar category
        varchar order_time
        text description
        jsonb needs
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    GAME_PACKAGES {
        serial id PK
        int game_id FK
        varchar package_id
        varchar name
        numeric price
        boolean popular
        int sort_order
        timestamptz created_at
        timestamptz updated_at
    }

    ORDERS {
        varchar id PK
        int user_id FK
        int game_id FK
        varchar game_name
        varchar package_name
        numeric amount
        varchar customer_name
        varchar customer_email
        varchar customer_phone
        jsonb player_credentials
        varchar payment_method
        varchar payment_sender_number
        varchar transaction_id
        varchar order_status
        text admin_notes
        timestamptz created_at
        timestamptz updated_at
    }

    SETTINGS {
        varchar key PK
        text value
        timestamptz updated_at
    }
```

---

## 💻 Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [TanStack Start](https://tanstack.com/start) | Full-stack React framework with Server Functions (RPC) & SSR |
| **Routing** | [TanStack Router](https://tanstack.com/router) | 100% type-safe file-based client & server router |
| **Frontend UI** | [React 19](https://react.dev/) | Core UI rendering library |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first styling system |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) | Accessible, headless UI component primitives |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, lightweight icon suite |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Smooth UI transitions and card animations |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational database for persistent ecommerce data |
| **Database Driver** | [pg (node-postgres)](https://node-postgres.com/) | High-performance PostgreSQL connection pool |
| **Authentication** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) & [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | Password hashing & JWT session management |
| **Build Tool** | [Vite 7](https://vite.dev/) | Lightning-fast development server and asset bundler |

---

## 📁 Project Directory Structure

```text
SKsTopUp/
├── .env                  # Private environment variables (DB, Admin Credentials, JWT Secret)
├── .env.example          # Template for required environment variables
├── package.json          # Dependencies, scripts, and package metadata
├── tsconfig.json         # TypeScript compiler configuration
├── vite.config.ts        # Vite configuration & TanStack Start server entries
├── src/
│   ├── api/              # TanStack Start RPC Server Functions (Client-safe stubs)
│   │   └── index.ts      # createServerFn definitions for auth, games, orders, settings
│   ├── components/       # Reusable presentation components
│   │   ├── Footer.tsx    # Global site footer
│   │   ├── GameGrid.tsx  # Dynamic game grid fetched from PostgreSQL
│   │   ├── Header.tsx    # Sticky header with /user profile linkage
│   │   ├── Hero.tsx      # Hero promotional section
│   │   ├── ThemeProvider.tsx # Dark/Light theme provider
│   │   └── ui/           # Radix & custom UI primitives (buttons, dialogs, cards)
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.tsx   # User & Admin authentication context & session state
│   ├── lib/              # Utilities and seed sources
│   │   ├── games.ts      # Default catalog seed data & TypeScript types
│   │   └── utils.ts      # Class merging & general utilities
│   ├── routes/           # File-based routes (TanStack Router)
│   │   ├── __root.tsx    # Root layout with QueryClient & AuthProvider
│   │   ├── index.tsx     # Homepage (/)
│   │   ├── user.tsx      # Dedicated User Panel (/user) - Login, Signup & Live Orders
│   │   ├── admin.tsx     # Dedicated Admin Portal (/admin) - CMS & Order Management
│   │   ├── products.tsx  # Gaming Gadgets page (/products)
│   │   ├── product.$slug.tsx # Dynamic Game Top-Up detail & 3-Step Checkout page
│   │   ├── about.tsx     # About Us page
│   │   └── contact.tsx   # Contact page
│   ├── server/           # Server-only execution layer (isolated from client bundle)
│   │   ├── db.ts         # PostgreSQL Pool, auto-migration & seed logic
│   │   └── api.ts        # Core business operations (SQL queries, password hashing)
│   ├── router.tsx        # TanStack Router instance
│   ├── server.ts         # SSR entry point and error wrapper
│   ├── start.ts          # Start instance & request middleware
│   └── styles.css        # Global Tailwind CSS and design tokens
```

---

## 🗄️ Database Schema

When the server boots, `initDatabase()` in `src/server/db.ts` automatically executes `CREATE TABLE IF NOT EXISTS` for the following schemas:

### 1. `users` Table
Stores registered customer credentials and roles.
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `games` Table
Stores all games displayed on the storefront.
```sql
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  image TEXT NOT NULL,
  badge VARCHAR(50),
  category VARCHAR(100) NOT NULL,
  order_time VARCHAR(255),
  description TEXT,
  needs JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. `game_packages` Table
Stores individual coin, diamond, or points packages for each game.
```sql
CREATE TABLE IF NOT EXISTS game_packages (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  package_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. `orders` Table
Stores all customer top-up purchases, in-game credentials, and MFS transaction details.
```sql
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
  game_name VARCHAR(255) NOT NULL,
  package_name VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  player_credentials JSONB NOT NULL DEFAULT '{}',
  payment_method VARCHAR(50) NOT NULL,
  payment_sender_number VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100) NOT NULL,
  order_status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. `settings` Table
Key-value store for MFS numbers (bKash, Nagad, Rocket) and customer checkout notices.
```sql
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## ⚡ Getting Started & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher (recommended: Node 20 LTS)
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **PostgreSQL Database**: Local PostgreSQL service (via pgAdmin or Postgres CLI) OR a free Cloud PostgreSQL instance (e.g., [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com)).

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SayhamKayes/SKz-Top-Up-Lab.git
   cd SKz-Top-Up-Lab
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your PostgreSQL connection string and desired admin credentials.

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.

---

### Database Setup (Local or Cloud)

#### Option A: Free Cloud PostgreSQL (Recommended: Neon.tech)
1. Go to [Neon.tech](https://neon.tech) and create a free project.
2. Copy the provided connection string (it looks like `postgresql://user:password@ep-xyz.aws.neon.tech/neondb?sslmode=require`).
3. Paste it into your `.env` file as `DATABASE_URL`.
4. Start `npm run dev`. The server will automatically connect with SSL and create all tables and initial games.

#### Option B: Local PostgreSQL (pgAdmin)
1. Ensure your PostgreSQL service is running locally on port `5432`.
2. Create a database named `skstopup`:
   ```sql
   CREATE DATABASE skstopup;
   ```
3. Set your connection string in `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:your_local_password@localhost:5432/skstopup
   ```
4. Start `npm run dev`. The tables will be created automatically.

---

## 🔐 Environment Configuration (`.env`)

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection URL (supports local and cloud SSL URLs) | `postgresql://postgres:postgres@localhost:5432/skstopup` |
| `SESSION_SECRET` | **Yes** | Secret salt string for signing JWT tokens | `skz_topup_super_secret_jwt_key_2026!` |
| `ADMIN_USERNAME` | **Yes** | Username to unlock `/admin` control panel | `admin` |
| `ADMIN_PASSWORD` | **Yes** | Password to unlock `/admin` control panel | `Admin@SKzLab2026#` |
| `BKASH_NUMBER` | No | Default bKash Send Money number | `01700000000` |
| `NAGAD_NUMBER` | No | Default Nagad Send Money number | `01800000000` |
| `ROCKET_NUMBER` | No | Default Rocket Send Money number | `01900000000` |
| `SUPPORT_WHATSAPP` | No | WhatsApp phone number for customer support | `8801700000000` |

---

## 🛠️ Admin Portal (`/admin`) Guide

Access the portal at `/admin`.

### Default Login:
- **Username:** `admin`
- **Password:** `Admin@SKzLab2026#` *(or the credentials configured in your `.env`)*

### Key Actions:
1. **Fulfilling Orders**:
   - Locate the order in the **Orders Management** tab.
   - Click **Copy ID** next to In-Game Credentials to copy the customer's Player ID.
   - Top-up the player's account in your provider dashboard.
   - Verify the TrxID via your MFS notification/statement.
   - Click **✓ Complete** to change the order status. The user will immediately see the green **Completed** badge in their `/user` dashboard.
2. **Adding a New Game**:
   - Go to **Games & Coins CMS** &gt; click **Add New Game**.
   - Input Game Name, Image URL, Category, and check which fields the user must enter (e.g., Player ID, Server ID).
   - Click **Save Game**.
3. **Updating Coin Prices**:
   - Expand any game card in **Games & Coins CMS**.
   - Click the pencil icon next to any coin tier to edit its name, price in ৳ BDT, or toggle the `POPULAR` badge.

---

## 👤 User Panel (`/user`) Guide

Access the user panel at `/user` or click **Account** in the header.

1. **Sign In & Register**:
   - Toggle between **Sign In** and **Create Account**.
   - Accounts can be created with Name, Email, WhatsApp Phone, and Password.
2. **Tracking Top-Ups**:
   - View recent purchases, amount paid, and live order progression.
   - Displays in-game credentials entered for proof of purchase.
   - Read administrative notes posted by the admin team.

---

## 📦 Production Build & Deployment

To validate or build the optimized production bundle:

```bash
# Type-check TypeScript
npx tsc --noEmit

# Compile client & SSR bundles
npm run build

# Preview production build locally
npm run preview
```

### Hosting Options:
- **Node.js Server**: Deploy with `node` or Docker using the generated SSR server bundle in `dist/server`.
- **Cloudflare Workers / Pages**: The project includes `wrangler.jsonc` and `@cloudflare/vite-plugin` for serverless edge deployment.

---

## 📄 License & Authors

This project is licensed under the **MIT License**.

- **Repository**: [https://github.com/SayhamKayes/SKz-Top-Up-Lab](https://github.com/SayhamKayes/SKz-Top-Up-Lab)
- **Author**: Sayham Kayes & SKz Lab Team

---
*Built with ❤️ for passionate gamers and community top-up operations.*
