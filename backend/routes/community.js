import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all topics
router.get("/topics", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, u.name as author_name, 
       (SELECT COUNT(*) FROM topic_replies WHERE topic_id = t.id) as replies
       FROM community_topics t
       JOIN users u ON u.id = t.user_id
       ORDER BY t.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create topic
router.post("/topics", requireAuth, async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO community_topics (user_id, title, category, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, title, category, description]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get topic with replies
router.get("/topics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows: topicRows } = await pool.query(
      `SELECT t.*, u.name as author_name
       FROM community_topics t
       JOIN users u ON u.id = t.user_id
       WHERE t.id = $1`,
      [id]
    );
    
    if (!topicRows[0]) return res.status(404).json({ error: "Topic not found" });
    
    const { rows: replyRows } = await pool.query(
      `SELECT r.*, u.name as author_name
       FROM topic_replies r
       JOIN users u ON u.id = r.user_id
       WHERE r.topic_id = $1
       ORDER BY r.created_at ASC`,
      [id]
    );
    
    res.json({ topic: topicRows[0], replies: replyRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add reply
router.post("/topics/:id/replies", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO topic_replies (topic_id, user_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, userId, content]
    );
    
    await pool.query(
      `UPDATE community_topics SET views = views + 1 WHERE id = $1`,
      [id]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
