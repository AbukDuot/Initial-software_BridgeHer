import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/course/:courseId", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
  
    const { rows: courseRows } = await pool.query(
      "SELECT * FROM courses WHERE id = $1 AND downloadable = true",
      [courseId]
    );
    
    if (!courseRows[0]) {
      return res.status(404).json({ error: "Course not found or not downloadable" });
    }
    
    
    const { rows: moduleRows } = await pool.query(
      "SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index",
      [courseId]
    );
  
    const { rows: contentRows } = await pool.query(
      "SELECT * FROM offline_content WHERE course_id = $1",
      [courseId]
    );
    
    res.json({
      course: courseRows[0],
      modules: moduleRows,
      offlineContent: contentRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/courses", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM courses WHERE downloadable = true ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/download/:courseId", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    await pool.query(
      `INSERT INTO user_courses (user_id, course_id, last_accessed)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, course_id) DO UPDATE SET last_accessed = NOW()`,
      [userId, courseId]
    );
    
    res.json({ message: "Download tracked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/my-downloads", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT c.*, uc.last_accessed, uc.progress, uc.completed
       FROM user_courses uc
       JOIN courses c ON c.id = uc.course_id
       WHERE uc.user_id = $1
       ORDER BY uc.last_accessed DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
