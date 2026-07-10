import authService from "../services/auth.service.js";
import { catchAsync } from "../utils/errors.js";

// Helper to set cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Access Token Cookie (15m expiry default)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  // Refresh Token Cookie (7d expiry default)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Helper to clear cookies
const clearTokenCookies = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax"
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax"
  });
};

class AuthController {
  /**
   * Register controller
   */
  register = catchAsync(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const result = await authService.register({ name, email, password, role });

    setTokenCookies(res, result.accessToken, result.refreshToken);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  });

  /**
   * Login controller
   */
  login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    setTokenCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  });

  /**
   * Logout controller
   */
  logout = catchAsync(async (req, res, next) => {
    clearTokenCookies(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  });

  /**
   * Refresh Token controller
   */
  refresh = catchAsync(async (req, res, next) => {
    // Try to get refresh token from cookies first, then body
    const token = req.cookies.refreshToken || req.body.refreshToken;

    const result = await authService.refreshTokens(token);

    setTokenCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken
      }
    });
  });

  /**
   * Forgot password request controller
   */
  forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: "If a user with that email exists, a password reset link has been sent."
    });
  });

  /**
   * Reset password controller
   */
  resetPassword = catchAsync(async (req, res, next) => {
    const { token, password } = req.body;

    await authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });
  });

  /**
   * Get current authenticated user profile
   */
  getMe = catchAsync(async (req, res, next) => {
    // req.user is set by protect middleware
    const userJson = req.user.toObject();
    delete userJson.password;

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: {
        user: userJson
      }
    });
  });

  /**
   * Update profile controller
   */
  updateProfile = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { name, email, currentPassword, newPassword } = req.body;

    const updatedUser = await authService.updateProfile(userId, {
      name,
      email,
      currentPassword,
      newPassword
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser
      }
    });
  });
}

export default new AuthController();
