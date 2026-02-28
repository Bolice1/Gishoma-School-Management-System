const {
  User,
  Student,
  Teacher,
  Mark,
  Attendance,
  Payment,
  Fee,
  Discipline,
  Homework,
  Exercise,
  Note,
  HomeworkSubmission,
  ExerciseSubmission,
} = require('../models');
const { Op } = require('sequelize');

exports.adminDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.count();
    const totalTeachers = await Teacher.count();
    const totalUsers = await User.count();

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const payments = await Payment.findAll({
      where: { paymentDate: { [Op.gte]: thisMonth } },
    });
    const monthlyRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.count({
      where: { date: today, type: 'student', status: 'present' },
    });
    const todayAbsent = await Attendance.count({
      where: { date: today, type: 'student', status: 'absent' },
    });

    const openDisciplines = await Discipline.count({ where: { status: 'open' } });
    const pendingHomework = await Homework.count({ where: { status: 'published' } });

    res.json({
      totalStudents,
      totalTeachers,
      totalUsers,
      monthlyRevenue,
      todayPresent: todayAttendance,
      todayAbsent,
      openDisciplines,
      pendingHomework,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bursarDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayPayments = await Payment.findAll({
      where: { paymentDate: { [Op.gte]: today } },
      include: [{ model: Student, as: 'Student', include: ['User'] }],
    });
    const todayTotal = todayPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthPayments = await Payment.findAll({
      where: { paymentDate: { [Op.gte]: thisMonth } },
    });
    const monthTotal = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const fees = await Fee.findAll({ where: { isActive: true } });

    res.json({
      todayPayments: todayPayments.length,
      todayTotal,
      monthTotal,
      fees,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deanDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const studentPresent = await Attendance.count({
      where: { date: today, type: 'student', status: 'present' },
    });
    const studentAbsent = await Attendance.count({
      where: { date: today, type: 'student', status: 'absent' },
    });
    const teacherPresent = await Attendance.count({
      where: { date: today, type: 'teacher', status: 'present' },
    });
    const teacherAbsent = await Attendance.count({
      where: { date: today, type: 'teacher', status: 'absent' },
    });

    const totalStudents = await Student.count();
    const totalTeachers = await Teacher.count();

    res.json({
      studentPresent,
      studentAbsent,
      teacherPresent,
      teacherAbsent,
      studentAttendanceRate: totalStudents > 0 ? ((studentPresent / totalStudents) * 100).toFixed(1) : 0,
      teacherAttendanceRate: totalTeachers > 0 ? ((teacherPresent / totalTeachers) * 100).toFixed(1) : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.teacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.teacherId || req.params.teacherId;
    if (!teacherId) return res.status(400).json({ error: 'Teacher ID required' });

    const disciplines = await Discipline.count({ where: { teacherId } });
    const homeworks = await Homework.count({ where: { teacherId, status: 'published' } });
    const exercises = await Exercise.count({ where: { teacherId, status: 'active' } });
    const marks = await Mark.count({ where: { teacherId } });

    res.json({
      disciplineCases: disciplines,
      homeworks,
      exercises,
      marksAdded: marks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.studentDashboard = async (req, res) => {
  try {
    const studentId = req.user.studentId || req.params.studentId;
    if (!studentId) return res.status(400).json({ error: 'Student ID required' });

    const [notesCount, exercisesCount, homeworkSubmissions, marksCount] = await Promise.all([
      Note.count(),
      ExerciseSubmission.count({ where: { studentId } }),
      HomeworkSubmission.count({ where: { studentId } }),
      Mark.count({ where: { studentId } }),
    ]);

    res.json({
      notesAvailable: notesCount,
      exercisesCompleted: exercisesCount,
      homeworkSubmitted: homeworkSubmissions,
      marksRecorded: marksCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
