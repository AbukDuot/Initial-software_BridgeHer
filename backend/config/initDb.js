import pool from './db.js';

const initDatabase = async () => {
  try {
    console.log('Checking database tables...');
    
    console.log('Ensuring all database tables exist...');

    console.log('Creating database tables...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Learner',
        phone VARCHAR(20),
        bio TEXT,
        expertise TEXT,
        expertise_ar TEXT,
        location VARCHAR(100),
        avatar_url TEXT,
        video_intro TEXT,
        badges TEXT[],
        rating DECIMAL(3,2) DEFAULT 0,
        calendar_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        title_ar VARCHAR(255),
        description TEXT,
        description_ar TEXT,
        category VARCHAR(100),
        difficulty VARCHAR(50),
        thumbnail_url TEXT,
        image_url TEXT,
        preview_video_url TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        title_ar VARCHAR(255),
        description TEXT,
        description_ar TEXT,
        video_url TEXT,
        pdf_url TEXT,
        order_index INTEGER,
        duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'written',
        questions JSONB,
        due_date TIMESTAMP,
        max_score INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        answers JSONB,
        score INTEGER,
        feedback TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        progress INTEGER DEFAULT 0,
        completed_modules INTEGER DEFAULT 0,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        score INTEGER DEFAULT 100,
        certificate_url TEXT,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'mentorship_requests') THEN
          CREATE TABLE mentorship_requests (
            id SERIAL PRIMARY KEY,
            requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            topic VARCHAR(255),
            status VARCHAR(50) DEFAULT 'pending',
            message TEXT,
            scheduled_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS mentorship_feedback (
        id SERIAL PRIMARY KEY,
        mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        learner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        learner_name VARCHAR(100),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS module_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        time_spent INTEGER DEFAULT 0,
        last_position INTEGER DEFAULT 0,
        completed_at TIMESTAMP,
        UNIQUE(user_id, module_id)
      );

      CREATE TABLE IF NOT EXISTS video_files (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT,
        mime_type VARCHAR(100),
        duration INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_points (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );

      CREATE TABLE IF NOT EXISTS offline_content (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        file_path TEXT NOT NULL,
        file_type VARCHAR(50),
        file_size BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        questions JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        answers JSONB,
        score INTEGER,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        badge_name VARCHAR(100) NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_by INTEGER REFERENCES users(id),
        pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS content_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content_type VARCHAR(50) NOT NULL,
        content_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS community_topics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        content TEXT,
        tags TEXT[],
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS topic_replies (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS topic_likes (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(topic_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS reply_likes (
        id SERIAL PRIMARY KEY,
        reply_id INTEGER REFERENCES topic_replies(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reply_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_courses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      );

      CREATE TABLE IF NOT EXISTS user_reminders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reminder_text TEXT NOT NULL,
        reminder_time TIMESTAMP,
        done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        language VARCHAR(10) DEFAULT 'en',
        theme VARCHAR(20) DEFAULT 'light',
        font_size VARCHAR(20) DEFAULT 'medium',
        accent_color VARCHAR(20) DEFAULT '#4A148C',
        account_privacy VARCHAR(20) DEFAULT 'public',
        profile_pic TEXT,
        notifications_enabled BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS support_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS name VARCHAR(100);
      ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS email VARCHAR(100);
      
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 100;

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        read BOOLEAN DEFAULT FALSE,
        sent_via_email BOOLEAN DEFAULT FALSE,
        sent_via_sms BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS course_recommendations (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        recommended_course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        similarity_score DECIMAL(3,2) DEFAULT 0.50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, recommended_course_id)
      );

      CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
      CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_module ON assignments(module_id);
      CREATE INDEX IF NOT EXISTS idx_course_recommendations_course_id ON course_recommendations(course_id);
      CREATE INDEX IF NOT EXISTS idx_course_recommendations_recommended_id ON course_recommendations(recommended_course_id);

      CREATE TABLE IF NOT EXISTS topic_questions (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS question_answers (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES topic_questions(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS topic_bookmarks (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(topic_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS reply_votes (
        id SERIAL PRIMARY KEY,
        reply_id INTEGER REFERENCES topic_replies(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reply_id, user_id)
      );

      ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';
      ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT FALSE;
      ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS video_url TEXT;
      ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'none';
      ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      
      ALTER TABLE topic_replies ADD COLUMN IF NOT EXISTS parent_reply_id INTEGER REFERENCES topic_replies(id) ON DELETE CASCADE;
      ALTER TABLE topic_replies ADD COLUMN IF NOT EXISTS best_answer BOOLEAN DEFAULT FALSE;
      ALTER TABLE topic_replies ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
      ALTER TABLE topic_replies ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

      CREATE INDEX IF NOT EXISTS idx_topic_questions_topic_id ON topic_questions(topic_id);
      CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers(question_id);
      CREATE INDEX IF NOT EXISTS idx_topic_bookmarks_user_id ON topic_bookmarks(user_id);
      CREATE INDEX IF NOT EXISTS idx_reply_votes_reply_id ON reply_votes(reply_id);
    `);

    console.log('Database tables created successfully!');

    // Add missing columns to assignments table
    await pool.query(`
      ALTER TABLE assignments ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 100;
    `);

    // Add missing columns to courses table
    await pool.query(`
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites TEXT;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS syllabus TEXT;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS estimated_hours INTEGER;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_objectives TEXT;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_name VARCHAR(255);
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS mentor VARCHAR(255);
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50);
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration VARCHAR(100);
    `);

    
    await pool.query(`
      UPDATE courses SET 
        prerequisites = CASE 
          WHEN category = 'Finance' THEN 'No prior financial knowledge required'
          WHEN category = 'Business' THEN 'Basic understanding of business concepts helpful'
          WHEN category = 'Tech' THEN 'No computer experience required'
          WHEN category = 'Leadership' THEN 'Some work or volunteer experience preferred'
          ELSE 'No prerequisites required'
        END,
        syllabus = CASE 
          WHEN category = 'Finance' THEN 'Module 1: Personal Finance Introduction\nModule 2: Budgeting Basics\nModule 3: Saving Strategies\nModule 4: Credit and Debt Management\nModule 5: Investment Fundamentals'
          WHEN category = 'Business' THEN 'Module 1: Business Idea Development\nModule 2: Business Planning\nModule 3: Marketing and Promotion\nModule 4: Funding and Capital'
          WHEN category = 'Tech' THEN 'Module 1: Computer Basics\nModule 2: Internet Navigation\nModule 3: Email Communication\nModule 4: Online Safety\nModule 5: Digital Tools'
          WHEN category = 'Leadership' THEN 'Module 1: Leadership Fundamentals\nModule 2: Public Speaking\nModule 3: Effective Communication\nModule 4: Team Management'
          ELSE 'Course syllabus will be available soon'
        END,
        estimated_hours = CASE 
          WHEN category = 'Finance' THEN 15
          WHEN category = 'Business' THEN 20
          WHEN category = 'Tech' THEN 12
          WHEN category = 'Leadership' THEN 18
          ELSE 10
        END,
        learning_objectives = CASE 
          WHEN category = 'Finance' THEN 'Master personal budgeting, understand saving strategies, learn debt management, and explore basic investment concepts'
          WHEN category = 'Business' THEN 'Identify business opportunities, create business plans, develop marketing strategies, and understand funding options'
          WHEN category = 'Tech' THEN 'Understand computer basics, navigate the internet safely, use email effectively, and work with digital tools'
          WHEN category = 'Leadership' THEN 'Develop leadership presence, master communication techniques, build team management skills, and create influence strategies'
          ELSE 'Learn essential skills and knowledge in this subject area'
        END
      WHERE prerequisites IS NULL OR syllabus IS NULL OR estimated_hours IS NULL OR learning_objectives IS NULL
    `);
    
    console.log('Updated existing courses with missing fields');
    
    
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/PMyiQYJ069w'
      WHERE title = 'Personal Finance Introduction' OR title LIKE '%Introduction to Budgeting%'
    `);
    
    console.log('Updated Personal Finance Introduction video URL');
    
    // Update Smart Saving Tips module video
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/DK-WciQjfxU'
      WHERE title = 'Smart Saving Tips' OR title LIKE '%Saving%'
    `);
    
    // Update Understanding Credit module video
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/YvOZWHXRK8E'
      WHERE title = 'Understanding Credit' OR title LIKE '%Credit%'
    `);
    
    console.log('Updated Finance course module videos');
    
    // Update Business course module videos
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/0Ul4aUS1dxQ'
      WHERE title = 'Finding a Business Idea' OR title LIKE '%Business Idea%'
    `);
    
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/P2LwuF7zn9c'
      WHERE title = 'Pitching and Presentation' OR title LIKE '%Pitching%' OR title LIKE '%Presentation%'
    `);
    
    console.log('Updated Business course module videos');
    
    // Update Leadership course module videos
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/2ZePHenqUg0'
      WHERE title = 'Leadership Fundamentals' OR title LIKE '%Leadership Fundamental%'
    `);
    
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/i5mYphUoOCs'
      WHERE title = 'Public Speaking' OR title LIKE '%Public Speaking%'
    `);
    
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/pJ7RgUCEd5M'
      WHERE title = 'Effective Communication' OR title LIKE '%Effective Communication%'
    `);
    
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/95QwKa34PU4'
      WHERE title = 'Team Management' OR title LIKE '%Team Management%'
    `);
    
    console.log('Updated Leadership course module videos');
    
    // Update Entrepreneurship 101 course module videos
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/-bO6ktwZlTk'
      WHERE title = 'Business Idea Development' OR title LIKE '%Business Idea Development%'
    `);
    
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/mSMtJMLpBZc'
      WHERE title = 'Business Planning' OR title LIKE '%Business Planning%'
    `);
    
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/dI3dXkRpEko'
      WHERE title = 'Marketing and Promotion' OR title LIKE '%Marketing and Promotion%'
    `);
    
    await pool.query(`
      UPDATE modules 
      SET video_url = 'https://www.youtube.com/embed/_emexasxTfw'
      WHERE title = 'Funding and Capital' OR title LIKE '%Funding and Capital%'
    `);
    
    console.log('Updated Entrepreneurship 101 course module videos');


    
    // Execute quiz SQL file
    await executeQuizSQL();
    console.log('Executed quiz SQL file');
    
    // Create assignments for all modules
    await createAssignments();
    console.log('Created assignments for all modules');
    

  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
};

const executeQuizSQL = async () => {
  try {
    // Check current quiz status
    const { rows: existingQuizzes } = await pool.query('SELECT COUNT(*) as count FROM quizzes');
    console.log(`Found ${existingQuizzes[0].count} existing quizzes`);
    
    // Check if we have the proper quiz structure
    const { rows: sampleQuiz } = await pool.query('SELECT * FROM quizzes LIMIT 1');
    if (sampleQuiz.length > 0) {
      console.log('Quiz structure:', Object.keys(sampleQuiz[0]));
      if (sampleQuiz[0].questions) {
        const questions = typeof sampleQuiz[0].questions === 'string' ? JSON.parse(sampleQuiz[0].questions) : sampleQuiz[0].questions;
        console.log(`Sample quiz has ${questions.length} questions`);
      }
    }
    
    // Force complete cleanup of quiz system
    console.log('Forcing complete cleanup of quiz system...');
    
    // Drop and recreate quiz tables to ensure clean state
    await pool.query('DROP TABLE IF EXISTS quiz_attempts CASCADE');
    await pool.query('DROP TABLE IF EXISTS quiz_questions CASCADE');
    await pool.query('DROP TABLE IF EXISTS quizzes CASCADE');
    
    // Recreate quizzes table with proper structure
    await pool.query(`
      CREATE TABLE quizzes (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        passing_score INTEGER DEFAULT 70,
        time_limit INTEGER DEFAULT 10,
        questions JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Recreate quiz_attempts table
    await pool.query(`
      CREATE TABLE quiz_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        score INTEGER,
        passed BOOLEAN,
        answers JSONB,
        time_taken INTEGER,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Recreated quiz tables with clean structure');
    
    // Create quizzes for all modules
    console.log('Creating fresh quizzes for all modules...');
    
    // Get all modules and create quizzes
    const { rows: modules } = await pool.query('SELECT id, title FROM modules ORDER BY id');
    
    for (const module of modules) {
      const questions = getQuestionsForModule(module.title);
      
      await pool.query(
        'INSERT INTO quizzes (module_id, title, passing_score, time_limit, questions) VALUES ($1, $2, $3, $4, $5)',
        [module.id, `${module.title} Quiz`, 70, 10, JSON.stringify(questions)]
      );
    }
    
    const { rows: newCount } = await pool.query('SELECT COUNT(*) as count FROM quizzes');
    console.log(`Created ${newCount[0].count} quizzes for modules`);
    
  } catch (error) {
    console.error('Error executing quiz SQL:', error.message);
  }
};

const getQuestionsForModule = (moduleTitle) => {
  const title = moduleTitle.toLowerCase();
  
  if (title.includes('personal finance introduction')) {
    return [
      {"question": "What is personal finance?", "options": ["Managing your money and financial decisions", "A type of bank account", "A credit card", "A loan"], "correctAnswer": 0},
      {"question": "Why is personal finance important?", "options": ["It helps you achieve financial goals", "It increases your salary", "It eliminates all debt", "It guarantees wealth"], "correctAnswer": 0},
      {"question": "What are the main areas of personal finance?", "options": ["Budgeting, saving, investing, and debt management", "Only saving money", "Only paying bills", "Only investing"], "correctAnswer": 0},
      {"question": "What is financial literacy?", "options": ["Understanding how money works", "Having lots of money", "Working in a bank", "Being good at math"], "correctAnswer": 0},
      {"question": "What is the first step in personal finance?", "options": ["Understanding your income and expenses", "Investing in stocks", "Getting a credit card", "Buying insurance"], "correctAnswer": 0}
    ];
  }
  
  if (title.includes('budgeting')) {
    return [
      {"question": "What is a budget?", "options": ["A plan for spending and saving money", "A type of bank account", "A credit card", "A loan"], "correctAnswer": 0},
      {"question": "Why is budgeting important?", "options": ["It helps track income and expenses", "It increases your salary", "It eliminates all debt", "It guarantees wealth"], "correctAnswer": 0},
      {"question": "What are fixed expenses?", "options": ["Expenses that stay the same each month", "Expenses that change monthly", "One-time purchases", "Entertainment costs"], "correctAnswer": 0},
      {"question": "Which is an example of a variable expense?", "options": ["Groceries", "Rent", "Insurance", "Loan payment"], "correctAnswer": 0},
      {"question": "What is the 50/30/20 budgeting rule?", "options": ["50% needs, 30% wants, 20% savings", "50% savings, 30% needs, 20% wants", "50% wants, 30% savings, 20% needs", "Equal distribution"], "correctAnswer": 0}
    ];
  }
  
  if (title.includes('saving')) {
    return [
      {"question": "What is an emergency fund?", "options": ["Money saved for unexpected expenses", "Money for vacations", "Money for shopping", "Money for investments"], "correctAnswer": 0},
      {"question": "How much should you save in an emergency fund?", "options": ["3-6 months of expenses", "1 week of expenses", "1 year of income", "No specific amount"], "correctAnswer": 0},
      {"question": "What is compound interest?", "options": ["Interest earned on both principal and accumulated interest", "Simple interest only", "Bank fees", "Loan charges"], "correctAnswer": 0},
      {"question": "Where is a safe place to keep savings?", "options": ["Bank savings account", "Under the mattress", "In a wallet", "With friends"], "correctAnswer": 0},
      {"question": "What percentage of income should you aim to save?", "options": ["At least 10-20%", "0%", "100%", "5% only"], "correctAnswer": 0}
    ];
  }
  
  if (title.includes('credit')) {
    return [
      {"question": "What is credit?", "options": ["Borrowed money that must be repaid", "Free money", "A gift", "Savings"], "correctAnswer": 0},
      {"question": "What is a credit score?", "options": ["A number representing creditworthiness", "Your bank balance", "Your income level", "Your age"], "correctAnswer": 0},
      {"question": "What affects your credit score?", "options": ["Payment history and debt levels", "Your name", "Your address", "Your education"], "correctAnswer": 0},
      {"question": "What is a good credit habit?", "options": ["Paying bills on time", "Missing payments", "Maxing out credit cards", "Avoiding all credit"], "correctAnswer": 0},
      {"question": "Why is good credit important?", "options": ["It helps you get loans with better terms", "It increases your salary", "It eliminates debt", "It has no importance"], "correctAnswer": 0}
    ];
  }
  
  if (title.includes('business idea')) {
    return [
      {"question": "What is the first step in finding a business idea?", "options": ["Identify a problem or need in your community", "Borrow money", "Quit your job", "Buy equipment"], "correctAnswer": 0},
      {"question": "What is market research?", "options": ["Gathering information about customers and competitors", "Guessing what people want", "Ignoring customers", "Copying others"], "correctAnswer": 0},
      {"question": "What is a unique selling proposition (USP)?", "options": ["What makes your business different from competitors", "Your business name", "Your location", "Your age"], "correctAnswer": 0},
      {"question": "Why is passion important in business?", "options": ["It keeps you motivated during challenges", "It guarantees success", "It eliminates competition", "It is not important"], "correctAnswer": 0},
      {"question": "How can you test a business idea?", "options": ["Start small and get customer feedback", "Invest all your money immediately", "Never test it", "Wait for years"], "correctAnswer": 0}
    ];
  }
  
  if (title.includes('pitching') || title.includes('presentation')) {
    return [
      {"question": "What is a business pitch?", "options": ["A brief presentation of your business idea", "A long document", "A casual conversation", "A complaint"], "correctAnswer": 0},
      {"question": "How long should an elevator pitch be?", "options": ["30-60 seconds", "30 minutes", "2 hours", "1 second"], "correctAnswer": 0},
      {"question": "What should you include in a pitch?", "options": ["Problem, solution, market, and ask", "Only your name", "Complaints", "Unrelated stories"], "correctAnswer": 0},
      {"question": "Why is body language important in presentations?", "options": ["It conveys confidence and engagement", "It does not matter", "It confuses audience", "It is irrelevant"], "correctAnswer": 0},
      {"question": "How can you improve your pitching skills?", "options": ["Practice regularly and seek feedback", "Never practice", "Avoid presentations", "Memorize without understanding"], "correctAnswer": 0}
    ];
  }
  
  // Entrepreneurship 101 modules
  if (title.includes('business idea development')) {
    return [
      {"question": "What is the first step in business idea development?", "options": ["Identify problems and opportunities", "Get funding immediately", "Quit your job", "Buy equipment"], "correctAnswer": 0},
      {"question": "What is a minimum viable product (MVP)?", "options": ["Simplest version to test core functionality", "Most expensive product", "Perfect final product", "Marketing campaign"], "correctAnswer": 0},
      {"question": "Why is market validation important?", "options": ["To confirm customer demand before investing", "To waste time", "To confuse customers", "To delay launch"], "correctAnswer": 0},
      {"question": "What makes a good business opportunity?", "options": ["Solves real problems for paying customers", "Looks impressive", "Is easy to copy", "Requires no effort"], "correctAnswer": 0},
      {"question": "How should you test your business idea?", "options": ["Get customer feedback early and often", "Keep it secret forever", "Never ask customers", "Only ask family"], "correctAnswer": 0}
    ];
  }
  
  if (title.includes('business planning')) {
    return [
      {"question": "What is the purpose of a business plan?", "options": ["Roadmap for business strategy and operations", "Decoration for office", "Waste of time", "Legal requirement only"], "correctAnswer": 0},
      {"question": "What is SWOT analysis?", "options": ["Strengths, Weaknesses, Opportunities, Threats", "Sales, Wages, Operations, Taxes", "Simple, Working, Organized, Timely", "Strategic, Wise, Optimal, Tactical"], "correctAnswer": 0},
      {"question": "Why is competitive analysis important?", "options": ["Understand market positioning and differentiation", "Copy competitors exactly", "Avoid all competition", "Waste research time"], "correctAnswer": 0},
      {"question": "What should financial projections include?", "options": ["Revenue forecasts, costs, and cash flow", "Only revenue", "Only expenses", "Wishful thinking"], "correctAnswer": 0},
      {"question": "How often should you update your business plan?", "options": ["Regularly as business evolves", "Never", "Only once per year", "Only when seeking funding"], "correctAnswer": 0}
    ];
  }
  
  if (title.includes('marketing') && title.includes('promotion')) {
    return [
      {"question": "What are the 4Ps of marketing?", "options": ["Product, Price, Place, Promotion", "People, Process, Physical, Performance", "Plan, Prepare, Present, Profit", "Purpose, Passion, Persistence, Profit"], "correctAnswer": 0},
      {"question": "What is a target market?", "options": ["Specific group of customers you aim to serve", "Everyone in the world", "Your competitors", "Your employees"], "correctAnswer": 0},
      {"question": "Why is brand positioning important?", "options": ["Differentiates you from competitors", "Confuses customers", "Increases costs", "Wastes time"], "correctAnswer": 0},
      {"question": "What is digital marketing?", "options": ["Marketing through online channels and platforms", "Only social media", "Only email", "Traditional advertising"], "correctAnswer": 0},
      {"question": "How do you measure marketing success?", "options": ["Track metrics like leads, sales, and ROI", "Count likes only", "Guess randomly", "Never measure"], "correctAnswer": 0}
    ];
  }
  
  if (title.includes('funding') && title.includes('capital')) {
    return [
      {"question": "What is bootstrapping?", "options": ["Self-funding your business with personal resources", "Stealing money", "Government funding", "Bank robbery"], "correctAnswer": 0},
      {"question": "What do angel investors typically provide?", "options": ["Early-stage funding and mentorship", "Only criticism", "Free labor", "Office space only"], "correctAnswer": 0},
      {"question": "What is equity financing?", "options": ["Raising money by selling ownership shares", "Taking a loan", "Crowdfunding only", "Government grants"], "correctAnswer": 0},
      {"question": "Why is cash flow management important?", "options": ["Ensures business can pay bills and operate", "Impresses investors only", "Complicates accounting", "Wastes time"], "correctAnswer": 0},
      {"question": "What should you prepare for investors?", "options": ["Business plan, financial projections, and pitch deck", "Only a handshake", "Promises without proof", "Personal stories only"], "correctAnswer": 0}
    ];
  }
  
  // Default questions for any module
  return [
    {"question": "What is the main topic of this module?", "options": ["Learning and development", "Cooking", "Sports", "Music"], "correctAnswer": 0},
    {"question": "Learning new skills is important for personal growth. True or False?", "options": ["True", "False"], "correctAnswer": 0},
    {"question": "Which is the best way to learn?", "options": ["Practice and application", "Just reading", "Ignoring content", "Sleeping"], "correctAnswer": 0},
    {"question": "What should you do after completing a module?", "options": ["Apply what you learned", "Forget everything", "Never use it", "Complain about it"], "correctAnswer": 0},
    {"question": "Continuous learning helps in career development. True or False?", "options": ["True", "False"], "correctAnswer": 0}
  ];
};

const createAssignments = async () => {
  try {
    // Clear existing assignments
    await pool.query('DELETE FROM assignment_submissions');
    await pool.query('DELETE FROM assignments');
    
    // Get all modules
    const { rows: modules } = await pool.query('SELECT id, title FROM modules ORDER BY id');
    
    for (const module of modules) {
      const assignment = getAssignmentForModule(module.title);
      
      await pool.query(
        'INSERT INTO assignments (module_id, title, description, type, due_date, max_score) VALUES ($1, $2, $3, $4, $5, $6)',
        [module.id, assignment.title, assignment.description, assignment.type, assignment.due_date, assignment.max_score || 100]
      );
    }
    
    const { rows: count } = await pool.query('SELECT COUNT(*) as count FROM assignments');
    console.log(`Created ${count[0].count} assignments`);
    
  } catch (error) {
    console.error('Error creating assignments:', error.message);
  }
};

const getAssignmentForModule = (moduleTitle) => {
  const title = moduleTitle.toLowerCase();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // 7 days from now
  
  if (title.includes('personal finance introduction')) {
    return {
      title: 'Personal Finance Assessment',
      description: 'Create a personal budget plan for yourself. Include your monthly income, fixed expenses, variable expenses, and savings goals. Explain how you would allocate your money using the 50/30/20 rule.',
      type: 'written',
      due_date: dueDate,
      max_score: 100
    };
  }
  
  if (title.includes('budgeting')) {
    return {
      title: 'Monthly Budget Creation',
      description: 'Design a detailed monthly budget for a fictional family of 4 with a combined income of $4,000. Include all necessary expenses and explain your reasoning for each allocation.',
      type: 'written',
      due_date: dueDate,
      max_score: 100
    };
  }
  
  if (title.includes('saving')) {
    return {
      title: 'Savings Strategy Plan',
      description: 'Develop a 12-month savings plan to build an emergency fund of $5,000. Include specific strategies, timeline, and potential challenges you might face.',
      type: 'written',
      due_date: dueDate,
      max_score: 100
    };
  }
  
  if (title.includes('credit')) {
    return {
      title: 'Credit Improvement Plan',
      description: 'Create a step-by-step plan to improve a credit score from 580 to 720. Include specific actions, timeline, and explain how each step helps improve the score.',
      type: 'written',
      due_date: dueDate,
      max_score: 100
    };
  }
  
  if (title.includes('business idea')) {
    return {
      title: 'Business Idea Proposal',
      description: 'Identify a business opportunity in your community and write a 2-page proposal. Include the problem you are solving, your solution, target customers, and how you would validate the idea.',
      type: 'written',
      due_date: dueDate,
      max_score: 100
    };
  }
  
  if (title.includes('pitching') || title.includes('presentation')) {
    return {
      title: 'Elevator Pitch Video',
      description: 'Record a 60-second elevator pitch for your business idea. Upload the video file and include a written transcript. Focus on problem, solution, market, and your ask.',
      type: 'file',
      due_date: dueDate,
      max_score: 100
    };
  }
  
  if (title.includes('business idea development')) {
    return {
      title: 'Market Validation Report',
      description: 'Conduct market research for your business idea. Interview 5 potential customers and write a report on your findings. Include customer feedback, market size estimation, and validation results.',
      type: 'written',
      due_date: dueDate,
      max_score: 100
    };
  }
  
  if (title.includes('business planning')) {
    return {
      title: 'Business Plan Executive Summary',
      description: 'Write a 1-page executive summary for your business plan. Include business concept, market analysis, competitive advantage, financial projections, and funding requirements.',
      type: 'written',
      due_date: dueDate,
      max_score: 100
    };
  }
  
  if (title.includes('marketing') && title.includes('promotion')) {
    return {
      title: 'Marketing Campaign Design',
      description: 'Create a marketing campaign for your business. Include target audience, marketing channels, budget allocation, timeline, and success metrics. Submit as a presentation or document.',
      type: 'file',
      due_date: dueDate,
      max_score: 100
    };
  }
  
  if (title.includes('funding') && title.includes('capital')) {
    return {
      title: 'Funding Strategy Presentation',
      description: 'Prepare a funding presentation for investors. Include financial projections, funding requirements, use of funds, and return on investment. Submit as PowerPoint or PDF.',
      type: 'file',
      due_date: dueDate,
      max_score: 100
    };
  }
  
  // Default assignment for any module
  return {
    title: `${moduleTitle} Reflection Assignment`,
    description: 'Write a 500-word reflection on what you learned in this module. Include key concepts, how you will apply this knowledge, and any questions you still have.',
    type: 'written',
    due_date: dueDate,
    max_score: 100
  };
};



export default initDatabase;