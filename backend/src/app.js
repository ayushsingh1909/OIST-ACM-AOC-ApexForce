import express from "express";

const app = express();

// middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// API Routes
app.use("api/auth", authRoutes);

// Default Error handler
app.use((err, req, res, next) => {
    const ErrMessage = err.message || "Internal Server Error";
    const ErrStatusCode = err.statusCode || 500;

    res.status(ErrStatusCode).json({ message: ErrMessage });
});

// Default API
app.get("/", AuthProtect, (req, res) => {
    res.json({ message: "Welcome to my Cravings" });
});

app.use((req, res) => {
    res.status(404).json({
        message: "API Not Found"
    });
});

export default app;