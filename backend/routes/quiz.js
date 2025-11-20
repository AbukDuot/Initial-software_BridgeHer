import express from 'express';
import pool from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test endpoint to check quiz status
router.get('/status', async (req, res) => {
  try {
    const { rows: quizCount } = await pool.query('SELECT COUNT(*) as count FROM quizzes');
    const { rows: sampleQuizzes } = await pool.query('SELECT id, module_id, title, time_limit, passing_score FROM quizzes LIMIT 5');
    
    res.json({
      totalQuizzes: quizCount[0].count,
      sampleQuizzes: sampleQuizzes.map(q => ({
        id: q.id,
        moduleId: q.module_id,
        title: q.title,
        timeLimit: q.time_limit,
        passingScore: q.passing_score
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz for a module
router.get('/module/:moduleId', requireAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id;
    
    const { rows: quizRows } = await pool.query(
      'SELECT * FROM quizzes WHERE module_id = $1',
      [moduleId]
    );
    
    if (!quizRows[0]) {
      return res.status(404).json({ error: 'Quiz not found for this module' });
    }
    
    const quiz = quizRows[0];
    
    // Check attempts
    const { rows: attemptRows } = await pool.query(
      'SELECT COUNT(*) as attempt_count FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
      [userId, quiz.id]
    );
    
    const attemptCount = parseInt(attemptRows[0].attempt_count);
    const maxAttempts = 3;
    
    let questions = [];
    
    if (quiz.questions && Array.isArray(quiz.questions)) {
      questions = quiz.questions.map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: q.options,
        correct_answer: q.options[q.correctAnswer],
        points: 10
      }));
    }
    
    res.json({ 
      id: quiz.id,
      title: quiz.title,
      time_limit: quiz.time_limit || 20,
      passing_score: quiz.passing_score || 70,
      questions,
      attemptCount,
      maxAttempts,
      attemptsRemaining: maxAttempts - attemptCount
    });
  } catch (error) {
    console.error('Quiz fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz attempt
router.post('/:quizId/submit', requireAuth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.id;
    
    // Check attempts limit
    const { rows: attemptCheck } = await pool.query(
      'SELECT COUNT(*) as attempt_count FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
      [userId, quizId]
    );
    
    const attemptCount = parseInt(attemptCheck[0].attempt_count);
    if (attemptCount >= 3) {
      return res.status(400).json({ error: 'Maximum attempts (3) reached for this quiz' });
    }
    
    const { rows: quizRows } = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    if (!quizRows[0]) return res.status(404).json({ error: 'Quiz not found' });
    
    const quiz = quizRows[0];
    const questions = quiz.questions || [];
    
    let score = 0;
    const totalPoints = questions.length * 10;
    
    questions.forEach((question, idx) => {
      const questionId = idx + 1;
      const userAnswer = answers[questionId];
      const correctAnswer = question.options[question.correctAnswer];
      
      // Safe comparison - handle undefined/null
      if (userAnswer && correctAnswer && 
          String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()) {
        score += 10;
      }
    });
    
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= (quiz.passing_score || 70);
    
    const { rows: attemptRows } = await pool.query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score, passed, answers, time_taken)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, quizId, score, passed, JSON.stringify(answers), timeSpent]
    );
    
    const attemptsRemaining = 3 - (attemptCount + 1);
    
    res.json({
      attempt: attemptRows[0],
      passed,
      score,
      totalPoints,
      percentage: Math.round(percentage),
      attemptNumber: attemptCount + 1,
      attemptsRemaining
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
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