import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.route.js";
import { protect } from "./middleware/auth.middleware.js";

const app = express();

// middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRoutes);

// Default API
app.get("/", protect, (req, res) => {
    res.json({ 
        success: true,
        message: "Welcome to ACIE API Gateway",
        data: {
            user: req.user
        }
    });
});

// Default Error handler
app.use((err, req, res, next) => {
    const ErrMessage = err.message || "Internal Server Error";
    const ErrStatusCode = err.statusCode || 500;

    res.status(ErrStatusCode).json({ 
        success: false,
        message: ErrMessage,
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Route Not Found"
    });
});

export default app;