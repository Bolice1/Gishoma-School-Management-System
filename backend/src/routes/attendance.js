const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/students', authorize('admin', 'dean', 'teacher'), attendanceController.getStudentAttendance);
router.get('/teachers', authorize('admin', 'dean'), attendanceController.getTeacherAttendance);
router.get('/summary', authorize('admin', 'dean'), attendanceController.getAttendanceSummary);
router.post('/', authorize('admin', 'dean', 'teacher'), attendanceController.recordAttendance);

module.exports = router;
