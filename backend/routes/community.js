import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/announcements", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, u.name as author_name
      FROM announcements a
      LEFT JOIN users u ON u.id = a.created_by
      ORDER BY a.pinned DESC, a.created_at DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/topics", async (req, res) => {
  try {
    const { category, tag, sort = 'recent', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT t.*, u.name as author_name, u.avatar_url,
      (SELECT COUNT(*) FROM topic_replies WHERE topic_id = t.id) as replies,
      (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes
      FROM community_topics t
      JOIN users u ON u.id = t.user_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (category) {
      conditions.push(`t.category = $${params.length + 1}`);
      params.push(category);
    }
    
    if (tag) {
      conditions.push(`$${params.length + 1} = ANY(t.tags)`);
      params.push(tag);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    if (sort === 'popular') {
      query += ` ORDER BY t.views DESC, t.likes DESC`;
    } else if (sort === 'trending') {
      query += ` ORDER BY t.likes DESC, t.created_at DESC`;
    } else {
      query += ` ORDER BY t.pinned DESC, t.created_at DESC`;
    }
    
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);
    
    const { rows } = await pool.query(query, params);
    
    const countQuery = `SELECT COUNT(*) FROM community_topics t` + 
      (conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '');
    const { rows: countRows } = await pool.query(countQuery, params.slice(0, -2));
    
    res.json({ 
      topics: rows, 
      total: parseInt(countRows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countRows[0].count) / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/categories", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM community_topics
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tags", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT unnest(tags) as tag, COUNT(*) as count
      FROM community_topics
      WHERE tags IS NOT NULL
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/activity", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      (SELECT 'topic' as type, t.id, t.title as content, u.name as author, t.created_at
       FROM community_topics t
       JOIN users u ON u.id = t.user_id
       ORDER BY t.created_at DESC
       LIMIT 10)
      UNION ALL
      (SELECT 'reply' as type, r.id, r.content, u.name as author, r.created_at
       FROM topic_replies r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.created_at DESC
       LIMIT 10)
      ORDER BY created_at DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/topics", requireAuth, async (req, res) => {
  try {
    const { title, category, description, content, tags } = req.body;
    const userId = req.user.id;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: "Title is required" });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO community_topics (user_id, title, category, description, content, tags)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, title, category || null, description || '', content || '', tags || []]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/topics/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, content, tags } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const { rows: existing } = await pool.query(
      `SELECT user_id FROM community_topics WHERE id = $1`,
      [id]
    );
    
    if (!existing[0]) return res.status(404).json({ error: "Topic not found" });
    if (existing[0].user_id !== userId && userRole !== 'Admin') {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const { rows } = await pool.query(
      `UPDATE community_topics 
       SET title = $1, category = $2, description = $3, content = $4, tags = $5
       WHERE id = $6 RETURNING *`,
      [title, category, description, content, tags || [], id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/replies/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const { rows: existing } = await pool.query(
      `SELECT user_id FROM topic_replies WHERE id = $1`,
      [id]
    );
    
    if (!existing[0]) return res.status(404).json({ error: "Reply not found" });
    if (existing[0].user_id !== userId && userRole !== 'Admin') {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const { rows } = await pool.query(
      `UPDATE topic_replies SET content = $1 WHERE id = $2 RETURNING *`,
      [content, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/topics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
   
    await pool.query(`UPDATE community_topics SET views = views + 1 WHERE id = $1`, [id]);
    
    const { rows: topicRows } = await pool.query(
      `SELECT t.*, u.name as author_name, u.avatar_url,
       (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes,
       ${userId ? `(SELECT COUNT(*) > 0 FROM topic_likes WHERE topic_id = t.id AND user_id = $2) as user_liked` : 'false as user_liked'}
       FROM community_topics t
       JOIN users u ON u.id = t.user_id
       WHERE t.id = $1`,
      userId ? [id, userId] : [id]
    );
    
    if (!topicRows[0]) return res.status(404).json({ error: "Topic not found" });
    
    const { rows: replyRows } = await pool.query(
      `SELECT r.*, u.name as author_name, u.avatar_url,
       (SELECT COUNT(*) FROM reply_likes WHERE reply_id = r.id) as likes,
       ${userId ? `(SELECT COUNT(*) > 0 FROM reply_likes WHERE reply_id = r.id AND user_id = $2) as user_liked` : 'false as user_liked'}
       FROM topic_replies r
       JOIN users u ON u.id = r.user_id
       WHERE r.topic_id = $1
       ORDER BY r.created_at ASC`,
      userId ? [id, userId] : [id]
    );
    
    res.json({ topic: topicRows[0], replies: replyRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/topics/:id/replies", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: "Reply content is required" });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO topic_replies (topic_id, user_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, userId, content]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/topics/:id/like", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT * FROM topic_likes WHERE topic_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (existing.length > 0) {
      
      await pool.query(
        `DELETE FROM topic_likes WHERE topic_id = $1 AND user_id = $2`,
        [id, userId]
      );
      res.json({ liked: false });
    } else {
      
      await pool.query(
        `INSERT INTO topic_likes (topic_id, user_id) VALUES ($1, $2)`,
        [id, userId]
      );
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/replies/:id/like", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT * FROM reply_likes WHERE reply_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (existing.length > 0) {
      
      await pool.query(
        `DELETE FROM reply_likes WHERE reply_id = $1 AND user_id = $2`,
        [id, userId]
      );
      res.json({ liked: false });
    } else {
      
      await pool.query(
        `INSERT INTO reply_likes (reply_id, user_id) VALUES ($1, $2)`,
        [id, userId]
      );
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/topics/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const { rows } = await pool.query(
      `SELECT user_id FROM community_topics WHERE id = $1`,
      [id]
    );
    
    if (!rows[0]) return res.status(404).json({ error: "Topic not found" });
    
    if (rows[0].user_id !== userId && userRole !== 'Admin') {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    await pool.query(`DELETE FROM community_topics WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/replies/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const { rows } = await pool.query(
      `SELECT user_id FROM topic_replies WHERE id = $1`,
      [id]
    );
    
    if (!rows[0]) return res.status(404).json({ error: "Reply not found" });
    
    if (rows[0].user_id !== userId && userRole !== 'Admin') {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    await pool.query(`DELETE FROM topic_replies WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) return res.json([]);
    
    const { rows } = await pool.query(
      `SELECT t.*, u.name as author_name,
       (SELECT COUNT(*) FROM topic_replies WHERE topic_id = t.id) as replies,
       (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes
       FROM community_topics t
       JOIN users u ON u.id = t.user_id
       WHERE t.title ILIKE $1 OR t.description ILIKE $1 OR t.content ILIKE $1
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [`%${q}%`]
    );
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/topics/:id/pin", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Admin only" });
    }
    
    const { rows } = await pool.query(
      `UPDATE community_topics SET pinned = NOT pinned WHERE id = $1 RETURNING pinned`,
      [id]
    );
    
    res.json({ pinned: rows[0].pinned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reports", requireAuth, async (req, res) => {
  try {
    const { content_type, content_id, reason } = req.body;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO content_reports (user_id, content_type, content_id, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, content_type, content_id, reason]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/reports", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Admin only" });
    }
    
    const { rows } = await pool.query(
      `SELECT r.*, u.name as reporter_name,
       CASE 
         WHEN r.content_type = 'topic' THEN (SELECT title FROM community_topics WHERE id = r.content_id)
         WHEN r.content_type = 'reply' THEN (SELECT content FROM topic_replies WHERE id = r.content_id)
       END as content_preview
       FROM content_reports r
       JOIN users u ON u.id = r.user_id
       WHERE r.status = 'pending'
       ORDER BY r.created_at DESC`
    );
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
