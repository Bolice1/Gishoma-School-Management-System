const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');

router.use(authenticate);

router.get('/super-admin', authorize('super_admin'), dashboardController.superAdminDashboard);
router.get('/school-admin', authorize('school_admin'), requireSchoolContext, dashboardController.schoolAdminDashboard);
router.get('/bursar', authorize('bursar'), requireSchoolContext, dashboardController.bursarDashboard);
router.get('/dean', authorize('dean'), requireSchoolContext, dashboardController.deanDashboard);
router.get('/teacher/:teacherId?', authorize('teacher', 'school_admin'), requireSchoolContext, dashboardController.teacherDashboard);
router.get('/student/:studentId?', authorize('student', 'school_admin'), requireSchoolContext, dashboardController.studentDashboard);

module.exports = router;
