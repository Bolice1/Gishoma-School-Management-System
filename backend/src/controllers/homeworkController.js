const { Homework, HomeworkSubmission, Course, Teacher, Student, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { courseId, status } = req.query;
    const where = {};
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;
    
    const homeworks = await Homework.findAll({
      where,
      include: [
        { model: Course, as: 'Course' },
        { model: Teacher, as: 'Teacher', include: ['User'] },
        { model: HomeworkSubmission, as: 'HomeworkSubmissions' },
      ],
      order: [['dueDate', 'DESC']],
    });
    res.json(homeworks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const homework = await Homework.findByPk(req.params.id, {
      include: [
        { model: Course, as: 'Course' },
        { model: Teacher, as: 'Teacher', include: ['User'] },
        {
          model: HomeworkSubmission,
          as: 'HomeworkSubmissions',
          include: [{ model: Student, as: 'Student', include: ['User'] }],
        },
      ],
    });
    if (!homework) return res.status(404).json({ error: 'Homework not found' });
    res.json(homework);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const homework = await Homework.create(req.body);
    res.status(201).json(await Homework.findByPk(homework.id, { include: ['Course', 'Teacher'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const homework = await Homework.findByPk(req.params.id);
    if (!homework) return res.status(404).json({ error: 'Homework not found' });
    await homework.update(req.body);
    res.json(await Homework.findByPk(homework.id, { include: ['Course', 'Teacher'] }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submit = async (req, res) => {
  try {
    const { homeworkId, studentId } = req.params;
    const { content, attachments } = req.body;
    
    const submission = await HomeworkSubmission.create({
      homeworkId,
      studentId,
      content,
      attachments: attachments || [],
      submittedAt: new Date(),
      status: 'submitted',
    });
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const submission = await HomeworkSubmission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    await submission.update(req.body);
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
