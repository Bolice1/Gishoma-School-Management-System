const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');

router.use(authenticate);

router.get('/', announcementController.list);
router.post('/', authorize('super_admin', 'school_admin'), announcementController.create);

module.exports = router;
