const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const authService = require('../services/authService');
const activityLogService = require('../services/activityLogService');

async function login(req, res, next) {
  try {
    const { email, password, schoolId } = req.body;
    const user = await authService.findUserByEmail(email, schoolId || undefined);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await authService.comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = authService.generateAccessToken({
      userId: user.id,
      role: user.role,
      schoolId: user.school_id,
    });
    const refresh = await authService.storeRefreshToken(user.id, authService.generateRefreshToken());

    await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    activityLogService.log({
      userId: user.id,
      schoolId: user.school_id,
      action: 'login',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    }).catch(() => {});

    const { password_hash, two_factor_secret, ...safeUser } = user;
    if (user.role === 'student') {
      const s = await query('SELECT id FROM students WHERE user_id = ?', [user.id]);
      safeUser.studentId = s[0]?.id;
    } else if (user.role === 'teacher') {
      const t = await query('SELECT id FROM teachers WHERE user_id = ?', [user.id]);
      safeUser.teacherId = t[0]?.id;
    }
    res.json({
      accessToken,
      refreshToken: refresh.token,
      expiresAt: refresh.expiresAt,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const record = await authService.validateRefreshToken(refreshToken);
    if (!record) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const users = await query('SELECT * FROM users WHERE id = ? AND is_active = 1', [record.user_id]);
    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    await authService.revokeRefreshToken(refreshToken);
    const newRefresh = await authService.storeRefreshToken(user.id, authService.generateRefreshToken());
    const accessToken = authService.generateAccessToken({
      userId: user.id,
      role: user.role,
      schoolId: user.school_id,
    });

    const { password_hash, two_factor_secret, ...safeUser } = user;
    res.json({
      accessToken,
      refreshToken: newRefresh.token,
      expiresAt: newRefresh.expiresAt,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  try {
    const users = await query(
      'SELECT id, school_id, email, first_name, last_name, role, phone, is_active FROM users WHERE id = ?',
      [req.userId]
    );
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'student') {
      const s = await query('SELECT id FROM students WHERE user_id = ?', [user.id]);
      user.studentId = s[0]?.id;
    } else if (user.role === 'teacher') {
      const t = await query('SELECT id FROM teachers WHERE user_id = ?', [user.id]);
      user.teacherId = t[0]?.id;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}
module.exports = { login, refresh, logout, me };
