const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const emailService = require('../services/emailService');

function getSchoolId(req) {
  return req.schoolId;
}

async function list(req, res, next) {
  try {
    const schoolId = req.userRole === 'super_admin' ? req.query.schoolId : getSchoolId(req);
    let rows;
    if (!schoolId) {
      rows = await query('SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name FROM announcements a LEFT JOIN users u ON a.author_id = u.id WHERE a.is_active = 1 ORDER BY a.created_at DESC');
    } else {
      rows = await query('SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name FROM announcements a LEFT JOIN users u ON a.author_id = u.id WHERE (a.school_id = ? OR a.school_id IS NULL) AND a.is_active = 1 ORDER BY a.created_at DESC', [schoolId]);
    }
    res.json(rows);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const schoolId = req.userRole === 'super_admin' ? req.body.schoolId : getSchoolId(req);
    const { title, content, targetRole, priority } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
    
    const id = uuidv4();
    await query('INSERT INTO announcements (id, school_id, title, content, author_id, target_role, priority) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, schoolId || null, title, content, req.userId, targetRole || 'all', priority || 'medium']);
    
    const created = await query('SELECT * FROM announcements WHERE id = ?', [id]);
    const io = req.app.get('io');
    if (io) io.to(schoolId || 'platform').emit('announcement', created[0]);

    // Send announcement emails (non-blocking)
    try {
      // Get school name
      const schoolRows = await query('SELECT name FROM schools WHERE id = ?', [schoolId]);
      const schoolName = schoolRows[0]?.name || 'Gishoma';

      // Get author name
      const authorRows = await query('SELECT first_name, last_name FROM users WHERE id = ?', [req.userId]);
      const authorName = authorRows[0] ? `${authorRows[0].first_name} ${authorRows[0].last_name}` : 'School Admin';

      // Fetch recipients based on target_role
      let roleFilter;
      if (targetRole === 'all' || !targetRole) {
        roleFilter = "u.role IN ('student','teacher','dean','bursar','patron','matron')";
      } else {
        roleFilter = `u.role = '${targetRole}'`;
      }

      const recipients = await query(
        `SELECT u.first_name, u.email FROM users u 
         WHERE u.school_id = ? AND u.is_active = 1 AND ${roleFilter}`,
        [schoolId]
      );

      // Send bulk announcement emails
      await emailService.sendBulkEmails(recipients, async (recipient) =>
        emailService.sendAnnouncementEmail({
          to: recipient.email,
          firstName: recipient.first_name,
          announcementTitle: title,
          announcementContent: content,
          priority: priority || 'normal',
          authorName,
          schoolName,
        })
      );
    } catch (emailErr) {
      console.error('Announcement email campaign failed:', emailErr.message);
    }

    res.status(201).json(created[0]);
  } catch (err) { next(err); }
}

module.exports = { list, create };
