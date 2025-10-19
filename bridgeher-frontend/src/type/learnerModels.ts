// ------------------------------
// User & Mentor Models
// ------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  streak: number;
  xp: number;
  level: number;
  role: "learner";
  language: "English" | "Arabic";
  createdAt: string;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  expertise: string[];
  online: boolean;
  rating?: number;
  bio?: string;
  language: string[];
}

// ------------------------------
// Course & Progress Tracking
// ------------------------------
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "ongoing" | "completed" | "scheduled";
  progress: number; // percentage
  nextLesson: string;
  lessons: number;
  completedLessons: number;
  mentorId?: string;
}

export interface Progress {
  userId: string;
  courseId: string;
  xpGained: number;
  completionRate: number;
  lastUpdated: string;
}

// ------------------------------
// Reminders & Notifications
// ------------------------------
export interface Reminder {
  id: string;
  userId: string;
  text: string;
  dueAt: string;
  done: boolean;
}

// ------------------------------
// Leaderboard
// ------------------------------
export interface LeaderboardEntry {
  userId: string;
  name: string;
  level: number;
  xp: number;
  rank: number;
}

// ------------------------------
// Badges & Achievements
// ------------------------------
export interface Badge {
  id: string;
  label: string;
  description: string;
  earnedAt?: string;
  iconUrl?: string;
}

// ------------------------------
// Mentorship Sessions
// ------------------------------
export interface MentorshipSession {
  id: string;
  mentorId: string;
  userId: string;
  title: string;
  dateTime: string;
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
}

// ------------------------------
// Chat Message
// ------------------------------
export interface ChatMessage {
  id: string;
  sender: "user" | "mentor";
  text: string;
  timestamp: string;
  sessionId?: string;
}
