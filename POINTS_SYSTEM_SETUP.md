# Points and Streak System Setup

## What Was Added

1. **Points System** - Users earn points for activities:
   - Complete a module: +10 points
   - Complete a course: +50 points
   - Submit assignment: +15 points
   - Pass quiz: +20 points
   - Create topic: +5 points
   - Reply to post: +2 points
   - Get a like: +1 point
   - Earn badge: +20 points

2. **Level System** - Automatic level calculation based on points:
   - Level 1: 0-99 points
   - Level 2: 100-299 points
   - Level 3: 300-599 points
   - Level 4: 600-999 points
   - Level 5: 1000+ points

3. **Streak System** - Tracks consecutive days of activity:
   - Increments by 1 each day you complete an activity
   - Resets to 1 if you miss a day
   - Updates automatically when you complete modules, assignments, etc.

## Setup Instructions

### Step 1: Initialize the Database Table

**Option A: Using Postman or Browser**
1. Make sure you're logged in as any user
2. Send a POST request to: `https://bridgeher-backend.onrender.com/api/setup-points/initialize-points-table`
3. Include your auth token in the header

**Option B: Using psql (Render Dashboard)**
1. Go to Render Dashboard → Your PostgreSQL database
2. Click "Connect" → "External Connection" → Copy the PSQL Command
3. Run this SQL:
```sql
CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
```

### Step 2: Deploy Backend to Render

1. Commit and push changes:
```bash
cd c:\Users\HP\Initial-software_BridgeHer
git add .
git commit -m "Add functional points and streak system"
git push origin main
```

2. Go to Render Dashboard → Your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete

### Step 3: Test the System

1. Login to your app
2. Go to Learner Dashboard
3. Complete a module in any course
4. Refresh the dashboard
5. You should see:
   - XP Points increased by 10
   - Streak shows 1 (or increments if you did activity yesterday)
   - Level updates automatically based on total points

## How It Works

- **Automatic Tracking**: Every time you complete a module, the system automatically:
  1. Awards points
  2. Calculates your new level
  3. Updates your streak (if it's a new day)
  4. Stores everything in the database

- **Dashboard Display**: The Learner Dashboard fetches your current stats from the database and displays them in real-time

- **Persistent**: All data is stored in PostgreSQL, so your progress is saved permanently

## Files Modified

- `backend/utils/pointsSystem.js` - Core points logic
- `backend/routes/setupPoints.js` - Setup route
- `backend/routes/modules.js` - Module completion tracking
- `backend/server.js` - Added setup route
- `backend/migrations/create_user_points_table.sql` - Database schema

## Next Steps (Optional)

To add points for other activities, import the points system in other routes:

```javascript
import { addPoints, POINTS } from '../utils/pointsSystem.js';

// Example: Award points for creating a topic
await addPoints(userId, POINTS.TOPIC_CREATE, 'Topic created');
```
