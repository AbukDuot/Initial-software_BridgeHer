import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { rows: userRows } = await pool.query(
      "SELECT name, email, bio, profile_pic FROM users WHERE id = $1",
      [userId]
    );
    
    const { rows: settingsRows } = await pool.query(
      "SELECT language, notifications_enabled FROM user_settings WHERE user_id = $1",
      [userId]
    );
    
    res.json({
      user: userRows[0] || {},
      settings: {
        language: settingsRows[0]?.language || 'en',
        notifications_enabled: settingsRows[0]?.notifications_enabled !== false
      }
    });
  } catch (err) {
    console.error('Settings GET error:', err);
    res.json({
      user: {},
      settings: { language: 'en', notifications_enabled: true }
    });
  }
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, profilePic, language, notifications_enabled } = req.body;
    
    if (name || bio || profilePic) {
      await pool.query(
        `UPDATE users SET name = COALESCE($1, name), bio = COALESCE($2, bio), profile_pic = COALESCE($3, profile_pic) WHERE id = $4`,
        [name, bio, profilePic, userId]
      );
    }
    
    if (language || notifications_enabled !== undefined) {
      await pool.query(
        `INSERT INTO user_settings (user_id, language, notifications_enabled) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET language = COALESCE($2, user_settings.language), notifications_enabled = COALESCE($3, user_settings.notifications_enabled)`,
        [userId, language, notifications_enabled]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Settings PUT error:', err);
    res.json({ success: true });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  res.json({ success: true });
});

router.delete("/account", requireAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
