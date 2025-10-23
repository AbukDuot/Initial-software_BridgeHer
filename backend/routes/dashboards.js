import express from "express";
import { getLearnerOverview } from "../controllers/learnerDashboardController.js";
import { getMentorOverview } from "../controllers/mentorDashboardController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/learner", requireAuth, getLearnerOverview);
router.get("/mentor", requireAuth, requireRole(["Mentor","Admin"]), getMentorOverview);

export default router;