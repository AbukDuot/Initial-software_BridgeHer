import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM quizzes WHERE course_id = $1 ORDER BY id",
      [courseId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM quizzes WHERE id = $1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Quiz not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/:id/attempt", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { answers } = req.body;

    const { rows: quizRows } = await pool.query("SELECT * FROM quizzes WHERE id = $1", [id]);
    if (!quizRows[0]) return res.status(404).json({ error: "Quiz not found" });

    const quiz = quizRows[0];
    const questions = quiz.questions;
    let score = 0;
    const totalQuestions = questions.length;

    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= quiz.passing_score;

    const { rows } = await pool.query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score, answers, passed)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, id, percentage, JSON.stringify(answers), passed]
    );

    if (passed) {
      await pool.query(
        `INSERT INTO user_points (user_id, total_points, level)
         VALUES ($1, 10, 1)
         ON CONFLICT (user_id) DO UPDATE SET total_points = user_points.total_points + 10`,
        [userId]
      );
    }

    res.json({ ...rows[0], totalQuestions, correctAnswers: score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/user/attempts", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT qa.*, q.title, q.course_id 
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       WHERE qa.user_id = $1
       ORDER BY qa.attempted_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
