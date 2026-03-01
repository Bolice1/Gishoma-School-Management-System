const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const courses = await query(
      `SELECT c.*, t.employee_id as teacher_employee_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM courses c JOIN teachers t ON c.teacher_id = t.id JOIN users u ON t.user_id = u.id WHERE c.school_id = ?`,
      [schoolId]
    );
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);

    const rows = await query(
      `SELECT c.*, t.employee_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name FROM courses c JOIN teachers t ON c.teacher_id = t.id JOIN users u ON t.user_id = u.id WHERE c.id = ? AND c.school_id = ?`,
      [id, schoolId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { teacherId, name, code, class_level, credits } = req.body;

    const t = await query('SELECT id FROM teachers WHERE id = ? AND school_id = ?', [teacherId, schoolId]);
    if (!t[0]) return res.status(400).json({ error: 'Invalid teacher' });

    const id = uuidv4();
    await query(
      'INSERT INTO courses (id, school_id, teacher_id, name, code, class_level, credits) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, schoolId, teacherId, name, code || null, class_level || null, credits || 1]
    );

    const created = await query('SELECT * FROM courses WHERE id = ?', [id]);
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
    const allowed = ['teacher_id', 'name', 'code', 'class_level', 'credits'];

    const existing = await query('SELECT id FROM courses WHERE id = ? AND school_id = ?', [id, schoolId]);
    if (!existing[0]) return res.status(404).json({ error: 'Course not found' });

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
      await query(`UPDATE courses SET ${set.join(', ')} WHERE id = ?`, vals);
    }

    const rows = await query('SELECT * FROM courses WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);

    const existing = await query('SELECT id FROM courses WHERE id = ? AND school_id = ?', [id, schoolId]);
    if (!existing[0]) return res.status(404).json({ error: 'Course not found' });
    await query('DELETE FROM courses WHERE id = ?', [id]);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
