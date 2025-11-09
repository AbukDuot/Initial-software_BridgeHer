-- Complete Community Forum Database Schema
-- Run this if you need to recreate all community tables

-- 1. Community Topics Table (main table)
CREATE TABLE IF NOT EXISTS community_topics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    content TEXT,
    tags TEXT[],
    image_url TEXT,
    video_url TEXT,
    media_type VARCHAR(20) DEFAULT 'none',
    status VARCHAR(20) DEFAULT 'open',
    locked BOOLEAN DEFAULT false,
    pinned BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Topic Replies Table
CREATE TABLE IF NOT EXISTS topic_replies (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    media_type VARCHAR(20) DEFAULT 'none',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Topic Likes Table
CREATE TABLE IF NOT EXISTS topic_likes (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(topic_id, user_id)
);

-- 4. Reply Likes Table
CREATE TABLE IF NOT EXISTS reply_likes (
    id SERIAL PRIMARY KEY,
    reply_id INTEGER REFERENCES topic_replies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reply_id, user_id)
);

-- 5. Topic Bookmarks Table
CREATE TABLE IF NOT EXISTS topic_bookmarks (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES community_topics(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(topic_id, user_id)
);

-- 6. Content Reports Table
CREATE TABLE IF NOT EXISTS content_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL,
    content_id INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_topics_user_id ON community_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_community_topics_category ON community_topics(category);
CREATE INDEX IF NOT EXISTS idx_community_topics_created_at ON community_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topic_replies_topic_id ON topic_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_replies_user_id ON topic_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_likes_topic_id ON topic_likes(topic_id);
CREATE INDEX IF NOT EXISTS idx_reply_likes_reply_id ON reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_topic_bookmarks_user_id ON topic_bookmarks(user_id);
