const authService = require('../services/authService');
const { query } = require('../config/database');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = authService.verifyAccessToken(token);
    } catch(e) {
      return res.status(401).json({ error: 'JWT failed: ' + e.message });
    }

    const users = await query('SELECT * FROM users WHERE id = ? AND is_active = 1', [decoded.userId]);
    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    req.schoolId = user.school_id;
    next();
  } catch (err) {
    next(err);
  }
}
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

function requireSchoolContext(req, res, next) {
  if (req.userRole === 'super_admin') return next();
  if (!req.schoolId) {
    return res.status(403).json({ error: 'School context required.' });
  }
  next();
}

module.exports = { authenticate, authorize, requireSchoolContext };
