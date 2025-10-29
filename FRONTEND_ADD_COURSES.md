# Add Technology & Finance Courses via Frontend

## Step-by-Step Guide

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd bridgeher-frontend
npm start
```
✅ Frontend running on http://localhost:5173

---

### 2. Login as Admin

1. Open browser: http://localhost:5173
2. Click "Login"
3. Enter credentials:
   - Email: `abukdeborah9@gmail.com`
   - Password: `Mayen2022`
4. Click "Login"

---

### 3. Navigate to Course Upload

- Click "Admin Dashboard" or navigate to: http://localhost:5173/admin-course-upload
- You should see "Upload New Course" page

---

### 4. Add Technology Course

Fill in the form:

**Course Details:**
- **Title**: `Introduction to Technology`
- **Description**: `Learn fundamental technology skills including computer basics, internet usage, and digital tools for modern work.`
- **Category**: Select `Technology` (already default)
- **Level**: Select `Beginner`
- **Duration**: `6 weeks`

**Add Module (Optional but recommended):**
- **Module Title**: `Computer Basics`
- **Module Description**: `Introduction to computers and operating systems`
- **Module Content**: `Learn about hardware, software, and basic computer operations`
- **Duration**: `45` (minutes)
- **Upload Video**: Select a video file (or skip for now)
- Click "Add Module"

**Upload Course:**
- Click "Upload Course" button
- Wait for "Course uploaded successfully!" message

---

### 5. Add Finance Course

**Course Details:**
- **Title**: `Financial Literacy for Women`
- **Description**: `Master personal finance, budgeting, saving strategies, and financial planning to achieve economic independence.`
- **Category**: Select `Finance`
- **Level**: Select `Beginner`
- **Duration**: `8 weeks`

**Add Module (Optional):**
- **Module Title**: `Budgeting Basics`
- **Module Description**: `Learn how to create and manage a personal budget`
- **Module Content**: `Understanding income, expenses, and savings goals`
- **Duration**: `60` (minutes)
- **Upload Video**: Select a video file (or skip for now)
- Click "Add Module"

**Upload Course:**
- Click "Upload Course" button
- Wait for "Course uploaded successfully!" message

---

### 6. Verify Courses Added

**Option A - Frontend:**
- Navigate to "Courses" page
- You should see both courses listed

**Option B - API:**
```http
GET http://localhost:5000/api/courses
```

**Option C - Database:**
```sql
SELECT id, title, category FROM courses;
```

---

## Quick Reference

### Technology Course
```
Title: Introduction to Technology
Description: Learn fundamental technology skills including computer basics, internet usage, and digital tools for modern work.
Category: Technology
Level: Beginner
Duration: 6 weeks
```

### Finance Course
```
Title: Financial Literacy for Women
Description: Master personal finance, budgeting, saving strategies, and financial planning to achieve economic independence.
Category: Finance
Level: Beginner
Duration: 8 weeks
```

---

## Troubleshooting

### "Unauthorized" Error
- Make sure you're logged in as Admin
- Check token in localStorage (F12 → Application → Local Storage)

### "Please add at least one module" Error
- You must add at least one module before uploading
- Click "Add Module" button after filling module details

### Video Upload Fails
- Check file size (max 100MB)
- Ensure Cloudinary credentials in backend/.env
- Video will fallback to local storage if Cloudinary not configured

### Course Not Appearing
- Refresh the courses page
- Check browser console for errors (F12)
- Verify backend is running

---

## Notes

✅ **Technology** and **Finance** are now in the category dropdown
✅ **Technology** is the default category
✅ You can add courses with or without modules
✅ Modules can include video and PDF files
✅ You can add assignments to modules (optional)

---

## Alternative: Add Without Modules

If you don't have video files ready:

1. Fill in course details only
2. Add a simple module:
   - Title: "Coming Soon"
   - Description: "Content will be added"
   - Duration: 1
   - Skip video upload
3. Click "Add Module"
4. Click "Upload Course"

You can add proper modules later!

---

## Success! 🎉

Once both courses are added, you'll see them in:
- Courses list page
- Admin dashboard
- Database courses table

Learners can now:
- Browse and enroll in Technology course
- Browse and enroll in Finance course
- Track progress
- Earn certificates upon completion
