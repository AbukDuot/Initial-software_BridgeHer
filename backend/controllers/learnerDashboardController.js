import pool from "../config/db.js";

export async function getLearnerOverview(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Authentication required" });

    let coursesCompleted = 0;
    try {
      const { rows } = await pool.query("SELECT count(*)::int AS cnt FROM user_courses WHERE user_id = $1 AND completed = true", [userId]);
      coursesCompleted = rows[0]?.cnt || 0;
    } catch (e) {
      coursesCompleted = 0;
    }

    let badgesCount = 0;
    try {
      const { rows } = await pool.query("SELECT count(*)::int AS cnt FROM badges WHERE user_id = $1", [userId]);
      badgesCount = rows[0]?.cnt || 0;
    } catch (e) {
      badgesCount = 0;
    }

    let postsCount = 0;
    try {
      const { rows } = await pool.query("SELECT count(*)::int AS cnt FROM posts WHERE user_id = $1", [userId]);
      postsCount = rows[0]?.cnt || 0;
    } catch (e) {
      postsCount = 0;
    }

    let upcomingMentorships = [];
    try {
      const { rows } = await pool.query(
        `SELECT id, topic, scheduled_at, status, mentor_id FROM mentorship_requests
         WHERE requester_id = $1 AND scheduled_at IS NOT NULL AND scheduled_at > now()
         ORDER BY scheduled_at ASC LIMIT 10`,
        [userId]
      );
      upcomingMentorships = rows;
    } catch (e) {
      upcomingMentorships = [];
    }

    let reminders = [];
    try {
      const { rows } = await pool.query("SELECT id, text, done FROM user_reminders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20", [userId]);
      reminders = rows;
    } catch (e) {
      reminders = [];
    }

    return res.json({
      coursesCompleted,
      badgesCount,
      postsCount,
      upcomingMentorships,
      reminders,
    });
  } catch (err) {
    next(err);
  }
}