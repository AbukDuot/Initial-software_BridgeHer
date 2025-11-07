import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Test if quiz tables exist and create sample quiz
router.get('/check-quiz-setup', async (req, res) => {
  try {
    // Check if quiz tables exist
    const { rows: tables } = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('quizzes', 'quiz_questions', 'quiz_attempts')
    `);
    
    const existingTables = tables.map(t => t.table_name);
    
    if (existingTables.length < 3) {
      // Create tables if they don't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quizzes (
          id SERIAL PRIMARY KEY,
          module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          time_limit INTEGER DEFAULT 30,
          passing_score INTEGER DEFAULT 70,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS quiz_questions (
          id SERIAL PRIMARY KEY,
          quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
          question TEXT NOT NULL,
          question_type VARCHAR(50) DEFAULT 'multiple_choice',
          options JSONB,
          correct_answer TEXT NOT NULL,
          points INTEGER DEFAULT 1,
          order_index INTEGER DEFAULT 0
        );
        
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
          score INTEGER NOT NULL,
          total_points INTEGER NOT NULL,
          percentage DECIMAL(5,2) NOT NULL,
          passed BOOLEAN NOT NULL,
          answers JSONB,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          time_taken INTEGER
        );
      `);
    }
    
    // Get first module to create test quiz
    const { rows: modules } = await pool.query('SELECT id, title FROM modules LIMIT 1');
    
    if (modules.length > 0) {
      const moduleId = modules[0].id;
      
      // Check if quiz exists for this module
      const { rows: existingQuiz } = await pool.query('SELECT id FROM quizzes WHERE module_id = $1', [moduleId]);
      
      if (existingQuiz.length === 0) {
        // Create test quiz
        const { rows: quizRows } = await pool.query(`
          INSERT INTO quizzes (module_id, title, description, time_limit, passing_score)
          VALUES ($1, $2, $3, 30, 70) RETURNING id
        `, [moduleId, `${modules[0].title} Quiz`, `Test your knowledge of ${modules[0].title}`]);
        
        const quizId = quizRows[0].id;
        
        // Add test questions
        await pool.query(`
          INSERT INTO quiz_questions (quiz_id, question, question_type, options, correct_answer, points, order_index)
          VALUES 
          ($1, 'What is the main component of a computer that processes data?', 'multiple_choice', '["CPU", "RAM", "Hard Drive", "Monitor"]', 'CPU', 2, 1),
          ($1, 'Learning new skills is important for personal growth. True or False?', 'multiple_choice', '["True", "False"]', 'True', 1, 2)
        `, [quizId]);
      }
    }
    
    res.json({ 
      message: 'Quiz setup completed',
      tablesExist: existingTables,
      modulesCount: modules.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;