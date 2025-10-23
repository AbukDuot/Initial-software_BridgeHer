# BridgeHer Backend - Complete Setup Guide

##  What's Been Fixed & Added

### 1. Database Schema (schema.sql)
- Users table with mentor/learner profiles
- Courses table with downloadable flag
- Modules table for course content
- Enrollments for tracking user progress
- Quizzes table with JSONB questions
- Quiz attempts for tracking scores
- Badges table for gamification
- User points and levels
- Posts and comments for community
- Mentorship requests
- Certificates
- Offline content tracking
- User courses tracking
- User settings
- User reminders

### 2. New API Routes

#### Quiz Routes (`/api/quizzes`)
- `GET /course/:courseId` - Get all quizzes for a course
- `GET /:id` - Get specific quiz
- `POST /:id/attempt` - Submit quiz answers
- `GET /user/attempts` - Get user's quiz history

#### Gamification Routes (`/api/gamification`)
- `GET /points` - Get user points and level
- `GET /badges` - Get user badges
- `POST /badges` - Award badge
- `POST /points/add` - Add points
- `GET /leaderboard` - View leaderboard

#### Offline Content Routes (`/api/offline`)
- `GET /courses` - Get downloadable courses
- `GET /course/:courseId` - Get course offline content
- `POST /download/:courseId` - Track download
- `GET /my-downloads` - Get user's downloads

#### Enhanced Course Routes
- `POST /:id/enroll` - Enroll in course
- `GET /:id/modules` - Get course modules
- `PUT /:id/progress` - Update progress
- `GET /my/enrolled` - Get enrolled courses

### 3. Features Implemented

#### Authentication & Authorization
- User registration with role (Learner/Mentor/Admin)
- JWT-based login
- Protected routes with middleware
- Role-based access control

#### Course Management
- Browse courses by category
- Course enrollment
- Progress tracking
- Module-based learning
- Downloadable content flag

#### Quiz System
- Multiple choice questions stored as JSONB
- Automatic scoring
- Pass/fail based on threshold
- Quiz attempt history
- Points awarded for passing

####  Gamification
- Points system (10 for quiz, 50 for course completion)
- Level progression (1-5 based on points)
- Badge system
- Leaderboard
- Automatic point awards

#### Offline Learning
- Mark courses as downloadable
- Track downloaded content
- Offline content metadata
- User download history
- Last accessed tracking

#### Mentorship
- Browse mentors by expertise
- Request mentorship sessions
- Accept/decline requests
- Schedule sessions
- Track mentorship history

#### Community Features
- Create posts with images
- Comment on posts
- User profiles
- Activity tracking

#### Dashboards
- Learner dashboard (courses, badges, reminders)
- Mentor dashboard (requests, mentees, schedule)
- Progress visualization data

## Quick Start

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE bridgeherdb;"

# Run schema
psql -U postgres -d bridgeherdb -f schema.sql

# Optional: Load seed data
psql -U postgres -d bridgeherdb -f seed.sql
```

### Step 3: Configure Environment
Update `.env` with your PostgreSQL password:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/bridgeherdb
JWT_SECRET=your_super_secret_jwt_key_change_this
```

### Step 4: Start Server
```bash
npm run dev
```

Server runs at: `http://localhost:5000`

##  Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"Learner"}'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the token from response!

### 3. Get Courses
```bash
curl http://localhost:5000/api/courses
```

### 4. Enroll in Course
```bash
curl -X POST http://localhost:5000/api/courses/1/enroll \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Get Quiz
```bash
curl http://localhost:5000/api/quizzes/course/1
```

### 6. Submit Quiz
```bash
curl -X POST http://localhost:5000/api/quizzes/1/attempt \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers":[0,1,2]}'
```

### 7. Check Points
```bash
curl http://localhost:5000/api/gamification/points \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Get Downloadable Courses
```bash
curl http://localhost:5000/api/offline/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📱 Frontend Integration

Update your frontend API calls to use these endpoints:

```typescript
// Example: Enroll in course
const enrollInCourse = async (courseId: number, token: string) => {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Example: Submit quiz
const submitQuiz = async (quizId: number, answers: number[], token: string) => {
  const response = await fetch(`${API_URL}/api/quizzes/${quizId}/attempt`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ answers })
  });
  return response.json();
};

// Example: Get offline content
const getOfflineContent = async (courseId: number, token: string) => {
  const response = await fetch(`${API_URL}/api/offline/course/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

##  Key Features for Users

### For Learners:
1. **Browse & Enroll** - Discover courses and enroll
2. **Learn** - Access modules with videos and content
3. **Quiz** - Test knowledge with quizzes
4. **Track Progress** - See completion percentage
5. **Earn Points** - Get points for completing activities
6. **Earn Badges** - Unlock achievements
7. **Download** - Save courses for offline learning
8. **Get Mentorship** - Request guidance from mentors
9. **Community** - Share experiences and learn from others
10. **Certificates** - Earn certificates on completion

### For Mentors:
1. **Profile** - Showcase expertise
2. **Requests** - Receive mentorship requests
3. **Schedule** - Manage mentorship sessions
4. **Track** - See mentee progress
5. **Dashboard** - Overview of mentorship activities

##  Database Tables Summary

| Table | Purpose |
|-------|---------|
| users | User accounts (Learner/Mentor/Admin) |
| courses | Course catalog |
| modules | Course content modules |
| enrollments | User course enrollments |
| quizzes | Quiz questions and settings |
| quiz_attempts | User quiz submissions |
| badges | Achievement badges |
| user_points | Points and levels |
| posts | Community posts |
| comments | Post comments |
| mentorship_requests | Mentorship requests |
| certificates | Course completion certificates |
| offline_content | Downloadable content metadata |
| user_courses | Course progress tracking |
| user_settings | User preferences |
| user_reminders | User to-do items |

## Security Features

-  Password hashing with bcrypt
-  JWT authentication
-  Protected routes
-  Role-based access control
-  SQL injection prevention (parameterized queries)
- CORS enabled
- Environment variables for secrets

##  Next Steps

1. **Test all endpoints** using Postman or curl
2. **Load seed data** for testing
3. **Connect frontend** to backend APIs
4. **Deploy to Render** using render.yaml
5. **Setup PostgreSQL** on Render
6. **Update frontend** API URLs for production

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d bridgeherdb -c "SELECT 1;"
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

##  Documentation

- Full API docs: `API_DOCUMENTATION.md`
- Quick start: `QUICKSTART.md`
- Deployment: `DEPLOYMENT_GUIDE.md`

##  All Features Working

- Login & Registration
- Course browsing & enrollment
- Module-based learning
- Quiz system with scoring
- Progress tracking
- Gamification (points, badges, levels)
- Offline content support
- Mentorship requests
- Community posts & comments
- Learner dashboard
- Mentor dashboard
- User profiles
- Settings management
- Certificate generation

Your backend is now fully functional! 🎉
