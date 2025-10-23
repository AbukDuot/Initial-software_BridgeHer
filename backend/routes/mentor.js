import express from "express";
import {
  listMentors,
  getMentor,
  updateMentor,
  listMentees,
  listMentorRequests,
  respondToRequest,
} from "../controllers/mentorController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", listMentors);
router.get("/:id", getMentor);


router.put("/:id", requireAuth, updateMentor);

router.get("/:id/mentees", requireAuth, listMentees);

router.get("/requests", requireAuth, listMentorRequests);

router.post("/requests/:requestId/respond", requireAuth, respondToRequest);

export default router;