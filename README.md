# Enrollment Management System (EMS)

## Project Overview

A full-stack enrollment management system built with:

- **Backend:** Node.js + TypeScript + TypeORM + MySQL
- **Frontend:** Vue.js 3 + Vite + Pinia + Tailwind CSS

## Prerequisites

- Node.js v18 or higher
- MySQL v8
- npm or yarn

---

## Quick Start

### Backend

1. **Clone the repository:**
   ```bash
   git clone <your-github-link>
   cd ems-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=yourpassword
   DB_NAME=enrollment_system
   PORT=5000
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRES_IN=7d
   NODE_ENV=development/
   ```

4. **Create the database in MySQL:**
   ```sql
   CREATE DATABASE enrollment_system;
   ```

5. **Run migrations and seed:**
   ```bash
   npm run migration:run
   npm run seed
   ```

6. **Start the development server:**
   ```bash
   c
   ```
   Server runs at `http://localhost:5000`

---

### Frontend

1. **Navigate to the frontend directory:**
   ```bash
   cd ems-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in:
   ```env
   VITE_API_BASE_URL=/api/v1
   VITE_APP_NAME=Enrollment Management System
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:3000`

> **Note:** Make sure the backend is running on port `5000` before starting the frontend. The Vite dev server proxies all `/api` requests to `http://localhost:5000` automatically.

---

## Available Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start backend with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled `dist/server.js` |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:generate` | Generate a new migration from entity changes |
| `npm run migration:revert` | Revert the last migration |
| `npm run seed` | Seed database with initial data |
| `npm test` | Run unit/integration tests |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start frontend dev server with hot reload |
| `npm run build` | Build for production to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run unit tests with Vitest |
| `npm run lint` | Lint `.vue` and `.ts` files with ESLint |

---

## Project Structure

```
enrollment-management-system/
├── ems-backend/
│   └── src/
│       ├── config/         # Database, logger, env config
│       ├── entities/       # TypeORM entities
│       ├── database/
│       │   ├── migrations/ # TypeORM migration files
│       │   └── seeds/      # Database seeders
│       ├── routes/         # Express route definitions
│       ├── controllers/    # Request handlers
│       ├── services/       # Business logic
│       └── server.ts       # App entry point
└── ems-frontend/
    └── src/
        ├── api/            # Axios instance and API modules
        ├── components/     # Reusable UI components
        ├── composables/    # Vue composables (useAuth, etc.)
        ├── router/         # Vue Router routes and guards
        ├── stores/         # Pinia state stores
        ├── types/          # TypeScript interfaces
        ├── views/          # Page-level Vue components
        └── main.ts         # App entry point
```

---

## Troubleshooting

**MySQL auth error (`mysql_native_password` not loaded)**
Run this in MySQL to fix the auth plugin:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'yourpassword';
FLUSH PRIVILEGES;
```

**Environment variables not loading**
Make sure `dotenv.config()` is called at the very top of `server.ts`, before any other imports.

**Migration fails with `process is not defined`**
Ensure `@types/node` is installed and `"types": ["node"]` is set in `tsconfig.json`.

**Frontend API calls returning 404**
Check that `vite.config.ts` has the proxy configured and the backend is running on port `5000`:
```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

**Blank page after `npm run build`**
Make sure `VITE_API_BASE_URL` in `.env.production` points to your actual backend URL, not the local proxy path.
