const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { courseId, status } = req.query;

    let where = 'h.school_id = ?';
    const params = [schoolId];
    if (courseId) { where += ' AND h.course_id = ?'; params.push(courseId); }
    if (status) { where += ' AND h.status = ?'; params.push(status); }

    const rows = await query(
      `SELECT h.*, c.name as course_name, t.employee_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM homework h JOIN courses c ON h.course_id = c.id JOIN teachers t ON h.teacher_id = t.id JOIN users u ON t.user_id = u.id
       WHERE ${where} ORDER BY h.due_date DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);

    const rows = await query(
      `SELECT h.*, c.name as course_name FROM homework h JOIN courses c ON h.course_id = c.id WHERE h.id = ? AND h.school_id = ?`,
      [id, schoolId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Homework not found' });

    const subs = await query(
      `SELECT hs.*, s.student_id, u.first_name, u.last_name FROM homework_submissions hs
       JOIN students s ON hs.student_id = s.id JOIN users u ON s.user_id = u.id WHERE hs.homework_id = ?`,
      [id]
    );
    rows[0].submissions = subs;
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { courseId, title, description, dueDate, maxScore, status } = req.body;
    const teacherId = req.user.teacherId;

    if (!teacherId) return res.status(403).json({ error: 'Teacher ID required' });

    const id = uuidv4();
    await query(
      `INSERT INTO homework (id, school_id, course_id, teacher_id, title, description, due_date, max_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, schoolId, courseId, teacherId, title, description || null, dueDate, maxScore || 100, status || 'published']
    );

    const created = await query('SELECT * FROM homework WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

async function submit(req, res, next) {
  try {
    const { homeworkId, studentId } = req.params;
    const schoolId = getSchoolId(req);
    const { content } = req.body;

    const hw = await query('SELECT id FROM homework WHERE id = ? AND school_id = ?', [homeworkId, schoolId]);
    if (!hw[0]) return res.status(404).json({ error: 'Homework not found' });

    const id = uuidv4();
    await query(
      `INSERT INTO homework_submissions (id, school_id, homework_id, student_id, content, submitted_at, status) VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [id, schoolId, homeworkId, studentId, content || null, 'submitted']
    );

    const created = await query('SELECT * FROM homework_submissions WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

async function gradeSubmission(req, res, next) {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);
    const { score, feedback, status } = req.body;

    const existing = await query('SELECT id FROM homework_submissions WHERE id = ? AND school_id = ?', [id, schoolId]);
    if (!existing[0]) return res.status(404).json({ error: 'Submission not found' });

    const set = [];
    const vals = [];
    if (score !== undefined) { set.push('score = ?'); vals.push(score); }
    if (feedback !== undefined) { set.push('feedback = ?'); vals.push(feedback); }
    if (status !== undefined) { set.push('status = ?'); vals.push(status); }
    if (set.length > 0) {
      vals.push(id);
      await query(`UPDATE homework_submissions SET ${set.join(', ')} WHERE id = ?`, vals);
    }

    const rows = await query('SELECT * FROM homework_submissions WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, submit, gradeSubmission };
