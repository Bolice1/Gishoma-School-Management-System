const { query } = require('../config/database');

async function log(activity) {
  const sql = `
    INSERT INTO activity_logs (user_id, school_id, action, resource, resource_id, details, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const details = activity.details ? JSON.stringify(activity.details) : null;
  await query(sql, [
    activity.userId || null,
    activity.schoolId || null,
    activity.action,
    activity.resource || null,
    activity.resourceId || null,
    details,
    activity.ipAddress || null,
    activity.userAgent || null,
  ]);
}

module.exports = { log };
