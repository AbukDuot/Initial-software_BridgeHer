import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";


const handleError = (res, err) => {
  console.error(err);
  return res.status(500).json({ message: "Server error" });
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await pool.query(
      "SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
};

export const getUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query(
      "SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
};

export const listUsers = async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    handleError(res, err);
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, email } = req.body;
    const result = await pool.query(
      "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, name, email, role, avatar, created_at",
      [name, email, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Missing passwords" });

    const { rows } = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const hashed = rows[0].password;
    const ok = await bcrypt.compare(currentPassword, hashed);
    if (!ok) return res.status(403).json({ message: "Current password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [newHash, userId]);
    res.json({ message: "Password updated" });
  } catch (err) {
    handleError(res, err);
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { rows } = await pool.query("SELECT avatar FROM users WHERE id = $1", [userId]);
    if (rows.length === 1 && rows[0].avatar) {
      try {
        const oldPath = path.join(process.cwd(), rows[0].avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (e) {
        
      }
    }

  
    const avatarPath = path.join("uploads", "avatars", req.file.filename).replace(/\\/g, "/");
    const result = await pool.query(
      "UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, name, email, role, avatar, created_at",
      [avatarPath, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { rows } = await pool.query("SELECT avatar FROM users WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    if (rows[0].avatar) {
      try {
        const oldPath = path.join(process.cwd(), rows[0].avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (e) {
       
      }
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    handleError(res, err);
  }
};