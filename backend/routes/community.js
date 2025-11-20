import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { checkAndAwardBadges } from "../utils/badgeAwarder.js";

const router = express.Router();

router.get("/announcements", async (req, res) => {
  try {
    console.log('📢 GET /api/community/announcements called');
    const { rows } = await pool.query(`
      SELECT a.*, u.name as author_name
      FROM announcements a
      LEFT JOIN users u ON u.id = a.created_by
      ORDER BY a.pinned DESC, a.created_at DESC
      LIMIT 5
    `);
    console.log(`✅ Found ${rows.length} announcements`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Announcements error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/announcements", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Admin only" });
    }
    
    const { title, content, pinned } = req.body;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO announcements (title, content, created_by, pinned)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, content, userId, pinned || false]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ Create announcement error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put("/announcements/:id", requireAuth, async (req, res) => {
  try {
    console.log('📝 PUT /api/community/announcements/:id called', req.params.id);
    console.log('User role:', req.user?.role);
    
    if (req.user.role !== 'Admin') {
      console.log('❌ Access denied - not admin');
      return res.status(403).json({ error: "Admin only" });
    }
    
    const { id } = req.params;
    const { title, content, pinned } = req.body;
    console.log('Update data:', { title, content, pinned });
    
    const { rows } = await pool.query(
      `UPDATE announcements SET title = $1, content = $2, pinned = $3 WHERE id = $4 RETURNING *`,
      [title, content, pinned, id]
    );
    
    if (!rows[0]) {
      console.log('❌ Announcement not found:', id);
      return res.status(404).json({ error: "Announcement not found" });
    }
    console.log('✅ Announcement updated successfully');
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Update announcement error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/announcements/:id", requireAuth, async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/community/announcements/:id called', req.params.id);
    console.log('User role:', req.user?.role);
    
    if (req.user.role !== 'Admin') {
      console.log('❌ Access denied - not admin');
      return res.status(403).json({ error: "Admin only" });
    }
    
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM announcements WHERE id = $1 RETURNING id`, [id]);
    
    if (result.rowCount === 0) {
      console.log('❌ Announcement not found:', id);
      return res.status(404).json({ error: "Announcement not found" });
    }
    
    console.log('✅ Announcement deleted successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Delete announcement error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/topics", async (req, res) => {
  try {
    console.log('📋 Fetching topics...');
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
      query += ` ORDER BY t.views DESC, (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) DESC`;
    } else if (sort === 'trending') {
      query += ` ORDER BY (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) DESC, t.created_at DESC`;
    } else {
      query += ` ORDER BY t.pinned DESC, t.created_at DESC`;
    }
    
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);
    
    const { rows } = await pool.query(query, params);
    
    const countQuery = `SELECT COUNT(*) FROM community_topics t` + 
      (conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '');
    const { rows: countRows } = await pool.query(countQuery, params.slice(0, -2));
    
    console.log('✅ Topics fetched:', rows.length);
    res.json({ 
      topics: rows, 
      total: parseInt(countRows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countRows[0].count) / parseInt(limit))
    });
  } catch (err) {
    console.error('❌ Topics error:', err.message);
    console.error('Stack:', err.stack);
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
    console.error('❌ Categories error:', err.message);
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
    console.error('❌ Tags error:', err.message);
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
    console.error('❌ Activity error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


router.post("/topics", requireAuth, async (req, res) => {
  try {
    const { title, category, description, tags, image_url, video_url, media_type } = req.body;
    const userId = req.user.id;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: "Title is required" });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO community_topics (user_id, title, category, description, tags, image_url, video_url, media_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, title, category || null, description || '', tags || [], image_url || null, video_url || null, media_type || 'none']
    );
    
    checkAndAwardBadges(userId);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ Create topic error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put("/topics/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, tags } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('Edit request - User ID:', userId, 'Role:', userRole, 'Topic ID:', id);
    
    const { rows: existing } = await pool.query(
      `SELECT user_id FROM community_topics WHERE id = $1`,
      [id]
    );
    
    if (!existing[0]) {
      console.log('Topic not found:', id);
      return res.status(404).json({ error: "Topic not found" });
    }
    
    console.log('Edit check - Topic owner:', existing[0].user_id, 'Current user:', userId, 'Role:', userRole);
    
    // Allow edit for topic owner or admin
    if (existing[0].user_id !== userId && userRole !== 'Admin') {
      console.log('Authorization failed for edit');
      return res.status(403).json({ error: "Not authorized to edit this topic" });
    }
    
    const { rows } = await pool.query(
      `UPDATE community_topics 
       SET title = $1, category = $2, description = $3, tags = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [title, category || null, description || '', tags || [], id]
    );
    
    console.log('Topic updated successfully:', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Edit topic error:', err);
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
    const { skipView } = req.query;
    const userId = req.user?.id;
    
    if (skipView !== 'true') {
      await pool.query(`UPDATE community_topics SET views = views + 1 WHERE id = $1`, [id]);
    }
    
    const { rows: topicRows } = await pool.query(
      `SELECT t.*, COALESCE(u.name, 'Anonymous') as author_name, u.avatar_url,
       (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes,
       ${userId ? `(SELECT COUNT(*) > 0 FROM topic_likes WHERE topic_id = t.id AND user_id = $2) as user_liked` : 'false as user_liked'}
       FROM community_topics t
       LEFT JOIN users u ON u.id = t.user_id
       WHERE t.id = $1`,
      userId ? [id, userId] : [id]
    );
    
    if (!topicRows[0]) return res.status(404).json({ error: "Topic not found" });
    
    const { rows: replyRows } = await pool.query(
      `SELECT r.*, u.name as author_name, u.avatar_url,
       (SELECT COUNT(*) FROM reply_likes WHERE reply_id = r.id) as likes,
       (SELECT COUNT(*) FROM reply_votes WHERE reply_id = r.id AND vote_type = 'up') as upvotes,
       (SELECT COUNT(*) FROM reply_votes WHERE reply_id = r.id AND vote_type = 'down') as downvotes,
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
    
    const { rows: topicRows } = await pool.query(
      `SELECT t.user_id, t.title, u.name as replier_name 
       FROM community_topics t, users u 
       WHERE t.id = $1 AND u.id = $2`,
      [id, userId]
    );
    
    if (topicRows[0] && topicRows[0].user_id !== userId) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, $2, $3, $4)`,
        [
          topicRows[0].user_id,
          'reply',
          'New Reply',
          `${topicRows[0].replier_name} replied to your topic "${topicRows[0].title}". Click to view: /community/topic/${id}`
        ]
      );
    }
    
    checkAndAwardBadges(userId);
    
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
      
      const { rows: topicRows } = await pool.query(
        `SELECT t.user_id, t.title, u.name as liker_name 
         FROM community_topics t, users u 
         WHERE t.id = $1 AND u.id = $2`,
        [id, userId]
      );
      
      if (topicRows[0] && topicRows[0].user_id !== userId) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES ($1, $2, $3, $4)`,
          [
            topicRows[0].user_id,
            'like',
            'New Like',
            `${topicRows[0].liker_name} liked your topic "${topicRows[0].title}". Click to view: /community/topic/${id}`
          ]
        );
      }
      
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
    
    console.log('Delete request - User ID:', userId, 'Role:', userRole, 'Topic ID:', id);
    
    const { rows } = await pool.query(
      `SELECT user_id FROM community_topics WHERE id = $1`,
      [id]
    );
    
    if (!rows[0]) {
      console.log('Topic not found for deletion:', id);
      return res.status(404).json({ error: "Topic not found" });
    }
    
    console.log('Delete check - Topic owner:', rows[0].user_id, 'Current user:', userId, 'Role:', userRole);
    
    // Allow delete for topic owner or admin
    if (rows[0].user_id !== userId && userRole !== 'Admin') {
      console.log('Authorization failed for delete');
      return res.status(403).json({ error: "Not authorized to delete this topic" });
    }
    
    // Delete related records first to avoid foreign key constraint violations
    console.log('Deleting related records...');
    await pool.query(`DELETE FROM topic_bookmarks WHERE topic_id = $1`, [id]);
    await pool.query(`DELETE FROM topic_likes WHERE topic_id = $1`, [id]);
    await pool.query(`DELETE FROM reply_likes WHERE reply_id IN (SELECT id FROM topic_replies WHERE topic_id = $1)`, [id]);
    await pool.query(`DELETE FROM topic_replies WHERE topic_id = $1`, [id]);
    
    console.log('Deleting topic...');
    await pool.query(`DELETE FROM community_topics WHERE id = $1`, [id]);
    
    console.log('Topic deleted successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('Delete topic error:', err);
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
    const { q, tag, author, dateFrom, dateTo, status } = req.query;
    
    let query = `SELECT t.*, u.name as author_name,
       (SELECT COUNT(*) FROM topic_replies WHERE topic_id = t.id) as replies,
       (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes
       FROM community_topics t
       JOIN users u ON u.id = t.user_id
       WHERE 1=1`;
    
    const params = [];
    
    if (q && q.trim()) {
      params.push(`%${q}%`);
      query += ` AND (t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`;
    }
    
    if (tag && tag.trim()) {
      params.push(tag.trim());
      query += ` AND $${params.length} = ANY(t.tags)`;
    }
    
    if (author && author.trim()) {
      params.push(`%${author}%`);
      query += ` AND u.name ILIKE $${params.length}`;
    }
    
    if (dateFrom) {
      params.push(dateFrom);
      query += ` AND t.created_at >= $${params.length}`;
    }
    
    if (dateTo) {
      params.push(dateTo);
      query += ` AND t.created_at <= $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }
    
    query += ` ORDER BY t.created_at DESC LIMIT 50`;
    
    console.log('🔍 Search query:', query);
    console.log('🔍 Search params:', params);
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Search error:', err.message);
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

router.put("/reports/:id/resolve", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Admin only" });
    }
    
    const { id } = req.params;
    await pool.query(
      `UPDATE content_reports SET status = 'resolved' WHERE id = $1`,
      [id]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/reports/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Admin only" });
    }
    
    const { id } = req.params;
    await pool.query(`DELETE FROM content_reports WHERE id = $1`, [id]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:userId/topics", async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await pool.query(
      `SELECT t.id, t.title, t.category, t.views, t.created_at,
       (SELECT COUNT(*) FROM topic_replies WHERE topic_id = t.id) as replies,
       (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes
       FROM community_topics t
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { rows: topicsCount } = await pool.query(
      `SELECT COUNT(*) as count FROM community_topics WHERE user_id = $1`,
      [userId]
    );
    
    const { rows: repliesCount } = await pool.query(
      `SELECT COUNT(*) as count FROM topic_replies WHERE user_id = $1`,
      [userId]
    );
    
    const { rows: likesCount } = await pool.query(
      `SELECT COUNT(*) as count FROM topic_likes tl
       JOIN community_topics t ON t.id = tl.topic_id
       WHERE t.user_id = $1`,
      [userId]
    );
    
    res.json({
      totalTopics: parseInt(topicsCount[0].count),
      totalReplies: parseInt(repliesCount[0].count),
      totalLikes: parseInt(likesCount[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/topics/:id/bookmark", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT * FROM topic_bookmarks WHERE topic_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (existing.length > 0) {
      await pool.query(
        `DELETE FROM topic_bookmarks WHERE topic_id = $1 AND user_id = $2`,
        [id, userId]
      );
      res.json({ bookmarked: false });
    } else {
      await pool.query(
        `INSERT INTO topic_bookmarks (topic_id, user_id) VALUES ($1, $2)`,
        [id, userId]
      );
      res.json({ bookmarked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/bookmarks/check/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `SELECT * FROM topic_bookmarks WHERE topic_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    res.json({ bookmarked: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/bookmarks/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await pool.query(
      `DELETE FROM topic_bookmarks WHERE topic_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    res.json({ bookmarked: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/bookmarks", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT t.*, u.name as author_name,
       (SELECT COUNT(*) FROM topic_replies WHERE topic_id = t.id) as replies,
       (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes,
       b.created_at as bookmarked_at
       FROM topic_bookmarks b
       JOIN community_topics t ON t.id = b.topic_id
       JOIN users u ON u.id = t.user_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/topics/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
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
      `UPDATE community_topics SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/topics/:id/lock", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Admin only" });
    }
    
    const { rows } = await pool.query(
      `UPDATE community_topics SET locked = NOT locked WHERE id = $1 RETURNING locked`,
      [id]
    );
    
    res.json({ locked: rows[0].locked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADVANCED FEATURE 1: NESTED REPLIES ==========
router.post("/replies/:id/reply", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const { rows: parentReply } = await pool.query(
      `SELECT topic_id FROM topic_replies WHERE id = $1`,
      [id]
    );
    
    if (!parentReply[0]) return res.status(404).json({ error: "Parent reply not found" });
    
    const { rows } = await pool.query(
      `INSERT INTO topic_replies (topic_id, user_id, content, parent_reply_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [parentReply[0].topic_id, userId, content, id]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Questions functionality
router.get("/topics/:id/questions", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows: questions } = await pool.query(
      `SELECT q.*, u.name as author_name FROM topic_questions q
       JOIN users u ON u.id = q.user_id
       WHERE q.topic_id = $1 ORDER BY q.created_at DESC`,
      [id]
    );
    
    const { rows: answers } = await pool.query(
      `SELECT a.*, u.name as author_name FROM question_answers a
       JOIN users u ON u.id = a.user_id
       WHERE a.question_id IN (SELECT id FROM topic_questions WHERE topic_id = $1)
       ORDER BY a.created_at ASC`,
      [id]
    );
    
    const answersByQuestion = {};
    answers.forEach(answer => {
      if (!answersByQuestion[answer.question_id]) {
        answersByQuestion[answer.question_id] = [];
      }
      answersByQuestion[answer.question_id].push(answer);
    });
    
    res.json({ questions, answers: answersByQuestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/topics/:id/questions", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    const userId = req.user.id;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: "Question is required" });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO topic_questions (topic_id, user_id, question)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, userId, question]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/questions/:id/answers", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;
    
    if (!answer || answer.trim() === '') {
      return res.status(400).json({ error: "Answer is required" });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO question_answers (question_id, user_id, answer)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, userId, answer]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit question
router.put("/questions/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT user_id FROM topic_questions WHERE id = $1`,
      [id]
    );
    
    if (!existing[0]) return res.status(404).json({ error: "Question not found" });
    if (existing[0].user_id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const { rows } = await pool.query(
      `UPDATE topic_questions SET question = $1 WHERE id = $2 RETURNING *`,
      [question, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete question
router.delete("/questions/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT user_id FROM topic_questions WHERE id = $1`,
      [id]
    );
    
    if (!existing[0]) return res.status(404).json({ error: "Question not found" });
    if (existing[0].user_id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    await pool.query(`DELETE FROM topic_questions WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit answer
router.put("/answers/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT user_id FROM question_answers WHERE id = $1`,
      [id]
    );
    
    if (!existing[0]) return res.status(404).json({ error: "Answer not found" });
    if (existing[0].user_id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const { rows } = await pool.query(
      `UPDATE question_answers SET answer = $1 WHERE id = $2 RETURNING *`,
      [answer, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete answer
router.delete("/answers/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT user_id FROM question_answers WHERE id = $1`,
      [id]
    );
    
    if (!existing[0]) return res.status(404).json({ error: "Answer not found" });
    if (existing[0].user_id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    await pool.query(`DELETE FROM question_answers WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADVANCED FEATURE 2: USER MENTIONS ==========
router.post("/mentions", requireAuth, async (req, res) => {
  try {
    const { content_type, content_id, mentioned_user_id } = req.body;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO user_mentions (user_id, mentioned_user_id, content_type, content_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, mentioned_user_id, content_type, content_id]
    );
    
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, $2, $3, $4)`,
      [mentioned_user_id, 'mention', 'You were mentioned', `You were mentioned in a ${content_type}`]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/mentions", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT m.*, u.name as mentioner_name
       FROM user_mentions m
       JOIN users u ON u.id = m.user_id
       WHERE m.mentioned_user_id = $1
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADVANCED FEATURE 3: EMOJI REACTIONS ==========
router.post("/topics/:id/react", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT * FROM topic_reactions WHERE topic_id = $1 AND user_id = $2 AND emoji = $3`,
      [id, userId, emoji]
    );
    
    if (existing.length > 0) {
      await pool.query(
        `DELETE FROM topic_reactions WHERE topic_id = $1 AND user_id = $2 AND emoji = $3`,
        [id, userId, emoji]
      );
      res.json({ reacted: false });
    } else {
      await pool.query(
        `INSERT INTO topic_reactions (topic_id, user_id, emoji) VALUES ($1, $2, $3)`,
        [id, userId, emoji]
      );
      res.json({ reacted: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/topics/:id/reactions", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT emoji, COUNT(*) as count, array_agg(u.name) as users
       FROM topic_reactions tr
       JOIN users u ON u.id = tr.user_id
       WHERE tr.topic_id = $1
       GROUP BY emoji`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/replies/:id/react", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT * FROM reply_reactions WHERE reply_id = $1 AND user_id = $2 AND emoji = $3`,
      [id, userId, emoji]
    );
    
    if (existing.length > 0) {
      await pool.query(
        `DELETE FROM reply_reactions WHERE reply_id = $1 AND user_id = $2 AND emoji = $3`,
        [id, userId, emoji]
      );
      res.json({ reacted: false });
    } else {
      await pool.query(
        `INSERT INTO reply_reactions (reply_id, user_id, emoji) VALUES ($1, $2, $3)`,
        [id, userId, emoji]
      );
      res.json({ reacted: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply voting (helpful/not helpful)
router.post("/replies/:id/vote", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body;
    const userId = req.user.id;
    
    if (!['up', 'down'].includes(vote_type)) {
      return res.status(400).json({ error: "Invalid vote type" });
    }
    
    // Check if reply exists
    const { rows: replyCheck } = await pool.query(
      `SELECT id FROM topic_replies WHERE id = $1`,
      [id]
    );
    
    if (!replyCheck[0]) {
      return res.status(404).json({ error: "Reply not found" });
    }
    
    // Check existing vote
    const { rows: existing } = await pool.query(
      `SELECT vote_type FROM reply_votes WHERE reply_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (existing.length > 0) {
      if (existing[0].vote_type === vote_type) {
        // Remove vote if same type
        await pool.query(
          `DELETE FROM reply_votes WHERE reply_id = $1 AND user_id = $2`,
          [id, userId]
        );
      } else {
        // Update vote type
        await pool.query(
          `UPDATE reply_votes SET vote_type = $1 WHERE reply_id = $2 AND user_id = $3`,
          [vote_type, id, userId]
        );
      }
    } else {
      // Insert new vote
      await pool.query(
        `INSERT INTO reply_votes (reply_id, user_id, vote_type) VALUES ($1, $2, $3)`,
        [id, userId, vote_type]
      );
    }
    
    // Get updated vote counts
    const { rows: voteCounts } = await pool.query(
      `SELECT 
         COUNT(CASE WHEN vote_type = 'up' THEN 1 END) as upvotes,
         COUNT(CASE WHEN vote_type = 'down' THEN 1 END) as downvotes
       FROM reply_votes WHERE reply_id = $1`,
      [id]
    );
    
    res.json({ 
      success: true,
      upvotes: parseInt(voteCounts[0].upvotes),
      downvotes: parseInt(voteCounts[0].downvotes)
    });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/replies/:id/reactions", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT emoji, COUNT(*) as count, array_agg(u.name) as users
       FROM reply_reactions rr
       JOIN users u ON u.id = rr.user_id
       WHERE rr.reply_id = $1
       GROUP BY emoji`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADVANCED FEATURE 4: FILE ATTACHMENTS ==========
router.post("/attachments", requireAuth, async (req, res) => {
  try {
    const { content_type, content_id, file_url, file_name, file_size } = req.body;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO file_attachments (user_id, content_type, content_id, file_url, file_name, file_size)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, content_type, content_id, file_url, file_name, file_size]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/attachments/:contentType/:contentId", async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM file_attachments WHERE content_type = $1 AND content_id = $2`,
      [contentType, contentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADVANCED FEATURE 5: TOPIC POLLS ==========
router.post("/topics/:id/vote", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { option_index } = req.body;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT * FROM poll_votes WHERE topic_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (existing.length > 0) {
      await pool.query(
        `UPDATE poll_votes SET option_index = $1 WHERE topic_id = $2 AND user_id = $3`,
        [option_index, id, userId]
      );
    } else {
      await pool.query(
        `INSERT INTO poll_votes (topic_id, user_id, option_index) VALUES ($1, $2, $3)`,
        [id, userId, option_index]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/topics/:id/poll-results", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT option_index, COUNT(*) as votes
       FROM poll_votes
       WHERE topic_id = $1
       GROUP BY option_index
       ORDER BY option_index`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADVANCED FEATURE 6: BEST ANSWER ==========
router.post("/replies/:id/mark-best", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows: reply } = await pool.query(
      `SELECT r.topic_id, t.user_id as topic_owner
       FROM topic_replies r
       JOIN community_topics t ON t.id = r.topic_id
       WHERE r.id = $1`,
      [id]
    );
    
    if (!reply[0]) return res.status(404).json({ error: "Reply not found" });
    if (reply[0].topic_owner !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Only topic owner can mark best answer" });
    }
    
    await pool.query(
      `UPDATE topic_replies SET best_answer = false WHERE topic_id = $1`,
      [reply[0].topic_id]
    );
    
    await pool.query(
      `UPDATE topic_replies SET best_answer = true WHERE id = $1`,
      [id]
    );
    
    await pool.query(
      `UPDATE community_topics SET status = 'solved' WHERE id = $1`,
      [reply[0].topic_id]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADVANCED FEATURE 7: USER REPUTATION ==========
router.post("/reputation", requireAuth, async (req, res) => {
  try {
    const { target_user_id, points, reason } = req.body;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO user_reputation (user_id, awarded_by, points, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [target_user_id, userId, points, reason]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/reputation/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(points), 0) as total_reputation
       FROM user_reputation
       WHERE user_id = $1`,
      [userId]
    );
    res.json({ reputation: parseInt(rows[0].total_reputation) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/reputation/:userId/history", async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await pool.query(
      `SELECT r.*, u.name as awarded_by_name
       FROM user_reputation r
       LEFT JOIN users u ON u.id = r.awarded_by
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADVANCED FEATURE 8: TOPIC SUBSCRIPTIONS ==========
router.post("/topics/:id/subscribe", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows: existing } = await pool.query(
      `SELECT * FROM topic_subscriptions WHERE topic_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (existing.length > 0) {
      await pool.query(
        `DELETE FROM topic_subscriptions WHERE topic_id = $1 AND user_id = $2`,
        [id, userId]
      );
      res.json({ subscribed: false });
    } else {
      await pool.query(
        `INSERT INTO topic_subscriptions (topic_id, user_id) VALUES ($1, $2)`,
        [id, userId]
      );
      res.json({ subscribed: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/subscriptions", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT t.*, u.name as author_name,
       (SELECT COUNT(*) FROM topic_replies WHERE topic_id = t.id) as replies,
       (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) as likes
       FROM topic_subscriptions ts
       JOIN community_topics t ON t.id = ts.topic_id
       JOIN users u ON u.id = t.user_id
       WHERE ts.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADVANCED FEATURE 9: DRAFT SAVING ==========
router.post("/drafts", requireAuth, async (req, res) => {
  try {
    const { title, category, description, tags } = req.body;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO community_topics (user_id, title, category, description, tags, is_draft)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
      [userId, title || 'Untitled Draft', category, description, tags || []]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/drafts", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT * FROM community_topics WHERE user_id = $1 AND is_draft = true ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/drafts/:id/publish", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `UPDATE community_topics SET is_draft = false WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    
    if (!rows[0]) return res.status(404).json({ error: "Draft not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADVANCED FEATURE 10: TOPIC TEMPLATES ==========
router.get("/templates", async (req, res) => {
  try {
    const templates = [
      { type: 'question', name: 'Question', template: '**Question:** \n\n**What I tried:** \n\n**Expected result:** \n\n**Actual result:** ' },
      { type: 'discussion', name: 'Discussion', template: '**Topic:** \n\n**Background:** \n\n**Points to discuss:** \n\n**Your thoughts:** ' },
      { type: 'tutorial', name: 'Tutorial', template: '**Title:** \n\n**Prerequisites:** \n\n**Steps:** \n\n**Conclusion:** ' },
      { type: 'announcement', name: 'Announcement', template: '**Announcement:** \n\n**Details:** \n\n**Action required:** ' }
    ];
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/topics/from-template", requireAuth, async (req, res) => {
  try {
    const { template_type, title, category, description, tags } = req.body;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO community_topics (user_id, title, category, description, tags, template_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, title, category, description, tags || [], template_type]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
