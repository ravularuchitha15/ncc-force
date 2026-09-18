const multer = require('multer');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid id: ${err.value}`;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value error: An entry with ${field} '${value}' already exists`;

    // Special message for attendance unique constraint
    if (err.keyValue && err.keyValue.sessionName && err.keyValue.cadet) {
      message = 'Attendance has already been marked for this cadet on this date and session';
    }
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
  }

  // Handle Multer file upload errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the allowed limit (5MB)';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Log non-operational / unexpected errors in development
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('[UNEXPECTED ERROR]', err);
  }

  return ApiResponse.error(res, message, statusCode, errors);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
