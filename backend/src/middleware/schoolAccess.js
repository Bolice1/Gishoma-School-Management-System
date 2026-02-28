const { query } = require('../config/database');

async function assertSchoolAccess(req, res, next) {
  if (req.userRole === 'super_admin') return next();
  const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId || req.schoolId;
  if (!schoolId) return res.status(400).json({ error: 'School ID required.' });
  if (req.schoolId && req.schoolId !== schoolId) {
    return res.status(403).json({ error: 'Access denied to this school.' });
  }
  req.contextSchoolId = schoolId;
  next();
}

async function assertResourceInSchool(req, resourceTable, resourceIdParam = 'id') {
  const resourceId = req.params[resourceIdParam];
  if (!resourceId) return null;
  const schoolId = req.contextSchoolId || req.schoolId;
  if (req.userRole === 'super_admin') return resourceId;

  const rows = await query(
    `SELECT id FROM ${resourceTable} WHERE id = ? AND school_id = ?`,
    [resourceId, schoolId]
  );
  return rows[0] ? resourceId : null;
}

module.exports = { assertSchoolAccess, assertResourceInSchool };
