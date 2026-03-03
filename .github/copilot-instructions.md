# Copilot Instructions for Gishoma School Management System

## Project Overview

Gishoma is a **multi-tenant school management system** built with:
- **Backend**: Node.js/Express (v4.18+), MySQL 8.0, Socket.io for real-time chat
- **Frontend**: React 18 with Redux Toolkit, Vite, React Router v6
- **Database**: MySQL with 15+ core tables (see DATABASE_SCHEMA.md for full structure)

Key architectural decision: Multi-tenant design where each school's data is isolated. All data queries must respect the `school_id` context from authenticated users.

## Build, Test, and Lint Commands

### Backend

```bash
cd backend

# Install dependencies
npm install

# Run dev server (with auto-reload via nodemon)
npm run dev

# Start production server
npm start

# Initialize database (creates tables)
npm run db:init

# Seed database with sample data
npm run db:seed
```

**Environment**: The `.env` file contains your actual configuration with real credentials (database password, JWT secrets, email passwords). Use `.env.example` only as a reference template showing what variables are needed. Required variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.

**Note**: No tests configured. Verify changes manually or via API integration testing.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Dev server runs on** `http://localhost:5173` by default.

### Docker Compose

```bash
# Start MySQL database (from root directory)
docker-compose up -d

# Verify MySQL is healthy
docker-compose ps
```

MySQL runs on `localhost:3306` with credentials: user=`root`, password=`12345`.

## High-Level Architecture

### Backend Structure

```
backend/src/
├── controllers/     # Request handlers (one per feature: auth, users, marks, etc.)
├── services/        # Business logic and data operations
├── routes/          # Express route definitions
├── middleware/      # Auth, validation, error handling
├── validators/      # Express-validator rules
├── config/          # Database connection, constants
├── sql/             # Raw SQL queries and migrations
├── utils/           # Helpers (logger, JWT service)
└── scripts/         # DB initialization and seeding
```

**Request Flow**: Route → Middleware (auth, validate) → Controller → Service → Database

### Frontend Structure

```
frontend/src/
├── pages/           # Page components (e.g., Login, Marks, Students)
├── components/      # Reusable UI components (Layout, ErrorBoundary, etc.)
├── store/           # Redux slices for state management (authSlice, etc.)
├── api/             # Axios instance with JWT interceptors
├── pages/dashboards # Role-specific dashboards (6 dashboard types)
└── index.css        # Global styles
```

**Data Flow**: Component → Redux store → Axios API call → Backend

### Database Schema Highlights

- **Users** (6 roles: super_admin, school_admin, bursar, dean, teacher, student)
- **Multi-tenant**: All tables include `school_id` to isolate data by school
- **Academic structure**: Students → Courses (via Enrollments) → Teachers/Marks/Homework
- **Key relationships**: Payments/Fees (bursar), Discipline/Attendance (dean), Marks/Homework (teacher)
- **Real-time**: Socket.io for StudentChat and activity notifications

## Key Conventions

### Authentication & Authorization

- **JWT tokens**: Access (15m) + Refresh (7d) tokens stored in localStorage
- **Auth middleware** (`middleware/auth.js`): Validates Bearer token, populates `req.user`, `req.userId`, `req.userRole`, `req.schoolId`
- **Route protection**: Use `authenticate` middleware for protected routes, then `authorize(...roles)` for role-based access
- **Frontend**: Redux `authSlice` handles token storage and refresh flow; Axios interceptor auto-attaches token

**Example route pattern**:
```javascript
router.post('/marks', authenticate, authorize('teacher', 'dean'), markController.create);
```

### Multi-Tenancy Pattern

- Every SQL query must filter by `school_id` from `req.schoolId` (set by auth middleware)
- Controllers receive `req.schoolId` and pass to services
- Services enforce `WHERE school_id = ?` in all queries

**Example**:
```javascript
const marks = await query(
  'SELECT * FROM marks WHERE school_id = ? AND course_id = ?',
  [req.schoolId, courseId]
);
```

### Data Validation

- Input validation uses `express-validator` with rules defined in `validators/*.js`
- Rules follow pattern: `body('fieldName').isEmail()`, `.trim()`, `.notEmpty()`, etc.
- Middleware `handleValidation` processes validation errors (HTTP 422)

**Example**:
```javascript
// validators/authValidators.js
exports.loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];
```

### Services & Business Logic

- Controllers call services; services contain DB queries and business logic
- Services use parameterized queries with the `query()` function from `config/database`
- Always validate `school_id` context before returning data

### Frontend State Management

- Redux slices in `store/` manage auth, user data, UI state
- Async thunks handle API calls; error states are caught and logged
- Protected routes use `ProtectedRoute` component checking `roles` array

**Protected route example**:
```jsx
<ProtectedRoute roles={['teacher', 'dean']}>
  <MarksPage />
</ProtectedRoute>
```

### Error Handling

- **Backend**: Express error handler catches all errors; returns JSON with `error` field
- **Frontend**: Axios errors caught in Redux thunks; `errorMessage` state displayed in UI
- **Logging**: Winston logger in `utils/logger.js` for server-side audit trail

### Real-Time Features

- Socket.io server initialized in `server.js`
- StudentChat page uses socket events (room-based for role isolation)
- Ensure room names include `school_id` to prevent cross-school data leakage

## Common Tasks

### Adding a New Endpoint

1. Create controller in `backend/src/controllers/newFeatureController.js`
2. Add route in `backend/src/routes/newFeature.js` with auth + validation middleware
3. Define validation rules in `backend/src/validators/*.js`
4. Create service in `backend/src/services/newFeatureService.js` (handles DB queries)
5. Import and use route in `server.js`
6. Add corresponding Redux slice and API call in frontend

### Modifying Database Schema

1. Edit `backend/src/sql/` migration files
2. Run `npm run db:init` to recreate tables (development only)
3. For production: Create migration scripts in `src/sql/` that preserve data
4. Update `DATABASE_SCHEMA.md` with changes

### Testing API Changes

- Use curl, Postman, or the frontend dev server to test
- Verify `Authorization: Bearer <token>` header is included
- Check `school_id` filtering in multi-school scenarios

## Testing

### End-to-End Tests with Playwright

```bash
# Run Playwright tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

Tests are in `tests/e2e/` directory. Playwright automatically starts the frontend dev server before running tests.

## MCP Servers Configured

### Playwright MCP
- **Purpose**: End-to-end testing and browser automation
- **Location**: `playwright.config.js`
- **Test directory**: `tests/e2e/`
- **Browsers**: Chromium and Firefox

### Database MCP (via .cline_rules)
- **Purpose**: Direct database querying and schema introspection
- **Configuration**: `.cline_rules` contains connection patterns and best practices
- **Key constraint**: All queries must filter by `school_id` for multi-tenant isolation
- **Useful for**: Schema verification, data validation, complex queries

## Important Notes

- **Testing**: Use Playwright for e2e tests; no unit tests configured
- **Rate limiting**: Express Rate Limit configured (100 requests/15min by default)
- **CORS**: Frontend URL configured via `FRONTEND_URL` env var
- **Database migration**: Run `npm run db:seed` to populate test data
- **Password hashing**: bcryptjs used; never store plain passwords
- **Activity logging**: Middleware logs all database changes for audit trail
