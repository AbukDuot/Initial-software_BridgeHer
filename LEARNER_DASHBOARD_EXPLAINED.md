# LearnerDashboard Explained - Simple Guide

## What is the LearnerDashboard?

The LearnerDashboard is the **main page learners see after logging in**. It shows their learning progress, stats, reminders, and calendar.

---

## 🎯 Main Features

### 1. **Sidebar Navigation**
- Dashboard (current page)
- Courses (browse courses)
- Mentorship (request mentors)
- Certificates (view earned certificates)
- Settings (account settings)

### 2. **User Stats**
Shows 3 key metrics:
- **Day Streak**: How many days in a row the learner studied (currently: 8 days)
- **XP Points**: Experience points earned (currently: 430 XP)
- **Current Level**: Level based on XP (Level = XP ÷ 1000)

### 3. **Learning Analytics**
Two charts:
- **Weekly Learning Hours**: Bar chart showing hours studied each day
- **Course Completion**: Doughnut chart showing 70% completed, 30% remaining

### 4. **Reminders**
- Add personal reminders
- Mark reminders as done
- Remove reminders
- Saved in browser localStorage

### 5. **Google Calendar**
- Embedded Google Calendar
- Shows upcoming sessions and course events
- Can sync with learner's Google account

### 6. **Theme Toggle**
- Light mode (default)
- Dark mode
- Sound on/off for UI interactions

### 7. **Daily Quote**
Motivational quote that changes daily

---

## 📊 How It Works (Step by Step)

### When Page Loads:

1. **Gets user info** from localStorage or context
   - User name: "Abuk"
   - Streak: 8 days
   - XP: 430 points

2. **Calculates level**
   ```
   Level = Math.floor(XP ÷ 1000) + 1
   430 ÷ 1000 = 0, so Level = 1
   ```

3. **Loads saved data** from browser:
   - Theme preference (light/dark)
   - Sound preference (on/off)
   - Reminders list

4. **Displays charts** with sample data:
   - Weekly hours: [2, 3, 1.5, 2, 4, 2.5, 3]
   - Completion: 70% done, 30% remaining

5. **Shows Google Calendar** iframe

---

## 🔧 Current Data (Hardcoded)

Right now, the dashboard uses **sample/demo data**:

```typescript
// User data
const user = { 
  name: "Abuk", 
  streak: 8 
};

// XP and Level
const xp = 430;
const level = 1;

// Weekly learning hours
const weeklyData = [2, 3, 1.5, 2, 4, 2.5, 3];

// Course completion
const completion = { completed: 70, remaining: 30 };
```

---

## 🔗 What Needs Backend Connection?

To make it **dynamic** (real data from backend), you need to fetch:

### 1. **User Stats**
```typescript
// Fetch from backend
const res = await fetch("http://localhost:5000/api/users/me/stats", {
  headers: { Authorization: `Bearer ${token}` }
});
const { streak, xp, level } = await res.json();
```

### 2. **Enrolled Courses**
```typescript
const res = await fetch("http://localhost:5000/api/courses/my/enrolled", {
  headers: { Authorization: `Bearer ${token}` }
});
const courses = await res.json();
// Calculate completion percentage
```

### 3. **Learning Hours**
```typescript
const res = await fetch("http://localhost:5000/api/users/me/activity", {
  headers: { Authorization: `Bearer ${token}` }
});
const weeklyHours = await res.json();
```

---

## 🎨 Features Explained

### Theme Toggle
```typescript
// Switches between light and dark mode
const [theme, setTheme] = useState("light");

// Saves to localStorage
localStorage.setItem("bh-theme", theme);

// Applies to entire page
document.documentElement.dataset.theme = theme;
```

### Sound Effects
```typescript
// Plays a beep sound when clicking buttons
const playUiSound = (enabled, tone) => {
  // Creates audio using Web Audio API
  // Frequency: 540Hz for tap, 650Hz for success
};
```

### Reminders
```typescript
// Stored in browser localStorage
const [reminders, setReminders] = useState([]);

// Add reminder
const addReminder = () => {
  setReminders([...reminders, { 
    id: Date.now(), 
    text: input, 
    done: false 
  }]);
};

// Toggle done
const toggleDone = (id) => {
  setReminders(reminders.map(r => 
    r.id === id ? { ...r, done: !r.done } : r
  ));
};
```

### Charts
```typescript
// Uses Chart.js library
import { Bar, Doughnut } from "react-chartjs-2";

// Bar chart for weekly hours
<Bar data={weeklyData} options={chartOptions} />

// Doughnut chart for completion
<Doughnut data={completionData} options={chartOptions} />
```

---

## 🌍 Multilingual Support

Dashboard supports **English and Arabic**:

```typescript
const tMap = {
  en: {
    sidebar: { dashboard: "Dashboard", courses: "Courses" },
    stats: { streak: "Day Streak", xp: "XP Points" }
  },
  ar: {
    sidebar: { dashboard: "لوحة التحكم", courses: "الدورات" },
    stats: { streak: "السلسلة المتتالية", xp: "نقاط الخبرة" }
  }
};

// Use based on language
const t = isArabic ? tMap.ar : tMap.en;
```

Arabic mode also:
- Adds RTL (right-to-left) class
- Converts numbers to Arabic numerals
- Flips layout direction

---

## 📱 Responsive Design

Dashboard adapts to screen sizes:
- **Desktop**: Sidebar + main content side by side
- **Tablet**: Sidebar collapses to hamburger menu
- **Mobile**: Full-width stacked layout

---

## 🚀 How to Use

### As a Learner:

1. **Login** to your account
2. **Navigate** to `/learner-dashboard`
3. **View** your stats and progress
4. **Add** reminders for study sessions
5. **Toggle** theme (light/dark)
6. **Click** sidebar links to navigate

### As a Developer:

1. **Current**: Dashboard shows demo data
2. **Next Step**: Connect to backend APIs
3. **Fetch**: Real user stats, courses, progress
4. **Update**: Charts with actual data
5. **Add**: More features as needed

---

## 🔄 Data Flow

```
User logs in
    ↓
Token saved in localStorage
    ↓
LearnerDashboard loads
    ↓
Fetches user data (future: from backend)
    ↓
Displays stats, charts, reminders
    ↓
User interacts (add reminder, toggle theme)
    ↓
Changes saved to localStorage
```

---

## ✅ What's Working Now

- ✅ Page layout and design
- ✅ Sidebar navigation
- ✅ Theme toggle (light/dark)
- ✅ Sound effects
- ✅ Reminders (add/remove/mark done)
- ✅ Charts display
- ✅ Google Calendar embed
- ✅ Multilingual (English/Arabic)
- ✅ Responsive design

---

## 🔧 What Needs Backend

- ⏳ Real user stats (streak, XP, level)
- ⏳ Actual enrolled courses
- ⏳ Real learning hours data
- ⏳ Actual completion percentage
- ⏳ User profile info

---

## 📝 Summary

**LearnerDashboard** is a **personal learning hub** that shows:
- Your learning stats and progress
- Charts and analytics
- Personal reminders
- Calendar for sessions
- Quick navigation to other pages

**Currently**: Uses demo data for display  
**Future**: Will fetch real data from backend APIs

It's like a **control center** for learners to track their learning journey! 🎓

---

## Quick Example

When a learner logs in:
1. Sees "Welcome back, Abuk"
2. Views 8-day streak, 430 XP, Level 1
3. Checks weekly learning hours chart
4. Adds reminder: "Complete Module 3 by Friday"
5. Clicks "Courses" to browse new courses
6. Switches to dark mode for night study

Simple and user-friendly! 🌟
