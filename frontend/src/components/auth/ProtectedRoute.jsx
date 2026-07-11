import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route protection wrapper component.
 * Redirects unauthenticated users to login.
 * Optionally enforces admin access.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-600">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium tracking-wide text-violet-400 animate-pulse">
          Loading ACIE Workspace...
        </p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and preserve original destination path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== "admin") {
    // Redirect non-admin users to the primary dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
