import React, { createContext, useContext, useState, useEffect } from "react";
import api, { setAccessToken, getAccessToken } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check current user status
  const checkUserSession = async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      if (response.data && response.data.data) {
        setUser(response.data.data.user);
      }
    } catch (err) {
      console.error("Session check failed, token might be invalid/expired", err);
      // Clean up local session
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();

    // Listen for global session-expired events (triggered by Axios response interceptor)
    const handleSessionExpired = () => {
      setUser(null);
      setAccessToken(null);
      toast.error("Your session has expired. Please log in again.");
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  /**
   * Log in user
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user: loggedInUser, accessToken } = response.data.data;

      setAccessToken(accessToken);
      setUser(loggedInUser);
      toast.success(response.data.message || "Logged in successfully!");
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to log in. Please try again.";
      toast.error(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = async ({ name, email, password, role }) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", { name, email, password, role });
      const { user: registeredUser, accessToken } = response.data.data;

      setAccessToken(accessToken);
      setUser(registeredUser);
      toast.success(response.data.message || "Registered successfully!");
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user
   */
  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout endpoint error, clearing local state anyway", err);
    } finally {
      setAccessToken(null);
      setUser(null);
      toast.success("Logged out successfully");
      setLoading(false);
    }
  };

  /**
   * Update user profile settings
   */
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await api.put("/auth/profile", profileData);
      const { user: updatedUser } = response.data.data;

      setUser(updatedUser);
      toast.success(response.data.message || "Profile updated successfully!");
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to update profile.";
      toast.error(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Forgot password request
   */
  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      toast.success(response.data.message || "Reset link sent to your email!");
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to send reset link.";
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };

  /**
   * Reset password request
   */
  const resetPassword = async (token, password) => {
    try {
      const response = await api.post("/auth/reset-password", { token, password });
      toast.success(response.data.message || "Password reset successfully!");
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to reset password.";
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
