const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/', authorize('super_admin', 'school_admin', 'dean', 'bursar', 'teacher'), studentController.list);
router.get('/:id', authorize('super_admin', 'school_admin', 'dean', 'bursar', 'teacher'), studentController.getById);
router.post('/', authorize('super_admin', 'school_admin'), studentController.create);
router.put('/:id', authorize('super_admin', 'school_admin'), studentController.update);
router.delete('/:id', authorize('super_admin', 'school_admin'), studentController.remove);

module.exports = router;
