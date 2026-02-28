const { body, param } = require('express-validator');

const createSchoolRules = [
  body('name').trim().notEmpty().isLength({ max: 255 }).withMessage('School name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().trim().isLength({ max: 50 }),
  body('address').optional().trim(),
  body('region').optional().trim().isLength({ max: 100 }),
];

const updateSchoolRules = [
  param('id').isUUID().withMessage('Invalid school ID'),
  body('name').optional().trim().isLength({ max: 255 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 50 }),
  body('address').optional().trim(),
  body('region').optional().trim().isLength({ max: 100 }),
  body('isActive').optional().isBoolean(),
  body('subscription_tier').optional().isIn(['free', 'basic', 'premium', 'enterprise']),
];

module.exports = { createSchoolRules, updateSchoolRules };
