-- Fix mentorship_requests table structure
-- Add missing columns if they don't exist

-- Add topic column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mentorship_requests' AND column_name = 'topic'
  ) THEN
    ALTER TABLE mentorship_requests ADD COLUMN topic VARCHAR(255);
  END IF;
END $$;

-- Add updated_at column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mentorship_requests' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE mentorship_requests ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'mentorship_requests'
ORDER BY ordinal_position;
