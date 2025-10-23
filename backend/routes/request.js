import express from "express";
import {
  listRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  respondToRequest,
} from "../controllers/requestController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", listRequests);
router.get("/:id", getRequest);

router.post("/", requireAuth, createRequest);

router.put("/:id", requireAuth, updateRequest);

router.delete("/:id", requireAuth, deleteRequest);

router.post("/:id/respond", requireAuth, respondToRequest);

export default router;