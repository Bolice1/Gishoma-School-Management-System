const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/', authorize('super_admin', 'school_admin', 'teacher', 'student'), noteController.list);
router.post('/', authorize('teacher'), noteController.create);
router.put('/:id', authorize('teacher'), noteController.update);

module.exports = router;
