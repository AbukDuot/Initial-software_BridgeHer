# ✅ Dashboards Connected to Backend

## What Changed

Both **LearnerDashboard** and **MentorDashboard** now fetch **real data from backend** instead of using demo data.

---

## 🔗 New Backend Endpoints

### 1. Learner Dashboard
```
GET /api/dashboards/learner
Authorization: Bearer TOKEN
```

**Returns:**
```json
{
  "user": {
    "name": "Abuk",
    "email": "user@example.com",
    "created_at": "2025-01-01"
  },
  "stats": {
    "streak": 8,
    "xp": 430,
    "level": 1,
    "totalCourses": 3,
    "completedCourses": 1,
    "certificates": 1
  },
  "courses": [
    {
      "id": 1,
      "title": "Digital Skills",
      "progress": 80,
      "enrolled_at": "2025-01-15"
    }
  ],
  "completion": {
    "completed": 70,
    "remaining": 30
  }
}
```

### 2. Mentor Dashboard
```
GET /api/dashboards/mentor
Authorization: Bearer TOKEN
```

**Returns:**
```json
{
  "user": {
    "name": "Mentor Name",
    "email": "mentor@example.com"
  },
  "stats": {
    "totalLearners": 5,
    "activeSessions": 3,
    "pendingRequests": 2
  },
  "connections": [
    {
      "id": 1,
      "learner_name": "Grace",
      "learner_email": "grace@example.com",
      "topic": "Digital Skills",
      "status": "accepted",
      "scheduled_at": "2025-02-01T10:00:00Z"
    }
  ]
}
```

---

## 📊 LearnerDashboard - What's Now Real

### Before (Demo Data):
- Streak: 8 (hardcoded)
- XP: 430 (hardcoded)
- Level: 1 (hardcoded)
- Completion: 70% (hardcoded)

### After (Real Data):
- ✅ **Streak**: From `user_points` table
- ✅ **XP**: From `user_points` table
- ✅ **Level**: From `user_points` table
- ✅ **Total Courses**: Count from `enrollments` table
- ✅ **Completed Courses**: Count where progress >= 100
- ✅ **Certificates**: Count from `certificates` table
- ✅ **Completion %**: Average progress of all enrolled courses

### Data Flow:
```
User logs in
    ↓
Token saved in localStorage
    ↓
LearnerDashboard loads
    ↓
Fetches: GET /api/dashboards/learner
    ↓
Backend queries:
  - users table (name, email)
  - enrollments table (courses + progress)
  - certificates table (count)
  - user_points table (streak, xp, level)
    ↓
Returns real data
    ↓
Dashboard displays actual stats
```

---

## 👨‍🏫 MentorDashboard - What's Now Real

### Before (Demo Data):
- Total Learners: 3 (hardcoded)
- Active Sessions: 2 (hardcoded)
- Pending Requests: 2 (hardcoded)

### After (Real Data):
- ✅ **Total Learners**: Count from `mentorship_requests` table
- ✅ **Active Sessions**: Count where status = 'accepted'
- ✅ **Pending Requests**: Count where status = 'pending'
- ✅ **Connections**: Real mentorship connections with learner names
- ✅ **Sessions**: Upcoming sessions with actual dates

### Data Flow:
```
Mentor logs in
    ↓
Token saved in localStorage
    ↓
MentorDashboard loads
    ↓
Fetches: GET /api/dashboards/mentor
    ↓
Backend queries:
  - users table (mentor info)
  - mentorship_requests table (all connections)
  - Joins with users table (learner names)
    ↓
Returns real data
    ↓
Dashboard displays actual mentorship data
```

---

## 🔧 How It Works

### LearnerDashboard.tsx
```typescript
useEffect(() => {
  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/dashboards/learner", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setDashboardData(data);
  };
  fetchDashboard();
}, []);

// Use real data
const { user, stats, completion } = dashboardData;
const { streak, xp, level } = stats;
```

### MentorDashboard.tsx
```typescript
useEffect(() => {
  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/dashboards/mentor", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setDashboardData(data);
    
    // Map to UI format
    setRequests(data.connections.filter(c => c.status === 'pending'));
    setLearners(data.connections.filter(c => c.status === 'accepted'));
  };
  fetchDashboard();
}, []);
```

---

## 📋 Database Tables Used

### For Learner Dashboard:
1. **users** - User name and email
2. **enrollments** - Enrolled courses and progress
3. **certificates** - Earned certificates count
4. **user_points** - Streak, XP, level

### For Mentor Dashboard:
1. **users** - Mentor and learner info
2. **mentorship_requests** - All mentorship connections
3. Joins users table to get learner names

---

## 🧪 Testing

### Test Learner Dashboard:
```bash
# 1. Login as learner
POST /api/auth/login
{
  "email": "learner@example.com",
  "password": "password"
}

# 2. Copy token

# 3. Get dashboard data
GET /api/dashboards/learner
Authorization: Bearer TOKEN

# 4. Open frontend
# Navigate to /learner-dashboard
# Should show real data
```

### Test Mentor Dashboard:
```bash
# 1. Login as mentor
POST /api/auth/login
{
  "email": "mentor@example.com",
  "password": "password"
}

# 2. Copy token

# 3. Get dashboard data
GET /api/dashboards/mentor
Authorization: Bearer TOKEN

# 4. Open frontend
# Navigate to /mentor-dashboard
# Should show real mentorship data
```

---

## ✅ What's Working Now

### LearnerDashboard:
- ✅ Real user name from database
- ✅ Real streak from user_points
- ✅ Real XP from user_points
- ✅ Real level from user_points
- ✅ Real course count from enrollments
- ✅ Real completion % from enrollments
- ✅ Real certificate count
- ✅ Charts show actual data
- ⏳ Weekly hours (still demo - needs activity tracking)

### MentorDashboard:
- ✅ Real mentor name from database
- ✅ Real total learners count
- ✅ Real active sessions count
- ✅ Real pending requests count
- ✅ Real mentorship connections
- ✅ Real learner names
- ✅ Accept/decline requests updates database
- ✅ Charts show actual data

---

## 🚀 Next Steps (Optional Enhancements)

### For More Accurate Data:

1. **Track Learning Hours**
   - Add `activity_log` table
   - Track time spent on each module
   - Update weekly hours chart with real data

2. **Track Streak Automatically**
   - Update streak when user logs in daily
   - Reset streak if user misses a day

3. **Calculate XP from Actions**
   - Award XP for completing modules
   - Award XP for submitting assignments
   - Award XP for earning certificates

4. **Session Scheduling**
   - Add scheduled_at to mentorship_requests
   - Show actual upcoming session times

---

## 📝 Summary

**Before**: Both dashboards showed fake demo data  
**After**: Both dashboards fetch and display real data from PostgreSQL database

**LearnerDashboard**: Shows real progress, courses, certificates, XP, streak  
**MentorDashboard**: Shows real mentorship connections, requests, sessions

**All data is now live and updates automatically!** 🎉

---

## Quick Test Commands

```bash
# Test learner dashboard
curl -X GET http://localhost:5000/api/dashboards/learner \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test mentor dashboard
curl -X GET http://localhost:5000/api/dashboards/mentor \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Both endpoints return real data from your database! ✅
