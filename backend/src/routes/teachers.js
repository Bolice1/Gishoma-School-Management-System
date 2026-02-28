const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('admin', 'dean'), teacherController.getAll);
router.get('/:id', authorize('admin', 'dean'), teacherController.getById);
router.post('/', authorize('admin'), teacherController.create);
router.put('/:id', authorize('admin'), teacherController.update);

module.exports = router;
