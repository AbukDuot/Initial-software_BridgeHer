# BridgeHer Course System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Course Data](#course-data)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [User Workflows](#user-workflows)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

### Architecture
```
Frontend (React + TypeScript)
    ↓
API Layer (Express.js)
    ↓
Database (PostgreSQL)
    ↓
External Services (Cloudinary for videos)
```

### Key Features
- **Course Browsing**: Filter by category, level, search
- **Course Preview**: View course details before enrolling
- **Enrollment**: One-click enrollment with email/SMS notifications
- **Progress Tracking**: Track module completion and course progress
- **Quizzes**: Test knowledge after each module
- **Certificates**: Earn certificates upon course completion
- **Offline Mode**: Download courses for offline learning
- **Multilingual**: Full English and Arabic support

---

## Database Schema

### Courses Table
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  category VARCHAR(100),           -- Finance, Business, Technology, Leadership
  level VARCHAR(50),                -- Beginner, Intermediate, Advanced
  duration VARCHAR(50),             -- e.g., "4 weeks", "6 weeks"
  mentor VARCHAR(255),              -- Instructor name
  instructor_id INTEGER,            -- FK to users table
  image TEXT,                       -- Course cover image URL
  preview_video_url TEXT,           -- Preview video for course
  estimated_hours INTEGER DEFAULT 10,
  prerequisites TEXT,               -- What learners need before starting
  learning_objectives TEXT,         -- What learners will achieve
  syllabus TEXT,                    -- Week-by-week course outline
  average_rating NUMERIC(3,2) DEFAULT 4.5,
  total_reviews INTEGER DEFAULT 0,
  total_enrolled INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Modules Table
```sql
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,                   -- Cloudinary or YouTube URL
  order_index INTEGER,              -- Module order in course
  duration_minutes INTEGER,
  downloadable_content TEXT,        -- PDF notes URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Enrollments Table
```sql
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,       -- 0-100 percentage
  completed_modules INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);
