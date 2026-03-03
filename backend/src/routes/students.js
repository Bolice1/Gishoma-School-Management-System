const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');
const { handleValidation } = require('../middleware/validate');
const { createStudentRules, updateStudentRules } = require('../validators/entityValidators');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/', authorize('super_admin', 'school_admin', 'dean', 'bursar', 'teacher'), studentController.list);
router.get('/:id', authorize('super_admin', 'school_admin', 'dean', 'bursar', 'teacher'), studentController.getById);
router.post('/', authorize('super_admin', 'school_admin'), createStudentRules, handleValidation, studentController.create);
router.put('/:id', authorize('super_admin', 'school_admin'), updateStudentRules, handleValidation, studentController.update);
router.delete('/:id', authorize('super_admin', 'school_admin'), studentController.remove);

module.exports = router;
