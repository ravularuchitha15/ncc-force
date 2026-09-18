const ApiError = require('../utils/apiError');
const { ROLES } = require('../config/constants');

/**
 * Middleware to restrict access based on user role(s)
 * @param  {...string} roles Allowed roles ('admin', 'officer', 'cadet')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize
};
