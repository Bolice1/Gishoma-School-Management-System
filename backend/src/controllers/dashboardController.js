const { query } = require('../config/database');

async function superAdminDashboard(req, res, next) {
  try {
    const sc = await query('SELECT COUNT(*) as c FROM schools WHERE is_active = 1');
    const uc = await query('SELECT COUNT(*) as c FROM users WHERE is_active = 1');
    const stc = await query('SELECT COUNT(*) as c FROM students s JOIN schools sc ON s.school_id = sc.id WHERE sc.is_active = 1');
    const tc = await query('SELECT COUNT(*) as c FROM teachers t JOIN schools sc ON t.school_id = sc.id WHERE sc.is_active = 1');

    res.json({
      totalSchools: sc[0]?.c || 0,
      totalUsers: uc[0]?.c || 0,
      totalStudents: stc[0]?.c || 0,
      totalTeachers: tc[0]?.c || 0,
    });
  } catch (err) {
    next(err);
  }
}

async function schoolAdminDashboard(req, res, next) {
  try {
    const schoolId = req.schoolId;
    const st = await query('SELECT COUNT(*) as c FROM students WHERE school_id = ?', [schoolId]);
    const t = await query('SELECT COUNT(*) as c FROM teachers WHERE school_id = ?', [schoolId]);
    const c = await query('SELECT COUNT(*) as c FROM courses WHERE school_id = ?', [schoolId]);
    const d = await query('SELECT COUNT(*) as c FROM disciplines WHERE school_id = ? AND status = "open"', [schoolId]);

    res.json({
      totalStudents: st[0]?.c || 0,
      totalTeachers: t[0]?.c || 0,
      totalCourses: c[0]?.c || 0,
      openDisciplines: d[0]?.c || 0,
    });
  } catch (err) {
    next(err);
  }
}

async function bursarDashboard(req, res, next) {
  try {
    const schoolId = req.schoolId;
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStr = monthStart.toISOString().split('T')[0];

    const todayPay = await query(
      'SELECT COUNT(*) as cnt, COALESCE(SUM(amount), 0) as total FROM payments WHERE school_id = ? AND DATE(payment_date) = ?',
      [schoolId, today]
    );
    const monthPay = await query(
      'SELECT COUNT(*) as cnt, COALESCE(SUM(amount), 0) as total FROM payments WHERE school_id = ? AND DATE(payment_date) >= ?',
      [schoolId, monthStr]
    );

    res.json({
      todayPayments: todayPay[0]?.cnt || 0,
      todayTotal: Number(todayPay[0]?.total || 0),
      monthPayments: monthPay[0]?.cnt || 0,
      monthTotal: Number(monthPay[0]?.total || 0),
    });
  } catch (err) {
    next(err);
  }
}

async function deanDashboard(req, res, next) {
  try {
    const schoolId = req.schoolId;
    const today = new Date().toISOString().split('T')[0];

    const sPresent = await query(
      'SELECT COUNT(*) as c FROM attendance WHERE school_id = ? AND date = ? AND type = "student" AND status = "present"',
      [schoolId, today]
    );
    const sAbsent = await query(
      'SELECT COUNT(*) as c FROM attendance WHERE school_id = ? AND date = ? AND type = "student" AND status = "absent"',
      [schoolId, today]
    );
    const tPresent = await query(
      'SELECT COUNT(*) as c FROM attendance WHERE school_id = ? AND date = ? AND type = "teacher" AND status = "present"',
      [schoolId, today]
    );
    const tAbsent = await query(
      'SELECT COUNT(*) as c FROM attendance WHERE school_id = ? AND date = ? AND type = "teacher" AND status = "absent"',
      [schoolId, today]
    );

    res.json({
      studentPresent: sPresent[0]?.c || 0,
      studentAbsent: sAbsent[0]?.c || 0,
      teacherPresent: tPresent[0]?.c || 0,
      teacherAbsent: tAbsent[0]?.c || 0,
    });
  } catch (err) {
    next(err);
  }
}

async function teacherDashboard(req, res, next) {
  try {
    const teacherId = req.user.teacherId || req.params.teacherId;
    if (!teacherId) return res.status(400).json({ error: 'Teacher ID required' });

    const schoolIdRow = await query('SELECT school_id FROM teachers WHERE id = ?', [teacherId]);
    const schoolId = schoolIdRow[0]?.school_id;
    if (!schoolId) return res.status(404).json({ error: 'Teacher not found' });

    const marks = await query('SELECT COUNT(*) as c FROM marks WHERE teacher_id = ?', [teacherId]);
    const homeworks = await query('SELECT COUNT(*) as c FROM homework WHERE teacher_id = ? AND status = "published"', [teacherId]);
    const exercises = await query('SELECT COUNT(*) as c FROM exercises WHERE teacher_id = ? AND status = "active"', [teacherId]);
    const disciplines = await query('SELECT COUNT(*) as c FROM disciplines WHERE teacher_id = ?', [teacherId]);

    res.json({
      marksAdded: marks[0]?.c || 0,
      homeworks: homeworks[0]?.c || 0,
      exercises: exercises[0]?.c || 0,
      disciplineCases: disciplines[0]?.c || 0,
    });
  } catch (err) {
    next(err);
  }
}

async function studentDashboard(req, res, next) {
  try {
    const studentId = req.user.studentId || req.params.studentId;
    if (!studentId) return res.status(400).json({ error: 'Student ID required' });

    const marks = await query('SELECT COUNT(*) as c FROM marks WHERE student_id = ?', [studentId]);
    const homeworkSub = await query('SELECT COUNT(*) as c FROM homework_submissions WHERE student_id = ?', [studentId]);
    const exSub = await query('SELECT COUNT(*) as c FROM exercise_submissions WHERE student_id = ?', [studentId]);
    const notes = await query('SELECT COUNT(DISTINCT n.id) as c FROM notes n JOIN courses c ON n.course_id = c.id JOIN enrollments e ON e.course_id = c.id AND e.student_id = ?', [studentId]);

    res.json({
      marksRecorded: marks[0]?.c || 0,
      homeworkSubmitted: homeworkSub[0]?.c || 0,
      exercisesCompleted: exSub[0]?.c || 0,
      notesAvailable: notes[0]?.c || 0,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  superAdminDashboard,
  schoolAdminDashboard,
  bursarDashboard,
  deanDashboard,
  teacherDashboard,
  studentDashboard,
};
