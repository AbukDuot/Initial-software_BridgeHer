# Add Technology and Finance Courses

## Option 1: Using SQL (Fastest)

Run the SQL script directly in your database:

```bash
psql -U postgres -d bridgeherdb -f backend/seed-courses.sql
```

Or manually in pgAdmin/psql:

```sql
-- Technology Course
INSERT INTO courses (title, description, category, level, duration, mentor, downloadable)
VALUES (
  'Introduction to Technology',
  'Learn fundamental technology skills including computer basics, internet usage, and digital tools for modern work.',
  'Technology',
  'Beginner',
  '6 weeks',
  'Tech Expert',
  true
);

-- Finance Course
INSERT INTO courses (title, description, category, level, duration, mentor, downloadable)
VALUES (
  'Financial Literacy for Women',
  'Master personal finance, budgeting, saving strategies, and financial planning to achieve economic independence.',
  'Finance',
  'Beginner',
  '8 weeks',
  'Finance Advisor',
  true
);
```

---

## Option 2: Using API (Recommended)

### Step 1: Login as Admin

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "abukdeborah9@gmail.com",
  "password": "Mayen2022"
}
```

Copy the `token` from response.

---

### Step 2: Create Technology Course

```http
POST http://localhost:5000/api/courses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Introduction to Technology",
  "description": "Learn fundamental technology skills including computer basics, internet usage, and digital tools for modern work.",
  "category": "Technology",
  "level": "Beginner",
  "duration": "6 weeks",
  "mentor": "Tech Expert"
}
```

---

### Step 3: Create Finance Course

```http
POST http://localhost:5000/api/courses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Financial Literacy for Women",
  "description": "Master personal finance, budgeting, saving strategies, and financial planning to achieve economic independence.",
  "category": "Finance",
  "level": "Beginner",
  "duration": "8 weeks",
  "mentor": "Finance Advisor"
}
```

---

## Option 3: Using Frontend (AdminCourseUpload)

1. Login as Admin
2. Navigate to `/admin-course-upload`
3. Fill in course details:
   - **Technology Course**:
     - Title: Introduction to Technology
     - Description: Learn fundamental technology skills...
     - Category: Technology
     - Level: Beginner
     - Duration: 6 weeks
     - Mentor: Tech Expert
   
   - **Finance Course**:
     - Title: Financial Literacy for Women
     - Description: Master personal finance...
     - Category: Finance
     - Level: Beginner
     - Duration: 8 weeks
     - Mentor: Finance Advisor

4. Click "Create Course"

---

## Verify Courses Added

```http
GET http://localhost:5000/api/courses
```

You should see both courses in the response.

---

## Quick Test (VS Code REST Client)

Open `backend/api-test.http` and:

1. Run "Login Admin" request
2. Copy token to `@token` variable at top
3. Run "Create Technology Course" request
4. Run "Create Finance Course" request
5. Run "Get All Courses" to verify

✅ Done! Both courses added.
