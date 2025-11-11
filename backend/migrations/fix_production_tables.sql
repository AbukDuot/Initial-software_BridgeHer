-- Fix production database tables
-- Run this on your Render PostgreSQL database

-- 1. Add missing columns to mentorship_requests
ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS topic VARCHAR(255);
ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Create course_recommendations table
CREATE TABLE IF NOT EXISTS course_recommendations (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  recommended_course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  similarity_score DECIMAL(3,2) DEFAULT 0.50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, recommended_course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_recommendations_course_id ON course_recommendations(course_id);
CREATE INDEX IF NOT EXISTS idx_course_recommendations_recommended_id ON course_recommendations(recommended_course_id);

-- Verify changes
SELECT 'mentorship_requests columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mentorship_requests' ORDER BY ordinal_position;

SELECT 'course_recommendations table exists:' as info;
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_recommendations');
