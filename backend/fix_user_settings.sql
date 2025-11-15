-- Fix user_settings table to add missing columns
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'light',
  font_size VARCHAR(20) DEFAULT 'medium',
  accent_color VARCHAR(20) DEFAULT '#6A1B9A',
  account_privacy VARCHAR(20) DEFAULT 'public',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='language') THEN
    ALTER TABLE user_settings ADD COLUMN language VARCHAR(10) DEFAULT 'en';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='theme') THEN
    ALTER TABLE user_settings ADD COLUMN theme VARCHAR(20) DEFAULT 'light';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='font_size') THEN
    ALTER TABLE user_settings ADD COLUMN font_size VARCHAR(20) DEFAULT 'medium';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='accent_color') THEN
    ALTER TABLE user_settings ADD COLUMN accent_color VARCHAR(20) DEFAULT '#6A1B9A';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='account_privacy') THEN
    ALTER TABLE user_settings ADD COLUMN account_privacy VARCHAR(20) DEFAULT 'public';
  END IF;
END $$;
