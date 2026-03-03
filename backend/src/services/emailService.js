const transporter = require('../config/mialer');
const logger = require('../utils/logger');

// HTML Email Template Styles
const STYLES = {
  base: `
    font-family: system-ui, -apple-system, sans-serif;
    background-color: #0f172a;
    color: #e2e8f0;
  `,
  card: `
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 2rem;
    margin: 1rem 0;
  `,
  header: `
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    color: white;
    padding: 2rem;
    border-radius: 12px 12px 0 0;
    text-align: center;
    margin-bottom: 2rem;
  `,
  button: `
    background-color: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    display: inline-block;
    margin: 1rem 0;
  `,
  footer: `
    color: #94a3b8;
    font-size: 0.875rem;
    text-align: center;
    margin-top: 2rem;
    border-top: 1px solid #334155;
    padding-top: 1rem;
  `,
};

/**
 * Send a generic email
 */
async function sendEmail({ to, subject, html, text }) {
  try {
    const mailOptions = {
      from: `Gishoma Management System <${process.env.EMAIL || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || '',
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Email send failed to ${to}:`, error.message);
    throw error;
  }
}

/**
 * Send welcome email to new student or teacher
 */
async function sendWelcomeEmail({ to, firstName, role, password }) {
  const roleLabel = role === 'student' ? 'Student' : role === 'teacher' ? 'Teacher' : 'User';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="${STYLES.base}">
      <div style="max-width: 600px; margin: 0 auto; padding: 1rem;">
        <div style="${STYLES.header}">
          <h1 style="margin: 0; font-size: 2rem;">Gishoma</h1>
          <p style="margin: 0.5rem 0 0 0;">Multi-School Management System</p>
        </div>

        <div style="${STYLES.card}">
          <h2 style="color: #3b82f6; margin-top: 0;">Welcome, ${firstName}!</h2>
          
          <p>Your ${roleLabel} account has been created successfully in the Gishoma Management System.</p>
          
          <p style="background-color: #0f172a; padding: 1rem; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <strong>Your Login Credentials:</strong><br>
            Email: <code style="background-color: #1e293b; padding: 0.25rem 0.5rem; border-radius: 4px;">${to}</code><br>
            Password: <code style="background-color: #1e293b; padding: 0.25rem 0.5rem; border-radius: 4px;">${password}</code>
          </p>

          <h3 style="color: #e2e8f0;">What You Can Do:</h3>
          <ul style="color: #cbd5e1;">
            <li>Access your personalized dashboard</li>
            <li>View announcements and assignments</li>
            <li>Track attendance and performance</li>
            <li>Participate in the school community</li>
            <li>Communicate with teachers and peers</li>
          </ul>

          <p style="color: #cbd5e1; margin-top: 2rem;">
            <strong>Next Step:</strong> Log in at <code style="background-color: #1e293b; padding: 0.25rem 0.5rem; border-radius: 4px;">http://localhost:5173</code>
          </p>

          <p style="color: #94a3b8; font-size: 0.875rem; margin-top: 2rem;">
            If you did not create this account or have any questions, please contact your school administrator.
          </p>
        </div>

        <div style="${STYLES.footer}">
          <p>© 2024 Gishoma Multi-School Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Welcome to Gishoma - ${roleLabel} Account Created`,
    html,
    text: `Welcome ${firstName}! Your account has been created. Email: ${to}, Password: ${password}`,
  });
}

/**
 * Send announcement email to users
 */
async function sendAnnouncementEmail({
  to,
  firstName,
  announcementTitle,
  announcementContent,
  priority = 'normal',
  authorName,
  schoolName,
}) {
  const priorityColor = priority === 'high' ? '#ef4444' : priority === 'urgent' ? '#dc2626' : '#3b82f6';
  const priorityBg = priority === 'high' ? '#fee2e2' : priority === 'urgent' ? '#fecaca' : '#dbeafe';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="${STYLES.base}">
      <div style="max-width: 600px; margin: 0 auto; padding: 1rem;">
        <div style="${STYLES.header}">
          <h1 style="margin: 0;">📢 ${schoolName}</h1>
          <p style="margin: 0.5rem 0 0 0;">New Announcement</p>
        </div>

        <div style="${STYLES.card}">
          <p>Hello ${firstName},</p>

          ${
            priority !== 'normal'
              ? `<div style="background-color: ${priorityBg}; border-left: 4px solid ${priorityColor}; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                  <strong style="color: ${priorityColor};">${priority.toUpperCase()} PRIORITY</strong>
                </div>`
              : ''
          }

          <h2 style="color: #3b82f6; margin: 1.5rem 0 0.5rem 0;">${announcementTitle}</h2>

          <div style="background-color: #0f172a; padding: 1.5rem; border-radius: 8px; line-height: 1.6; color: #cbd5e1;">
            ${announcementContent.replace(/\n/g, '<br>')}
          </div>

          <div style="background-color: #0f172a; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; font-size: 0.875rem; color: #94a3b8;">
            <p style="margin: 0;">
              <strong style="color: #cbd5e1;">From:</strong> ${authorName}<br>
              <strong style="color: #cbd5e1;">School:</strong> ${schoolName}
            </p>
          </div>

          <p style="color: #cbd5e1; margin-top: 2rem;">
            Log in to your dashboard to view more details and respond if needed.
          </p>
        </div>

        <div style="${STYLES.footer}">
          <p>© 2024 Gishoma Multi-School Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `[${schoolName}] ${announcementTitle}${priority !== 'normal' ? ` (${priority.toUpperCase()})` : ''}`,
    html,
    text: `Announcement: ${announcementTitle}\n\n${announcementContent}\n\nFrom: ${authorName}`,
  });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail({ to, firstName, tempPassword }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="${STYLES.base}">
      <div style="max-width: 600px; margin: 0 auto; padding: 1rem;">
        <div style="${STYLES.header}">
          <h1 style="margin: 0;">🔐 Password Reset</h1>
          <p style="margin: 0.5rem 0 0 0;">Gishoma Management System</p>
        </div>

        <div style="${STYLES.card}">
          <p>Hello ${firstName},</p>

          <p style="color: #cbd5e1;">Your password has been reset by your school administrator. Here is your temporary password:</p>

          <div style="background-color: #0f172a; padding: 1.5rem; border: 2px solid #3b82f6; border-radius: 8px; text-align: center; margin: 1.5rem 0;">
            <p style="color: #94a3b8; font-size: 0.875rem; margin: 0 0 0.5rem 0;">Temporary Password:</p>
            <code style="font-size: 1.25rem; font-weight: bold; color: #3b82f6; letter-spacing: 2px;">${tempPassword}</code>
          </div>

          <p style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 1rem; border-radius: 4px; color: #991b1b;">
            <strong>⚠️ Important:</strong> Please change this temporary password immediately after logging in for security.
          </p>

          <h3 style="color: #e2e8f0;">How to Log In:</h3>
          <ol style="color: #cbd5e1;">
            <li>Visit the Gishoma portal</li>
            <li>Enter your email: <code style="background-color: #1e293b; padding: 0.25rem 0.5rem; border-radius: 4px;">${to}</code></li>
            <li>Enter the temporary password above</li>
            <li>Change your password to something secure</li>
          </ol>

          <p style="color: #cbd5e1; margin-top: 2rem;">
            If you did not request this password reset or have any questions, please contact your school administrator immediately.
          </p>
        </div>

        <div style="${STYLES.footer}">
          <p>© 2024 Gishoma Multi-School Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Your Temporary Password - Gishoma Management System',
    html,
    text: `Your temporary password: ${tempPassword}\n\nPlease change it immediately after logging in.`,
  });
}

/**
 * Send bulk emails to multiple recipients
 * templateFn should be an async function that takes a recipient and returns email config
 */
async function sendBulkEmails(recipients, templateFn) {
  const results = {
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (const recipient of recipients) {
    try {
      await templateFn(recipient);
      results.sent++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        recipient: recipient.email || recipient,
        error: error.message,
      });
      logger.error(`Bulk email failed for ${recipient.email || recipient}:`, error.message);
    }
  }

  return results;
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAnnouncementEmail,
  sendPasswordResetEmail,
  sendBulkEmails,
};
