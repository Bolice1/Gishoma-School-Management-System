const { Announcement, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { targetRole } = req.query;
    const where = { isActive: true };
    if (targetRole) where.targetRole = targetRole;

    const announcements = await Announcement.findAll({
      where,
      include: [{ model: User, as: 'User', attributes: ['firstName', 'lastName'], required: false }],
      order: [['createdAt', 'DESC']],
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      authorId: req.userId,
    });
    const io = req.app.get('io');
    if (io) io.emit('announcement', announcement);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
