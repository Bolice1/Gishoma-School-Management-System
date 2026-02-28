const express = require('express');
const router = express.Router();
const markController = require('../controllers/markController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'teacher'));
router.get('/', markController.getAll);
router.post('/', markController.create);
router.post('/bulk', markController.bulkCreate);
router.put('/:id', markController.update);

module.exports = router;
