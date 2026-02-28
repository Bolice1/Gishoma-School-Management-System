const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate);

router.get('/', authorize('super_admin', 'school_admin'), requireSchoolContext, assertSchoolAccess, userController.list);
router.post('/', authorize('super_admin', 'school_admin'), requireSchoolContext, assertSchoolAccess, userController.create);

module.exports = router;
