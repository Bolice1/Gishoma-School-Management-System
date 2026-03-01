const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { courseId } = req.query;

    let where = 'n.school_id = ?';
    const params = [schoolId];
    if (courseId) { where += ' AND n.course_id = ?'; params.push(courseId); }

    const rows = await query(
      `SELECT n.*, c.name as course_name, u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM notes n JOIN courses c ON n.course_id = c.id JOIN teachers t ON n.teacher_id = t.id JOIN users u ON t.user_id = u.id
       WHERE ${where} ORDER BY n.created_at DESC`,
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
    const { courseId, title, content, topic } = req.body;
    const teacherId = req.user.teacherId;

    if (!teacherId) return res.status(403).json({ error: 'Teacher ID required' });

    const id = uuidv4();
    await query(
      `INSERT INTO notes (id, school_id, course_id, teacher_id, title, content, topic) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, schoolId, courseId, teacherId, title, content, topic || null]
    );

    const created = await query('SELECT * FROM notes WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);
    const { title, content, topic } = req.body;

    const existing = await query('SELECT id FROM notes WHERE id = ? AND school_id = ?', [id, schoolId]);
    if (!existing[0]) return res.status(404).json({ error: 'Note not found' });

    const set = [];
    const vals = [];
    if (title !== undefined) { set.push('title = ?'); vals.push(title); }
    if (content !== undefined) { set.push('content = ?'); vals.push(content); }
    if (topic !== undefined) { set.push('topic = ?'); vals.push(topic); }
    if (set.length > 0) {
      vals.push(id);
      await query(`UPDATE notes SET ${set.join(', ')} WHERE id = ?`, vals);
    }

    const rows = await query('SELECT * FROM notes WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update };
