const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { courseId, status } = req.query;

    let where = 'e.school_id = ?';
    const params = [schoolId];
    if (courseId) { where += ' AND e.course_id = ?'; params.push(courseId); }
    if (status) { where += ' AND e.status = ?'; params.push(status); }

    const rows = await query(
      `SELECT e.*, c.name as course_name FROM exercises e JOIN courses c ON e.course_id = c.id WHERE ${where} ORDER BY e.created_at DESC`,
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
      'SELECT e.*, c.name as course_name FROM exercises e JOIN courses c ON e.course_id = c.id WHERE e.id = ? AND e.school_id = ?',
      [id, schoolId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Exercise not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { courseId, title, questions, dueDate, maxScore, timeLimitMinutes, status } = req.body;
    const teacherId = req.user.teacherId;

    if (!teacherId) return res.status(403).json({ error: 'Teacher ID required' });

    const id = uuidv4();
    const qJson = JSON.stringify(questions || []);
    await query(
      `INSERT INTO exercises (id, school_id, course_id, teacher_id, title, questions, due_date, max_score, time_limit_minutes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, schoolId, courseId, teacherId, title, qJson, dueDate || null, maxScore || 100, timeLimitMinutes || null, status || 'active']
    );

    const created = await query('SELECT * FROM exercises WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

async function submit(req, res, next) {
  try {
    const { exerciseId, studentId } = req.params;
    const schoolId = getSchoolId(req);
    const { answers, timeSpentMinutes } = req.body;

    const ex = await query('SELECT id FROM exercises WHERE id = ? AND school_id = ?', [exerciseId, schoolId]);
    if (!ex[0]) return res.status(404).json({ error: 'Exercise not found' });

    const id = uuidv4();
    const ansJson = JSON.stringify(answers || {});
    await query(
      `INSERT INTO exercise_submissions (id, school_id, exercise_id, student_id, answers, submitted_at, time_spent_minutes) VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [id, schoolId, exerciseId, studentId, ansJson, timeSpentMinutes || null]
    );

    const created = await query('SELECT * FROM exercise_submissions WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, submit };
