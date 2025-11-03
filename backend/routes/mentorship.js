import express from "express";
import pool from "../config/db.js";
import { listRequests, getRequest, createRequest, updateRequest, deleteRequest, mentorSummary } from "../controllers/mentorshipController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listRequests);
router.get("/:id", getRequest);

router.post("/", requireAuth, createRequest);

router.put("/:id", requireAuth, updateRequest);

router.delete("/:id", requireAuth, requireRole(["Admin"]), deleteRequest);

router.get("/mentor/:mentorId/summary", requireAuth, mentorSummary);

router.put("/requests/:id/accept", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const defaultDate = new Date(Date.now() + 24 * 3600 * 1000);
    const updated = await pool.query(
      "UPDATE mentorship_requests SET status = 'accepted', scheduled_at = $2 WHERE id = $1 RETURNING *",
      [id, defaultDate]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/requests/:id/decline", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await pool.query(
      "UPDATE mentorship_requests SET status = 'declined' WHERE id = $1 RETURNING *",
      [id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/feedback", requireAuth, async (req, res) => {
  try {
    const { mentor_id, rating, comment } = req.body;
    const learner_name = req.user.name;
    const result = await pool.query(
      "INSERT INTO mentorship_feedback (mentor_id, learner_name, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [mentor_id, learner_name, rating, comment]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;