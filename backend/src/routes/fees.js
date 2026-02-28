const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { authenticate, authorize, requireSchoolContext } = require('../middleware/auth');
const { assertSchoolAccess } = require('../middleware/schoolAccess');

router.use(authenticate, requireSchoolContext, assertSchoolAccess);

router.get('/', authorize('super_admin', 'school_admin', 'bursar'), feeController.listFees);
router.post('/', authorize('school_admin', 'bursar'), feeController.createFee);
router.get('/payments', authorize('super_admin', 'school_admin', 'bursar'), feeController.listPayments);
router.post('/payments', authorize('bursar', 'school_admin'), feeController.recordPayment);

module.exports = router;
