import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/db.js";
import { sendCourseCompletionEmail } from "../services/emailService.js";
import { sendCourseCompletionSMS, sendEnrollmentSMS } from "../services/smsService.js";
import { sendEnrollmentEmail } from "../services/notificationService.js";
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`);
  },
});
const upload = multer({ storage });


router.get("/", listCourses);
router.get("/:id", getCourse);

router.post("/", requireAuth, requireRole(["Admin"]), upload.single("image"), createCourse);

router.put("/:id", requireAuth, requireRole(["Admin"]), upload.single("image"), updateCourse);


router.delete("/:id", requireAuth, requireRole(["Admin"]), deleteCourse);


router.post("/:id/enroll", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING
       RETURNING *`,
      [userId, id]
    );
    
    if (rows[0]) {
      const { rows: userData } = await pool.query(
        "SELECT u.name, u.email, u.phone, c.title FROM users u, courses c WHERE u.id = $1 AND c.id = $2",
        [userId, id]
      );
      if (userData[0]) {
        sendEnrollmentEmail(userData[0].email, userData[0].name, userData[0].title).catch(console.error);
        if (userData[0].phone) {
          sendEnrollmentSMS(userData[0].phone, userData[0].name, userData[0].title).catch(console.error);
        }
      }
    }
    
    res.json({ message: "Enrolled successfully", enrollment: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id/modules", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index",
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:id/progress", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { progress, completedModules } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE enrollments 
       SET progress = $1, completed_modules = $2
       WHERE user_id = $3 AND course_id = $4
       RETURNING *`,
      [progress, completedModules, userId, id]
    );
    
    if (progress >= 100) {
      await pool.query(
        `INSERT INTO certificates (user_id, course_id, score)
         VALUES ($1, $2, 100)
         ON CONFLICT DO NOTHING`,
        [userId, id]
      );
      
      await pool.query(
        `INSERT INTO user_points (user_id, total_points, level)
         VALUES ($1, 50, 1)
         ON CONFLICT (user_id) DO UPDATE SET total_points = user_points.total_points + 50`,
        [userId]
      );

      
      const { rows: userRows } = await pool.query("SELECT name, email, phone FROM users WHERE id = $1", [userId]);
      const { rows: courseRows } = await pool.query("SELECT title FROM courses WHERE id = $1", [id]);
      
      if (userRows[0] && courseRows[0]) {
        sendCourseCompletionEmail(userRows[0].email, userRows[0].name, courseRows[0].title).catch(console.error);
        if (userRows[0].phone) {
          sendCourseCompletionSMS(userRows[0].phone, userRows[0].name, courseRows[0].title).catch(console.error);
        }
      }
    }
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/my/enrolled", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT c.*, e.progress, e.completed_modules, e.enrolled_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id/stream/:moduleId", requireAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { rows } = await pool.query("SELECT video_url FROM modules WHERE id = $1", [moduleId]);
    
    if (!rows[0] || !rows[0].video_url) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    res.json({ videoUrl: rows[0].video_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id/download/:moduleId", requireAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { rows } = await pool.query(
      "SELECT downloadable_content, title FROM modules WHERE id = $1",
      [moduleId]
    );
    
    if (!rows[0] || !rows[0].downloadable_content) {
      return res.status(404).json({ error: "Downloadable content not found" });
    }
    
    res.json({
      content: rows[0].downloadable_content,
      filename: `${rows[0].title}.pdf`,
      title: rows[0].title
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/:id/offline/:moduleId", requireAuth, async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const { contentType, fileSize } = req.body;
    
    await pool.query(
      `INSERT INTO offline_content (course_id, module_id, content_type, file_size)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [id, moduleId, contentType, fileSize]
    );
    
    res.json({ message: "Content marked for offline access" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/my/certificates", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT cert.*, c.title as course_title, c.category, u.name as user_name
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = cert.user_id
       WHERE cert.user_id = $1
       ORDER BY cert.issued_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/certificate/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT cert.*, c.title as course_title, c.category, u.name as user_name, u.email
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = cert.user_id
       WHERE cert.id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Certificate not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;