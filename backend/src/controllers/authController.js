const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const authService = require('../services/authService');
const activityLogService = require('../services/activityLogService');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email (no schoolId filter - auto-detect from DB)
    const users = await query(
      'SELECT u.*, s.name as school_name, s.is_active as school_active FROM users u LEFT JOIN schools s ON u.school_id = s.id WHERE u.email = ? AND u.is_active = 1',
      [email.toLowerCase()]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Verify password
    const valid = await authService.comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if school is active (if user belongs to a school)
    if (user.school_id && user.school_active === 0) {
      return res.status(403).json({ 
        error: 'Your school account has been deactivated. Contact the platform administrator.' 
      });
    }

    // Generate tokens with schoolId from database
    const accessToken = authService.generateAccessToken({
      userId: user.id,
      role: user.role,
      schoolId: user.school_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
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

    const { password_hash, two_factor_secret, school_active, ...safeUser } = user;
    
    // Add student/teacher IDs if applicable
    if (user.role === 'student') {
      const s = await query('SELECT id, is_prefect FROM students WHERE user_id = ?', [user.id]);
      safeUser.studentId = s[0]?.id;
      safeUser.is_prefect = s[0]?.is_prefect || 'none';
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

    const users = await query(
      'SELECT id, school_id, email, first_name, last_name, role, phone, is_active, created_at FROM users WHERE id = ? AND is_active = 1',
      [record.user_id]
    );
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

    // Blacklist the access token on logout
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = require('jsonwebtoken').decode(token);
        const expiresAt = decoded?.exp
          ? new Date(decoded.exp * 1000)
          : new Date(Date.now() + 15 * 60 * 1000);
        await query(
          'INSERT IGNORE INTO blacklisted_tokens (token, expires_at) VALUES (?, ?)',
          [token, expiresAt]
        );
      } catch (err) {
        // Token blacklist is nice-to-have, don't fail logout if it fails
      }
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
