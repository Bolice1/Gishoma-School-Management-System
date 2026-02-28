const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.post('/', authorize('admin'), courseController.create);
router.put('/:id', authorize('admin'), courseController.update);
router.delete('/:id', authorize('admin'), courseController.delete);

module.exports = router;
