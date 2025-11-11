# Production Database Fix for Render

## Problem
Your production database on Render is missing:
1. `topic` and `updated_at` columns in `mentorship_requests` table
2. `course_recommendations` table

## Quick Fix - Option 1: Using Render Shell

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **PostgreSQL database** (not the web service)
3. Click **"Connect"** → **"External Connection"**
4. Copy the **External Database URL**
5. Use a PostgreSQL client (like pgAdmin, DBeaver, or psql) to connect
6. Run this SQL:

```sql
-- Add missing columns to mentorship_requests
ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS topic VARCHAR(255);
ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create course_recommendations table
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
```

## Quick Fix - Option 2: Using psql Command Line

If you have `psql` installed:

```bash
# Use the External Database URL from Render
psql "postgresql://user:password@host/database?sslmode=require"

# Then paste the SQL commands above
```

## Quick Fix - Option 3: Deploy with Auto-Migration

The updated `initDb.js` will automatically create missing tables on next deployment:

1. Commit your changes:
```bash
git add .
git commit -m "Fix: Add missing database tables and columns"
git push
```

2. Render will auto-deploy and run the initialization
3. The missing tables/columns will be created automatically

## Verify the Fix

After running the migration, test:
1. Mentorship request should work without "topic" column error
2. Course recommendations should work without table error

## Files Updated
- ✅ `backend/config/initDb.js` - Added course_recommendations table
- ✅ `backend/migrations/fix_production_tables.sql` - Migration script
- ✅ `backend/migrations/fix_mentorship_requests.sql` - Mentorship fix