```

### Quizzes Table
```sql
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  questions JSONB,                  -- Array of question objects
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Quiz Attempts Table
```sql
CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  total_points INTEGER,
  percentage NUMERIC(5,2),
  passed BOOLEAN,
  answers JSONB,                    -- User's answers
  time_taken INTEGER,               -- Seconds
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Course Data

### Course 1: Financial Literacy Basics
**Category**: Finance  
**Level**: Beginner  
**Duration**: 4 weeks  
**Mentor**: Mary Aluel  
**Image**: https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800

**Prerequisites**:
- No prior financial knowledge required
- Basic literacy and numeracy skills recommended

**Learning Objectives**:
- Master personal budgeting and expense tracking
- Understand income management and saving strategies
- Learn about credit, debt management, and financial planning
- Develop smart spending habits and financial decision-making skills

**Syllabus**:
- **Week 1**: Introduction to Personal Finance - Understanding income, expenses, and financial goals
- **Week 2**: Budgeting Fundamentals - Creating and maintaining a personal budget, tracking expenses
- **Week 3**: Saving Strategies - Emergency funds, short-term and long-term savings, compound interest
- **Week 4**: Credit and Debt Management - Understanding credit scores, managing debt, avoiding financial pitfalls

**Modules**:
1. Introduction to Budgeting
2. Smart Saving Tips
3. Understanding Credit

---

### Course 2: Entrepreneurship 101
**Category**: Business  
**Level**: Beginner  
**Duration**: 6 weeks  
**Mentor**: Priscilla Ayuen  
**Image**: https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800

**Prerequisites**:
- Basic business awareness
- Willingness to learn and take initiative
- No prior entrepreneurship experience required

**Learning Objectives**:
- Identify viable business opportunities in your community
- Develop a comprehensive business plan from idea to execution
- Master pitching and presentation skills for investors and customers
- Understand basic business operations, marketing, and financial management

**Syllabus**:
- **Week 1-2**: Finding Your Business Idea - Market research, identifying problems to solve, validating ideas
- **Week 3-4**: Business Planning - Creating a business model, financial projections, resource planning
- **Week 5**: Marketing and Customer Acquisition - Understanding your target market, branding basics, sales strategies
- **Week 6**: Pitching Your Business - Crafting compelling presentations, handling questions, building investor confidence

**Modules**:
1. Finding a Business Idea
2. Pitching and Presentation

---

### Course 3: Digital Skills for Beginners
**Category**: Technology  
**Level**: Beginner  
**Duration**: 5 weeks  
**Mentor**: Adich Dorcus  
**Image**: https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800

**Prerequisites**:
- No prior computer experience required
- Access to a computer or smartphone for practice
- Basic reading and writing skills

**Learning Objectives**:
- Navigate computers and operating systems confidently
- Use the internet safely and effectively for research and communication
- Master essential software applications (word processing, spreadsheets, email)
- Understand online safety, privacy, and digital citizenship

**Syllabus**:
- **Week 1**: Computer Basics - Hardware components, operating systems, file management
- **Week 2**: Internet Fundamentals - Browsers, search engines, email, online safety
- **Week 3**: Productivity Software - Word processing, spreadsheets, presentations
- **Week 4**: Digital Communication - Social media basics, video calls, online collaboration tools
- **Week 5**: Digital Safety and Ethics - Password security, privacy settings, identifying scams, responsible online behavior

**Modules**:
1. Introduction to Computers
2. Internet Basics

---

### Course 4: Leadership & Communication
**Category**: Leadership  
**Level**: Intermediate  
**Duration**: 6 weeks  
**Mentor**: Achol Williams  
**Image**: https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800

**Prerequisites**:
- Basic communication skills
- Willingness to practice public speaking
- Some work or volunteer experience helpful but not required

**Learning Objectives**:
- Develop confident public speaking and presentation skills
- Master effective communication techniques for diverse audiences
- Build leadership capabilities and team management skills
- Learn conflict resolution and negotiation strategies

**Syllabus**:
- **Week 1-2**: Communication Fundamentals - Verbal and non-verbal communication, active listening, emotional intelligence
- **Week 3**: Public Speaking Mastery - Overcoming fear, structuring speeches, engaging audiences, voice and body language
- **Week 4-5**: Leadership Principles - Leadership styles, motivating teams, decision-making, delegation
- **Week 6**: Advanced Skills - Conflict resolution, negotiation, giving and receiving feedback, building influence

**Modules**:
1. Public Speaking Basics
2. Team Leadership

---

### Course 5: Advanced Financial Management
**Category**: Finance  
**Level**: Advanced  
**Duration**: 6 weeks  
**Mentor**: Sarah Johnson  
**Image**: https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800

**Prerequisites**:
- Completion of Financial Literacy Basics or equivalent knowledge
- Understanding of basic accounting principles
- Experience with budgeting and financial planning

**Learning Objectives**:
- Master advanced financial analysis and forecasting techniques
- Understand investment strategies and portfolio management
- Learn risk management and financial decision-making frameworks
- Develop skills in financial modeling and data-driven planning

**Syllabus**:
- **Week 1**: Advanced Financial Analysis - Financial statements, ratio analysis, trend analysis
- **Week 2**: Investment Fundamentals - Asset classes, risk vs return, diversification strategies
- **Week 3-4**: Financial Planning and Forecasting - Cash flow management, scenario planning, financial modeling
- **Week 5**: Risk Management - Identifying financial risks, hedging strategies, insurance planning
- **Week 6**: Strategic Financial Decision-Making - Capital budgeting, cost-benefit analysis, performance metrics

**Modules**:
(To be added)

---

### Course 6: Strategic Business Leadership
**Category**: Business  
**Level**: Advanced  
**Duration**: 8 weeks  
**Mentor**: Dr. Michael Chen  
**Image**: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800

**Prerequisites**:
- Completion of Entrepreneurship 101 and Leadership & Communication courses or equivalent experience
- 2+ years of business or management experience recommended

**Learning Objectives**:
- Develop strategic thinking and long-term business planning capabilities
- Master organizational leadership and change management
- Learn to build high-performing teams and organizational culture
- Understand competitive strategy, innovation, and sustainable growth

**Syllabus**:
- **Week 1-2**: Strategic Leadership Foundations - Vision setting, strategic planning frameworks, competitive analysis
- **Week 3**: Organizational Leadership - Building culture, change management, organizational design
- **Week 4-5**: Team Excellence - Hiring strategies, performance management, developing leaders, succession planning
- **Week 6-7**: Innovation and Growth - Business model innovation, scaling strategies, market expansion
- **Week 8**: Executive Skills - Stakeholder management, board relations, crisis leadership, ethical decision-making

**Modules**:
(To be added)

---

## API Endpoints

### Course Endpoints

#### GET /api/courses
**Description**: List all courses with optional filtering  
**Query Parameters**:
- `q` (string): Search query for title/description
- `category` (string): Filter by category (Finance, Business, Technology, Leadership)

**Response**:
```json
[
  {
    "id": 1,
    "title": "Financial Literacy Basics",
    "description": "Learn how to manage your income...",
    "category": "Finance",
    "level": "Beginner",
    "duration": "4 weeks",
    "mentor": "Mary Aluel",
    "image": "https://images.unsplash.com/...",
    "average_rating": 4.5,
    "total_reviews": 0
  }
]
```

---

#### GET /api/courses/:id
**Description**: Get detailed course information  
**Authentication**: Optional (shows enrollment status if authenticated)

**Response**:
```json
{
  "id": 1,
  "title": "Financial Literacy Basics",
  "description": "Learn how to manage your income...",
  "category": "Finance",
  "level": "Beginner",
  "duration": "4 weeks",
  "mentor": "Mary Aluel",
  "image": "https://images.unsplash.com/...",
  "prerequisites": "No prior financial knowledge required...",
  "learning_objectives": "Master personal budgeting...",
  "syllabus": "Week 1: Introduction to Personal Finance...",
  "average_rating": 4.5,
  "total_reviews": 0,
  "instructor_name": "Mary Aluel",
  "enrolled_count": 15,
  "resources": []
}
```

---

#### GET /api/courses/:id/preview
**Description**: Get course preview information (for non-enrolled users)  
**Authentication**: Not required

**Response**:
```json
{
  "id": 1,
  "title": "Financial Literacy Basics",
  "description": "Learn how to manage your income...",
  "preview_video_url": null,
  "syllabus": "Week 1: Introduction to Personal Finance...",
  "estimated_hours": 10,
  "prerequisites": "No prior financial knowledge required...",
  "learning_objectives": "Master personal budgeting...",
  "average_rating": 4.5,
  "total_reviews": 0,
  "category": "Finance",
  "level": "Beginner",
  "duration": "4 weeks",
  "instructor_name": "Mary Aluel",
  "instructor_bio": "Experienced educator and industry professional.",
  "instructor_credentials": "Certified Professional",
  "instructor_expertise": "Finance"
}
```

---

#### POST /api/courses/:id/enroll
**Description**: Enroll user in a course  
**Authentication**: Required  
**Notifications**: Sends email and SMS confirmation

**Response**:
```json
{
  "message": "Enrolled successfully",
  "enrollment": {
    "id": 1,
    "user_id": 3,
    "course_id": 1,
    "progress": 0,
    "enrolled_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### GET /api/courses/my/enrolled
**Description**: Get all courses the authenticated user is enrolled in  
**Authentication**: Required

**Response**:
```json
[
  {
    "id": 1,
    "title": "Financial Literacy Basics",
    "progress": 50,
    "completed_modules": 2,
    "enrolled_at": "2024-01-15T10:30:00Z"
  }
]
```

---

#### GET /api/courses/:id/modules
**Description**: Get all modules for a course  
**Authentication**: Optional

**Response**:
```json
[
  {
    "id": 1,
    "course_id": 1,
    "title": "Introduction to Budgeting",
    "description": "Learn the basics of budgeting...",
    "video_url": "https://res.cloudinary.com/...",
    "order_index": 1,
    "duration_minutes": 30,
    "downloadable_content": "https://..."
  }
]
```

---

#### GET /api/courses/:id/recommendations
**Description**: Get recommended courses based on current course  
**Authentication**: Not required

**Response**:
```json
[
  {
    "id": 5,
    "title": "Advanced Financial Management",
    "category": "Finance",
    "similarity_score": 0.8
  }
]
```

---

### Module Endpoints

#### POST /api/modules/:id/complete
**Description**: Mark a module as complete and award XP points  
**Authentication**: Required  
**Points Awarded**: 50 XP per module

**Request Body**:
```json
{
  "courseId": 1
}
```

**Response**:
```json
{
  "message": "Module completed successfully",
  "pointsAwarded": 50
}
```

---

### Quiz Endpoints

#### GET /api/quiz/module/:moduleId
**Description**: Get quiz for a specific module  
**Authentication**: Required

**Response**:
```json
{
  "id": 1,
  "title": "Budgeting Basics Quiz",
  "module_id": 1,
  "passing_score": 70,
  "time_limit_minutes": 30,
  "questions": [
    {
      "id": 1,
      "question": "What is a budget?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "points": 10
    }
  ]
}
```

---

#### POST /api/quiz/:quizId/submit
**Description**: Submit quiz answers and get score  
**Authentication**: Required

**Request Body**:
```json
{
  "answers": {
    "1": "A",
    "2": "B",
    "3": "C"
  }
}
```

**Response**:
```json
{
  "score": 80,
  "total_points": 100,
  "percentage": 80,
  "passed": true,
  "correct_answers": 8,
  "total_questions": 10
}
```

---

## Frontend Components

### Course Pages

#### 1. Courses.tsx
**Location**: `bridgeher-frontend/src/pages/Courses.tsx`  
**Purpose**: Main course listing page with search and filters

**Features**:
- Search courses by title, description, or mentor
- Filter by category (Finance, Business, Tech, Leadership)
- Filter by level (Beginner, Intermediate, Advanced)
- Sort by newest, popular, or title
- Display enrollment status
- Preview and enroll buttons

**Key State**:
```typescript
const [courses, setCourses] = useState<Course[]>([]);
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All");
const [level, setLevel] = useState("All");
const [sortBy, setSortBy] = useState("newest");
```

---

#### 2. CourseDetail.tsx
**Location**: `bridgeher-frontend/src/pages/CourseDetail.tsx`  
**Purpose**: Detailed course view with modules and enrollment

**Features**:
- Display course information (title, description, instructor)
- Show learning objectives and prerequisites
- List all course modules with video previews
- Enroll button (if not enrolled)
- Start learning button (if enrolled)
- Course preview modal
- Certificate preview
- Course reviews
- Course recommendations
- Offline download option

**Key Functions**:
```typescript
const loadCourse = async () => { /* Fetch course data */ };
const handleEnroll = async () => { /* Enroll user */ };
```

---

#### 3. CoursePlayer.tsx
**Location**: `bridgeher-frontend/src/pages/CoursePlayer.tsx`  
**Purpose**: Video player for learning modules

**Features**:
- Video playback with Cloudinary integration
- Module navigation (previous/next)
- Progress tracking
- Quiz access after module completion
- Downloadable notes
- Playback speed control
- Resume from last position

**Key Functions**:
```typescript
const handleModuleComplete = async () => {
  // Mark module complete and award 50 XP
  await fetch(`/api/modules/${moduleId}/complete`, { method: 'POST' });
};
```

---

### Course Components

#### 1. EnhancedCourseCard.tsx
**Location**: `bridgeher-frontend/src/components/EnhancedCourseCard.tsx`  
**Purpose**: Reusable course card component

**Props**:
```typescript
interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  instructor?: string;
  thumbnail?: string;  // Course image URL
  rating?: number;
  enrolled?: boolean;
  progress?: number;
  language: string;
  onEnroll?: (id: number) => void;
  onPreview?: (id: number) => void;
}
```

**Features**:
- Displays course thumbnail image
- Shows category and level badges
- Displays rating and enrollment count
- Progress bar for enrolled courses
- Enroll/Continue/Preview buttons
- Multilingual support

---

#### 2. CoursePreview.tsx
**Location**: `bridgeher-frontend/src/components/CoursePreview.tsx`  
**Purpose**: Modal for previewing course before enrollment

**Features**:
- Course title and description
- Preview video (if available)
- Duration and rating
- Instructor information
- Learning objectives
- Prerequisites
- Syllabus overview
- Enroll button

**API Call**:
```typescript
const loadPreview = async () => {
  const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/preview`);
  const data = await res.json();
  setCourse(data);
};
```

---

#### 3. CourseReviews.tsx
**Location**: `bridgeher-frontend/src/components/CourseReviews.tsx`  
**Purpose**: Display and submit course reviews

**Features**:
- List all course reviews
- Star rating display
- Add review (if enrolled)
- Sort by newest/highest rated
- Pagination

---

#### 4. CourseRecommendations.tsx
**Location**: `bridgeher-frontend/src/components/CourseRecommendations.tsx`  
**Purpose**: Show related courses

**Features**:
- Display 4 recommended courses
- Based on category similarity
- Click to view course details

---

## User Workflows

### 1. Browse and Enroll Workflow
```
User visits /courses
  ↓
