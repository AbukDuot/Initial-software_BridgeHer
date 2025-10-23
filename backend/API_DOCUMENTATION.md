# BridgeHer API Documentation

Base URL: `http://localhost:5000` (Development) | `https://bridgeher-backend.onrender.com` (Production)

## Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Abuk Mayen",
  "email": "abuk@example.com",
  "password": "password123",
  "role": "Learner"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "abuk@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Abuk Mayen",
    "email": "abuk@example.com",
    "role": "Learner"
  }
}
```

## Courses

### Get All Courses
```http
GET /api/courses?category=Finance&q=budget
```

### Get Course by ID
```http
GET /api/courses/:id
```

### Get Course Modules
```http
GET /api/courses/:id/modules
```

### Enroll in Course (Protected)
```http
POST /api/courses/:id/enroll
Authorization: Bearer {token}
```

### Update Course Progress (Protected)
```http
PUT /api/courses/:id/progress
Authorization: Bearer {token}
Content-Type: application/json

{
  "progress": 75,
  "completedModules": 3
}
```

### Get My Enrolled Courses (Protected)
```http
GET /api/courses/my/enrolled
Authorization: Bearer {token}
```

### Create Course (Admin/Mentor)
```http
POST /api/courses
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Financial Literacy",
  "description": "Learn budgeting basics",
  "category": "Finance",
  "level": "Beginner",
  "duration": "4 weeks",
  "mentor": "Aguil Ajang",
  "image": [file]
}
```

## Quizzes

### Get Quizzes for Course
```http
GET /api/quizzes/course/:courseId
```

### Get Quiz by ID
```http
GET /api/quizzes/:id
```

### Submit Quiz Attempt (Protected)
```http
POST /api/quizzes/:id/attempt
Authorization: Bearer {token}
Content-Type: application/json

{
  "answers": [0, 2, 1, 3]
}
```

Response:
```json
{
  "id": 1,
  "user_id": 1,
  "quiz_id": 1,
  "score": 75,
  "passed": true,
  "totalQuestions": 4,
  "correctAnswers": 3
}
```

### Get My Quiz Attempts (Protected)
```http
GET /api/quizzes/user/attempts
Authorization: Bearer {token}
```

## Gamification

### Get My Points (Protected)
```http
GET /api/gamification/points
Authorization: Bearer {token}
```

Response:
```json
{
  "user_id": 1,
  "total_points": 150,
  "level": 2
}
```

### Get My Badges (Protected)
```http
GET /api/gamification/badges
Authorization: Bearer {token}
```

### Add Points (Protected)
```http
POST /api/gamification/points/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "points": 10
}
```

### Get Leaderboard
```http
GET /api/gamification/leaderboard
```

## Offline Content

### Get Downloadable Courses (Protected)
```http
GET /api/offline/courses
Authorization: Bearer {token}
```

### Get Course Offline Content (Protected)
```http
GET /api/offline/course/:courseId
Authorization: Bearer {token}
```

Response:
```json
{
  "course": {...},
  "modules": [...],
  "offlineContent": [...]
}
```

### Track Download (Protected)
```http
POST /api/offline/download/:courseId
Authorization: Bearer {token}
```

### Get My Downloads (Protected)
```http
GET /api/offline/my-downloads
Authorization: Bearer {token}
```

## Mentorship

### Get All Mentors
```http
GET /api/mentors?expertise=Finance
```

### Get Mentor by ID
```http
GET /api/mentors/:id
```

### Create Mentorship Request (Protected)
```http
POST /api/requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "mentor_id": 3,
  "topic": "Career guidance",
  "message": "I need help with my career path"
}
```

### Get My Requests (Protected)
```http
GET /api/requests?requesterId={userId}
Authorization: Bearer {token}
```

### Respond to Request (Mentor)
```http
POST /api/requests/:id/respond
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "accept",
  "scheduled_at": "2025-02-15T10:00:00Z"
}
```

## Community

### Get All Posts
```http
GET /api/community/posts?q=finance&limit=20
```

### Get Post by ID
```http
GET /api/community/posts/:id
```

### Create Post (Protected)
```http
POST /api/community/posts
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "content": "Great learning experience!",
  "image": [file]
}
```

### Add Comment (Protected)
```http
POST /api/community/posts/:id/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "I agree!"
}
```

## Dashboards

### Learner Dashboard (Protected)
```http
GET /api/dashboards/learner
Authorization: Bearer {token}
```

Response:
```json
{
  "coursesCompleted": 3,
  "badgesCount": 5,
  "postsCount": 2,
  "upcomingMentorships": [...],
  "reminders": [...]
}
```

### Mentor Dashboard (Protected)
```http
GET /api/dashboards/mentor
Authorization: Bearer {token}
```

Response:
```json
{
  "assignedSummary": [...],
  "upcoming": [...],
  "menteesCount": 10
}
```

## User Management

### Get Current User (Protected)
```http
GET /api/users/me
Authorization: Bearer {token}
```

### Update Profile (Protected)
```http
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

### Change Password (Protected)
```http
PUT /api/users/me/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

### Upload Avatar (Protected)
```http
POST /api/users/me/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "avatar": [file]
}
```

## Settings

### Get My Settings (Protected)
```http
GET /api/settings
Authorization: Bearer {token}
```

### Update Settings (Protected)
```http
PUT /api/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "settings": {
    "language": "ar",
    "notifications": true,
    "theme": "dark"
  }
}
```

## Error Responses

All endpoints may return these error responses:

```json
{
  "error": "Error message here"
}
```

Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Points System

- Complete Quiz (Pass): +10 points
- Complete Course: +50 points
- Create Post: +5 points
- Receive Badge: +20 points

## Levels

- Level 1: 0-99 points
- Level 2: 100-249 points
- Level 3: 250-499 points
- Level 4: 500-999 points
- Level 5: 1000+ points
