-- Add missing column to user_badges table
ALTER TABLE user_badges 
ADD COLUMN IF NOT EXISTS badge_description TEXT;

-- Verify column added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_badges'
ORDER BY ordinal_position;
