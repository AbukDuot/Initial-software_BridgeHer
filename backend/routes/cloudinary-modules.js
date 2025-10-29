import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import pool from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({ storage });

router.post("/", requireAuth, requireRole(["Admin"]), upload.fields([{ name: "video", maxCount: 1 }, { name: "pdf", maxCount: 1 }]), async (req, res) => {
  try {
    const { course_id, title, description, content, order_index, duration } = req.body;
    
    let videoPath = null;
    
    if (req.files?.video?.[0]) {
      videoPath = req.files.video[0].path;
    }
    
    const { rows } = await pool.query(
      `INSERT INTO modules (course_id, title, description, content, video_url, order_index, duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [course_id, title, description || "", content || "", videoPath, order_index || 0, duration || 0]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
