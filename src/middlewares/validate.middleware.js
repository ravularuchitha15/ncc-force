const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Validates the request against express-validator rules
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return next(
      new ApiError('Validation Error: Invalid input data', 400, formattedErrors)
    );
  }
  next();
};

module.exports = validate;
