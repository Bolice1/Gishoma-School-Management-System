const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const authService = require('../services/authService');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = req.userRole === 'super_admin' ? req.query.schoolId : getSchoolId(req);
    const { role, page = 1, limit = 20 } = req.query;

    let where = '1=1';
    const params = [];
    if (schoolId) { where += ' AND u.school_id = ?'; params.push(schoolId); }
    if (role) { where += ' AND u.role = ?'; params.push(role); }

    const count = await query(
      `SELECT COUNT(*) as total FROM users u WHERE ${where}`,
      params
    );
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const users = await query(
      `SELECT u.id, u.school_id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.last_login_at FROM users u WHERE ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    res.json({ users, total: count[0]?.total || 0 });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { email, password, firstName, lastName, role, phone } = req.body;

    const [existing] = await query('SELECT id FROM users WHERE email = ? AND (school_id = ? OR (school_id IS NULL AND ? IS NULL))', [email, schoolId, schoolId]);
    if (existing[0]) return res.status(400).json({ error: 'Email already registered' });

    const userId = uuidv4();
    const hash = await authService.hashPassword(password || 'password123');

    const allowedRoles = ['school_admin', 'bursar', 'dean', 'teacher', 'student'];
    if (!allowedRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    await query(
      'INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, schoolId, email, hash, firstName, lastName, role, phone || null]
    );

    const [created] = await query(
      'SELECT id, school_id, email, first_name, last_name, role, is_active FROM users WHERE id = ?',
      [userId]
    );
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
