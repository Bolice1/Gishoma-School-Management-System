const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');

router.use(authenticate);

router.get('/marks/:studentId', authorize('super_admin', 'school_admin', 'teacher', 'student'), pdfController.marksReport);
router.get('/discipline/:studentId', authorize('super_admin', 'school_admin', 'teacher', 'student'), pdfController.disciplineReport);
router.get('/homework/:studentId', authorize('super_admin', 'school_admin', 'teacher', 'student'), pdfController.homeworkReport);

module.exports = router;
