import pool from "../config/db.js";

export async function getSettings(userId) {
  const { rows } = await pool.query("SELECT settings FROM user_settings WHERE user_id = $1", [userId]);
  return rows[0] ? rows[0].settings : null;
}

export async function upsertSettings(userId, settingsObj) {
  const { rows } = await pool.query(
    `INSERT INTO user_settings (user_id, settings)
     VALUES ($1,$2)
     ON CONFLICT (user_id) DO UPDATE SET settings = $2, updated_at = now()
     RETURNING settings`,
    [userId, settingsObj]
  );
  return rows[0].settings;
}