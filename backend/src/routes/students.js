const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('admin', 'dean', 'bursar', 'teacher'), studentController.getAll);
router.get('/:id', authorize('admin', 'dean', 'bursar', 'teacher'), studentController.getById);
router.post('/', authorize('admin'), studentController.create);
router.put('/:id', authorize('admin'), studentController.update);
router.delete('/:id', authorize('admin'), studentController.delete);

module.exports = router;
