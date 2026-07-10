import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.route.js";
import resumeRoutes from "./routes/resume.route.js";
import quizRoutes from "./routes/quiz.route.js";
import assignmentRoutes from "./routes/assignment.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import interviewRoutes from "./routes/interview.route.js";
import { protect } from "./middleware/auth.middleware.js";
import { AppError } from "./utils/errors.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new AppError("CORS origin not allowed", 403));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "ACIE API is running", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/interview", interviewRoutes);

app.get("/", protect, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the AI Career Intelligence Engine (ACIE)",
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    },
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message);
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

export default app;
