import pool from "../config/db.js";

export async function listPosts({ q, limit = 100, offset = 0 } = {}) {
  const params = [];
  let where = "";
  if (q) {
    params.push(`%${q}%`);
    where = `WHERE content ILIKE $${params.length}`;
  }
  params.push(limit, offset);
  const sql = `SELECT p.*, u.name AS author_name
               FROM posts p
               LEFT JOIN users u ON u.id = p.user_id
               ${where}
               ORDER BY p.created_at DESC
               LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getPostById(id) {
  const { rows } = await pool.query(`SELECT p.*, u.name AS author_name FROM posts p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = $1`, [id]);
  return rows[0] || null;
}

export async function createPost({ user_id, content = "", image = "" }) {
  const { rows } = await pool.query(
    `INSERT INTO posts (user_id, content, image) VALUES ($1,$2,$3) RETURNING *`,
    [user_id, content, image]
  );
  return rows[0];
}

export async function updatePost(id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return null;
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const params = keys.map((k) => fields[k]);
  params.push(id);
  const sql = `UPDATE posts SET ${sets.join(", ")}, updated_at = now() WHERE id = $${params.length} RETURNING *`;
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

export async function removePost(id) {
  const { rowCount } = await pool.query("DELETE FROM posts WHERE id = $1", [id]);
  return rowCount > 0;
}

export async function listComments(postId, { limit = 200 } = {}) {
  const { rows } = await pool.query(
    `SELECT c.*, u.name AS author_name FROM comments c LEFT JOIN users u ON u.id = c.user_id WHERE c.post_id = $1 ORDER BY c.created_at ASC LIMIT $2`,
    [postId, limit]
  );
  return rows;
}

export async function addComment(postId, { user_id, content }) {
  const { rows } = await pool.query(
    `INSERT INTO comments (post_id, user_id, content) VALUES ($1,$2,$3) RETURNING *`,
    [postId, user_id, content]
  );
  return rows[0];
}

export async function removeComment(id) {
  const { rowCount } = await pool.query("DELETE FROM comments WHERE id = $1", [id]);
  return rowCount > 0;
}