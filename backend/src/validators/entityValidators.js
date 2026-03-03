const { body, param } = require('express-validator');

const createStudentRules = [
  body('firstName').trim().notEmpty().isLength({ max: 100 }).withMessage('First name is required'),
  body('lastName').trim().notEmpty().isLength({ max: 100 }).withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('studentId').optional().trim().isLength({ max: 50 }),
  body('class_level').trim().notEmpty().withMessage('Class level is required'),
  body('section').optional().trim().isLength({ max: 10 }),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('parentName').optional().trim().isLength({ max: 100 }),
  body('parentPhone').optional().trim().isLength({ max: 20 }),
  body('address').optional().trim().isLength({ max: 255 }),
];

const updateStudentRules = [
  param('id').isUUID().withMessage('Invalid student ID'),
  body('firstName').optional().trim().isLength({ max: 100 }),
  body('lastName').optional().trim().isLength({ max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('class_level').optional().trim(),
  body('section').optional().trim().isLength({ max: 10 }),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('dateOfBirth').optional().isISO8601(),
  body('parentName').optional().trim().isLength({ max: 100 }),
  body('parentPhone').optional().trim().isLength({ max: 20 }),
  body('address').optional().trim().isLength({ max: 255 }),
  body('is_prefect').optional().isIn(['none', 'head_boy', 'head_girl']).withMessage('Invalid prefect status'),
];

const createMarkRules = [
  body('studentId').isUUID().withMessage('Invalid student ID'),
  body('courseId').isUUID().withMessage('Invalid course ID'),
  body('term').trim().notEmpty().isLength({ max: 50 }).withMessage('Term is required'),
  body('academicYear').trim().notEmpty().isLength({ max: 10 }).withMessage('Academic year is required'),
  body('examType').optional().isIn(['midterm', 'final', 'assignment', 'quiz', 'normal']).withMessage('Invalid exam type'),
  body('score').isNumeric().withMessage('Score must be a number'),
  body('maxScore').optional().isNumeric().withMessage('Max score must be a number'),
  body('remarks').optional().trim().isLength({ max: 500 }),
];

const bulkCreateMarkRules = [
  body('marks').isArray().withMessage('Marks must be an array'),
  body('marks.*.studentId').isUUID().withMessage('Invalid student ID'),
  body('marks.*.courseId').isUUID().withMessage('Invalid course ID'),
  body('marks.*.term').trim().notEmpty().withMessage('Term is required'),
  body('marks.*.academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('marks.*.score').isNumeric().withMessage('Score must be a number'),
];

const removeMarkRules = [
  param('id').isUUID().withMessage('Invalid mark ID'),
  body('reason').optional().trim().isLength({ max: 500 }),
];

const createAttendanceRules = [
  body('records').isArray().withMessage('Records must be an array'),
  body('records.*.studentId').optional().isUUID().withMessage('Invalid student ID'),
  body('records.*.teacherId').optional().isUUID().withMessage('Invalid teacher ID'),
  body('records.*.courseId').optional().isUUID().withMessage('Invalid course ID'),
  body('records.*.date').isISO8601().withMessage('Invalid date'),
  body('records.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid status'),
  body('records.*.type').isIn(['student', 'teacher']).withMessage('Invalid attendance type'),
  body('records.*.remarks').optional().trim().isLength({ max: 255 }),
];

const createDisciplineRules = [
  body('studentId').isUUID().withMessage('Invalid student ID'),
  body('type').isIn(['warning', 'reprimand', 'suspension', 'expulsion']).withMessage('Invalid discipline type'),
  body('description').trim().notEmpty().isLength({ max: 1000 }).withMessage('Description is required'),
  body('date').isISO8601().withMessage('Invalid date'),
];

const createFeeRules = [
  body('name').trim().notEmpty().isLength({ max: 255 }).withMessage('Fee name is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('term').trim().notEmpty().isLength({ max: 50 }).withMessage('Term is required'),
  body('academicYear').trim().notEmpty().isLength({ max: 10 }).withMessage('Academic year is required'),
  body('dueDate').isISO8601().withMessage('Invalid due date'),
];

const createPaymentRules = [
  body('studentId').isUUID().withMessage('Invalid student ID'),
  body('feeId').isUUID().withMessage('Invalid fee ID'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('paymentMethod').isIn(['cash', 'bank', 'mobile_money', 'check']).withMessage('Invalid payment method'),
];

const createAnnouncementRules = [
  body('title').trim().notEmpty().isLength({ max: 255 }).withMessage('Title is required'),
  body('content').trim().notEmpty().isLength({ max: 5000 }).withMessage('Content is required'),
  body('targetRole').optional().isIn(['all', 'students', 'teachers', 'admin']).withMessage('Invalid target role'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
];

module.exports = {
  createStudentRules,
  updateStudentRules,
  createMarkRules,
  bulkCreateMarkRules,
  removeMarkRules,
  createAttendanceRules,
  createDisciplineRules,
  createFeeRules,
  createPaymentRules,
  createAnnouncementRules,
};
