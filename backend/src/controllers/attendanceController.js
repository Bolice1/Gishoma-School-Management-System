const { Attendance, Student, Teacher, Course, User } = require('../models');
const { Op } = require('sequelize');

exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    const where = { type: 'student' };
    if (studentId) where.studentId = studentId;
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const attendance = await Attendance.findAll({
      where,
      include: [
        { model: Student, as: 'Student', include: ['User'] },
        { model: Course, as: 'Course' },
      ],
      order: [['date', 'DESC']],
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeacherAttendance = async (req, res) => {
  try {
    const { teacherId, startDate, endDate } = req.query;
    const where = { type: 'teacher' };
    if (teacherId) where.teacherId = teacherId;
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Teacher, as: 'Teacher', include: ['User'] }],
      order: [['date', 'DESC']],
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.recordAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    const created = await Attendance.bulkCreate(records);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const studentAttendance = await Attendance.findAll({
      where: { ...where, type: 'student' },
      attributes: ['status', 'studentId'],
    });
    
    const teacherAttendance = await Attendance.findAll({
      where: { ...where, type: 'teacher' },
      attributes: ['status', 'teacherId'],
    });
    
    const studentStats = { present: 0, absent: 0, late: 0 };
    studentAttendance.forEach(a => {
      if (a.status in studentStats) studentStats[a.status]++;
    });
    
    const teacherStats = { present: 0, absent: 0, late: 0 };
    teacherAttendance.forEach(a => {
      if (a.status in teacherStats) teacherStats[a.status]++;
    });
    
    res.json({ student: studentStats, teacher: teacherStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
