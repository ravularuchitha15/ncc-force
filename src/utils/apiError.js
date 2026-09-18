/**
 * Custom Operational Error class
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad Request', errors = []) {
    return new ApiError(msg, 400, errors);
  }

  static unauthorized(msg = 'Unauthorized access') {
    return new ApiError(msg, 401);
  }

  static forbidden(msg = 'Forbidden: Insufficient permissions') {
    return new ApiError(msg, 403);
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(msg, 404);
  }

  static conflict(msg = 'Resource conflict or duplicate entry') {
    return new ApiError(msg, 409);
  }

  static internal(msg = 'Internal server error') {
    return new ApiError(msg, 500);
  }
}

module.exports = ApiError;
