const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const authService = require('../services/authService');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const teachers = await query(
      `SELECT t.*, u.first_name, u.last_name, u.email FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.school_id = ? ORDER BY t.employee_id`,
      [schoolId]
    );
    res.json({ teachers });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);

    const [rows] = await query(
      `SELECT t.*, u.first_name, u.last_name, u.email FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.id = ? AND t.school_id = ?`,
      [id, schoolId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Teacher not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { email, password, firstName, lastName, employeeId, specialization, dateOfBirth, gender, hireDate, address } = req.body;

    const userId = uuidv4();
    const hash = await authService.hashPassword(password || 'password123');

    await query(
      'INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, schoolId, email, hash, firstName, lastName, 'teacher']
    );

    const id = uuidv4();
    await query(
      `INSERT INTO teachers (id, school_id, user_id, employee_id, specialization, date_of_birth, gender, hire_date, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, schoolId, userId, employeeId || `T${Date.now()}`, specialization || null, dateOfBirth || null, gender || null, hireDate || null, address || null]
    );

    const [created] = await query(
      `SELECT t.*, u.first_name, u.last_name, u.email FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.id = ?`,
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
    const allowed = ['employee_id', 'specialization', 'date_of_birth', 'gender', 'hire_date', 'address'];

    const [existing] = await query('SELECT id FROM teachers WHERE id = ? AND school_id = ?', [id, schoolId]);
    if (!existing[0]) return res.status(404).json({ error: 'Teacher not found' });

    const set = [];
    const vals = [];
    for (const k of allowed) {
      if (updates[k] !== undefined) {
        set.push(`${k} = ?`);
        vals.push(updates[k]);
      }
    }
    if (set.length > 0) {
      vals.push(id);
      await query(`UPDATE teachers SET ${set.join(', ')} WHERE id = ?`, vals);
    }

    const [rows] = await query(
      `SELECT t.*, u.first_name, u.last_name, u.email FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.id = ?`,
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update };
