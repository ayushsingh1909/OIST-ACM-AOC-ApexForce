import tokenService from "../services/token.service.js";
import User from "../models/user.model.js";
import { AppError, catchAsync } from "../utils/errors.js";

/**
 * Protect routes - ensures user is authenticated.
 * Attaches user details to the request object.
 */
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Read token from Authorization header or Cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to access this resource.", 401));
  }

  // 2) Verify token
  try {
    const decoded = tokenService.verifyAccessToken(token);

    // 3) Check if user still exists and is active
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    if (!currentUser.isActive) {
      return next(new AppError("User account is inactive.", 403));
    }

    // 4) Grant access and save user to request
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired access token.", 401));
  }
});

/**
 * Restrict routes to specified roles only.
 * @param  {...string} roles Allowed roles ('admin', 'student', etc.)
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }

    next();
  };
};
