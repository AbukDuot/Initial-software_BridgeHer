# BridgeHer Testing Guide

## Quick Start Testing (5 Minutes)

### Prerequisites
1. Backend running: `cd backend && npm run dev`
2. Database running: PostgreSQL on localhost:5432
3. Frontend running: `cd bridgeher-frontend && npm start`

---

## Test 1: SMS Notifications ✅

**What it does**: Sends SMS via Twilio when users register, complete courses, or get mentorship

**How to test**:
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123",
  "role": "Learner",
  "contact": "+250789101234"
}
```

**Expected**: SMS sent to phone number with welcome message

**Check**: 
- Console log: "Welcome SMS sent to: +250789101234"
- Phone receives SMS

---

## Test 2: Video Storage (Cloudinary) ✅

**What it does**: Uploads videos to Cloudinary cloud storage

**How to test**:
1. Login as Admin
2. Use AdminCourseUpload page OR API:

```http
POST http://localhost:5000/api/modules
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

course_id=1
title=Test Module
video=[SELECT VIDEO FILE]
```

**Expected**: Video uploaded to Cloudinary (cloud_name: dizhk3uqb)

**Check**:
- Response contains `video_url` with Cloudinary URL
- Video accessible via URL

---

## Test 3: Course Management ✅

**What it does**: Admin creates/manages courses, learners enroll

**How to test**:

**Create Course (Admin)**:
```http
POST http://localhost:5000/api/courses
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "title": "Test Course",
  "description": "Test Description",
  "category": "Technology",
  "level": "Beginner"
}
```

**Enroll in Course (Learner)**:
```http
POST http://localhost:5000/api/courses/1/enroll
Authorization: Bearer LEARNER_TOKEN
```

**Expected**: 
- Course created with ID
- Enrollment successful
- Email notification sent

---

## Test 4: Module Upload with Videos & PDFs ✅

**What it does**: Upload course modules with video and PDF materials

**How to test**:
```http
POST http://localhost:5000/api/modules
Authorization: Bearer ADMIN_TOKEN
Content-Type: multipart/form-data

course_id=1
title=Introduction
description=Module 1
video=[VIDEO FILE]
pdf=[PDF FILE]
```

**Expected**:
- Module created
- Video uploaded to Cloudinary
- PDF uploaded to Cloudinary
- Both URLs returned in response

---

## Test 5: Assignments & Assessments ✅

**What it does**: Admin creates assignments, learners submit, admin grades

**How to test**:

**Step 1 - Create Assignment (Admin)**:
```http
POST http://localhost:5000/api/assignments
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "module_id": 1,
  "title": "Test Assignment",
  "description": "Complete this task",
  "due_date": "2025-03-01",
  "max_score": 100
}
```

**Step 2 - Submit Assignment (Learner)**:
```http
POST http://localhost:5000/api/assignments/1/submit
Authorization: Bearer LEARNER_TOKEN
Content-Type: multipart/form-data

content=My submission text
file=[PDF FILE]
```

**Step 3 - Grade Assignment (Admin)**:
```http
PUT http://localhost:5000/api/assignments/submission/1/grade
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "score": 85,
  "feedback": "Great work!"
}
```

**Expected**:
- Assignment created
- Submission saved with file
- Email sent on submission
- Grade updated
- Email sent on grading

---

## Test 6: Progress Tracking ✅

**What it does**: Tracks learner progress through courses

**How to test**:

**Update Progress**:
```http
PUT http://localhost:5000/api/courses/1/progress
Authorization: Bearer LEARNER_TOKEN
Content-Type: application/json

{
  "progress": 50,
  "completedModules": [1, 2]
}
```

**Check Progress**:
```http
GET http://localhost:5000/api/courses/my/enrolled
Authorization: Bearer LEARNER_TOKEN
```

**Expected**:
- Progress updated to 50%
- Completed modules tracked
- Response shows progress in enrolled courses

---

## Test 7: Mentorship System ✅

**What it does**: Learners request mentors, admins assign mentors

**How to test**:

**Request Mentor (Learner)**:
```http
POST http://localhost:5000/api/mentorship
Authorization: Bearer LEARNER_TOKEN
Content-Type: application/json

