class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // To distinguish between operational errors and programming errors
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request") {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static forbidden(message = "forbidden") {
    return new ApiError(412, message);
  }
}

export default ApiError;
