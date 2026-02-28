const { query } = require('../config/database');

async function list(req, res, next) {
  try {
    const { schoolId, userId, action, limit = 50 } = req.query;

    let where = '1=1';
    const params = [];
    if (schoolId) { where += ' AND school_id = ?'; params.push(schoolId); }
    if (userId) { where += ' AND user_id = ?'; params.push(userId); }
    if (action) { where += ' AND action = ?'; params.push(action); }
    params.push(parseInt(limit, 10));

    const rows = await query(
      `SELECT * FROM activity_logs WHERE ${where} ORDER BY created_at DESC LIMIT ?`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
