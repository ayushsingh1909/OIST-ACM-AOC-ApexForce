import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile
} from "../middleware/validation.js";

const router = Router();

// Public routes
router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refresh);
router.post("/forgot-password", validateForgotPassword, authController.forgotPassword);
router.post("/reset-password", validateResetPassword, authController.resetPassword);

// Protected routes
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, validateUpdateProfile, authController.updateProfile);

export default router;
