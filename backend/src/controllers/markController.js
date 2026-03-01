const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { studentId, courseId, term, academicYear } = req.query;

    let where = 'm.school_id = ?';
    const params = [schoolId];
    if (studentId) { where += ' AND m.student_id = ?'; params.push(studentId); }
    if (courseId) { where += ' AND m.course_id = ?'; params.push(courseId); }
    if (term) { where += ' AND m.term = ?'; params.push(term); }
    if (academicYear) { where += ' AND m.academic_year = ?'; params.push(academicYear); }

    const rows = await query(
      `SELECT m.*, s.student_id as student_no, u1.first_name as student_first_name, u1.last_name as student_last_name,
       c.name as course_name, t.employee_id as teacher_employee_id, u2.first_name as teacher_first_name, u2.last_name as teacher_last_name
       FROM marks m JOIN students s ON m.student_id = s.id JOIN users u1 ON s.user_id = u1.id
       JOIN courses c ON m.course_id = c.id JOIN teachers t ON m.teacher_id = t.id JOIN users u2 ON t.user_id = u2.id
       WHERE ${where} ORDER BY m.academic_year DESC, m.term`,
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
    const { studentId, courseId, term, academicYear, examType, score, maxScore, remarks } = req.body;

    const id = uuidv4();
    const teacherId = req.user.teacherId;
    if (!teacherId) return res.status(403).json({ error: 'Teacher ID required' });

    await query(
      `INSERT INTO marks (id, school_id, student_id, course_id, teacher_id, term, academic_year, exam_type, score, max_score, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, schoolId, studentId, courseId, teacherId, term, academicYear, examType || null, score, maxScore || 100, remarks || null]
    );

    const created = await query('SELECT * FROM marks WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

async function bulkCreate(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { marks } = req.body;
    const teacherId = req.user.teacherId;

    if (!Array.isArray(marks) || marks.length === 0 || !teacherId) {
      return res.status(400).json({ error: 'Marks array and teacher context required' });
    }

    for (const m of marks) {
      const id = uuidv4();
      await query(
        `INSERT INTO marks (id, school_id, student_id, course_id, teacher_id, term, academic_year, exam_type, score, max_score, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, schoolId, m.studentId, m.courseId, teacherId, m.term, m.academicYear, m.examType || null, m.score, m.maxScore || 100, m.remarks || null]
      );
    }
    res.status(201).json({ message: `${marks.length} mark(s) created` });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, bulkCreate };
