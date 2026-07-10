import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import SessionTimeoutWatcher from "./components/auth/SessionTimeoutWatcher";
import Navbar from "./components/layout/Navbar";

// Page imports
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProfileSettings from "./pages/ProfileSettings";
import StudentDashboard from "./pages/StudentDashboard";
import ResumeIntelligence from "./pages/ResumeIntelligence";
import QuizDashboard from "./pages/quiz/QuizDashboard";
import QuizTaking from "./pages/quiz/QuizTaking";
import QuizResults from "./pages/quiz/QuizResults";
import Assignments from "./pages/Assignments";
import AssignmentSubmit from "./pages/assignment/AssignmentSubmit";
import AssignmentFeedback from "./pages/assignment/AssignmentFeedback";

// Interview Simulation Engine pages
import InterviewOnboarding from "./pages/interview/InterviewOnboarding";
import InterviewActive from "./pages/interview/InterviewActive";
import InterviewReport from "./pages/interview/InterviewReport";
import InterviewHistory from "./pages/interview/InterviewHistory";
import InterviewPortal from "./pages/InterviewPortal";

// Modules 7 & 8 pages
import CareerDashboard from "./pages/career-intelligence/CareerDashboard";
import GrowthTrend from "./pages/career-intelligence/GrowthTrend";

const AppRoutes = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <Navbar />
    <SessionTimeoutWatcher />
    <main>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Student Routes */}
        <Route path="/" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><ResumeIntelligence /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><QuizDashboard /></ProtectedRoute>} />
        <Route path="/quiz/:attemptId" element={<ProtectedRoute><QuizTaking /></ProtectedRoute>} />
        <Route path="/quiz/:attemptId/results" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
        <Route path="/assignments/:assignmentId/submit" element={<ProtectedRoute><AssignmentSubmit /></ProtectedRoute>} />
        <Route path="/assignments/:submissionId/feedback" element={<ProtectedRoute><AssignmentFeedback /></ProtectedRoute>} />
        
        {/* Interview Simulation Routes */}
        <Route path="/interview" element={<ProtectedRoute><InterviewOnboarding /></ProtectedRoute>} />
        <Route path="/interview/session/:id" element={<ProtectedRoute><InterviewActive /></ProtectedRoute>} />
        <Route path="/interview/session/:id/report" element={<ProtectedRoute><InterviewReport /></ProtectedRoute>} />
        <Route path="/interview/history" element={<ProtectedRoute><InterviewHistory /></ProtectedRoute>} />
        <Route path="/interviews" element={<ProtectedRoute><InterviewPortal /></ProtectedRoute>} />

        {/* Career Intelligence Routes */}
        <Route path="/career-dashboard" element={<ProtectedRoute><CareerDashboard /></ProtectedRoute>} />
        <Route path="/growth-trend" element={<ProtectedRoute><GrowthTrend /></ProtectedRoute>} />


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
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
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
