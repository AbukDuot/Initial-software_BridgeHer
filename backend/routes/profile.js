import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, phone, bio, location, avatar_url, calendar_id FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/", requireAuth, async (req, res) => {
  const { name, phone, bio, location, calendar_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users SET name = $1, phone = $2, bio = $3, location = $4, calendar_id = $5 
       WHERE id = $6 RETURNING id, name, email, role, phone, bio, location, calendar_id`,
      [name, phone, bio, location, calendar_id, req.user.id]
    );
    res.json({ message: "Profile updated", user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
