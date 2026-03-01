const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

function getSchoolId(req) {
  return req.contextSchoolId || req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = req.userRole === 'super_admin' ? req.query.schoolId : getSchoolId(req);

    let where = '(a.school_id = ? OR a.school_id IS NULL)';
    const params = [schoolId];

    const rows = await query(
      `SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name
       FROM announcements a LEFT JOIN users u ON a.author_id = u.id
       WHERE ${where} AND a.is_active = 1 ORDER BY a.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const schoolId = req.userRole === 'super_admin' ? req.body.schoolId : getSchoolId(req);
    const { title, content, targetRole, priority } = req.body;

    const id = uuidv4();
    await query(
      `INSERT INTO announcements (id, school_id, title, content, author_id, target_role, priority) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, schoolId, title, content, req.userId, targetRole || 'all', priority || 'medium']
    );

    const created = await query('SELECT * FROM announcements WHERE id = ?', [id]);
    const io = req.app.get('io');
    if (io) io.to(schoolId || 'platform').emit('announcement', created[0]);
    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
