import { z } from "zod";
import { AppError } from "../utils/errors.js";

/**
 * Zod validation schemas for auth endpoints
 */
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(50),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["student"]).optional()
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(1, "Password is required")
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase()
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(50).optional(),
  email: z.string().email("Invalid email format").trim().toLowerCase().optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long")
    .regex(/[a-zA-Z]/, "New password must contain at least one letter")
    .regex(/[0-9]/, "New password must contain at least one number")
    .optional()
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"]
});

/**
 * Middleware factory that returns validation middleware for a given Zod schema.
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Map and format the Zod validation errors
      const errorMessages = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
      return next(new AppError(errorMessages, 400));
    }
    // Set parsed body
    req.body = result.data;
    next();
  };
};

export const validateRegister = validateBody(registerSchema);
export const validateLogin = validateBody(loginSchema);
export const validateForgotPassword = validateBody(forgotPasswordSchema);
export const validateResetPassword = validateBody(resetPasswordSchema);
export const validateUpdateProfile = validateBody(updateProfileSchema);
