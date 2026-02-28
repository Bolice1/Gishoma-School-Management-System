const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/', authorize('super_admin', 'school_admin', 'dean', 'teacher', 'student'), courseController.list);
router.get('/:id', courseController.getById);
router.post('/', authorize('super_admin', 'school_admin'), courseController.create);
router.put('/:id', authorize('super_admin', 'school_admin'), courseController.update);
router.delete('/:id', authorize('super_admin', 'school_admin'), courseController.remove);

module.exports = router;
