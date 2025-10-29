# BridgeHer Course System Guide

## Overview
Complete course management system with video uploads, modules, assignments, offline learning, and progress tracking.

## Database Setup

### Migration (replaces old course tables):
```bash
psql -U postgres -d bridgeher_db -f backend/migrate-courses.sql
psql -U postgres -d bridgeher_db -f backend/seed-courses.sql
```

## Backend API Endpoints

### Modules
- `POST /api/modules` - Upload module with video (Admin/Mentor)
- `GET /api/modules/:id` - Get module details
- `PUT /api/modules/:id` - Update module (Admin/Mentor)
- `DELETE /api/modules/:id` - Delete module (Admin)
- `GET /api/modules/:id/stream` - Stream video
- `GET /api/modules/:id/download` - Download for offline
- `POST /api/modules/:id/progress` - Track progress
- `GET /api/modules/:id/progress` - Get user progress

### Assignments
- `POST /api/assignments` - Create assignment (Admin/Mentor)
- `GET /api/assignments/module/:moduleId` - Get module assignments
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/submit` - Submit assignment
- `GET /api/assignments/:id/submission` - Get user submission
- `GET /api/assignments/:id/submissions` - Get all submissions (Admin/Mentor)
- `PUT /api/assignments/submission/:id/grade` - Grade submission (Admin/Mentor)

## Frontend Components

### AdminCourseUpload
Location: `bridgeher-frontend/src/pages/AdminCourseUpload.tsx`
- Upload courses with multiple modules
- Direct video file upload (up to 500MB per video)
- Add text content for offline learning

### CoursePlayer
Location: `bridgeher-frontend/src/pages/CoursePlayer.tsx`
- Stream videos directly
- Download modules for offline
- Track progress automatically
- Submit assignments with files
- Resume from last position

## Usage

### For Admins/Mentors:
1. Navigate to Admin Course Upload page
2. Fill course details (title, description, category, level)
3. Add modules one by one with video uploads
4. Click "Upload Course"
5. Create assignments for each module

### For Learners:
1. Browse courses on Courses page
2. Click "View Course" to open Course Player
3. Watch videos (streams directly, no embedding)
4. Download modules for offline learning
5. Complete assignments and submit
6. Track progress automatically

## Offline Learning
- Videos and content downloadable per module
- Stored in browser localStorage
- Works without internet connection
- Syncs progress when back online

## File Storage
- Videos: `backend/uploads/videos/`
- Assignments: `backend/uploads/assignments/`
- Max video size: 500MB
- Supported formats: mp4, webm, mov, avi

## Key Features
✅ Real video uploads (not embedded)
✅ Direct video streaming with resume capability
✅ Offline learning support
✅ Full module system with text content
✅ Assignment submission with file uploads
✅ Progress tracking per module
✅ Admin grading system
✅ Mobile responsive
