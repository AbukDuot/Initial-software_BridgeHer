import express from "express";
import multer from "multer";
import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary.js";
import pool from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }
});

router.post("/", requireAuth, requireRole(["Admin"]), upload.fields([{ name: "video", maxCount: 1 }, { name: "pdf", maxCount: 1 }]), async (req, res) => {
  try {
    const { course_id, title, description, content, order_index, duration } = req.body;
    
    let videoPath = null;
    let pdfPath = null;
    
    if (req.files?.video?.[0]) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "bridgeher-videos", resource_type: "video" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        const streamifier = Readable.from(req.files.video[0].buffer);
        streamifier.pipe(stream);
      });
      videoPath = result.secure_url;
    }
    
    if (req.files?.pdf?.[0]) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "bridgeher-pdfs", resource_type: "raw" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        const streamifier = Readable.from(req.files.pdf[0].buffer);
        streamifier.pipe(stream);
      });
      pdfPath = result.secure_url;
    }
    
    const { rows } = await pool.query(
      `INSERT INTO modules (course_id, title, description, content, video_url, pdf_url, order_index, duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [course_id, title, description || "", content || "", videoPath, pdfPath, order_index || 0, duration || 0]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
