const { Discipline, Student, Teacher, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const where = {};
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    
    const disciplines = await Discipline.findAll({
      where,
      include: [
        { model: Student, as: 'Student', include: ['User'] },
        { model: Teacher, as: 'Teacher', include: ['User'] },
      ],
      order: [['date', 'DESC']],
    });
    res.json(disciplines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const discipline = await Discipline.create(req.body);
    res.status(201).json(await Discipline.findByPk(discipline.id, {
      include: ['Student', 'Teacher'],
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const discipline = await Discipline.findByPk(req.params.id);
    if (!discipline) return res.status(404).json({ error: 'Discipline record not found' });
    await discipline.update(req.body);
    res.json(await Discipline.findByPk(discipline.id, { include: ['Student', 'Teacher'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
