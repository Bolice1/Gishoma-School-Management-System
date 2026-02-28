const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/students', authorize('super_admin', 'school_admin', 'dean', 'teacher'), attendanceController.listStudents);
router.get('/teachers', authorize('super_admin', 'school_admin', 'dean'), attendanceController.listTeachers);
router.post('/', authorize('super_admin', 'school_admin', 'dean', 'teacher'), attendanceController.record);

module.exports = router;
