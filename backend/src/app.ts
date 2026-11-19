import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import userRoutes from "./routes/user.routes.js";
import familyRoutes from "./routes/family.routes.js";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "Welcome to the Temple Management System API",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            users: "/api/users",
            families: "/api/families",
            auditLogs: "/api/audit-logs",
        },
    });
});

app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/families", familyRoutes);
app.use("/api/audit-logs", auditRoutes);

export default app;
