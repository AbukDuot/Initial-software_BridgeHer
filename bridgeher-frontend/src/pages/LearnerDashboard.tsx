import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../styles/learnerdashboard.css";

type Lang = "English" | "Arabic";

interface Course {
  id: string;
  titleEn: string;
  titleAr: string;
  totalModules: number;
  completedModules: number;
  xp: number;
}

interface Feedback {
  from: string;
  textEn: string;
  textAr: string;
  date: string;
}

interface PersistShape {
  courses: Course[];
  xp: number;
  streak: number;
  lastActive: string;
  unlockedSkills: string[];
  achievements: string[];
}

const txt = {
  headerTitle: { English: "Welcome back", Arabic: "مرحباً مجدداً" },
  headerSubtitle: {
    English: "Track your learning, earn XP, and grow your skills.",
    Arabic: "تابعي تقدمكِ، واكتسبي النقاط، وطوّري مهاراتكِ.",
  },
  streak: { English: "Day Streak", Arabic: "أيام متتالية" },
  skillTree: { English: "Skill Tree", Arabic: "مسار المهارات" },
  myCourses: { English: "Active Courses", Arabic: "الدورات النشطة" },
  modulesCompleted: { English: "Modules Completed", Arabic: "الوحدات المكتملة" },
  completeLesson: { English: "Complete Lesson", Arabic: "إكمال الدرس" },
  startQuiz: { English: "Start Quiz", Arabic: "بدء الاختبار" },
  viewCourse: { English: "View Course", Arabic: "عرض الدورة" },
  achievements: { English: "Achievements", Arabic: "الإنجازات" },
  analytics: { English: "Analytics", Arabic: "تحليلات التعلم" },
  mentorFeedback: { English: "Mentor Feedback", Arabic: "ملاحظات المرشد" },
  xp: { English: "XP", Arabic: "نقاط الخبرة" },
  certificates: { English: "Certificates", Arabic: "الشهادات" },
};

const seedCourses: Course[] = [
  {
    id: "1",
    titleEn: "Women’s Financial Empowerment",
    titleAr: "التمكين المالي للنساء",
    totalModules: 5,
    completedModules: 3,
    xp: 120,
  },
  {
    id: "2",
    titleEn: "Digital Leadership Skills",
    titleAr: "مهارات القيادة الرقمية",
    totalModules: 6,
    completedModules: 2,
    xp: 90,
  },
  {
    id: "3",
    titleEn: "Entrepreneurship Basics",
    titleAr: "أساسيات ريادة الأعمال",
    totalModules: 4,
    completedModules: 1,
    xp: 40,
  },
];

const seedFeedback: Feedback[] = [
  {
    from: "Mentor Monica",
    textEn: "Great work on your budgeting module!",
    textAr: "عمل رائع في وحدة إعداد الميزانية!",
    date: "2025-10-06",
  },
  {
    from: "Coach Priscilla",
    textEn: "Excellent progress in leadership lessons!",
    textAr: "تقدم ممتاز في دروس القيادة!",
    date: "2025-10-05",
  },
];

const STORAGE_KEY = "learner-dashboard-state";

function loadState(): PersistShape {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as PersistShape;
    } catch {}
  }
  return {
    courses: seedCourses,
    xp: seedCourses.reduce((a, c) => a + c.xp, 0),
    streak: 1,
    lastActive: new Date().toISOString(),
    unlockedSkills: ["finance"],
    achievements: [],
  };
}

