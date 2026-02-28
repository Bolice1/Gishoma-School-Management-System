# Gishoma Secondary School - Management System

A complete full-stack school management system for Gishoma Secondary School with role-based access control, dashboards, PDF reports, and real-time features.

## Features

### Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Admin** | Full system access, user management, all dashboards |
| **Bursar** | Fee management, payments, receipts |
| **Dean of Courses** | Teacher & student attendance monitoring |
| **Teacher** | Marks, discipline, homework, notes, exercises |
| **Student** | Notes, exercises, homework, PDF reports |

### Functional Highlights

- JWT authentication with role-based access control
- CRUD for students, teachers, courses, discipline, homework, exercises, fees
- PDF reports: marks, homework progress, discipline cases
- Real-time support via WebSockets (Socket.io)
- Dashboard per role with relevant statistics

## Tech Stack

- **Backend:** Node.js, Express, Sequelize, PostgreSQL, JWT, PDFKit, Socket.io
- **Frontend:** React, Vite, Redux Toolkit, React Router

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker for database only)
- npm or yarn

### 1. Database Setup

**Option A: Using Docker**
```bash
docker-compose up -d
```

**Option B: Local PostgreSQL**

Create a database:
```sql
CREATE DATABASE gishoma_school;
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env - set DATABASE_URL and JWT_SECRET

npm install
npm run db:seed    # Creates tables + sample data
npm run dev        # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Starts on http://localhost:5173
```

### 4. Login

Open http://localhost:5173 and use:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gishoma.edu | password123 |
| Bursar | bursar@gishoma.edu | password123 |
| Dean | dean@gishoma.edu | password123 |
| Teacher | teacher1@gishoma.edu | password123 |
| Student | student1@gishoma.edu | password123 |

---

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gishoma_school
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/dashboard/admin | Admin stats |
| GET | /api/dashboard/bursar | Bursar stats |
| GET | /api/dashboard/dean | Dean attendance stats |
| GET | /api/dashboard/teacher/:id | Teacher stats |
| GET | /api/dashboard/student/:id | Student stats |
| GET | /api/pdf/marks/:studentId | Marks PDF |
| GET | /api/pdf/homework/:studentId | Homework PDF |
| GET | /api/pdf/discipline/:studentId | Discipline PDF |
| ... | /api/students, /api/teachers, etc. | CRUD resources |

---

## Production Deployment

### Option 1: Docker (Full Stack)

```bash
# Build and run everything
docker-compose -f docker-compose.full.yml up -d

# Access at http://localhost (port 80)
```

### Option 2: Manual Deployment

1. **Database:** Provision PostgreSQL (e.g. Supabase, Railway, AWS RDS)
2. **Backend:** Deploy to Node.js host (Railway, Render, Heroku)
   - Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
3. **Frontend:** Build and deploy to static host
   ```bash
   cd frontend && npm run build
   ```
   - Set API base URL if different from same-origin
   - Deploy `dist/` to Nginx, Vercel, Netlify, etc.

---

## Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for the full schema.

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── models/       # Sequelize models
│   │   ├── controllers/
│   │   ├── middleware/   # Auth, RBAC
│   │   ├── routes/
│   │   ├── services/    # PDF generation
│   │   ├── scripts/      # Seed script
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/        # Redux
│   │   ├── api/
│   │   └── App.jsx
│   └── package.json
├── docker-compose.yml    # PostgreSQL only
├── docker-compose.full.yml  # Full deployment
└── README.md
```

---

## License

MIT
