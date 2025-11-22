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

// Setup Computer courses
router.post('/setup-computer-courses', protect, async (req, res) => {
  try {
    const { rows: courseRows } = await pool.query(
      `SELECT id, title FROM courses WHERE title ILIKE '%Introduction to Computer%' OR title ILIKE '%Introduction to Technology%'`
    );
    
    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Computer courses not found' });
    }
    
    let setupResults = [];
    
    for (const course of courseRows) {
      const courseId = course.id;
      const courseTitle = course.title;
      
      await pool.query('DELETE FROM modules WHERE course_id = $1', [courseId]);
    
      let modules = [];
      
      if (courseTitle.toLowerCase().includes('computer')) {
        modules = [
          { title: 'Computer Hardware Basics', description: 'Learn about computer components and how they work together.', content: 'Understanding CPU, RAM, storage, motherboard, and other essential computer components.', video_url: 'https://www.youtube.com/embed/8Z3Y0sU1y1M', duration: 20, order_index: 1 },
          { title: 'Operating System Fundamentals', description: 'Master Windows interface and file management.', content: 'Navigate Windows, manage files and folders, understand system settings.', video_url: 'https://www.youtube.com/embed/1T_YbkBWGcE', duration: 25, order_index: 2 },
          { title: 'Basic Computer Operations', description: 'Essential computer skills for everyday use.', content: 'Learn typing, mouse usage, keyboard shortcuts, and basic troubleshooting.', video_url: 'https://www.youtube.com/embed/kFMTec22JfQ', duration: 18, order_index: 3 }
        ];
      } else {
        modules = [
          { title: 'Computer Basics and Hardware', description: 'Learn about computer components, hardware, and basic operations.', content: 'This module covers the fundamental components of a computer system.', video_url: 'https://www.youtube.com/embed/8Z3Y0sU1y1M', duration: 20, order_index: 1 },
          { title: 'Understanding Operating Systems', description: 'Introduction to Windows, file management, and system navigation.', content: 'Learn about operating systems, focusing on Windows interface.', video_url: 'https://www.youtube.com/embed/1T_YbkBWGcE', duration: 25, order_index: 2 },
          { title: 'Internet and Web Browsing', description: 'Master internet navigation, web browsers, and online search techniques.', content: 'Discover how to use web browsers effectively.', video_url: 'https://www.youtube.com/embed/YuZP1JmRzjI', duration: 18, order_index: 3 },
          { title: 'Email and Digital Communication', description: 'Learn to send emails, manage contacts, and communicate digitally.', content: 'Master email basics including creating accounts.', video_url: 'https://www.youtube.com/embed/GtQdIYUtAHg', duration: 22, order_index: 4 },
          { title: 'Online Safety and Security', description: 'Protect yourself online with essential cybersecurity knowledge.', content: 'Learn about password security and recognizing scams.', video_url: 'https://www.youtube.com/embed/UB1O30fR-EE', duration: 20, order_index: 5 },
          { title: 'Social Media and Digital Platforms', description: 'Navigate social media platforms safely and effectively.', content: 'Understand popular social media platforms.', video_url: 'https://www.youtube.com/embed/2QR3dvs5Mps', duration: 25, order_index: 6 },
          { title: 'Essential Digital Tools and Applications', description: 'Explore useful software and applications for productivity.', content: 'Learn about essential software applications.', video_url: 'https://www.youtube.com/embed/kFMTec22JfQ', duration: 30, order_index: 7 }
        ];
      }
      
      for (const module of modules) {
        await pool.query(
          `INSERT INTO modules (course_id, title, description, content, video_url, duration, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [courseId, module.title, module.description, module.content, module.video_url, module.duration, module.order_index]
        );
      }
      
      setupResults.push({ courseTitle, courseId, modulesAdded: modules.length });
    }
    
    res.json({ message: 'Computer courses setup completed successfully', courses: setupResults });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
