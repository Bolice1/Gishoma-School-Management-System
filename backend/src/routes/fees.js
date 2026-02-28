const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('admin', 'bursar'), feeController.getAllFees);
router.post('/', authorize('admin', 'bursar'), feeController.createFee);
router.get('/payments', authorize('admin', 'bursar'), feeController.getAllPayments);
router.post('/payments', authorize('admin', 'bursar'), feeController.recordPayment);

module.exports = router;
