const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { studentId, status } = req.query;

    let where = 'd.school_id = ?';
    const params = [schoolId];
    if (studentId) { where += ' AND d.student_id = ?'; params.push(studentId); }
    if (status) { where += ' AND d.status = ?'; params.push(status); }

    const rows = await query(
      `SELECT d.*, s.student_id as student_no, u1.first_name as student_first_name, u1.last_name as student_last_name,
       t.employee_id, u2.first_name as teacher_first_name, u2.last_name as teacher_last_name
       FROM disciplines d JOIN students s ON d.student_id = s.id JOIN users u1 ON s.user_id = u1.id
       JOIN teachers t ON d.teacher_id = t.id JOIN users u2 ON t.user_id = u2.id
       WHERE ${where} ORDER BY d.date DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { studentId, type, description, date, resolution, status } = req.body;
    const teacherId = req.user.teacherId;

    if (!teacherId) return res.status(403).json({ error: 'Teacher ID required' });

    const id = uuidv4();
    await query(
      `INSERT INTO disciplines (id, school_id, student_id, teacher_id, type, description, date, resolution, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, schoolId, studentId, teacherId, type, description, date, resolution || null, status || 'open']
    );

    const created = await query('SELECT * FROM disciplines WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);
    const { resolution, status } = req.body;

    const existing = await query('SELECT id FROM disciplines WHERE id = ? AND school_id = ?', [id, schoolId]);
    if (!existing[0]) return res.status(404).json({ error: 'Discipline record not found' });

    const set = [];
    const vals = [];
    if (resolution !== undefined) { set.push('resolution = ?'); vals.push(resolution); }
    if (status !== undefined) { set.push('status = ?'); vals.push(status); }
    if (set.length > 0) {
      vals.push(id);
      await query(`UPDATE disciplines SET ${set.join(', ')} WHERE id = ?`, vals);
    }

    const rows = await query('SELECT * FROM disciplines WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update };
