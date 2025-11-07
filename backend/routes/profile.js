import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, phone, bio, location, avatar_url FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/", requireAuth, async (req, res) => {
  const { name, phone, bio, location } = req.body;
  try {
    console.log('Updating profile for user:', req.user.id, req.body);
    const { rows } = await pool.query(
      `UPDATE users SET name = $1, phone = $2, bio = $3, location = $4
       WHERE id = $6 RETURNING id, name, email, role, phone, bio, location`,
      [name, phone, bio, location, req.user.id]
    );
    console.log('Profile updated successfully');
    res.json({ message: "Profile updated", user: rows[0] });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
