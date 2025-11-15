-- Add missing columns to community_topics table
ALTER TABLE community_topics 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_type VARCHAR(50);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'community_topics'
ORDER BY ordinal_position;
