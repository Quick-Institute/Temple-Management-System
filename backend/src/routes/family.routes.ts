import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  getFamilies,
  getFamilyById,
  checkDuplicate,
  createFamily,
  updateFamily,
  updateFamilyStatus,
  transferFamily,
  deleteFamily,
  getTempleQr,
} from "../controllers/family.controller.js";

const router = Router();

const familyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests to family service. Please try again later.",
  },
});

router.use(familyLimiter);

// Real-time duplicate check (FR-37) - must be before /:id
router.get("/check-duplicate", checkDuplicate);

// QR Onboarding flyer data (FR-33)
router.get("/temple-qr/:code", getTempleQr);

// Family CRUD & Operations
router.get("/", getFamilies);
router.get("/:id", getFamilyById);
router.post("/", createFamily);
router.put("/:id", updateFamily);
router.patch("/:id/status", updateFamilyStatus);
router.post("/:id/transfer", transferFamily);
router.delete("/:id", deleteFamily);

export default router;
