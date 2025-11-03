import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM user_reminders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { text, reminderTime } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO user_reminders (user_id, reminder_text, reminder_time, done)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [req.user.id, text, reminderTime || null]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { done } = req.body;
    const { rows } = await pool.query(
      "UPDATE user_reminders SET done = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [done, req.params.id, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM user_reminders WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
