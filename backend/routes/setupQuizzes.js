import express from 'express';
import pool from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup quizzes for all modules
router.post('/setup-all-quizzes', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    // Get all modules
    const { rows: modules } = await pool.query('SELECT id, title, course_id FROM modules ORDER BY course_id, order_index');
    
    let setupCount = 0;
    
    for (const module of modules) {
      // Check if quiz already exists
      const { rows: existingQuiz } = await pool.query('SELECT id FROM quizzes WHERE module_id = $1', [module.id]);
      
      if (existingQuiz.length === 0) {
        // Create quiz
        const { rows: quizRows } = await pool.query(
          `INSERT INTO quizzes (module_id, title, description, time_limit, passing_score)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [module.id, `${module.title} Quiz`, `Test your knowledge of ${module.title}`, 30, 70]
        );
        
        const quizId = quizRows[0].id;
        
        // Add sample questions based on module content
        const questions = generateQuestionsForModule(module.title);
        
        for (let i = 0; i < questions.length; i++) {
          await pool.query(
            `INSERT INTO quiz_questions (quiz_id, question, question_type, options, correct_answer, points, order_index)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [quizId, questions[i].question, questions[i].type, JSON.stringify(questions[i].options), questions[i].correct, questions[i].points, i + 1]
          );
        }
        
        setupCount++;
      }
    }
    
    res.json({ message: `Setup completed. Created ${setupCount} quizzes.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateQuestionsForModule(moduleTitle) {
  const title = moduleTitle.toLowerCase();
  
  if (title.includes('hardware') || title.includes('computer basics')) {
    return [
      {
        question: "What is the main processing unit of a computer called?",
        type: "multiple_choice",
        options: ["CPU", "RAM", "Hard Drive", "Monitor"],
        correct: "CPU",
        points: 2
      },
      {
        question: "RAM stands for Random Access Memory. True or False?",
        type: "true_false", 
        options: ["True", "False"],
        correct: "True",
        points: 1
      },
      {
        question: "Which component stores data permanently?",
        type: "multiple_choice",
        options: ["RAM", "CPU", "Hard Drive", "Cache"],
        correct: "Hard Drive",
        points: 2
      }
    ];
  }
  
  if (title.includes('operating system') || title.includes('windows')) {
    return [
      {
        question: "What is an operating system?",
        type: "multiple_choice",
        options: ["Software that manages computer hardware", "A type of virus", "A web browser", "A game"],
        correct: "Software that manages computer hardware",
        points: 2
      },
      {
        question: "Windows is an example of an operating system. True or False?",
        type: "true_false",
        options: ["True", "False"], 
        correct: "True",
        points: 1
      }
    ];
  }
  
  if (title.includes('internet') || title.includes('web')) {
    return [
      {
        question: "What does WWW stand for?",
        type: "multiple_choice",
        options: ["World Wide Web", "World Wide Window", "Web Wide World", "Wide Web World"],
        correct: "World Wide Web",
        points: 2
      },
      {
        question: "A web browser is used to access websites. True or False?",
        type: "true_false",
        options: ["True", "False"],
        correct: "True", 
        points: 1
      }
    ];
  }
  
  // Default questions for any module
  return [
    {
      question: `What is the main topic of the ${moduleTitle} module?`,
      type: "multiple_choice",
      options: ["Technology", "Cooking", "Sports", "Music"],
      correct: "Technology",
      points: 2
    },
    {
      question: "Learning new skills is important for personal growth. True or False?",
      type: "true_false",
      options: ["True", "False"],
      correct: "True",
      points: 1
    }
  ];
}

export default router;