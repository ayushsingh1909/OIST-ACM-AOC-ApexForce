import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.route.js";
import resumeRoutes from "./routes/resume.route.js";
import assignmentRoutes from "./routes/assignment.route.js";
import { protect } from "./middleware/auth.middleware.js";

const app = express();

// Global Middleware setup
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/assignments", assignmentRoutes);

// Default API
app.get("/", protect, (req, res) => {
    res.json({ 
        success: true,
        message: "Welcome to the AI Career Intelligence Engine (ACIE)",
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email
            }
        }
    });
});

// Default Error handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err.message);
    const ErrMessage = err.message || "Internal Server Error";
    const ErrStatusCode = err.statusCode || 500;

    res.status(ErrStatusCode).json({ 
        success: false,
        message: ErrMessage,
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

// 404 Route handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Route Not Found"
    });
});

export default app;