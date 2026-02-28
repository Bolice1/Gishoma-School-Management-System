const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { createSchoolRules, updateSchoolRules } = require('../validators/schoolValidators');

router.use(authenticate);

router.get('/', authorize('super_admin'), schoolController.list);
router.get('/:id', authorize('super_admin', 'school_admin'), schoolController.getById);
router.post('/', authorize('super_admin'), createSchoolRules, handleValidation, schoolController.create);
router.put('/:id', authorize('super_admin'), updateSchoolRules, handleValidation, schoolController.update);

module.exports = router;
