/**
 * Custom application error class for handling operational errors.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Flag to distinguish operational errors from programming/system bugs

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Utility wrapper to catch async errors and pass them to the Express error handler.
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
