# Enrollment Management System (EMS)

## Project Overview
This is a full-stack enrollment system with:
- Backend: Node.js + TypeScript + TypeORM + MySQL
- Frontend: Vue.js + Tailwind CSS

## Prerequisites
- Node.js (v18 or higher)
- MySQL (v8)
- npm or yarn

## Quick Start (Backend)

1. Clone the repository:
   ```bash
   git clone githut-link
   cd ems-backend

2. Install depencies:
    ```bash
    npm install

3. Create `.env` file:
    ```bash
    cp .env.example .env

4. Create database in MySQL:
    ```sql
    CREATE DATABASE enrollment_system

5. Run migrations and seed:
    ```bash
    npm run migration:run
    npm run seed

6. Start development server:
    ```bash
    npm run dev

## Quick start (Frontend)



## Available Scripts
### Backend

| Command                 | Description                     |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Start backend with hot reload   |
| `npm run build`         | Compile TypeScript to `dist`    |
| `npm run start`         | Run compiled `dist`             |
| `npm run migration:run` | Run pending migrations          |
| `npm run seed`          | Seed database with initial data |
| `npm test`              | Run unit/integration tests      |
