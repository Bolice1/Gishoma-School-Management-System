const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function listStudents(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { startDate, endDate, studentId } = req.query;

    let where = 'a.school_id = ? AND a.type = "student"';
    const params = [schoolId];
    if (startDate) { where += ' AND a.date >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND a.date <= ?'; params.push(endDate); }
    if (studentId) { where += ' AND a.student_id = ?'; params.push(studentId); }

    const rows = await query(
      `SELECT a.*, s.student_id as student_no, u.first_name, u.last_name FROM attendance a
       JOIN students s ON a.student_id = s.id JOIN users u ON s.user_id = u.id WHERE ${where} ORDER BY a.date DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function listTeachers(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { startDate, endDate, teacherId } = req.query;

    let where = 'a.school_id = ? AND a.type = "teacher"';
    const params = [schoolId];
    if (startDate) { where += ' AND a.date >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND a.date <= ?'; params.push(endDate); }
    if (teacherId) { where += ' AND a.teacher_id = ?'; params.push(teacherId); }

    const rows = await query(
      `SELECT a.*, t.employee_id, u.first_name, u.last_name FROM attendance a
       JOIN teachers t ON a.teacher_id = t.id JOIN users u ON t.user_id = u.id WHERE ${where} ORDER BY a.date DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function record(req, res, next) {
  try {
    const schoolId = getSchoolId(req);
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Records array required' });
    }

    for (const r of records) {
      const id = uuidv4();
      await query(
        `INSERT INTO attendance (id, school_id, student_id, teacher_id, course_id, date, status, type, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, schoolId, r.studentId || null, r.teacherId || null, r.courseId || null, r.date, r.status, r.type, r.remarks || null]
      );
    }
    res.status(201).json({ message: `${records.length} record(s) created` });
  } catch (err) {
    next(err);
  }
}

module.exports = { listStudents, listTeachers, record };
