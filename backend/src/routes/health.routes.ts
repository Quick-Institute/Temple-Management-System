import {Router} from "express";
import {rateLimit} from "express-rate-limit";
import pool from "../config/database.js";

const router = Router();

// Apply the limit before the database query so rejected requests cannot use a connection.
const healthLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many health check requests. Please try again later.",
    },
});

router.get("/", healthLimiter, async (_req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            success: true,
            message: "Backend and PostgreSQL are connected",
        });
    } catch (error) {
        console.error("Database health check failed:", error);

        res.status(503).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

export default router;