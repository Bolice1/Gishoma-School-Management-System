const { Course, Teacher, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: Teacher,
          as: 'Teacher',
          include: [{ model: User, as: 'User', attributes: ['firstName', 'lastName'] }],
        },
      ],
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: Teacher, as: 'Teacher', include: ['User'] }],
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(await Course.findByPk(course.id, { include: ['Teacher'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    await course.update(req.body);
    res.json(await Course.findByPk(course.id, { include: ['Teacher'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    await course.destroy();
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
