const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { loginRules, refreshRules } = require('../validators/authValidators');

router.post('/login', loginRules, handleValidation, authController.login);
router.post('/refresh', refreshRules, handleValidation, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
