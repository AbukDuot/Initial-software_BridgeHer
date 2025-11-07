import express from 'express';
import pool from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get modules without videos
router.get('/missing-videos', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.id, m.title, m.course_id, c.title as course_title
      FROM modules m
      JOIN courses c ON c.id = m.course_id
      WHERE m.video_url IS NULL OR m.video_url = ''
      ORDER BY c.title, m.order_index
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add video to module
router.put('/:id/video', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { video_url, duration } = req.body;
    
    const { rows } = await pool.query(`
      UPDATE modules 
      SET video_url = $1, duration = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [video_url, duration || 15, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk add videos to modules
router.post('/bulk-add-videos', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const { modules } = req.body; // Array of {id, video_url, duration}
    
    const results = [];
    for (const module of modules) {
      const { rows } = await pool.query(`
        UPDATE modules 
        SET video_url = $1, duration = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [module.video_url, module.duration || 15, module.id]);
      
      if (rows.length > 0) {
        results.push(rows[0]);
      }
    }
    
    res.json({ 
      message: `Updated ${results.length} modules with videos`,
      modules: results 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-assign educational videos based on module titles
router.post('/auto-assign-videos', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const videoMappings = [
      // Financial Literacy
      { keywords: ['budget', 'budgeting'], url: 'https://www.youtube.com/embed/pCwLhz0ltlE' },
      { keywords: ['saving', 'save', 'savings'], url: 'https://www.youtube.com/embed/gMbNxthEQEk' },
      { keywords: ['credit', 'loan', 'debt'], url: 'https://www.youtube.com/embed/RlPH-S6f5pI' },
      { keywords: ['investment', 'invest', 'stocks'], url: 'https://www.youtube.com/embed/HQzoZfc3GwQ' },
      { keywords: ['emergency', 'fund', 'financial planning'], url: 'https://www.youtube.com/embed/WEDIj9JBTC8' },
      { keywords: ['money', 'finance', 'financial'], url: 'https://www.youtube.com/embed/4j2emMn7UuI' },
      
      // Entrepreneurship
      { keywords: ['business idea', 'startup', 'opportunity'], url: 'https://www.youtube.com/embed/0Ul4aUS1dxQ' },
      { keywords: ['pitch', 'presentation', 'present'], url: 'https://www.youtube.com/embed/P2LwuF7zn9c' },
      { keywords: ['business plan', 'planning', 'strategy'], url: 'https://www.youtube.com/embed/bNpx7gpSqbY' },
      { keywords: ['marketing', 'promotion', 'advertising'], url: 'https://www.youtube.com/embed/llKvV8_T95M' },
      { keywords: ['funding', 'capital', 'investor'], url: 'https://www.youtube.com/embed/kC5QlkiqTLM' },
      { keywords: ['entrepreneur', 'business', 'company'], url: 'https://www.youtube.com/embed/ZoqgAy3h4OM' },
      
      // Digital Skills
      { keywords: ['computer', 'basic', 'introduction'], url: 'https://www.youtube.com/embed/8Z3Y0sU1y1M' },
      { keywords: ['internet', 'web', 'online'], url: 'https://www.youtube.com/embed/YuZP1JmRzjI' },
      { keywords: ['email', 'mail', 'communication'], url: 'https://www.youtube.com/embed/GtQdIYUtAHg' },
      { keywords: ['social media', 'facebook', 'social'], url: 'https://www.youtube.com/embed/2QR3dvs5Mps' },
      { keywords: ['safety', 'security', 'privacy'], url: 'https://www.youtube.com/embed/UB1O30fR-EE' },
      { keywords: ['microsoft', 'word', 'excel'], url: 'https://www.youtube.com/embed/1T_YbkBWGcE' },
      { keywords: ['digital', 'technology', 'tech'], url: 'https://www.youtube.com/embed/kFMTec22JfQ' },
      
      // Leadership & Communication
      { keywords: ['public speaking', 'speaking', 'speech'], url: 'https://www.youtube.com/embed/zvR9sXKQeB0' },
      { keywords: ['leadership', 'leader', 'leading'], url: 'https://www.youtube.com/embed/Np3GU7aS4nA' },
      { keywords: ['communication', 'communicate', 'conversation'], url: 'https://www.youtube.com/embed/HAnw168huqA' },
      { keywords: ['team', 'teamwork', 'collaboration'], url: 'https://www.youtube.com/embed/VzxfQlzzGJE' },
      { keywords: ['confidence', 'self-esteem', 'motivation'], url: 'https://www.youtube.com/embed/yeqKWOKxLDs' },
      { keywords: ['negotiation', 'conflict', 'resolution'], url: 'https://www.youtube.com/embed/psN1DORYYV0' },
      
      // Women Empowerment
      { keywords: ['women', 'empowerment', 'gender'], url: 'https://www.youtube.com/embed/RyVS7R9PN6Y' },
      { keywords: ['career', 'professional', 'workplace'], url: 'https://www.youtube.com/embed/hER0Qp6QJNU' },
      
      // General fallbacks
      { keywords: ['intro', 'introduction'], url: 'https://www.youtube.com/embed/kJQP7kiw5Fk' },
      { keywords: ['advanced', 'expert'], url: 'https://www.youtube.com/embed/fJ9rUzIMcZQ' }
    ];
    
    // Get modules without videos
    const { rows: modules } = await pool.query(`
      SELECT id, title FROM modules 
      WHERE video_url IS NULL OR video_url = ''
    `);
    
    const updates = [];
    
    for (const module of modules) {
      const title = module.title.toLowerCase();
      
      for (const mapping of videoMappings) {
        if (mapping.keywords.some(keyword => title.includes(keyword))) {
          updates.push({
            id: module.id,
            title: module.title,
            video_url: mapping.url
          });
          break;
        }
      }
    }
    
    // Apply updates
    for (const update of updates) {
      await pool.query(`
        UPDATE modules 
        SET video_url = $1, duration = 15, updated_at = NOW()
        WHERE id = $2
      `, [update.video_url, update.id]);
    }
    
    res.json({
      message: `Auto-assigned videos to ${updates.length} modules`,
      updates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;