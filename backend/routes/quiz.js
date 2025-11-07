import express from 'express';
import pool from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get quiz for a module
router.get('/module/:moduleId', requireAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const { rows: quizRows } = await pool.query(
      'SELECT * FROM quizzes WHERE module_id = $1',
      [moduleId]
    );
    
    if (!quizRows[0]) {
      return res.status(404).json({ error: 'Quiz not found for this module' });
    }
    
    const quiz = quizRows[0];
    
    const { rows: questions } = await pool.query(
      'SELECT id, question, question_type, options, points, order_index FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index',
      [quiz.id]
    );
    
    res.json({ ...quiz, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz attempt
router.post('/:quizId/submit', requireAuth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.id;
    
    // Get quiz and questions
    const { rows: quizRows } = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    if (!quizRows[0]) return res.status(404).json({ error: 'Quiz not found' });
    
    const { rows: questions } = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index',
      [quizId]
    );
    
    // Calculate score
    let score = 0;
    let totalPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (userAnswer && userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()) {
        score += question.points;
      }
    });
    
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= quizRows[0].passing_score;
    
    // Save attempt
    const { rows: attemptRows } = await pool.query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score, total_points, percentage, passed, answers, time_taken)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, quizId, score, totalPoints, percentage, passed, JSON.stringify(answers), timeSpent]
    );
    
    res.json({
      attempt: attemptRows[0],
      passed,
      score,
      totalPoints,
      percentage: Math.round(percentage)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's quiz attempts
router.get('/:quizId/attempts', requireAuth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    
    const { rows } = await pool.query(
      'SELECT * FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2 ORDER BY completed_at DESC',
      [userId, quizId]
    );
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;