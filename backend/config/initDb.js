import pool from './db.js';

const initDatabase = async () => {
  try {
    console.log(' Checking database tables...');
    
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

    // Clear existing courses and add new ones
    console.log('Setting up default courses...');
    
    // Delete existing courses (this will cascade to modules)
    await pool.query('DELETE FROM courses');
    
    console.log('Adding default courses...');
      
      const defaultCourses = [
        {
          title: 'Financial Literacy for Women',
          description: 'Master personal finance, budgeting, saving, and investment strategies designed specifically for women.',
          category: 'Finance',
          level: 'Beginner',
          duration: '6 weeks',
          mentor: 'Sarah Ahmed',
          image: '/images/finance-course.jpg'
        },
        {
          title: 'Digital Marketing Fundamentals',
          description: 'Learn social media marketing, content creation, and online business strategies.',
          category: 'Business',
          level: 'Beginner', 
          duration: '8 weeks',
          mentor: 'Fatima Hassan',
          image: '/images/marketing-course.jpg'
        },
        {
          title: 'Introduction to Technology',
          description: 'Basic computer skills, internet navigation, and digital communication for beginners.',
          category: 'Tech',
          level: 'Beginner',
          duration: '4 weeks', 
          mentor: 'Amina Mohamed',
          image: '/images/tech-course.jpg'
        },
        {
          title: 'Leadership and Communication',
          description: 'Develop leadership skills, public speaking, and effective communication techniques.',
          category: 'Leadership',
          level: 'Intermediate',
          duration: '10 weeks',
          mentor: 'Zeinab Ali',
          image: '/images/leadership-course.jpg'
        },
        {
          title: 'Entrepreneurship Basics',
          description: 'Start your own business with practical guidance on planning, funding, and operations.',
          category: 'Business',
          level: 'Beginner',
          duration: '12 weeks',
          mentor: 'Hanan Ibrahim',
          image: '/images/business-course.jpg'
        },
        {
          title: 'Advanced Financial Planning',
          description: 'Investment strategies, retirement planning, and wealth building for experienced learners.',
          category: 'Finance', 
          level: 'Advanced',
          duration: '8 weeks',
          mentor: 'Mariam Osman',
          image: '/images/advanced-finance.jpg'
        }
      ];
      
      for (const course of defaultCourses) {
        const { rows } = await pool.query(
          `INSERT INTO courses (title, description, category, level, duration, mentor, image)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [course.title, course.description, course.category, course.level, course.duration, course.mentor, course.image]
        );
        
        const courseId = rows[0].id;
        
        // Add modules for each course
        let modules = [];
        
        if (course.title.includes('Financial Literacy')) {
          modules = [
            { title: 'Introduction to Personal Finance', video_url: 'https://www.youtube.com/embed/4j2emMn7UuI', duration: 20 },
            { title: 'Budgeting Basics', video_url: 'https://www.youtube.com/embed/pCwLhz0ltlE', duration: 25 },
            { title: 'Saving Strategies', video_url: 'https://www.youtube.com/embed/gMbNxthEQEk', duration: 18 },
            { title: 'Understanding Credit and Debt', video_url: 'https://www.youtube.com/embed/RlPH-S6f5pI', duration: 22 },
            { title: 'Investment Fundamentals', video_url: 'https://www.youtube.com/embed/HQzoZfc3GwQ', duration: 30 }
          ];
        } else if (course.title.includes('Digital Marketing')) {
          modules = [
            { title: 'Marketing Fundamentals', video_url: 'https://www.youtube.com/embed/llKvV8_T95M', duration: 25 },
            { title: 'Social Media Strategy', video_url: 'https://www.youtube.com/embed/2QR3dvs5Mps', duration: 20 },
            { title: 'Content Creation', video_url: 'https://www.youtube.com/embed/kFMTec22JfQ', duration: 30 },
            { title: 'Online Advertising', video_url: 'https://www.youtube.com/embed/llKvV8_T95M', duration: 28 }
          ];
        } else if (course.title.includes('Introduction to Technology')) {
          modules = [
            { title: 'Computer Basics', video_url: 'https://www.youtube.com/embed/8Z3Y0sU1y1M', duration: 20 },
            { title: 'Internet Navigation', video_url: 'https://www.youtube.com/embed/YuZP1JmRzjI', duration: 18 },
            { title: 'Email Communication', video_url: 'https://www.youtube.com/embed/GtQdIYUtAHg', duration: 22 },
            { title: 'Online Safety', video_url: 'https://www.youtube.com/embed/UB1O30fR-EE', duration: 20 }
          ];
        } else if (course.title.includes('Leadership')) {
          modules = [
            { title: 'Leadership Fundamentals', video_url: 'https://www.youtube.com/embed/Np3GU7aS4nA', duration: 25 },
            { title: 'Public Speaking Skills', video_url: 'https://www.youtube.com/embed/zvR9sXKQeB0', duration: 30 },
            { title: 'Effective Communication', video_url: 'https://www.youtube.com/embed/HAnw168huqA', duration: 22 },
            { title: 'Team Management', video_url: 'https://www.youtube.com/embed/VzxfQlzzGJE', duration: 28 }
          ];
        } else if (course.title.includes('Entrepreneurship')) {
          modules = [
            { title: 'Business Idea Development', video_url: 'https://www.youtube.com/embed/0Ul4aUS1dxQ', duration: 25 },
            { title: 'Business Planning', video_url: 'https://www.youtube.com/embed/bNpx7gpSqbY', duration: 30 },
            { title: 'Funding Your Business', video_url: 'https://www.youtube.com/embed/kC5QlkiqTLM', duration: 28 },
            { title: 'Marketing Your Business', video_url: 'https://www.youtube.com/embed/llKvV8_T95M', duration: 25 }
          ];
        } else if (course.title.includes('Advanced Financial')) {
          modules = [
            { title: 'Investment Strategies', video_url: 'https://www.youtube.com/embed/HQzoZfc3GwQ', duration: 30 },
            { title: 'Retirement Planning', video_url: 'https://www.youtube.com/embed/WEDIj9JBTC8', duration: 25 },
            { title: 'Wealth Building', video_url: 'https://www.youtube.com/embed/4j2emMn7UuI', duration: 28 }
          ];
        }
        
        // Insert modules
        for (let i = 0; i < modules.length; i++) {
          const module = modules[i];
          await pool.query(
            `INSERT INTO modules (course_id, title, description, video_url, duration, order_index)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [courseId, module.title, `Learn about ${module.title.toLowerCase()}`, module.video_url, module.duration, i + 1]
          );
        }
      }
      
      console.log('Default courses and modules added successfully');

    console.log('Database tables created successfully');


  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
};

export default initDatabase;
