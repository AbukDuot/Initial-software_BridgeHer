import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user points and level
router.get("/points", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      "SELECT * FROM user_points WHERE user_id = $1",
      [userId]
    );
    
    if (!rows[0]) {
      const { rows: newRows } = await pool.query(
        "INSERT INTO user_points (user_id, total_points, level) VALUES ($1, 0, 1) RETURNING *",
        [userId]
      );
      return res.json(newRows[0]);
    }
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user badges
router.get("/badges", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      "SELECT * FROM badges WHERE user_id = $1 ORDER BY earned_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Award badge
router.post("/badges", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, icon } = req.body;
    
    const { rows } = await pool.query(
      `INSERT INTO badges (user_id, name, description, icon)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, name, description, icon]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add points
router.post("/points/add", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { points } = req.body;
    
    const { rows } = await pool.query(
      `INSERT INTO user_points (user_id, total_points, level)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id) DO UPDATE 
       SET total_points = user_points.total_points + $2,
           level = CASE WHEN user_points.total_points + $2 >= 1000 THEN 5
                        WHEN user_points.total_points + $2 >= 500 THEN 4
                        WHEN user_points.total_points + $2 >= 250 THEN 3
                        WHEN user_points.total_points + $2 >= 100 THEN 2
                        ELSE 1 END
       RETURNING *`,
      [userId, points]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, up.total_points, up.level
       FROM user_points up
       JOIN users u ON u.id = up.user_id
       ORDER BY up.total_points DESC
       LIMIT 50`,
      []
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
