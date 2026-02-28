const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/admin', authorize('admin'), dashboardController.adminDashboard);
router.get('/bursar', authorize('admin', 'bursar'), dashboardController.bursarDashboard);
router.get('/dean', authorize('admin', 'dean'), dashboardController.deanDashboard);
router.get('/teacher/:teacherId?', authorize('admin', 'teacher'), dashboardController.teacherDashboard);
router.get('/student/:studentId?', authorize('admin', 'student'), dashboardController.studentDashboard);

module.exports = router;
