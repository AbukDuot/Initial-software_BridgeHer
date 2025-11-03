import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let userRows = [];
    try {
      const result = await pool.query(
        "SELECT name, email, bio, profile_pic, calendar_id FROM users WHERE id = $1",
        [userId]
      );
      userRows = result.rows;
    } catch (err) {
      const result = await pool.query(
        "SELECT name, email, bio, profile_pic FROM users WHERE id = $1",
        [userId]
      );
      userRows = result.rows;
    }
    
    const settingsResult = await pool.query(
      "SELECT settings FROM user_settings WHERE user_id = $1",
      [userId]
    );
    
    const settingsData = settingsResult.rows[0]?.settings || {};
    
    res.json({
      user: userRows[0] || {},
      settings: {
        theme: settingsData.theme || 'light',
        font_size: settingsData.font_size || 'medium',
        accent_color: settingsData.accent_color || '#4A148C',
        account_privacy: settingsData.account_privacy || 'public'
      }
    });
  } catch (err) {
    console.error('Settings GET error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.put("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, calendarId, theme, fontSize, accent, accountPrivacy, profilePic } = req.body;
    
    if (name || bio || calendarId !== undefined || profilePic !== undefined) {
      try {
        await pool.query(
          `UPDATE users 
           SET name = COALESCE($1, name),
               bio = COALESCE($2, bio),
               calendar_id = COALESCE($3, calendar_id),
               profile_pic = COALESCE($4, profile_pic)
           WHERE id = $5`,
          [name, bio, calendarId, profilePic, userId]
        );
      } catch (err) {
        await pool.query(
          `UPDATE users 
           SET name = COALESCE($1, name),
               bio = COALESCE($2, bio),
               profile_pic = COALESCE($3, profile_pic)
           WHERE id = $4`,
          [name, bio, profilePic, userId]
        );
      }
    }
    
    const settingsData = {
      theme: theme || 'light',
      font_size: fontSize || 'medium',
      accent_color: accent || '#4A148C',
      account_privacy: accountPrivacy || 'public'
    };
    
    await pool.query(
      `INSERT INTO user_settings (user_id, settings, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         settings = $2,
         updated_at = NOW()`,
      [userId, JSON.stringify(settingsData)]
    );
    
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    console.error('Settings PUT error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/logout", requireAuth, async (req, res) => {
  try {
    
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/account", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
