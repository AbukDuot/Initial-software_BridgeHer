import express from 'express';
import pool from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/users', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/users/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role',
      [name, email, role, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/users/:id', protect, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    // Update tables without CASCADE (set created_by to NULL)
    await client.query('UPDATE courses SET created_by = NULL WHERE created_by = $1', [id]);
    await client.query('UPDATE announcements SET created_by = NULL WHERE created_by = $1', [id]);
    
    // Delete from tables that don't have CASCADE or need explicit deletion
    await client.query('DELETE FROM question_answers WHERE user_id = $1', [id]);
    await client.query('DELETE FROM topic_questions WHERE user_id = $1', [id]);
    
    // Delete user (CASCADE will handle most related tables automatically)
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }
    
    await client.query('COMMIT');
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});

router.get('/enrollments', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT course_id, user_id FROM enrollments');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/add-mentor-videos', protect, async (req, res) => {
  try {
    const sampleVideos = [
      'https://www.youtube.com/watch?v=ZXsQAXx_ao0',
      'https://www.youtube.com/watch?v=mgmVOuLgFB0',
      'https://www.youtube.com/watch?v=Lp7E973zozc',
      'https://www.youtube.com/watch?v=g-jwWYX7Jlo'
    ];
    
    
    const mentorsResult = await pool.query(
      "SELECT id, name FROM users WHERE role = 'Mentor' AND (video_intro IS NULL OR video_intro = '')"
    );
    
    const mentors = mentorsResult.rows;
    let updated = 0;
    
    for (let i = 0; i < mentors.length; i++) {
      const mentor = mentors[i];
      const videoUrl = sampleVideos[i % sampleVideos.length];
      
      await pool.query(
        'UPDATE users SET video_intro = $1 WHERE id = $2',
        [videoUrl, mentor.id]
      );
      updated++;
    }
    
    res.json({ 
      message: `Added video URLs to ${updated} mentors`,
      mentorsUpdated: mentors.map((m, i) => ({
        id: m.id,
        name: m.name,
        videoUrl: sampleVideos[i % sampleVideos.length]
      }))
    });
  } catch (err) {
    console.error('Error adding mentor videos:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/remove-duplicate-video', async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE users SET video_intro = NULL WHERE id = (SELECT id FROM users WHERE role = 'Mentor' AND video_intro IS NOT NULL ORDER BY id DESC LIMIT 1) RETURNING name"
    );
    res.json({ message: `Removed video from ${result.rows[0]?.name || 'mentor'}` });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
