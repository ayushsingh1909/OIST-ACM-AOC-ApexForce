import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProfileSettings from "./pages/ProfileSettings";
import ResumeIntelligence from "./pages/ResumeIntelligence";
import { FiUser, FiLogOut } from "react-icons/fi";

// Simple nav shown for authenticated users
const Navbar = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <Link to="/" className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
        ACIE
      </Link>
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
        >
          <FiUser className="w-4 h-4" />
          {user.name}
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <FiLogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </nav>
  );
};

// Minimal dashboard placeholder (other modules will replace this)
const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-violet-600/20">
        {user?.name?.charAt(0).toUpperCase()}
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-3 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
        Welcome to ACIE
      </h1>
      <p className="text-slate-400 max-w-md">
        Hello, <span className="text-violet-400 font-semibold">{user?.name}</span>! Your AI Career Intelligence Engine workspace is ready.
        Other modules will be built here.
      </p>
      <div className="mt-4 px-3 py-1 rounded-full text-xs font-semibold border text-violet-400 border-violet-400/30 bg-violet-400/10">
        Role: {user?.role}
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ResumeIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e1f2e",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#8b5cf6", secondary: "#1e1f2e" },
            },
            error: {
              iconTheme: { primary: "#f43f5e", secondary: "#1e1f2e" },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;