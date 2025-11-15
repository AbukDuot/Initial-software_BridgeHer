-- Create topic_reactions table
CREATE TABLE IF NOT EXISTS topic_reactions (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(topic_id, user_id, emoji)
);

-- Create reply_reactions table
CREATE TABLE IF NOT EXISTS reply_reactions (
  id SERIAL PRIMARY KEY,
  reply_id INTEGER REFERENCES topic_replies(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reply_id, user_id, emoji)
);

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('topic_reactions', 'reply_reactions');
