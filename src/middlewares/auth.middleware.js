const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const protect = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Not authorized, token missing from Authorization header'));
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_ncc_management_jwt_key_2026_secure'
    );

    // Fetch user from DB
    const user = await User.findById(decoded.id).populate('cadetProfile');

    if (!user) {
      return next(ApiError.unauthorized('User associated with this token no longer exists'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('Your account has been deactivated. Contact an administrator.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid authentication token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Authentication token has expired, please log in again'));
    }
    return next(error);
  }
};

module.exports = { protect };
