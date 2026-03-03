/**
 * Brute Force Protection Service
 * Tracks login attempts and implements account lockout
 */

const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
const LOCKOUT_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10);

/**
 * Record a login attempt
 */
async function recordLoginAttempt(email, ipAddress, userAgent, success = false) {
  try {
    await query(
      'INSERT INTO login_attempts (id, email, ip_address, user_agent, attempted_at, success) VALUES (?, ?, ?, ?, NOW(), ?)',
      [uuidv4(), email.toLowerCase(), ipAddress, userAgent, success ? 1 : 0]
    );
  } catch (err) {
    console.error('Failed to record login attempt:', err.message);
  }
}

/**
 * Check if an email/IP is locked out
 */
async function isLockedOut(emailOrIp, isEmail = true) {
  try {
    const field = isEmail ? 'email' : 'ip_address';
    const rows = await query(
      `SELECT * FROM account_lockouts WHERE user_id = (SELECT id FROM users WHERE ${field} = ?) AND locked_until > NOW()`,
      [emailOrIp]
    );
    return rows.length > 0;
  } catch (err) {
    console.error('Failed to check lockout status:', err.message);
    return false;
  }
}

/**
 * Get recent failed login attempts
 */
async function getFailedAttempts(emailOrIp, isEmail = true, minutes = LOCKOUT_MINUTES) {
  try {
    const field = isEmail ? 'email' : 'ip_address';
    const rows = await query(
      `SELECT COUNT(*) as count FROM login_attempts WHERE ${field} = ? AND success = 0 AND attempted_at > DATE_SUB(NOW(), INTERVAL ${minutes} MINUTE)`,
      [emailOrIp]
    );
    return rows[0]?.count || 0;
  } catch (err) {
    console.error('Failed to get login attempts:', err.message);
    return 0;
  }
}

/**
 * Enforce brute force protection
 * Returns { allowed: boolean, reason?: string }
 */
async function enforceBruteForceProtection(email, ipAddress) {
  // Check if email is locked out
  const emailLocked = await isLockedOut(email, true);
  if (emailLocked) {
    return {
      allowed: false,
      reason: 'Account temporarily locked due to too many failed login attempts. Try again in 15 minutes.',
    };
  }

  // Check failed attempts from this IP
  const failedFromIP = await getFailedAttempts(ipAddress, false);
  if (failedFromIP >= MAX_LOGIN_ATTEMPTS * 3) {
    // IP is hammering us, block harder
    return {
      allowed: false,
      reason: 'Too many failed login attempts from this IP. Try again later.',
    };
  }

  // Check failed attempts from this email
  const failedFromEmail = await getFailedAttempts(email, true);
  if (failedFromEmail >= MAX_LOGIN_ATTEMPTS) {
    return {
      allowed: false,
      reason: 'Too many failed login attempts. Try again in 15 minutes.',
    };
  }

  return { allowed: true };
}

/**
 * Lock an account after too many failures
 */
async function lockAccount(userId, reason = 'Too many failed login attempts') {
  try {
    const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    await query(
      'INSERT INTO account_lockouts (id, user_id, locked_until, reason) VALUES (?, ?, ?, ?)',
      [uuidv4(), userId, lockedUntil, reason]
    );
  } catch (err) {
    console.error('Failed to lock account:', err.message);
  }
}

/**
 * Clear failed attempts for an email after successful login
 */
async function clearFailedAttempts(email) {
  try {
    // In production, we'd want to mark these as cleared
    // For now, old attempts naturally expire via the time window check
  } catch (err) {
    console.error('Failed to clear login attempts:', err.message);
  }
}

/**
 * Cleanup old login attempts (run periodically)
 */
async function cleanupOldAttempts(daysOld = 30) {
  try {
    await query(
      'DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysOld]
    );
  } catch (err) {
    console.error('Failed to cleanup old login attempts:', err.message);
  }
}

module.exports = {
  recordLoginAttempt,
  isLockedOut,
  getFailedAttempts,
  enforceBruteForceProtection,
  lockAccount,
  clearFailedAttempts,
  cleanupOldAttempts,
};
