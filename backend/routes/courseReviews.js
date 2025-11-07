import express from 'express';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      `SELECT cr.*, u.name as user_name 
       FROM course_reviews cr 
       JOIN users u ON cr.user_id = u.id 
       WHERE cr.course_id = $1 
       ORDER BY cr.created_at DESC`,
      [courseId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { course_id, rating, review_text } = req.body;
    const user_id = req.user.id;

    // Check if user already reviewed
    const existing = await pool.query(
      'SELECT id FROM course_reviews WHERE user_id = $1 AND course_id = $2',
      [user_id, course_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already reviewed this course' });
    }

    const result = await pool.query(
      'INSERT INTO course_reviews (user_id, course_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, course_id, rating, review_text]
    );

    // Update course average rating
    await pool.query(
      `UPDATE courses 
       SET average_rating = (SELECT AVG(rating) FROM course_reviews WHERE course_id = $1),
           total_reviews = (SELECT COUNT(*) FROM course_reviews WHERE course_id = $1)
       WHERE id = $1`,
      [course_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
