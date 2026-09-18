const { auth, isFirebaseReady } = require('../config/firebase');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

/**
 * Middleware to verify Firebase ID Token from client.
 * Looks in Authorization header (Bearer <token>) or x-firebase-token header.
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    if (!isFirebaseReady() || !auth) {
      return next(
        ApiError.internal(
          'Firebase is not configured on this server. Please provide Firebase credentials in .env or serviceAccountKey.json'
        )
      );
    }

    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-firebase-token']) {
      token = req.headers['x-firebase-token'];
    }

    if (!token) {
      return next(ApiError.unauthorized('Firebase ID token missing from request headers'));
    }

    // Verify token using Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);
    req.firebaseUser = decodedToken;

    // Attempt to hydrate corresponding MongoDB user
    const user = await User.findOne({
      $or: [{ firebaseUid: decodedToken.uid }, { email: decodedToken.email }]
    }).populate('cadetProfile');

    if (user) {
      if (!user.isActive) {
        return next(ApiError.forbidden('Your account has been deactivated. Contact an administrator.'));
      }
      // Link firebaseUid if not yet linked
      if (!user.firebaseUid) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
      }
      req.user = user;
    }

    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return next(ApiError.unauthorized('Firebase ID token has expired'));
    }
    if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      return next(ApiError.unauthorized('Invalid Firebase ID token'));
    }
    return next(ApiError.unauthorized(`Firebase authentication failed: ${error.message}`));
  }
};

module.exports = { verifyFirebaseToken };
