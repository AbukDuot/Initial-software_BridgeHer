import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getCurrentUser,
  getUser,
  listUsers,
  updateCurrentUser,
  changePassword,
  uploadAvatar,
  deleteUser,
} from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "avatars");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({ storage });

router.get("/me", requireAuth, getCurrentUser);
router.put("/me", requireAuth, updateCurrentUser);
router.put("/me/password", requireAuth, changePassword);
router.post("/me/avatar", requireAuth, upload.single("avatar"), uploadAvatar);

router.get("/", requireAuth, requireRole(["Admin"]), listUsers);
router.get("/mentors", async (req, res) => {
  try {
    const pool = (await import("../config/db.js")).default;
    const { rows } = await pool.query(
      `SELECT id, name, email, bio, expertise, expertise_ar, video_intro, contact, location, avatar_url, badges, rating, created_at
       FROM users
       WHERE role = 'Mentor'
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/:id", requireAuth, requireRole(["Admin"]), getUser);
router.delete("/:id", requireAuth, requireRole(["Admin"]), deleteUser);

export default router;