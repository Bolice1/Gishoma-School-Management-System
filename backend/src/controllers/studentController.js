const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const authService = require('../services/authService');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'School ID required' });

    const { class_level, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let where = 's.school_id = ?';
    const params = [schoolId];
    if (class_level) {
      where += ' AND s.class_level = ?';
      params.push(class_level);
    }

    const count = await query(
      `SELECT COUNT(*) as total FROM students s WHERE ${where}`,
      params
    );
    const students = await query(
      `SELECT s.*, u.first_name, u.last_name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE ${where} ORDER BY s.student_id LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    res.json({ students, total: count[0]?.total || 0 });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);

    const rows = await query(
      `SELECT s.*, u.first_name, u.last_name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.school_id = ?`,
      [id, schoolId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { email, password, firstName, lastName, studentId, class_level, section, dateOfBirth, gender, parentName, parentPhone, address } = req.body;

    const userId = uuidv4();
    const hash = await authService.hashPassword(password || 'password123');

    await query(
      'INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, schoolId, email, hash, firstName, lastName, 'student']
    );

    const id = uuidv4();
    await query(
      `INSERT INTO students (id, school_id, user_id, student_id, class_level, section, date_of_birth, gender, parent_name, parent_phone, address, enrollment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [id, schoolId, userId, studentId || `S${Date.now()}`, class_level || 'Senior 1', section || null, dateOfBirth || null, gender || null, parentName || null, parentPhone || null, address || null]
    );

    const created = await query(
      `SELECT s.*, u.first_name, u.last_name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [id]
    );
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);
    const updates = req.body;
    const allowed = ['class_level', 'section', 'date_of_birth', 'gender', 'parent_name', 'parent_phone', 'address'];

    const existing = await query('SELECT id FROM students WHERE id = ? AND school_id = ?', [id, schoolId]);
    if (!existing[0]) return res.status(404).json({ error: 'Student not found' });

    const set = [];
    const vals = [];
    for (const k of allowed) {
      const key = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (updates[k] !== undefined || updates[key] !== undefined) {
        set.push(`${k} = ?`);
        vals.push(updates[k] ?? updates[key]);
      }
    }
    if (set.length > 0) {
      vals.push(id);
      await query(`UPDATE students SET ${set.join(', ')} WHERE id = ?`, vals);
    }

    const rows = await query(
      `SELECT s.*, u.first_name, u.last_name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);

    const s = await query('SELECT user_id FROM students WHERE id = ? AND school_id = ?', [id, schoolId]);
    if (!s[0]) return res.status(404).json({ error: 'Student not found' });
    await query('DELETE FROM students WHERE id = ?', [id]);
    await query('DELETE FROM users WHERE id = ?', [s[0].user_id]);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
