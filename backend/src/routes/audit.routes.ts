import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { getAuditLogs } from "../controllers/audit.controller.js";

const router = Router();

const auditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many audit log requests. Please try again later.",
  },
});

router.use(auditLimiter);

router.get("/", getAuditLogs);

export default router;
