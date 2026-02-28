const activityLogService = require('../services/activityLogService');

function logActivity(action, resource = null) {
  return async (req, res, next) => {
    const origJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400 && req.userId) {
        activityLogService.log({
          userId: req.userId,
          schoolId: req.schoolId,
          action,
          resource,
          resourceId: req.params?.id || body?.id,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('user-agent'),
        }).catch(() => {});
      }
      return origJson(body);
    };
    next();
  };
}

module.exports = { logActivity };
