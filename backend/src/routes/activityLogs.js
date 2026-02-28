const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('super_admin'));

router.get('/', activityLogController.list);

module.exports = router;
