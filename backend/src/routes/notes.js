const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('admin', 'teacher', 'student'), noteController.getAll);
router.post('/', authorize('admin', 'teacher'), noteController.create);
router.put('/:id', authorize('admin', 'teacher'), noteController.update);

module.exports = router;
