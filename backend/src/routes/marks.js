const express = require('express');
const router = express.Router();
const markController = require('../controllers/markController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/', authorize('super_admin', 'school_admin', 'teacher'), markController.list);
router.post('/', authorize('teacher'), markController.create);
router.post('/bulk', authorize('teacher'), markController.bulkCreate);

module.exports = router;
