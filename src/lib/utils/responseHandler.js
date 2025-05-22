/**
 * Standardized API response handler
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {*} [data] - Optional data to send
 * @returns {Object} Response object
 */
export const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    ...(data && { data })
  };
  return res.status(statusCode).json(response);
};

/**
 * Error response handler
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @returns {Object} Error response
 */
export const sendError = (res, error) => {
  console.error('API Error:', error);
  
  // Default error response
  const errorResponse = {
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error 
    })
  };

  // Handle specific error types
  switch (true) {
    case error.name === 'ValidationError':
      return res.status(400).json({
        ...errorResponse,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });

    case error.name === 'CastError':
      return res.status(400).json({
        ...errorResponse,
        message: 'Invalid ID format'
      });

    case error.code === 11000:
      return res.status(409).json({
        ...errorResponse,
        message: 'Duplicate entry found'
      });

    default:
      return res.status(error.statusCode || 500).json(errorResponse);
  }
};

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} [data] - Optional data
 * @returns {Object} Success response
 */
export const sendSuccess = (res, message, data = null) => {
  return sendResponse(res, 200, true, message, data);
};

/**
 * Created response helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} [data] - Optional data
 * @returns {Object} Created response
 */
export const sendCreated = (res, message, data = null) => {
  return sendResponse(res, 201, true, message, data);
};

/**
 * Bad request response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Bad request response
 */
export const sendBadRequest = (res, message) => {
  return sendResponse(res, 400, false, message);
};

/**
 * Not found response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Not found response
 */
export const sendNotFound = (res, message) => {
  return sendResponse(res, 404, false, message);
};

/**
 * Forbidden response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Forbidden response
 */
export const sendForbidden = (res, message) => {
  return sendResponse(res, 403, false, message);
};

/**
 * Unauthorized response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Unauthorized response
 */
export const sendUnauthorized = (res, message) => {
  return sendResponse(res, 401, false, message);
}; 