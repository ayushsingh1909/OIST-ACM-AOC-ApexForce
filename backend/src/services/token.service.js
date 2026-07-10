import jwt from "jsonwebtoken";
import crypto from "crypto";

class TokenService {
  /**
   * Generates a short-lived access JWT.
   * @param {Object} payload 
   * @returns {string} JWT Access Token
   */
  generateAccessToken(payload) {
    const secret = process.env.JWT_ACCESS_SECRET || "default_access_secret_123456";
    const expiresIn = process.env.JWT_ACCESS_EXPIRY || "15m";
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Generates a long-lived refresh JWT.
   * @param {Object} payload 
   * @returns {string} JWT Refresh Token
   */
  generateRefreshToken(payload) {
    const secret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_123456";
    const expiresIn = process.env.JWT_REFRESH_EXPIRY || "7d";
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verifies an access token.
   * @param {string} token 
   * @returns {Object} Decoded payload
   */
  verifyAccessToken(token) {
    const secret = process.env.JWT_ACCESS_SECRET || "default_access_secret_123456";
    return jwt.verify(token, secret);
  }

  /**
   * Verifies a refresh token.
   * @param {string} token 
   * @returns {Object} Decoded payload
   */
  verifyRefreshToken(token) {
    const secret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_123456";
    return jwt.verify(token, secret);
  }

  /**
   * Generates a random cryptographic token for password resets.
   * @returns {{clearToken: string, hashedToken: string}} Clear token (to email) and hashed token (to DB)
   */
  generateResetPasswordToken() {
    const clearToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(clearToken)
      .digest("hex");

    return {
      clearToken,
      hashedToken
    };
  }

  /**
   * Hashes a clean reset token for DB lookup comparisons.
   * @param {string} token 
   * @returns {string} Hashed token
   */
  hashResetToken(token) {
    return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  }
}

export default new TokenService();
