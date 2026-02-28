const express = require('express');
const router = express.Router();
const homeworkController = require('../controllers/homeworkController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('admin', 'teacher', 'student'), homeworkController.getAll);
router.get('/:id', authorize('admin', 'teacher', 'student'), homeworkController.getById);
router.post('/', authorize('admin', 'teacher'), homeworkController.create);
router.put('/:id', authorize('admin', 'teacher'), homeworkController.update);
router.post('/:homeworkId/submit/:studentId', authorize('admin', 'teacher', 'student'), homeworkController.submit);
router.put('/submissions/:id', authorize('admin', 'teacher'), homeworkController.gradeSubmission);

module.exports = router;
