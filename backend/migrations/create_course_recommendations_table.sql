-- Create course_recommendations table
CREATE TABLE IF NOT EXISTS course_recommendations (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  recommended_course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  similarity_score DECIMAL(3,2) DEFAULT 0.50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, recommended_course_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_recommendations_course_id ON course_recommendations(course_id);
CREATE INDEX IF NOT EXISTS idx_course_recommendations_recommended_id ON course_recommendations(recommended_course_id);

COMMIT;
