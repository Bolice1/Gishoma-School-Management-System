const { Mark, Student, Course, Teacher, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { studentId, courseId, term, academicYear } = req.query;
    const where = {};
    if (studentId) where.studentId = studentId;
    if (courseId) where.courseId = courseId;
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;
    
    const marks = await Mark.findAll({
      where,
      include: [
        { model: Student, as: 'Student', include: ['User'] },
        { model: Course, as: 'Course' },
        { model: Teacher, as: 'Teacher', include: ['User'] },
      ],
    });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const mark = await Mark.create(req.body);
    res.status(201).json(await Mark.findByPk(mark.id, {
      include: ['Student', 'Course', 'Teacher'],
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bulkCreate = async (req, res) => {
  try {
    const { marks } = req.body;
    const created = await Mark.bulkCreate(marks);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const mark = await Mark.findByPk(req.params.id);
    if (!mark) return res.status(404).json({ error: 'Mark not found' });
    await mark.update(req.body);
    res.json(await Mark.findByPk(mark.id, { include: ['Student', 'Course', 'Teacher'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
