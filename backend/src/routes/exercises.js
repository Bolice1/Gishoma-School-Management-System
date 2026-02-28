const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/', authorize('super_admin', 'school_admin', 'teacher', 'student'), exerciseController.list);
router.get('/:id', exerciseController.getById);
router.post('/', authorize('teacher'), exerciseController.create);
router.post('/:exerciseId/submit/:studentId', authorize('teacher', 'student'), exerciseController.submit);

module.exports = router;
