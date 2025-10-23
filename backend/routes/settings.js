import express from "express";
import { getMySettings, updateMySettings } from "../controllers/settingsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getMySettings);
router.put("/", requireAuth, updateMySettings);

export default router;