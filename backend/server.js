import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import session from "express-session";
import passport from "./config/passport.js";
import pool from "./config/db.js";
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
import assignmentRoutes from "./routes/assignments.js";
import adminMentorshipRoutes from "./routes/admin-mentorship.js";
import adminRoutes from "./routes/admin.js";
import quizRoutes from "./routes/quiz.js";
import gamificationRoutes from "./routes/gamification.js";
import offlineRoutes from "./routes/offline.js";
import supportRoutes from "./routes/support.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.send("BridgeHer Backend API is running");
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
app.use("/api/assignments", assignmentRoutes);
app.use("/api/admin/mentorship", adminMentorshipRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/offline", offlineRoutes);
app.use("/api/support", supportRoutes);


app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});


app.use((err, _req, res, _next) => {
  
  console.error(err && err.stack ? err.stack : err);
  res.status(err?.status || 500).json({ error: err?.message || "Internal Server Error" });
});

const PORT = Number(process.env.PORT) || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


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
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});