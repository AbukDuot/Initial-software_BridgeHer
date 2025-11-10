-- Create community tables for localhost

CREATE TABLE IF NOT EXISTS community_topics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT,
  status VARCHAR(50) DEFAULT 'open',
  image_url TEXT,
  video_url TEXT,
  media_type VARCHAR(20),
  views INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  best_answer_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_replies (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_best_answer BOOLEAN DEFAULT FALSE,
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
  reply_id INTEGER REFERENCES community_replies(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reply_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_topics_user_id ON community_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_community_topics_category ON community_topics(category);
CREATE INDEX IF NOT EXISTS idx_community_replies_topic_id ON community_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_user_id ON community_replies(user_id);
