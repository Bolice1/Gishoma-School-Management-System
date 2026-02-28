const express = require('express');
const router = express.Router();
const disciplineController = require('../controllers/disciplineController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('admin', 'teacher', 'dean'), disciplineController.getAll);
router.post('/', authorize('admin', 'teacher'), disciplineController.create);
router.put('/:id', authorize('admin', 'teacher'), disciplineController.update);

module.exports = router;
