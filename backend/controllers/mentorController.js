import pool from "../config/db.js";

export async function listMentors(req, res, next) {
  try {
    const { q, expertise, limit = 50 } = req.query;
    const params = [];
    const where = ["role = 'Mentor'"];

    if (q) {
      params.push(`%${q}%`);
      where.push(`(name ILIKE $${params.length} OR bio ILIKE $${params.length})`);
    }
    if (expertise) {
      params.push(`%${expertise}%`);
      where.push(`expertise ILIKE $${params.length}`);
    }

    params.push(Number(limit));
    const sql = `SELECT id, name, email, bio, expertise, phone, location, avatar_url, rating, created_at
                 FROM users
                 WHERE ${where.join(" AND ")}
                 ORDER BY name
                 LIMIT $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getMentor(req, res, next) {
  try {
    const { id } = req.params;
    const { rows: userRows } = await pool.query(
      `SELECT id, name, email, bio, expertise, phone, location, avatar_url, rating, created_at
       FROM users WHERE id = $1 AND role = 'Mentor'`,
      [id]
    );
    const user = userRows[0];
    if (!user) return res.status(404).json({ error: "Mentor not found" });

    const { rows: statsRows } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE mentor_id = $1) AS total_requests,
         COUNT(*) FILTER (WHERE mentor_id = $1 AND status = 'accepted') AS accepted_requests,
         COUNT(DISTINCT requester_id) AS mentees_count
       FROM mentorship_requests`,
      [id]
    );
    const stats = statsRows[0] || { total_requests: 0, accepted_requests: 0, mentees_count: 0 };

    return res.json({ profile: user, stats });
  } catch (err) {
    next(err);
  }
}


export async function updateMentor(req, res, next) {
  try {
    const { id } = req.params;
    const requester = req.user;
    if (!requester) return res.status(401).json({ error: "Authentication required" });
    if (requester.role !== "Admin" && String(requester.id) !== String(id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const allowed = ["name", "bio", "expertise", "phone", "location"];
    const fields = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) fields[k] = req.body[k];
    }
    if (!Object.keys(fields).length) return res.status(400).json({ error: "No updatable fields provided" });

    const keys = Object.keys(fields);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    const params = keys.map((k) => fields[k]);
    params.push(id);

    const sql = `UPDATE users SET ${sets.join(", ")}
                 WHERE id = $${params.length} AND role = 'Mentor'
                 RETURNING id, name, email, bio, expertise, phone, location, created_at`;
    const { rows } = await pool.query(sql, params);
    if (!rows[0]) return res.status(404).json({ error: "Mentor not found or not updated" });
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}


export async function listMentees(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, MIN(m.created_at) AS first_request_at, COUNT(m.id)::int AS request_count
       FROM mentorship_requests m
       JOIN users u ON u.id = m.requester_id
       WHERE m.mentor_id = $1
       GROUP BY u.id, u.name, u.email
       ORDER BY first_request_at DESC`,
      [id]
    );
    return res.json(rows);
  } catch (err) {
    next(err);
  }
}


export async function listMentorRequests(req, res, next) {
  try {
    const mentorId = req.user?.id;
    if (!mentorId) return res.status(401).json({ error: "Authentication required" });
    const { status } = req.query;
    const params = [mentorId];
    let sql = `SELECT m.*, u.name AS requester_name, u.email AS requester_email
               FROM mentorship_requests m
               LEFT JOIN users u ON u.id = m.requester_id
               WHERE m.mentor_id = $1`;
    if (status) {
      params.push(status);
      sql += ` AND m.status = $${params.length}`;
    }
    sql += ` ORDER BY m.created_at DESC`;
    const { rows } = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    next(err);
  }
}


export async function respondToRequest(req, res, next) {
  try {
    const mentorId = req.user?.id;
    if (!mentorId) return res.status(401).json({ error: "Authentication required" });

    const { requestId } = req.params;
    const { action, scheduled_at } = req.body;
    if (!["accept", "decline"].includes(action)) return res.status(400).json({ error: "action must be 'accept' or 'decline'" });

    const { rows: reqRows } = await pool.query("SELECT * FROM mentorship_requests WHERE id = $1", [requestId]);
    const request = reqRows[0];
    if (!request) return res.status(404).json({ error: "Mentorship request not found" });

    const isAssignedMentor = request.mentor_id ? String(request.mentor_id) === String(mentorId) : false;
    const isAdmin = req.user.role === "Admin";
    if (!isAssignedMentor && !isAdmin && request.mentor_id) {
      return res.status(403).json({ error: "Forbidden - not the assigned mentor" });
    }

    const newStatus = action === "accept" ? "accepted" : "declined";
    const params = [];
    let idx = 1;
    const sets = [`status = $${idx++}`];
    params.push(newStatus);

    if (action === "accept" && !request.mentor_id) {
      sets.push(`mentor_id = $${idx++}`);
      params.push(mentorId);
    }

    if (scheduled_at) {
      sets.push(`scheduled_at = $${idx++}`);
      params.push(scheduled_at);
    }

    params.push(requestId);
    const sql = `UPDATE mentorship_requests SET ${sets.join(", ")}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const { rows: updatedRows } = await pool.query(sql, params);
    return res.json(updatedRows[0]);
  } catch (err) {
    next(err);
  }
}