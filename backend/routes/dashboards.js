import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get learner dashboard data
router.get("/learner", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const { rows: userRows } = await pool.query(
      "SELECT name, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    // Get enrolled courses with progress
    const { rows: coursesRows } = await pool.query(
      `SELECT c.id, c.title, c.category, e.progress, e.completed_modules, e.enrolled_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );

    // Get certificates count
    const { rows: certRows } = await pool.query(
      "SELECT COUNT(*) as count FROM certificates WHERE user_id = $1",
      [userId]
    );

    // Get or create gamification points
    let pointsRows = await pool.query(
      "SELECT total_points, level, streak FROM user_points WHERE user_id = $1",
      [userId]
    );
    
    // If no points record exists, create one
    if (pointsRows.rows.length === 0) {
      await pool.query(
        "INSERT INTO user_points (user_id, total_points, level, streak) VALUES ($1, 0, 1, 0)",
        [userId]
      );
      pointsRows = await pool.query(
        "SELECT total_points, level, streak FROM user_points WHERE user_id = $1",
        [userId]
      );
    }

    // Calculate stats
    const totalCourses = coursesRows.length;
    const completedCourses = coursesRows.filter(c => c.progress >= 100).length;
    const avgProgress = totalCourses > 0 
      ? Math.round(coursesRows.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCourses)
      : 0;

    res.json({
      user: userRows[0],
      stats: {
        streak: pointsRows.rows[0]?.streak || 0,
        xp: pointsRows.rows[0]?.total_points || 0,
        level: pointsRows.rows[0]?.level || 1,
        totalCourses,
        completedCourses,
        certificates: parseInt(certRows[0].count)
      },
      courses: coursesRows,
      completion: {
        completed: avgProgress,
        remaining: 100 - avgProgress
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get mentor dashboard data
router.get("/mentor", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const { rows: userRows } = await pool.query(
      "SELECT name, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    // Get mentorship connections
    const { rows: connectionsRows } = await pool.query(
      `SELECT m.*, u.name as learner_name, u.email as learner_email
       FROM mentorship_requests m
       JOIN users u ON u.id = m.requester_id
       WHERE m.mentor_id = $1
       ORDER BY m.created_at DESC`,
      [userId]
    );

    // Get stats
    const totalLearners = connectionsRows.length;
    const activeSessions = connectionsRows.filter(c => c.status === 'accepted').length;
    const pendingRequests = connectionsRows.filter(c => c.status === 'pending').length;

    res.json({
      user: userRows[0],
      stats: {
        totalLearners,
        activeSessions,
        pendingRequests
      },
      connections: connectionsRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
