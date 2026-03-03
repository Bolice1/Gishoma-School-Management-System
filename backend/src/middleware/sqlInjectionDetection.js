/**
 * SQL Injection Pattern Detection Middleware
 * Detects and blocks common SQL injection patterns in request data
 */

const SQL_INJECTION_PATTERNS = [
  /(\bor\b.*=.*)/i,
  /(\bunion\b.*\bselect\b)/i,
  /(\bdrop\b.*\btable\b)/i,
  /(\bdelete\b.*\bfrom\b)/i,
  /(\bupdate\b.*\bset\b)/i,
  /(\binsert\b.*\binto\b)/i,
  /(--\s*$)/i,
  /;\s*--/i,
  /\/\*.*?\*\//i,
  /(xp_|sp_)/i,
  /(\bexec\b|\bexecute\b)/i,
];

function containsSQLInjectionPattern(str) {
  if (typeof str !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(str));
}

function checkObjectForSQLInjection(obj, path = '') {
  if (!obj || typeof obj !== 'object') return null;

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof value === 'string') {
      if (containsSQLInjectionPattern(value)) {
        return {
          detected: true,
          path: currentPath,
          pattern: value.substring(0, 50),
        };
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
      const result = checkObjectForSQLInjection(value, currentPath);
      if (result) return result;
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === 'string') {
          if (containsSQLInjectionPattern(value[i])) {
            return {
              detected: true,
              path: `${currentPath}[${i}]`,
              pattern: value[i].substring(0, 50),
            };
          }
        }
      }
    }
  }

  return null;
}

function sqlInjectionDetectionMiddleware(req, res, next) {
  let suspiciousData = null;

  if (req.body) {
    suspiciousData = checkObjectForSQLInjection(req.body);
  }

  if (!suspiciousData && req.query) {
    suspiciousData = checkObjectForSQLInjection(req.query);
  }

  if (!suspiciousData && req.params) {
    suspiciousData = checkObjectForSQLInjection(req.params);
  }

  if (suspiciousData) {
    // Log security event
    console.error('🚨 SQL Injection attempt detected:', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      method: req.method,
      url: req.url,
      userId: req.userId || 'unauthenticated',
      suspiciousPath: suspiciousData.path,
      pattern: suspiciousData.pattern,
    });

    return res.status(400).json({
      error: 'Invalid input detected. Request rejected.',
      code: 'INVALID_INPUT',
    });
  }

  next();
}

module.exports = { sqlInjectionDetectionMiddleware, containsSQLInjectionPattern };
