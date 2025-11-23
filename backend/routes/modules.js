import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import pool from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { addPoints, POINTS } from "../utils/pointsSystem.js";
import { videoStorage as cloudinaryVideoStorage, pdfStorage as cloudinaryPdfStorage } from "../config/cloudinary.js";

const router = express.Router();

const videoDir = path.join(process.cwd(), "uploads", "videos");
const pdfDir = path.join(process.cwd(), "uploads", "pdfs");
fs.mkdirSync(videoDir, { recursive: true });
fs.mkdirSync(pdfDir, { recursive: true });

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videoDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `video-${Date.now()}${ext}`);
  },
});

const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, pdfDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `pdf-${Date.now()}${ext}`);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const allowed = [".mp4", ".webm", ".mov", ".avi"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only video files allowed"));
  },
});

const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const cloudinaryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

const fileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "video") cb(null, videoDir);
      else if (file.fieldname === "pdf") cb(null, pdfDir);
      else cb(new Error("Invalid field"), "");
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const prefix = file.fieldname === "video" ? "video" : "pdf";
      cb(null, `${prefix}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
});


router.post("/", requireAuth, requireRole(["Admin"]), cloudinaryUpload.fields([{ name: "video", maxCount: 1 }, { name: "pdf", maxCount: 1 }]), async (req, res) => {
  try {
    const { course_id, title, description, content, order_index, duration } = req.body;
    
    let videoPath = null;
    let pdfPath = null;
    let fileSize = null;
    
    if (req.files?.video?.[0]) {
      if (useCloudinary) {
        const { cloudinary } = await import("../config/cloudinary.js");
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
        fileSize = result.bytes;
      } else {
        const filename = `video-${Date.now()}${path.extname(req.files.video[0].originalname)}`;
        const filePath = path.join(videoDir, filename);
        fs.writeFileSync(filePath, req.files.video[0].buffer);
        videoPath = `/uploads/videos/${filename}`;
        fileSize = req.files.video[0].size;
      }
    }
    
    if (req.files?.pdf?.[0]) {
      if (useCloudinary) {
        const { cloudinary } = await import("../config/cloudinary.js");
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
      } else {
        const filename = `pdf-${Date.now()}${path.extname(req.files.pdf[0].originalname)}`;
        const filePath = path.join(pdfDir, filename);
        fs.writeFileSync(filePath, req.files.pdf[0].buffer);
        pdfPath = `/uploads/pdfs/${filename}`;
      }
    }
    
    const { rows } = await pool.query(
      `INSERT INTO modules (course_id, title, description, content, video_url, pdf_url, order_index, duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [course_id, title, description || "", content || "", videoPath, pdfPath, order_index || 0, duration || 0]
    );
    
    if (req.files?.video?.[0] && rows[0]) {
      await pool.query(
        `INSERT INTO video_files (module_id, filename, file_path, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [rows[0].id, req.files.video[0].filename, videoPath, fileSize, req.files.video[0].mimetype]
      );
    }
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM modules WHERE id = $1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Module not found" });
    
    const module = rows[0];
    if (module.video_url && module.video_url.startsWith('http://')) {
      module.video_url = module.video_url.replace('http://', 'https://');
    }
    if (module.pdf_url && module.pdf_url.startsWith('http://')) {
      module.pdf_url = module.pdf_url.replace('http://', 'https://');
    }
    
    res.json(module);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:id", requireAuth, requireRole(["Admin"]), fileUpload.fields([{ name: "video", maxCount: 1 }, { name: "pdf", maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = { ...req.body };
    
    if (req.files?.video?.[0]) {
      fields.video_url = `/uploads/videos/${req.files.video[0].filename}`;
      
      await pool.query(
        `INSERT INTO video_files (module_id, filename, file_path, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, req.files.video[0].filename, fields.video_url, req.files.video[0].size, req.files.video[0].mimetype]
      );
    }
    
    if (req.files?.pdf?.[0]) {
      fields.pdf_url = `/uploads/pdfs/${req.files.pdf[0].filename}`;
    }
    
    const keys = Object.keys(fields);
    if (!keys.length) return res.status(400).json({ error: "No fields to update" });
    
    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    const params = keys.map(k => fields[k]);
    params.push(id);
    
    const { rows } = await pool.query(
      `UPDATE modules SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params
    );
    
    if (!rows[0]) return res.status(404).json({ error: "Module not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", requireAuth, requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows: videos } = await pool.query("SELECT file_path FROM video_files WHERE module_id = $1", [id]);
    videos.forEach(v => {
      const filePath = path.join(process.cwd(), v.file_path);
      fs.unlink(filePath, () => {});
    });
    
    await pool.query("DELETE FROM modules WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/stream", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT video_url FROM modules WHERE id = $1", [id]);
    
    if (!rows[0] || !rows[0].video_url) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    const videoPath = path.join(process.cwd(), rows[0].video_url);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: "Video file not found" });
    }
    
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id/download", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT video_url, pdf_url, title, content FROM modules WHERE id = $1",
      [id]
    );
    
    if (!rows[0]) return res.status(404).json({ error: "Module not found" });
    
    res.json({
      videoUrl: rows[0].video_url,
      pdfUrl: rows[0].pdf_url,
      title: rows[0].title,
      content: rows[0].content,
      downloadable: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id/pdf", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT pdf_url, title FROM modules WHERE id = $1", [id]);
    
    if (!rows[0] || !rows[0].pdf_url) {
      return res.status(404).json({ error: "PDF not found" });
    }
    
    if (rows[0].pdf_url.startsWith('http')) {
      return res.json({ url: rows[0].pdf_url, title: rows[0].title });
    }
    
    const pdfPath = path.join(process.cwd(), rows[0].pdf_url);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: "PDF file not found" });
    }
    
    res.download(pdfPath, `${rows[0].title}.pdf`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/:id/progress", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { completed, time_spent, last_position } = req.body;
    
    const { rows } = await pool.query(
      `INSERT INTO module_progress (user_id, module_id, completed, time_spent, last_position, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, module_id) 
       DO UPDATE SET completed = $3, time_spent = $4, last_position = $5, 
                     completed_at = CASE WHEN $3 = true THEN now() ELSE module_progress.completed_at END
       RETURNING *`,
      [userId, id, completed || false, time_spent || 0, last_position || 0, completed ? new Date() : null]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id/progress", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      "SELECT * FROM module_progress WHERE user_id = $1 AND module_id = $2",
      [userId, id]
    );
    
    res.json(rows[0] || { completed: false, time_spent: 0, last_position: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/:id/complete", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO module_progress (user_id, module_id, completed, completed_at)
       VALUES ($1, $2, true, now())
       ON CONFLICT (user_id, module_id) 
       DO UPDATE SET completed = true, completed_at = now()
       RETURNING *`,
      [userId, id]
    );
    
    // Award points for module completion
    await addPoints(userId, POINTS.MODULE_COMPLETE, 'Module completed');
    
    
    const { rows: moduleRows } = await pool.query(
      "SELECT course_id FROM modules WHERE id = $1",
      [id]
    );
    
    if (moduleRows[0]) {
      const courseId = moduleRows[0].course_id;
      
      const { rows: allModules } = await pool.query(
        "SELECT COUNT(*) as total FROM modules WHERE course_id = $1",
        [courseId]
      );
      
      const { rows: completedModules } = await pool.query(
        `SELECT COUNT(*) as completed FROM module_progress mp
         JOIN modules m ON m.id = mp.module_id
         WHERE m.course_id = $1 AND mp.user_id = $2 AND mp.completed = true`,
        [courseId, userId]
      );
      
      if (allModules[0].total === completedModules[0].completed) {
        
        await pool.query(
          `INSERT INTO certificates (user_id, course_id, issued_at)
           VALUES ($1, $2, now())
           ON CONFLICT DO NOTHING`,
          [userId, courseId]
        );
        
        res.json({ ...rows[0], courseComplete: true });
      } else {
        res.json(rows[0]);
      }
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
