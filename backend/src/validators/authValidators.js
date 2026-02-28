const { body } = require('express-validator');

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain a letter'),
  body('firstName').trim().notEmpty().isLength({ max: 100 }).withMessage('First name required'),
  body('lastName').trim().notEmpty().isLength({ max: 100 }).withMessage('Last name required'),
  body('role').isIn(['school_admin', 'bursar', 'dean', 'teacher', 'student']).withMessage('Invalid role'),
  body('schoolId').optional().isUUID().withMessage('Invalid school ID'),
];

const refreshRules = [
  body('refreshToken').notEmpty().withMessage('Refresh token required'),
];

module.exports = { loginRules, registerRules, refreshRules };
