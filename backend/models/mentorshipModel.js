import pool from "../config/db.js";

export async function list({ requesterId, mentorId, status, limit = 200 } = {}) {
  const where = [];
  const params = [];
  if (requesterId) {
    params.push(requesterId);
    where.push(`requester_id = $${params.length}`);
  }
  if (mentorId) {
    params.push(mentorId);
    where.push(`mentor_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  params.push(limit);
  const sql = `SELECT * FROM mentorship_requests ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT $${params.length}`;
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query("SELECT * FROM mentorship_requests WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function create(payload) {
  const { requester_id, mentor_id = null, topic = "", message = "", status = "pending", scheduled_at = null } = payload;
  const sql = `INSERT INTO mentorship_requests (requester_id, mentor_id, topic, message, status, scheduled_at)
               VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const params = [requester_id, mentor_id, topic, message, status, scheduled_at];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

export async function update(id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return null;
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const params = keys.map((k) => fields[k]);
  params.push(id);
  const sql = `UPDATE mentorship_requests SET ${sets.join(", ")}, updated_at = now() WHERE id = $${params.length} RETURNING *`;
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await pool.query("DELETE FROM mentorship_requests WHERE id = $1", [id]);
  return rowCount > 0;
}

export async function summaryForMentor(mentorId) {
  const { rows } = await pool.query(
    `SELECT status, count(*)::int AS cnt
     FROM mentorship_requests
     WHERE mentor_id = $1
     GROUP BY status`,
    [mentorId]
  );
  return rows;
}