const { Teacher, User, Course } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { count, rows } = await Teacher.findAndCountAll({
      include: [
        { model: User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] },
        { model: Course, as: 'Courses' },
      ],
    });
    res.json({ teachers: rows, total: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [
        { model: User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] },
        { model: Course, as: 'Courses' },
      ],
    });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { user, ...teacherData } = req.body;
    const userRecord = await User.create(user);
    const teacher = await Teacher.create({
      ...teacherData,
      userId: userRecord.id,
    });
    res.status(201).json(await Teacher.findByPk(teacher.id, { include: ['User'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    await teacher.update(req.body);
    res.json(await Teacher.findByPk(teacher.id, { include: ['User'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