{
  "mentor_id": 3,
  "topic": "Career Guidance",
  "message": "Need help with career planning"
}
```

**Assign Mentor (Admin)**:
```http
POST http://localhost:5000/api/admin/mentorship/assign
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "learner_id": 2,
  "mentor_id": 3,
  "topic": "Digital Skills",
  "message": "Assigned for digital skills training"
}
```

**Expected**:
- Mentorship request created
- Email notification sent
- SMS notification sent (if phone provided)

---

## Test 8: Offline Learning ✅

**What it does**: Download courses for offline access

**How to test**:

**Get Downloadable Course**:
```http
GET http://localhost:5000/api/offline/course/1
Authorization: Bearer LEARNER_TOKEN
```

**Track Download**:
```http
POST http://localhost:5000/api/offline/download/1
Authorization: Bearer LEARNER_TOKEN
```

**View My Downloads**:
```http
GET http://localhost:5000/api/offline/my-downloads
Authorization: Bearer LEARNER_TOKEN
```

**Expected**:
- Course data with modules returned
- Download tracked in database
- My downloads list shows course

---

## Test 9: Certificates ✅

**What it does**: Auto-generate certificate when course reaches 100% completion

**How to test**:

**Step 1 - Complete Course**:
```http
PUT http://localhost:5000/api/courses/1/progress
Authorization: Bearer LEARNER_TOKEN
Content-Type: application/json

{
  "progress": 100,
  "completedModules": [1, 2, 3, 4]
}
```

**Step 2 - View Certificates**:
```http
GET http://localhost:5000/api/courses/my/certificates
Authorization: Bearer LEARNER_TOKEN
```

**Step 3 - Get Specific Certificate**:
```http
GET http://localhost:5000/api/courses/certificate/1
Authorization: Bearer LEARNER_TOKEN
```

**Expected**:
- Certificate auto-created when progress = 100%
- Email notification sent
- SMS notification sent (if phone provided)
- 50 points added to gamification
- Certificate details returned

---

## Complete Test Flow (End-to-End)

### 1. Register User
```http
POST /api/auth/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Jane123",
  "role": "Learner",
  "contact": "+250789101234"
}
```
✅ SMS welcome message sent

### 2. Login
```http
POST /api/auth/login
{
  "email": "jane@example.com",
  "password": "Jane123"
}
```
✅ JWT token returned

### 3. Enroll in Course
```http
POST /api/courses/1/enroll
Authorization: Bearer TOKEN
```
✅ Email notification sent

### 4. View Course Modules
```http
GET /api/courses/1/modules
```
✅ Modules with videos/PDFs listed

### 5. Submit Assignment
```http
POST /api/assignments/1/submit
Authorization: Bearer TOKEN
Content: "My submission"
```
✅ Email notification sent

### 6. Update Progress
```http
PUT /api/courses/1/progress
Authorization: Bearer TOKEN
{
  "progress": 100,
  "completedModules": [1, 2, 3]
}
```
✅ Certificate auto-generated
✅ Email + SMS sent
✅ 50 points added

### 7. View Certificate
```http
GET /api/courses/my/certificates
Authorization: Bearer TOKEN
```
✅ Certificate details returned

---

## Troubleshooting

### SMS Not Sending
- Check `.env` has correct Twilio credentials
- Verify phone number format: +250789101234
- Check Twilio trial account has verified numbers

### Email Not Sending
- Check `.env` has Gmail credentials
- Verify app password (not regular password)
- Check Gmail "Less secure apps" or use App Password

### Video Upload Failing
- Check Cloudinary credentials in `.env`
- Verify file size < 100MB
- Check file format (mp4, avi, mov)

### Certificate Not Generated
- Ensure progress = 100 (not 99)
- Check enrollments table has record
- Verify certificates table exists

---

## Environment Variables Checklist

```env
# Database
DATABASE_URL=postgresql://postgres:Harobed2023@localhost:5432/bridgeherdb

# JWT
JWT_SECRET=your_secret_key

# Email (Gmail)
EMAIL_USER=abukdeborah9@gmail.com
EMAIL_PASSWORD=ewxsrnhbdmxndead

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACd877ab2e1d143f193a6d4bb341630a63
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary
CLOUDINARY_CLOUD_NAME=dizhk3uqb
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Success Indicators

✅ **SMS Working**: Console shows "SMS sent to: +250..."
✅ **Email Working**: Console shows "Email sent to: user@example.com"
✅ **Cloudinary Working**: Video URL contains "cloudinary.com"
✅ **Certificates Working**: Certificate auto-created at 100% progress
✅ **Progress Working**: Enrolled courses show progress percentage
✅ **Assignments Working**: Submissions saved with files
✅ **Mentorship Working**: Connections created in database
✅ **Offline Working**: Downloads tracked in user_courses table

---

## All Features Ready! 🎉

All 9 features are implemented and tested. Use `api-test.http` for quick testing.
