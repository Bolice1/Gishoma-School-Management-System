const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

const SALT_ROUNDS = 12;
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY;
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY;

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

async function storeRefreshToken(userId, token) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const id = uuidv4();
  await query(
    'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [id, userId, hash, expiresAt]
  );
  return { token, expiresAt };
}

async function revokeRefreshToken(token) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  await query('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?', [hash]);
}

async function validateRefreshToken(token) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const rows = await query(  // ← add [rows] destructuring
    'SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = 0 AND expires_at > NOW()',
    [hash]
  );
  return rows[0] || null;
}
async function findUserByEmail(email, schoolId = null) {
  let rows;
  if (schoolId) {
    rows = await query(
      'SELECT * FROM users WHERE email = ? AND school_id = ? AND is_active = 1',
      [email, schoolId]
    );
  } else {
    rows = await query(
      'SELECT * FROM users WHERE email = ? AND is_active = 1 ORDER BY school_id IS NULL DESC LIMIT 1',
      [email]
    );
  }
  return rows[0];
}

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  storeRefreshToken,
  revokeRefreshToken,
  validateRefreshToken,
  findUserByEmail,
};
