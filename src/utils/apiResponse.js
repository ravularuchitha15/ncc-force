/**
 * Standardized API Response Helper
 */
class ApiResponse {
  static success(res, message = 'Success', data = null, statusCode = 200, pagination = null) {
    const response = {
      success: true,
      message,
      data
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, message = 'Resource created successfully', data = null) {
    return ApiResponse.success(res, message, data, 201);
  }

  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
