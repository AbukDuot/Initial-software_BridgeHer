import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import pool from "./config/db.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import initDatabase from "./config/initDb.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import mentorRoutes from "./routes/mentor.js";
import requestRoutes from "./routes/request.js";
import communityRoutes from "./routes/community.js";
import mentorshipRoutes from "./routes/mentorship.js";
import settingsRoutes from "./routes/settings.js";
import dashboardsRoutes from "./routes/dashboards.js";
import courseRoutes from "./routes/course.js";
import moduleRoutes from "./routes/modules.js";
import cloudinaryModulesRoutes from "./routes/cloudinary-modules.js";
import assignmentRoutes from "./routes/assignments.js";
import adminMentorshipRoutes from "./routes/admin-mentorship.js";
import adminRoutes from "./routes/admin.js";
import quizRoutes from "./routes/quiz.js";
import setupQuizzesRoutes from "./routes/setupQuizzes.js";
import gamificationRoutes from "./routes/gamification.js";
import offlineRoutes from "./routes/offline.js";
import supportRoutes from "./routes/support.js";
import notificationsRoutes from "./routes/notifications.js";
import profileRoutes from "./routes/profile.js";
import remindersRoutes from "./routes/reminders.js";
import courseReviewsRoutes from "./routes/courseReviews.js";
import videoNotesRoutes from "./routes/videoNotes.js";
import videoBookmarksRoutes from "./routes/videoBookmarks.js";
import searchRoutes from "./routes/search.js";
import moduleVideosRoutes from "./routes/moduleVideos.js";
import setupTechCourseRoutes from "./routes/setupTechCourse.js";
import testQuizRoutes from "./routes/testQuiz.js";
import uploadRoutes from "./routes/upload.js";

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://bridgeher.vercel.app',
  'https://software-bridge-her.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost and bridgeher vercel deployments
    if (allowedOrigins.includes(origin) || origin.match(/https:\/\/bridgeher.*\.vercel\.app$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(generalLimiter);
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'unload=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  next();
});


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.send("BridgeHer Backend API v2 is running");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboards", dashboardsRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/cloudinary-modules", cloudinaryModulesRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/admin/mentorship", adminMentorshipRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/setup-quizzes", setupQuizzesRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/offline", offlineRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/course-reviews", courseReviewsRoutes);
app.use("/api/video-notes", videoNotesRoutes);
app.use("/api/video-bookmarks", videoBookmarksRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/module-videos", moduleVideosRoutes);
app.use("/api/setup", setupTechCourseRoutes);
app.use("/api/test", testQuizRoutes);
app.use("/api/upload", uploadRoutes);


app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});


app.use((err, _req, res, _next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR:`, err && err.stack ? err.stack : err);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  
  res.status(err?.status || 500).json({ error: err?.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

initDatabase()
  .then(() => {
    const server = app.listen(PORT, () => console.log(` Server running on port ${PORT}`))
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(` Port ${PORT} is already in use. Please kill the process or use a different port.`);
          console.error('Run: netstat -ano | findstr :5000 to find the process');
          process.exit(1);
        } else {
          console.error('Server error:', err);
          process.exit(1);
        }
      });
    
    const shutdown = async () => {
      console.log("Shutting down...");
      server.close(() => {
        if (pool && typeof pool.end === "function") {
          pool.end().catch(() => {});
        }
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});