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
      "SELECT * FROM user_settings WHERE user_id = $1",
      [userId]
    );
    
    res.json({
      user: userRows[0],
      settings: settingsRows[0] || {
        theme: 'light',
        font_size: 'medium',
        accent_color: '#4A148C;',
        account_privacy: 'public'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, theme, fontSize, accent, accountPrivacy, profilePic } = req.body;
    
    if (name || bio || profilePic) {
      await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             bio = COALESCE($2, bio),
             profile_pic = COALESCE($3, profile_pic)
         WHERE id = $4`,
        [name, bio, profilePic, userId]
      );
    }
    
   
    await pool.query(
      `INSERT INTO user_settings (user_id, theme, font_size, accent_color, account_privacy, profile_pic, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         theme = COALESCE($2, user_settings.theme),
         font_size = COALESCE($3, user_settings.font_size),
         accent_color = COALESCE($4, user_settings.accent_color),
         account_privacy = COALESCE($5, user_settings.account_privacy),
         profile_pic = COALESCE($6, user_settings.profile_pic),
         updated_at = NOW()`,
      [userId, theme, fontSize, accent, accountPrivacy, profilePic]
    );
    
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
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
