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
   NODE_ENV=development
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
   npm run dev
   ```
   Server runs at `http://localhost:5000`
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


```

**Blank page after `npm run build`**
Make sure `VITE_API_BASE_URL` in `.env.production` points to your actual backend URL, not the local proxy path.
