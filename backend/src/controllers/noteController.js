const { Note, Course, Teacher, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = {};
    if (courseId) where.courseId = courseId;
    
    const notes = await Note.findAll({
      where,
      include: [
        { model: Course, as: 'Course' },
        { model: Teacher, as: 'Teacher', include: ['User'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(await Note.findByPk(note.id, { include: ['Course', 'Teacher'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    await note.update(req.body);
    res.json(await Note.findByPk(note.id, { include: ['Course', 'Teacher'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
