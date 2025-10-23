import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
} from "../controllers/communityController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

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

router.get("/posts", listPosts);
router.get("/posts/:id", getPost);

router.post("/posts", requireAuth, upload.single("image"), createPost);
router.put("/posts/:id", requireAuth, upload.single("image"), updatePost);
router.delete("/posts/:id", requireAuth, deletePost);

router.post("/posts/:id/comments", requireAuth, addComment);
router.delete("/posts/:postId/comments/:commentId", requireAuth, deleteComment);

export default router;