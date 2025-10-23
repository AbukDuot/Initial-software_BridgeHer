import pool from "../config/db.js";

export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, bio, expertise, availability, contact, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function getByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, name, email, password, role, bio, expertise, availability, contact, created_at
     FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

export async function create({ name = "", email, password, role = "Learner", bio = "", expertise = "", availability = null, contact = "" }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role, bio, expertise, availability, contact)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, name, email, role, bio, expertise, availability, contact, created_at`,
    [name, email, password, role, bio, expertise, availability, contact]
  );
  return rows[0];
}

export async function update(id, fields = {}) {
  const keys = Object.keys(fields);
  if (!keys.length) return null;
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const params = keys.map((k) => fields[k]);
  params.push(id);
  const sql = `UPDATE users SET ${sets.join(", ")}, updated_at = now() WHERE id = $${params.length} RETURNING id, name, email, role, bio, expertise, availability, contact, updated_at`;
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

export async function setPassword(id, hashedPassword) {
  const { rows } = await pool.query(
    `UPDATE users SET password = $1, updated_at = now() WHERE id = $2 RETURNING id`,
    [hashedPassword, id]
  );
  return !!rows[0];
}

export async function list({ role, q, limit = 50, offset = 0 } = {}) {
  const params = [];
  const where = [];
  if (role) {
    params.push(role);
    where.push(`role = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length} OR bio ILIKE $${params.length})`);
  }
  params.push(limit, offset);
  const sql = `SELECT id, name, email, role, bio, expertise, availability, created_at
               FROM users
               ${where.length ? "WHERE " + where.join(" AND ") : ""}
               ORDER BY created_at DESC
               LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await pool.query(sql, params);
  return rows;
}