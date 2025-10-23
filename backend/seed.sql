INSERT INTO users (name, email, password, role, bio, expertise) VALUES
('Admin User', 'admin@bridgeher.com', '$2a$10$YourHashedPasswordHere', 'Admin', 'Platform administrator', 'Platform Management'),
('Priscilla Ayuen', 'priscilla@bridgeher.com', '$2a$10$YourHashedPasswordHere', 'Mentor', 'Startup expert and digital skills trainer', 'Entrepreneurship, Digital Skills'),
('Aguil Ajang', 'aguil@bridgeher.com', '$2a$10$YourHashedPasswordHere', 'Mentor', 'Financial literacy and business planning expert', 'Finance, Business Planning'),
('Abuk Learner', 'abuk@bridgeher.com', '$2a$10$YourHashedPasswordHere', 'Learner', 'Aspiring entrepreneur', NULL);


INSERT INTO courses (title, description, category, level, duration, mentor, downloadable) VALUES
('Financial Literacy Basics', 'Learn budgeting, saving, and managing personal finances', 'Finance', 'Beginner', '4 weeks', 'Aguil Ajang', true),
('Entrepreneurship 101', 'Turn your ideas into businesses with practical steps', 'Business', 'Beginner', '6 weeks', 'Priscilla Ayuen', true),
('Digital Skills for Beginners', 'Master internet basics and productivity tools', 'Technology', 'Beginner', '3 weeks', 'Priscilla Ayuen', true),
('Advanced Business Planning', 'Create comprehensive business plans and strategies', 'Business', 'Advanced', '8 weeks', 'Aguil Ajang', true);


INSERT INTO modules (course_id, title, description, video_url, content, order_index, duration) VALUES
(1, 'Introduction to Budgeting', 'Learn the basics of creating a personal budget', 'https://example.com/video1.mp4', 'Budgeting is the foundation of financial health...', 1, 30),
(1, 'Saving Strategies', 'Effective ways to save money', 'https://example.com/video2.mp4', 'Learn different saving techniques...', 2, 25),
(1, 'Managing Debt', 'How to handle and reduce debt', 'https://example.com/video3.mp4', 'Understanding debt management...', 3, 35),
(1, 'Building Emergency Fund', 'Create your financial safety net', 'https://example.com/video4.mp4', 'Emergency funds are crucial...', 4, 20);


INSERT INTO modules (course_id, title, description, video_url, content, order_index, duration) VALUES
(2, 'Finding Your Business Idea', 'Identify opportunities in your community', 'https://example.com/video5.mp4', 'Every business starts with an idea...', 1, 40),
(2, 'Market Research Basics', 'Understanding your customers', 'https://example.com/video6.mp4', 'Know your market before launching...', 2, 35),
(2, 'Creating a Business Plan', 'Structure your business strategy', 'https://example.com/video7.mp4', 'A solid plan is your roadmap...', 3, 45),
(2, 'Funding Your Startup', 'Finding capital for your business', 'https://example.com/video8.mp4', 'Explore funding options...', 4, 30);


INSERT INTO quizzes (course_id, module_id, title, questions, passing_score) VALUES
(1, 1, 'Budgeting Basics Quiz', '[
  {
    "question": "What is the 50/30/20 budgeting rule?",
    "options": ["50% needs, 30% wants, 20% savings", "50% savings, 30% needs, 20% wants", "50% wants, 30% savings, 20% needs", "Equal distribution"],
    "correctAnswer": 0
  },
  {
    "question": "Which expense is considered a need?",
    "options": ["Entertainment", "Rent", "Dining out", "Vacation"],
    "correctAnswer": 1
  },
  {
    "question": "How often should you review your budget?",
    "options": ["Never", "Once a year", "Monthly", "Every 5 years"],
    "correctAnswer": 2
  }
]'::jsonb, 70),
(2, 1, 'Business Ideas Quiz', '[
  {
    "question": "What is the first step in starting a business?",
    "options": ["Get funding", "Identify a problem to solve", "Hire employees", "Buy equipment"],
    "correctAnswer": 1
  },
  {
    "question": "What makes a good business idea?",
    "options": ["It solves a real problem", "It is expensive", "It requires no work", "It has no competition"],
    "correctAnswer": 0
  }
]'::jsonb, 70);


INSERT INTO enrollments (user_id, course_id, progress, completed_modules) VALUES
(4, 1, 50, 2),
(4, 2, 25, 1);


INSERT INTO mentorship_requests (requester_id, mentor_id, topic, message, status) VALUES
(4, 2, 'Starting my first business', 'I need guidance on launching my small business', 'pending'),
(4, 3, 'Personal finance advice', 'Help with creating a budget', 'accepted');


INSERT INTO posts (user_id, content) VALUES
(4, 'Just completed my first course on financial literacy! Feeling empowered! 💪'),
(2, 'Excited to mentor more women entrepreneurs. Let''s build together! 🚀');


INSERT INTO comments (post_id, user_id, content) VALUES
(1, 2, 'Congratulations! Keep up the great work!'),
(1, 3, 'That''s amazing! Financial literacy is so important.');


INSERT INTO badges (user_id, name, description, icon) VALUES
(4, 'First Course', 'Completed your first course', '🎓'),
(4, 'Quick Learner', 'Completed a course in under 2 weeks', '⚡');


INSERT INTO user_points (user_id, total_points, level) VALUES
(4, 150, 2),
(2, 500, 4),
(3, 350, 3);

INSERT INTO offline_content (course_id, module_id, content_type, file_path, file_size) VALUES
(1, 1, 'pdf', '/offline/course1/module1.pdf', 2048576),
(1, 2, 'pdf', '/offline/course1/module2.pdf', 1536000),
(2, 1, 'pdf', '/offline/course2/module1.pdf', 3072000);


INSERT INTO user_courses (user_id, course_id, completed, progress) VALUES
(4, 1, false, 50),
(4, 2, false, 25);


INSERT INTO certificates (user_id, course_id, score) VALUES
(2, 1, 95),
(3, 2, 88);
