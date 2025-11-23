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

router.post('/calculate-retroactive-points', protect, async (req, res) => {
  try {
    const { rows: users } = await pool.query('SELECT id FROM users');
    let updated = 0;
    
    for (const user of users) {
      const userId = user.id;
      const { rows: moduleCount } = await pool.query(
        'SELECT COUNT(*) as count FROM module_progress WHERE user_id = $1 AND completed = true',
        [userId]
      );
      const modulePoints = parseInt(moduleCount[0].count) * 10;
      
      const { rows: assignmentCount } = await pool.query(
        'SELECT COUNT(*) as count FROM assignment_submissions WHERE user_id = $1',
        [userId]
      );
      const assignmentPoints = parseInt(assignmentCount[0].count) * 15;
      
      const { rows: topicCount } = await pool.query(
        'SELECT COUNT(*) as count FROM community_topics WHERE user_id = $1',
        [userId]
      );
      const topicPoints = parseInt(topicCount[0].count) * 5;
      
      const { rows: replyCount } = await pool.query(
        'SELECT COUNT(*) as count FROM community_replies WHERE user_id = $1',
        [userId]
      );
      const replyPoints = parseInt(replyCount[0].count) * 2;
      
      const totalPoints = modulePoints + assignmentPoints + topicPoints + replyPoints;
      
      if (totalPoints > 0) {
        let level = 1;
        if (totalPoints >= 1000) level = 5;
        else if (totalPoints >= 600) level = 4;
        else if (totalPoints >= 300) level = 3;
        else if (totalPoints >= 100) level = 2;
        
        await pool.query(
          `INSERT INTO user_points (user_id, total_points, level, streak, last_activity)
           VALUES ($1, $2, $3, 0, NOW())
           ON CONFLICT (user_id) DO UPDATE 
           SET total_points = $2, level = $3`,
          [userId, totalPoints, level]
        );
        updated++;
      }
    }
    
    res.json({ message: `Retroactive points calculated for ${updated} users`, updated });
  } catch (err) {
    console.error('Error calculating retroactive points:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
