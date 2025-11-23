import express from 'express';
import pool from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initialize-points-table', protect, async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_points (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak INTEGER DEFAULT 0,
        last_activity TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id)
    `);

    res.json({ message: 'user_points table created successfully' });
  } catch (err) {
    console.error('Error creating user_points table:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
