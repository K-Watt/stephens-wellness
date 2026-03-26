const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuth } = require('../middleware/auth');

// Login routes
router.get('/login', redirectIfAuth, authController.showLogin);
router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

// Forgot password routes
router.get('/forgot-password', redirectIfAuth, authController.showForgotPassword);
router.post('/forgot-password', authController.forgotPassword);

// Reset password routes
router.get('/reset-password/:token', redirectIfAuth, authController.showResetPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
