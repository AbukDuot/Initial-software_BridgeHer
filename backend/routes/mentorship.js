import express from "express";
import { listRequests, getRequest, createRequest, updateRequest, deleteRequest, mentorSummary } from "../controllers/mentorshipController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listRequests);
router.get("/:id", getRequest);

router.post("/", requireAuth, createRequest);

router.put("/:id", requireAuth, updateRequest);

router.delete("/:id", requireAuth, requireRole(["Admin"]), deleteRequest);

router.get("/mentor/:mentorId/summary", requireAuth, mentorSummary);

export default router;