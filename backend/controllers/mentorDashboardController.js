import pool from "../config/db.js";

export async function getMentorOverview(req, res, next) {
  try {
    const mentorId = req.user?.id;
    if (!mentorId) return res.status(401).json({ error: "Authentication required" });

    let assignedSummary = [];
    try {
      const { rows } = await pool.query(
        `SELECT status, count(*)::int AS cnt FROM mentorship_requests WHERE mentor_id = $1 GROUP BY status`,
        [mentorId]
      );
      assignedSummary = rows;
    } catch (e) {
      assignedSummary = [];
    }

    let upcoming = [];
    try {
      const { rows } = await pool.query(
        `SELECT id, requester_id, topic, scheduled_at FROM mentorship_requests WHERE mentor_id = $1 AND scheduled_at > now() ORDER BY scheduled_at ASC LIMIT 10`,
        [mentorId]
      );
      upcoming = rows;
    } catch (e) {
      upcoming = [];
    }

    let menteesCount = 0;
    try {
      const { rows } = await pool.query(`SELECT COUNT(DISTINCT requester_id)::int AS cnt FROM mentorship_requests WHERE mentor_id = $1`, [mentorId]);
      menteesCount = rows[0]?.cnt || 0;
    } catch (e) {
      menteesCount = 0;
    }

    return res.json({
      assignedSummary,
      upcoming,
      menteesCount,
    });
  } catch (err) {
    next(err);
  }
}