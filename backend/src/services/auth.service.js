import User from "../models/user.model.js";
import tokenService from "./token.service.js";
import emailService from "./email.service.js";
import { AppError } from "../utils/errors.js";

class AuthService {
  /**
   * Registers a new user.
   * @param {Object} userData { name, email, password, role }
   * @returns {Object} { user, accessToken, refreshToken }
   */
  async register({ name, email, password, role }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email is already registered", 400);
    }

    // Create the new user
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || "student"
    });

    // Remove password from output object
    const userJson = newUser.toObject();
    delete userJson.password;

    // Generate tokens
    const accessToken = tokenService.generateAccessToken({ id: newUser._id, role: newUser.role });
    const refreshToken = tokenService.generateRefreshToken({ id: newUser._id });

    return {
      user: userJson,
      accessToken,
      refreshToken
    };
  }

  /**
   * Logins an existing user.
   * @param {string} email 
   * @param {string} password 
   * @returns {Object} { user, accessToken, refreshToken }
   */
  async login(email, password) {
    // Check user existence (select password explicitly as it is select: false)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError("This account is currently deactivated", 403);
    }

    const userJson = user.toObject();
    delete userJson.password;

    // Generate tokens
    const accessToken = tokenService.generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = tokenService.generateRefreshToken({ id: user._id });

    return {
      user: userJson,
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   * @param {string} token 
   * @returns {Object} { accessToken, newRefreshToken }
   */
  async refreshTokens(token) {
    if (!token) {
      throw new AppError("Refresh token is required", 400);
    }

    try {
      const decoded = tokenService.verifyRefreshToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (!user.isActive) {
        throw new AppError("User account is inactive", 403);
      }

      // Generate new pair
      const accessToken = tokenService.generateAccessToken({ id: user._id, role: user.role });
      const newRefreshToken = tokenService.generateRefreshToken({ id: user._id });

      return {
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  /**
   * Forgot password request. Generates reset token and emails it.
   * @param {string} email 
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Avoid leaking whether email exists or not to prevent user enumeration
      // We will resolve successfully but not send any email
      return;
    }

    // Generate reset token
    const { clearToken, hashedToken } = tokenService.generateResetPasswordToken();

    // Set expiration to 15 minutes from now
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // Send reset email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${clearToken}`;

    await emailService.sendResetPasswordEmail(user.email, resetUrl);
  }

  /**
   * Resets password using clear text token.
   * @param {string} clearToken 
   * @param {string} newPassword 
   */
  async resetPassword(clearToken, newPassword) {
    // Hash token to compare with DB
    const hashedToken = tokenService.hashResetToken(clearToken);

    // Find user with active token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError("Password reset token is invalid or has expired", 400);
    }

    // Set new password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
  }

  /**
   * Gets current user profile.
   * @param {string} userId 
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  /**
   * Updates user profile (name, email, optional password).
   * @param {string} userId 
   * @param {Object} updateData { name, email, currentPassword, newPassword }
   */
  async updateProfile(userId, { name, email, currentPassword, newPassword }) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // If changing email, make sure it is not already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError("Email is already in use by another account", 400);
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    // If changing password, verify old password
    if (newPassword) {
      if (!currentPassword) {
        throw new AppError("Current password is required to change password", 400);
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new AppError("Incorrect current password", 400);
      }
      user.password = newPassword;
    }

    await user.save();
    
    const updatedUser = user.toObject();
    delete updatedUser.password;
    return updatedUser;
  }
}

export default new AuthService();
