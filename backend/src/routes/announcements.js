const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');

router.use(authenticate, requireSchoolContext);

router.get('/', announcementController.list);
router.post('/', authorize('super_admin', 'school_admin', 'teacher', 'dean', 'bursar'), announcementController.create);

module.exports = router;
