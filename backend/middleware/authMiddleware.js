import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [decoded.id]);

      if (!user.rows.length) return res.status(401).json({ message: "User not found" });

      req.user = user.rows[0];
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  if (!token) return res.status(401).json({ message: "No token, authorization denied" });
};


export const requireAuth = protect;

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!Array.isArray(roles) || roles.length === 0) return next();
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
};