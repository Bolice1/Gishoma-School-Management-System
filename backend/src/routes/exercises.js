const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('admin', 'teacher', 'student'), exerciseController.getAll);
router.get('/:id', authorize('admin', 'teacher', 'student'), exerciseController.getById);
router.post('/', authorize('admin', 'teacher'), exerciseController.create);
router.post('/:exerciseId/submit/:studentId', authorize('admin', 'teacher', 'student'), exerciseController.submit);

module.exports = router;
