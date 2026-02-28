const { Student, User, Mark, Discipline, HomeworkSubmission, ExerciseSubmission, Payment } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { class: studentClass, page = 1, limit = 20 } = req.query;
    const where = {};
    if (studentClass) where.class = studentClass;
    
    const { count, rows } = await Student.findAndCountAll({
      where,
      include: [{ model: User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ students: rows, total: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }],
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { user, ...studentData } = req.body;
    const userRecord = await User.create(user);
    const student = await Student.create({
      ...studentData,
      userId: userRecord.id,
    });
    res.status(201).json(await Student.findByPk(student.id, { include: ['User'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    await student.update(req.body);
    res.json(await Student.findByPk(student.id, { include: ['User'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    await User.destroy({ where: { id: student.userId } });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
