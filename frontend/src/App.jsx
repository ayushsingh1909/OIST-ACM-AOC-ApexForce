import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import SessionTimeoutWatcher from "./components/auth/SessionTimeoutWatcher";
import LMSLayout from "./components/layout/LMSLayout";

// Page imports
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProfileSettings from "./pages/ProfileSettings";
import Dashboard from "./pages/dashboard/Dashboard";
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
import Readiness from "./pages/career-intelligence/Readiness";
import GrowthTrend from "./pages/career-intelligence/GrowthTrend";
import AnimationDemo from "./pages/AnimationDemo";
import LMSDemo from "./pages/LMSDemo";

const ProtectedLayout = () => (
  <ProtectedRoute>
    <LMSLayout>
      <Outlet />
    </LMSLayout>
  </ProtectedRoute>
);

const AppRoutes = () => (
  <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans">
    <SessionTimeoutWatcher />
    <main>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/animation-demo" element={<AnimationDemo />} />
        <Route path="/lms-demo" element={<LMSDemo />} />

        {/* Protected LMS Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/resume" element={<ResumeIntelligence />} />
          <Route path="/quiz" element={<QuizDashboard />} />
          <Route path="/quiz/:attemptId" element={<QuizTaking />} />
          <Route path="/quiz/:attemptId/results" element={<QuizResults />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/assignments/:assignmentId/submit" element={<AssignmentSubmit />} />
          <Route path="/assignments/:submissionId/feedback" element={<AssignmentFeedback />} />
          
          {/* Interview Simulation Routes */}
          <Route path="/interview" element={<InterviewOnboarding />} />
          <Route path="/interview/session/:id" element={<InterviewActive />} />
          <Route path="/interview/session/:id/report" element={<InterviewReport />} />
          <Route path="/interview/history" element={<InterviewHistory />} />
          <Route path="/interviews" element={<InterviewPortal />} />

          {/* Career Intelligence Routes */}
          <Route path="/readiness" element={<Readiness />} />
          <Route path="/growth-trend" element={<GrowthTrend />} />
        </Route>

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
                background: "#FFFFFF",
                color: "#1e293b",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                fontSize: "14px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
              },
              success: {
                iconTheme: { primary: "#4F46E5", secondary: "#FFFFFF" },
              },
              error: {
                iconTheme: { primary: "#f43f5e", secondary: "#FFFFFF" },
              },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
