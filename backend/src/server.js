require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const { pool } = require('./config/database');
const logger = require('./utils/logger');
const { sanitizeMiddleware } = require('./middleware/sanitize');

const authRoutes = require('./routes/auth');
const schoolRoutes = require('./routes/schools');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const courseRoutes = require('./routes/courses');
const attendanceRoutes = require('./routes/attendance');
const markRoutes = require('./routes/marks');
const disciplineRoutes = require('./routes/discipline');
const homeworkRoutes = require('./routes/homework');
const exerciseRoutes = require('./routes/exercises');
const noteRoutes = require('./routes/notes');
const feeRoutes = require('./routes/fees');
const pdfRoutes = require('./routes/pdf');
const announcementRoutes = require('./routes/announcements');
const activityLogRoutes = require('./routes/activityLogs');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' },
});

const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeMiddleware);

morgan.token('userId', (req) => req.userId || '-');
app.use(morgan(':method :url :status :response-time ms :userId', {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip: (req) => req.path === '/api/health',
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message: { error: 'Too many requests' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts' },
});
app.use('/api/auth/login', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/discipline', disciplineRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/activity-logs', activityLogRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', (room) => socket.join(room));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
