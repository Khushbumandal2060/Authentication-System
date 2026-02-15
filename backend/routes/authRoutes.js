// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/captcha', authController.generateCaptcha);
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', protect, authController.getMe);

// Unique & Real-world security routes
router.post('/passwordless-login-request', authController.passwordlessLoginRequest);
router.post('/passwordless-login-verify', authController.passwordlessLoginVerify);
router.get('/sessions', protect, authController.getSessions);
router.post('/sessions/revoke', protect, authController.revokeSession);
router.get('/activities', protect, authController.getActivities);
router.post('/resend-verification-otp', authController.resendVerificationOTP);

module.exports = router;