const { Exercise, ExerciseSubmission, Course, Teacher, Student, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { courseId, status } = req.query;
    const where = {};
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;
    
    const exercises = await Exercise.findAll({
      where,
      include: [
        { model: Course, as: 'Course' },
        { model: Teacher, as: 'Teacher', include: ['User'] },
      ],
    });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id, {
      include: [
        { model: Course, as: 'Course' },
        { model: Teacher, as: 'Teacher', include: ['User'] },
      ],
    });
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json(await Exercise.findByPk(exercise.id, { include: ['Course', 'Teacher'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submit = async (req, res) => {
  try {
    const { exerciseId, studentId } = req.params;
    const { answers, timeSpent } = req.body;
    
    const submission = await ExerciseSubmission.create({
      exerciseId,
      studentId,
      answers: answers || {},
      submittedAt: new Date(),
      timeSpent: timeSpent || 0,
    });
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
