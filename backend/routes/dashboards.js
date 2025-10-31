import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/learner", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    
    const { rows: userRows } = await pool.query(
      "SELECT name, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    
    const { rows: coursesRows } = await pool.query(
      `SELECT c.id, c.title, c.category, e.progress, e.completed_modules, e.enrolled_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );

   
    const { rows: certRows } = await pool.query(
      "SELECT COUNT(*) as count FROM certificates WHERE user_id = $1",
      [userId]
    );

    
    let pointsRows = await pool.query(
      "SELECT total_points, level, streak FROM user_points WHERE user_id = $1",
      [userId]
    );
    
   
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

   
    const totalCourses = coursesRows.length;
    const completedCourses = coursesRows.filter(c => c.progress >= 100).length;
    const avgProgress = totalCourses > 0 
      ? Math.round(coursesRows.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCourses)
      : 0;

    const { rows: activityRows } = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM (
         SELECT created_at FROM module_progress WHERE user_id = $1 AND completed = true
         UNION ALL
         SELECT submitted_at as created_at FROM assignment_submissions WHERE user_id = $1
       ) activities
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [userId]
    );
    
    const weeklyHours = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    activityRows.forEach(row => {
      const activityDate = new Date(row.date);
      const daysDiff = Math.floor((today - activityDate) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        const dayIndex = (today.getDay() - daysDiff + 7) % 7;
        weeklyHours[dayIndex] = parseInt(row.count) * 0.5;
      }
    });

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
      },
      weeklyHours
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/mentor", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

   
    const { rows: userRows } = await pool.query(
      "SELECT name, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    
    const { rows: connectionsRows } = await pool.query(
      `SELECT m.*, u.name as learner_name, u.email as learner_email
       FROM mentorship_requests m
       JOIN users u ON u.id = m.requester_id
       WHERE m.mentor_id = $1
       ORDER BY m.created_at DESC`,
      [userId]
    );

   
    const totalLearners = connectionsRows.length;
    const activeSessions = connectionsRows.filter(c => c.status === 'accepted').length;
    const pendingRequests = connectionsRows.filter(c => c.status === 'pending').length;

    const { rows: feedbackRows } = await pool.query(
      `SELECT id, learner_name as learner, rating, comment
       FROM mentorship_feedback
       WHERE mentor_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    const avgRating = feedbackRows.length > 0
      ? feedbackRows.reduce((sum, f) => sum + f.rating, 0) / feedbackRows.length
      : 0;

    res.json({
      user: userRows[0],
      stats: {
        totalLearners,
        activeSessions,
        pendingRequests,
        avgRating: Math.round(avgRating * 10) / 10
      },
      connections: connectionsRows,
      feedback: feedbackRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
