import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { sendAssignmentSubmittedEmail, sendAssignmentGradedEmail } from "../services/notificationService.js";
import { sendAssignmentSubmittedSMS, sendAssignmentGradedSMS } from "../services/assignmentSmsService.js";

const router = express.Router();

const assignmentDir = path.join(process.cwd(), "uploads", "assignments");
fs.mkdirSync(assignmentDir, { recursive: true });

const assignmentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, assignmentDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `assignment-${Date.now()}${ext}`);
  },
});

const assignmentUpload = multer({
  storage: assignmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post("/", requireAuth, requireRole(["Admin"]), async (req, res) => {
  try {
    const { module_id, title, description, due_date, max_score, type, questions } = req.body;
    
    const { rows } = await pool.query(
      `INSERT INTO assignments (module_id, title, description, due_date, max_score, type, questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [module_id, title, description || "", due_date || null, max_score || 100, type || 'written', JSON.stringify(questions || [])]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/module/:moduleId", requireAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM assignments WHERE module_id = $1 ORDER BY created_at",
      [moduleId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM assignments WHERE id = $1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Assignment not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/:id/submit", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { answers } = req.body;
    
    const { rows: assignmentData } = await pool.query(
      "SELECT type, questions, max_score FROM assignments WHERE id = $1",
      [id]
    );
    
    if (!assignmentData[0]) return res.status(404).json({ error: "Assignment not found" });
    
    const assignment = assignmentData[0];
    let score = null;
    
    
    if (assignment.type === 'quiz' && assignment.questions) {
      const questions = JSON.parse(assignment.questions);
      let correct = 0;
      questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) correct++;
      });
      score = Math.round((correct / questions.length) * assignment.max_score);
    }
    
    const { rows } = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, user_id, answers, score, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (assignment_id, user_id) 
       DO UPDATE SET answers = $3, score = $4, status = $5, submitted_at = now()
       RETURNING *`,
      [id, userId, JSON.stringify(answers), score, score !== null ? 'graded' : 'submitted']
    );
    
    const { rows: userData } = await pool.query(
      "SELECT u.name, u.email, u.phone, a.title FROM users u, assignments a WHERE u.id = $1 AND a.id = $2",
      [userId, id]
    );
    if (userData[0]) {
      sendAssignmentSubmittedEmail(userData[0].email, userData[0].name, userData[0].title).catch(console.error);
      if (userData[0].phone) {
        sendAssignmentSubmittedSMS(userData[0].phone, userData[0].name, userData[0].title).catch(console.error);
      }
    }
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/submission", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      "SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND user_id = $2",
      [id, userId]
    );
    
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id/submissions", requireAuth, requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows } = await pool.query(
      `SELECT s.*, u.name as user_name, u.email as user_email
       FROM assignment_submissions s
       JOIN users u ON u.id = s.user_id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
      [id]
    );
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/submission/:id/grade", requireAuth, requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE assignment_submissions 
       SET score = $1, feedback = $2, status = 'graded', graded_at = now()
       WHERE id = $3 RETURNING *`,
      [score, feedback || "", id]
    );
    
    if (!rows[0]) return res.status(404).json({ error: "Submission not found" });
    
    const { rows: userData } = await pool.query(
      "SELECT u.name, u.email, u.phone, a.title FROM users u, assignment_submissions s, assignments a WHERE s.id = $1 AND u.id = s.user_id AND a.id = s.assignment_id",
      [id]
    );
    if (userData[0]) {
      sendAssignmentGradedEmail(userData[0].email, userData[0].name, userData[0].title, score).catch(console.error);
      if (userData[0].phone) {
        sendAssignmentGradedSMS(userData[0].phone, userData[0].name, userData[0].title, score).catch(console.error);
      }
    }
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:id", requireAuth, requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, max_score, type, questions } = req.body;
    
    const fields = {};
    if (title) fields.title = title;
    if (description !== undefined) fields.description = description;
    if (due_date !== undefined) fields.due_date = due_date;
    if (max_score !== undefined) fields.max_score = max_score;
    if (type) fields.type = type;
    if (questions !== undefined) fields.questions = JSON.stringify(questions);
    
    const keys = Object.keys(fields);
    if (!keys.length) return res.status(400).json({ error: "No fields to update" });
    
    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    const params = keys.map(k => fields[k]);
    params.push(id);
    
    const { rows } = await pool.query(
      `UPDATE assignments SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params
    );
    
    if (!rows[0]) return res.status(404).json({ error: "Assignment not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", requireAuth, requireRole(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM assignments WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
