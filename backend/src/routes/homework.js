const express = require('express');
const router = express.Router();
const homeworkController = require('../controllers/homeworkController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/', authorize('super_admin', 'school_admin', 'teacher', 'student'), homeworkController.list);
router.get('/:id', homeworkController.getById);
router.post('/', authorize('teacher'), homeworkController.create);
router.post('/:homeworkId/submit/:studentId', authorize('teacher', 'student'), homeworkController.submit);
router.put('/submissions/:id', authorize('teacher'), homeworkController.gradeSubmission);

module.exports = router;
