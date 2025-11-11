# Database Migrations

## Fix Mentorship Requests Table

### Problem
The `mentorship_requests` table is missing the `topic` and `updated_at` columns, causing errors when creating mentorship requests.

### Solution

Run the migration to add the missing columns:

```bash
cd backend
node migrations/run-migration.js
```

### Manual Fix (Alternative)

If you prefer to run the SQL directly, connect to your database and execute:

```sql
-- Add topic column if missing
ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS topic VARCHAR(255);

-- Add updated_at column if missing
ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### For Production (Render)

1. Go to your Render Dashboard
2. Select your PostgreSQL database
3. Click "Connect" → "External Connection"
4. Use the connection string to connect via psql or a database client
5. Run the SQL commands above

OR

1. Go to Render Dashboard → Your Web Service
2. Click "Shell" tab
3. Run: `node migrations/run-migration.js`

### Verify the Fix

After running the migration, test the mentorship request feature:
1. Log in as a learner
2. Navigate to the Mentorship page
3. Click "Request Mentorship" on a mentor's profile
4. Fill in the form and submit
5. The request should be created successfully without errors
