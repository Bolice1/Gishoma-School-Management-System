# Gishoma Multi-School Management System

A **secure, scalable, multi-tenant** school management system for many schools across the country. Built with Node.js/Express backend, React frontend, and MySQL database.

## Features

### Multi-School Architecture
- **Multi-tenant design**: Each school's data is isolated
- **School registration**: Schools register and manage their own data
- **Scalable**: Designed for thousands of schools and tens of thousands of users

### Roles & Permissions
| Role | Capabilities |
|------|-------------|
| **Super Admin** | Platform management, all schools, subscriptions, activity logs |
| **School Admin** | School profile, teachers, students, school settings |
| **Bursar** | Fees, payments, receipts |
| **Dean of Courses** | Teacher & student attendance monitoring |
| **Teacher** | Marks, discipline, homework, exercises, notes |
| **Student** | Notes, exercises, homework, PDF reports |

### Security
- JWT access tokens + refresh tokens
- Role-based access control (RBAC) at every endpoint
- Input validation (express-validator)
- Password hashing (bcrypt)
- Rate limiting & brute-force protection
- Activity logging for auditing
- SQL injection, XSS, CSRF protection
- Helmet security headers

---

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+ (or Docker)

### 1. Database

**Option A: Docker**
```bash
docker-compose up -d
# Wait for MySQL to be ready (~30 seconds)
```

**Option B: Local MySQL**
- Create database: `CREATE DATABASE Gishoma;`
- Ensure user `root` with password `12345` has access (or update `.env`)

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DB credentials, JWT secrets

npm install
npm run db:init    # Creates tables
npm run db:seed    # Sample data
npm run dev        # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### 4. Login

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@gishoma.edu | password123 |
| School Admin | admin@gishoma.edu | password123 |
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

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=12345
DB_NAME=Gishoma

JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## Database Schema

- **schools** – Tenant root, one per school
- **users** – Global, linked to `school_id` (null for super_admin)
- **refresh_tokens** – JWT refresh token storage
- **activity_logs** – Audit trail
- **students, teachers** – Per-school, linked to users
- **courses** – Per-school, assigned to teachers
- **enrollments** – Student-course links
- **attendance** – Student/teacher attendance
- **marks** – Student grades
- **disciplines** – Discipline cases
- **homework, homework_submissions**
- **exercises, exercise_submissions**
- **notes**
- **fees, payments**
- **announcements**

Full schema: `backend/src/sql/schema.sql`

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login (returns accessToken, refreshToken) |
| POST | /api/auth/refresh | Refresh tokens |
| GET | /api/auth/me | Current user |
| GET | /api/schools | List schools (super_admin) |
| GET | /api/dashboard/super-admin | Platform stats |
| GET | /api/dashboard/school-admin | School stats |
| GET | /api/dashboard/bursar | Bursar stats |
| GET | /api/dashboard/dean | Attendance stats |
| GET | /api/pdf/marks/:studentId | Marks PDF |
| GET | /api/pdf/homework/:studentId | Homework PDF |
| GET | /api/pdf/discipline/:studentId | Discipline PDF |
| ... | /api/students, /api/teachers, etc. | CRUD resources |

All school-scoped routes use `req.schoolId` from JWT. Super admin can pass `?schoolId=xxx` to access a specific school.

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/        # Database (mysql2)
│   │   ├── controllers/
│   │   ├── middleware/    # auth, RBAC, validate, sanitize, logging
│   │   ├── routes/
│   │   ├── services/      # authService, pdfService, activityLog
│   │   ├── sql/           # schema.sql
│   │   ├── scripts/       # initDb, seed
│   │   ├── validators/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── api/
│   └── package.json
├── docker-compose.yml     # MySQL
└── README.md
```

---

## Production Deployment

1. **Database**: Provision MySQL (AWS RDS, DigitalOcean, etc.)
2. **Backend**: Deploy to Node.js host (Railway, Render, etc.)
   - Set all env vars
   - Use strong JWT secrets (32+ chars)
3. **Frontend**: `npm run build` → deploy `dist/` to Nginx/Vercel/Netlify
4. **Security**: Enable HTTPS, set `FRONTEND_URL` to production domain

---

## License

MIT