function saveState(s: PersistShape) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const LearnerDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === "Arabic";
  const navigate = useNavigate();

  const [state, setState] = useState<PersistShape>(() => loadState());
  const [feedback] = useState<Feedback[]>(seedFeedback);

  useEffect(() => {
    const today = new Date();
    const last = new Date(state.lastActive);
    if (today.toDateString() !== last.toDateString()) {
      const diffDays = Math.floor(
        (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
      );
      const newStreak = diffDays === 1 ? state.streak + 1 : 1;
      const updated = { ...state, streak: newStreak, lastActive: today.toISOString() };
      setState(updated);
      saveState(updated);
    }
  }, []);

  const totalModules = useMemo(
    () => state.courses.reduce((a, c) => a + c.totalModules, 0),
    [state.courses]
  );
  const completedModules = useMemo(
    () => state.courses.reduce((a, c) => a + c.completedModules, 0),
    [state.courses]
  );
  const progress = Math.round((completedModules / totalModules) * 100);

  const handleCompleteLesson = (id: string) => {
    setState((prev) => {
      const updatedCourses = prev.courses.map((c) =>
        c.id === id && c.completedModules < c.totalModules
          ? { ...c, completedModules: c.completedModules + 1, xp: c.xp + 10 }
          : c
      );
      const updated = {
        ...prev,
        courses: updatedCourses,
        xp: updatedCourses.reduce((a, c) => a + c.xp, 0),
      };
      saveState(updated);
      return updated;
    });
  };

  const handleStartQuiz = (id: string) => {
    navigate(`/quiz/${id}`);
  };

  return (
    <section className={`learner-dashboard ${isAr ? "rtl" : ""}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="dashboard-container">
        <header className="dashboard-header clickable" onClick={() => navigate("/profile/learner")}>
          <div>
            <h2>{isAr ? txt.headerTitle.Arabic : txt.headerTitle.English}</h2>
            <p>{isAr ? txt.headerSubtitle.Arabic : txt.headerSubtitle.English}</p>
          </div>
          <div className="streak-badge">
            {state.streak} {isAr ? txt.streak.Arabic : txt.streak.English}
          </div>
        </header>

        <h3>{isAr ? txt.myCourses.Arabic : txt.myCourses.English}</h3>
        <div className="course-list">
          {state.courses.map((course) => {
            const pct = Math.round(
              (course.completedModules / course.totalModules) * 100
            );
            return (
              <div className="course-card clickable" key={course.id}>
                <h4>{isAr ? course.titleAr : course.titleEn}</h4>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <p className="muted">
                  {isAr
                    ? `${txt.modulesCompleted.Arabic}: ${course.completedModules}/${course.totalModules}`
                    : `${txt.modulesCompleted.English}: ${course.completedModules}/${course.totalModules}`}
                </p>
                <p className="xp-chip">{course.xp} XP</p>
                <div className="course-actions">
                  <button className="btn ghost" onClick={() => handleCompleteLesson(course.id)}>
                    {isAr ? txt.completeLesson.Arabic : txt.completeLesson.English}
                  </button>
                  <button className="btn outline" onClick={() => handleStartQuiz(course.id)}>
                    {isAr ? txt.startQuiz.Arabic : txt.startQuiz.English}
                  </button>
                  <button className="btn primary" onClick={() => navigate(`/course/${course.id}`)}>
                    {isAr ? txt.viewCourse.Arabic : txt.viewCourse.English}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="analytics clickable" onClick={() => navigate("/my-certificates")}>
          <h3>{isAr ? txt.analytics.Arabic : txt.analytics.English}</h3>
          <p>
            {isAr
              ? `مستوى التقدم الكلي: ${progress}% | نقاط الخبرة: ${state.xp}`
              : `Overall progress: ${progress}% | XP: ${state.xp}`}
          </p>
        </div>

        <div className="feedback-section clickable" onClick={() => navigate("/mentorship")}>
          <h3>{isAr ? txt.mentorFeedback.Arabic : txt.mentorFeedback.English}</h3>
          {feedback.map((f, i) => (
            <div className="feedback-card" key={i}>
              <strong>{f.from}</strong>
              <p>{isAr ? f.textAr : f.textEn}</p>
              <span className="muted">{f.date}</span>
            </div>
          ))}
        </div>

        <div className="report-section clickable" onClick={() => navigate("/my-certificates")}>
          <h3>{isAr ? txt.certificates.Arabic : txt.certificates.English}</h3>
          <Link to="/my-certificates" className="btn outline">
            {isAr ? txt.certificates.Arabic : txt.certificates.English}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LearnerDashboard;
