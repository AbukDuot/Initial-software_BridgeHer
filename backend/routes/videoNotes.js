import express from 'express';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:moduleId', requireAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const user_id = req.user.id;
    const result = await pool.query(
      'SELECT * FROM video_notes WHERE user_id = $1 AND module_id = $2 ORDER BY timestamp',
      [user_id, moduleId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { module_id, timestamp, note_text } = req.body;
    const user_id = req.user.id;
    const result = await pool.query(
      'INSERT INTO video_notes (user_id, module_id, timestamp, note_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, module_id, timestamp, note_text]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM video_notes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
