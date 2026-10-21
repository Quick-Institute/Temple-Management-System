import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Temple Management System"
    });
});

app.use("/api/health", healthRoutes);

export default app;