const express = require('express');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { query } = require('../config/database');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware to protect all email routes
router.use(authenticate);

/**
 * GET /api/email/recipients
 * Get list of users in the school for recipient selection
 */
router.get('/recipients', requireSchoolContext, authorize('school_admin', 'teacher', 'dean', 'patron', 'matron'), async (req, res, next) => {
  try {
    const schoolId = req.schoolId;
    
    const recipients = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role
       FROM users u
       WHERE u.school_id = ? AND u.is_active = 1
       AND u.role IN ('student', 'teacher', 'patron', 'matron', 'dean', 'bursar', 'school_admin')
       ORDER BY u.role, u.first_name`,
      [schoolId]
    );

    res.json(recipients.map(r => ({
      id: r.id,
      name: `${r.first_name} ${r.last_name}`,
      email: r.email,
      role: r.role,
    })));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/email/send-announcement
 * Send announcement email to users by role or specific recipients
 */
router.post('/send-announcement', requireSchoolContext, authorize('school_admin', 'teacher', 'dean', 'patron', 'matron'), async (req, res, next) => {
  try {
    const schoolId = req.schoolId;
    const { subject, message, targetRole, recipientIds } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Get school name
    const schoolRows = await query('SELECT name FROM schools WHERE id = ?', [schoolId]);
    const schoolName = schoolRows[0]?.name || 'Gishoma';

    // Get author name
    const authorRows = await query('SELECT first_name, last_name FROM users WHERE id = ?', [req.userId]);
    const authorName = authorRows[0] ? `${authorRows[0].first_name} ${authorRows[0].last_name}` : 'School Admin';

    // Fetch recipients based on selection
    let recipients = [];
    if (recipientIds && recipientIds.length > 0) {
      // Send to specific selected recipients
      const placeholders = recipientIds.map(() => '?').join(',');
      recipients = await query(
        `SELECT first_name, email FROM users WHERE id IN (${placeholders}) AND school_id = ? AND is_active = 1`,
        [...recipientIds, schoolId]
      );
    } else if (targetRole && targetRole !== 'all') {
      // Send to all users of a specific role
      recipients = await query(
        `SELECT first_name, email FROM users WHERE school_id = ? AND role = ? AND is_active = 1`,
        [schoolId, targetRole]
      );
    } else {
      // Send to all users
      recipients = await query(
        `SELECT first_name, email FROM users WHERE school_id = ? AND is_active = 1`,
        [schoolId]
      );
    }

    // Send bulk announcement emails
    const results = await emailService.sendBulkEmails(recipients, async (recipient) =>
      emailService.sendAnnouncementEmail({
        to: recipient.email,
        firstName: recipient.first_name,
        announcementTitle: subject,
        announcementContent: message,
        priority: 'normal',
        authorName,
        schoolName,
      })
    );

    logger.info(`Announcement email campaign: sent=${results.sent}, failed=${results.failed}, schoolId=${schoolId}`);
    res.json({
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/email/send-custom
 * Send custom email to specific selected recipients
 */
router.post('/send-custom', requireSchoolContext, authorize('school_admin', 'patron', 'matron'), async (req, res, next) => {
  try {
    const schoolId = req.schoolId;
    const { recipientIds, subject, message } = req.body;

    if (!recipientIds || recipientIds.length === 0) {
      return res.status(400).json({ error: 'At least one recipient is required' });
    }

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Fetch selected recipients
    const placeholders = recipientIds.map(() => '?').join(',');
    const recipients = await query(
      `SELECT first_name, email FROM users WHERE id IN (${placeholders}) AND school_id = ? AND is_active = 1`,
      [...recipientIds, schoolId]
    );

    // Send custom emails
    const results = await emailService.sendBulkEmails(recipients, async (recipient) =>
      emailService.sendEmail({
        to: recipient.email,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: system-ui, -apple-system, sans-serif; background-color: #0f172a; color: #e2e8f0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 1rem;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 2rem; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="margin: 0;">Gishoma</h1>
                <p style="margin: 0.5rem 0 0 0;">Message from your school</p>
              </div>

              <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 0 0 12px 12px; padding: 2rem;">
                <p>Hello ${recipient.first_name},</p>
                
                <div style="background-color: #0f172a; padding: 1.5rem; border-radius: 8px; line-height: 1.6; color: #cbd5e1;">
                  ${message.replace(/\n/g, '<br>')}
                </div>

                <p style="color: #94a3b8; font-size: 0.875rem; margin-top: 2rem; border-top: 1px solid #334155; padding-top: 1rem; text-align: center;">
                  © 2024 Gishoma Multi-School Management System
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: message,
      })
    );

    logger.info(`Custom email campaign: sent=${results.sent}, failed=${results.failed}, schoolId=${schoolId}`);
    res.json({
      sent: results.sent,
      failed: results.failed,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