Searches/filters courses
  ↓
Clicks "Preview" button
  ↓
CoursePreview modal opens
  ↓
Reviews course details
  ↓
Clicks "Enroll Now"
  ↓
Enrollment API called
  ↓
Email/SMS confirmation sent
  ↓
User redirected to course detail page
  ↓
"Start Learning" button now available
```

### 2. Learning Workflow
```
User clicks "Start Learning"
  ↓
CoursePlayer opens with first module
  ↓
Watches video
  ↓
Clicks "Mark as Complete"
  ↓
50 XP points awarded
  ↓
Quiz becomes available
  ↓
Takes quiz
  ↓
Passes quiz (70%+)
  ↓
Next module unlocks
  ↓
Repeat until course complete
  ↓
Certificate issued
  ↓
Email/SMS notification sent
```

### 3. Offline Learning Workflow
```
User enrolled in course
  ↓
Clicks "Download for Offline"
  ↓
Course content cached locally
  ↓
User goes offline
  ↓
Opens course from cache
  ↓
Watches videos offline
  ↓
Progress syncs when online
```

---

## Troubleshooting

### Issue: Course images not displaying
**Cause**: Frontend not passing `image` field as `thumbnail` prop  
**Solution**: Ensure `Courses.tsx` passes `thumbnail={course.image}` to `EnhancedCourseCard`

### Issue: Course preview not working
**Cause**: Backend query missing `mentor` field or instructor data  
**Solution**: Updated preview endpoint to include `mentor` field and fallback to mentor if instructor_name is null

### Issue: XP points not awarded
**Cause**: Frontend calling `/progress` instead of `/complete` endpoint  
**Solution**: Changed `CoursePlayer.tsx` to call `/api/modules/:id/complete`

### Issue: Quiz not available
**Cause**: Quizzes have NULL module_id  
**Solution**: Assigned all quizzes to appropriate modules in database

### Issue: Quiz submission failing
**Cause**: Missing columns in quiz_attempts table  
**Solution**: Added `total_points`, `percentage`, `passed`, `time_taken`, `completed_at` columns

---

## Best Practices

### For Developers

1. **Always include error handling**:
```typescript
try {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed');
  const data = await res.json();
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly message
}
```

2. **Use loading states**:
```typescript
const [loading, setLoading] = useState(true);
// Show spinner while loading
if (loading) return <LoadingSpinner />;
```

3. **Validate data before rendering**:
```typescript
if (!course) return <p>Course not found</p>;
```

4. **Cache API responses**:
```typescript
const [courses, setCourses] = useState<Course[]>([]);
useEffect(() => {
  if (courses.length === 0) fetchCourses();
}, []);
```

### For Content Creators

1. **Course Structure**:
   - Keep modules focused (20-30 minutes each)
   - Include downloadable resources
   - Add quizzes after each module
   - Provide clear learning objectives

2. **Video Guidelines**:
   - Upload to Cloudinary for best performance
   - Include captions for accessibility
   - Keep videos under 15 minutes
   - Use high-quality audio

3. **Quiz Design**:
   - 5-10 questions per module
   - Mix question types
   - Set passing score at 70%
   - Provide explanations for answers

---

## Future Enhancements

1. **Live Sessions**: Add WebRTC for live mentorship sessions
2. **Discussion Forums**: Per-course discussion boards
3. **Assignments**: Graded assignments with mentor feedback
4. **Certificates**: Blockchain-verified certificates
5. **Mobile App**: React Native mobile application
6. **AI Recommendations**: ML-based course recommendations
7. **Gamification**: Badges, streaks, leaderboards
8. **Social Learning**: Study groups and peer collaboration

---

**Last Updated**: January 2024  
**Maintained By**: BridgeHer Development Team  
**Contact**: abukmayen@gmail.com
