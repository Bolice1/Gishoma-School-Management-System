const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', announcementController.getAll);
router.post('/', authorize('admin'), announcementController.create);

module.exports = router;
