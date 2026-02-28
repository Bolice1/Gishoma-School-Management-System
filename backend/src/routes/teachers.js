const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/', authorize('super_admin', 'school_admin', 'dean'), teacherController.list);
router.get('/:id', authorize('super_admin', 'school_admin', 'dean'), teacherController.getById);
router.post('/', authorize('super_admin', 'school_admin'), teacherController.create);
router.put('/:id', authorize('super_admin', 'school_admin'), teacherController.update);

module.exports = router;
