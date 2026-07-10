/**
 * Admin-Only Middleware — Module 8: Admin Platform Management
 *
 * This middleware EXTENDS the existing role-based access control from Module 1.
 * It does NOT rewrite auth logic — it simply composes the existing `authorizeRoles`
 * factory from auth.middleware.js with the "admin" role argument.
 *
 * Usage in routes:
 *   router.use(protect, adminOnly);
 *   — or —
 *   router.get("/route", protect, adminOnly, controller.handler);
 */

import { authorizeRoles } from "./auth.middleware.js";

/**
 * adminOnly middleware
 * Restricts access to users with role === "admin".
 * Must be used AFTER the `protect` middleware so that req.user is populated.
 */
export const adminOnly = authorizeRoles("admin");
