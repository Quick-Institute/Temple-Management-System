import {Router} from "express";
import pool from "../config/database.js";

const router = Router();

router.get("/", async (_req, res) => {
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