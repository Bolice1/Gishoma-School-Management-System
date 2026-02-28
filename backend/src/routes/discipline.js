const express = require('express');
const router = express.Router();
const disciplineController = require('../controllers/disciplineController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/', authorize('super_admin', 'school_admin', 'dean', 'teacher'), disciplineController.list);
router.post('/', authorize('teacher'), disciplineController.create);
router.put('/:id', authorize('teacher', 'school_admin'), disciplineController.update);

module.exports = router;
