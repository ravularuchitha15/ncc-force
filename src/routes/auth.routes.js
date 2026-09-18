const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  firebaseLoginValidation
} = require('../validations/auth.validation');

const ApiResponse = require('../utils/apiResponse');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/firebase-login', authLimiter, firebaseLoginValidation, validate, authController.firebaseLogin);
router.get('/firebase-login', (req, res) => {
  return ApiResponse.success(res, 'Firebase Authentication Endpoint. Send a POST request with JSON body: { "idToken": "<firebase_id_token>" }', {
    method: 'POST',
    endpoint: '/api/auth/firebase-login',
    requiredBody: {
      idToken: 'String (Firebase Client SDK ID Token)'
    },
    optionalBody: {
      fcmToken: 'String (FCM Device Registration Token)'
    }
  });
});
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, validate, authController.resetPassword);



// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, changePasswordValidation, validate, authController.changePassword);

module.exports = router;
