import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
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
  avatarDataUrl?: string | null;
  displayName?: string;
}

const txt = {
  welcome: { English: "Welcome back", Arabic: "مرحباً مجدداً" },
  subtitle: {
    English:
      "Track your progress, earn XP, and unlock new achievements. Everything below is interactive.",
    Arabic:
      "تابعي تقدمك، واكتسبي نقاط الخبرة، وافتحي إنجازات جديدة. كل العناصر بالأسفل تفاعلية.",
  },
  editProfile: { English: "Edit Profile", Arabic: "تعديل الملف الشخصي" },
  uploadPhoto: { English: "Upload Photo", Arabic: "رفع صورة" },
  changeName: { English: "Change Name", Arabic: "تغيير الاسم" },
  save: { English: "Save", Arabic: "حفظ" },
  cancel: { English: "Cancel", Arabic: "إلغاء" },
  streak: { English: "Day Streak", Arabic: "أيام متتالية" },
  skillTree: { English: "Skill Tree", Arabic: "مسار المهارات" },
  myCourses: { English: "My Courses", Arabic: "دوراتي الحالية" },
  modulesCompleted: { English: "Modules Completed", Arabic: "الوحدات المكتملة" },
  completeLesson: { English: "Complete Lesson", Arabic: "إكمال درس" },
  startQuiz: { English: "Start 30-min Quiz", Arabic: "بدء اختبار لمدة 30 دقيقة" },
  viewCourse: { English: "Open Course", Arabic: "فتح الدورة" },
  achievements: { English: "Achievements", Arabic: "الإنجازات" },
  analytics: { English: "Learning Analytics", Arabic: "تحليلات التعلّم" },
  totalTime: { English: "Total Learning Time (hrs)", Arabic: "إجمالي وقت التعلّم (ساعات)" },
  avgScore: { English: "Average Quiz Score (%)", Arabic: "متوسط نتيجة الاختبارات (%)" },
  modules: { English: "Modules Completed", Arabic: "الوحدات المكتملة" },
  xp: { English: "XP", Arabic: "نقاط الخبرة" },
  mentorFeedback: { English: "Mentor Feedback", Arabic: "ملاحظات المرشدين" },
  learningReport: { English: "Learning Report", Arabic: "تقرير التعلّم" },
  certificates: { English: "Certificates", Arabic: "الشهادات" },
  generatePDF: { English: "Generate PDF Report", Arabic: "إنشاء تقرير PDF" },
  openAll: { English: "Open All", Arabic: "فتح الكل" },
  levelProgress: { English: "Level Progress", Arabic: "تقدم المستوى" },
  consistency: { English: "Consistency", Arabic: "الاستمرارية" },
  overall: { English: "Overall Progress", Arabic: "نسبة التقدم" },
  locked: { English: "Locked", Arabic: "مغلق" },
  unlocked: { English: "Unlocked", Arabic: "مفتوح" },
  skillDigital: { English: "Digital Skills", Arabic: "المهارات الرقمية" },
  skillFinance: { English: "Financial Management", Arabic: "الإدارة المالية" },
  skillComm: { English: "Effective Communication", Arabic: "التواصل الفعّال" },
  skillEntre: { English: "Innovation & Entrepreneurship", Arabic: "الابتكار وريادة الأعمال" },
  note: {
    English: "Quizzes are mocked. Wire to backend later.",
    Arabic: "الاختبارات هنا تجريبية. اربطيها بالواجهة الخلفية لاحقاً.",
  },
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
    titleEn: "Intro to Entrepreneurship",
    titleAr: "مقدمة في ريادة الأعمال",
    totalModules: 4,
    completedModules: 1,
    xp: 40,
  },
];

const seedFeedback: Feedback[] = [
  {
    from: "Mentor Monica",
    textEn: "Great improvement on your budgeting module. Keep the steady pace.",
    textAr: "تحسن رائع في وحدة إعداد الميزانية. استمري على هذا الإيقاع.",
    date: "2025-10-04",
  },
  {
    from: "Coach Priscilla",
    textEn: "Try practicing the pitch outline again; your structure is strong.",
    textAr: "جرّبي تمرين مخطط العرض مرة أخرى؛ هيكلك قوي.",
    date: "2025-10-02",
  },
];

const STORAGE_KEY = "bh-learner-dashboard-v2";

function loadState(): PersistShape {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as PersistShape;
    } catch (e) {
      
      console.warn("Failed to parse persisted learner dashboard state:", e);
    }
  }
  return {
    courses: seedCourses,
    xp: seedCourses.reduce((a, c) => a + c.xp, 0),
    streak: 1,
    lastActive: new Date().toISOString(),
    unlockedSkills: ["digital", "finance"],
    achievements: ["first-quiz", "100xp"],
    avatarDataUrl: null,
    displayName: "Learner",
  };
}

function saveState(s: PersistShape) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

const LearnerDashboard: React.FC = () => {
  const { language } = useLanguage() as { language: Lang };
  const isAr = language === "Arabic";
  const navigate = useNavigate();

  const [state, setState] = useState<PersistShape>(() => loadState());
  const [feedback] = useState<Feedback[]>(seedFeedback);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(state.displayName || "Learner");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const last = new Date(state.lastActive);
    const today = new Date(todayISO());
    const diffDays = Math.round(
      (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    let streak = state.streak;
    if (diffDays === 1) streak = Math.max(1, state.streak + 1);
    if (diffDays > 1) streak = 1;

    const updated = { ...state, streak, lastActive: today.toISOString() };
    setState(updated);
    saveState(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalModules = useMemo(
    () => state.courses.reduce((a, c) => a + c.totalModules, 0),
    [state.courses]
  );
  const completedModules = useMemo(
    () => state.courses.reduce((a, c) => a + c.completedModules, 0),
    [state.courses]
  );

  const totalHours = 6 + Math.floor(completedModules * 0.5);
  const avgScore = 92 - Math.max(0, 5 - completedModules);

  const chartData = [
    { name: isAr ? "الوقت" : "Time", value: totalHours, color: "#6a1b9a" },
    { name: isAr ? "الوحدات" : "Modules", value: completedModules, color: "#ffd700" }, 
    { name: isAr ? "الخبرة" : "XP", value: state.xp, color: "#6a1b9a;" }, 
  ];

  function completeLesson(courseId: string) {
    setState((prev) => {
      const courses = prev.courses.map((c) => {
        if (c.id !== courseId) return c;
        if (c.completedModules >= c.totalModules) return c;
        return { ...c, completedModules: c.completedModules + 1, xp: c.xp + 10 };
      });
      const newXP = courses.reduce((a, c) => a + c.xp, 0);

      const updated = {
        ...prev,
        courses,
        xp: newXP,
        lastActive: new Date().toISOString(),
      };
      saveState(updated);
      return updated;
    });
  }

  function startQuiz(courseId: string) {
    navigate(`/quiz/${courseId}`);
  }

  function openCourse(courseId: string) {
    navigate(`/course/${courseId}`);
  }

  function toggleSkill(key: string) {
    setState((prev) => {
      const setS = new Set(prev.unlockedSkills);
      if (setS.has(key)) setS.delete(key);
      else setS.add(key);
      const updated = { ...prev, unlockedSkills: Array.from(setS) };
      saveState(updated);
      return updated;
    });
  }

  function openAllCourses() {
    navigate("/courses");
  }

  function handleChooseAvatar() {
    fileRef.current?.click();
  }

  async function handleAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setState((prev) => {
        const updated = { ...prev, avatarDataUrl: dataUrl };
        saveState(updated);
        return updated;
      });
    };
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    setState((prev) => {
      const updated = { ...prev, displayName: tempName };
      saveState(updated);
      return updated;
    });
    setEditing(false);
  }

  function generatePDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const line = (y: number) => {
      doc.setDrawColor(130);
      doc.line(margin, y, 555, y);
    };

    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(isAr ? "تقرير تقدّم المتعلّم" : "Learner Progress Report", margin, 60);

    if (state.avatarDataUrl) {
      try {
        doc.addImage(state.avatarDataUrl, "JPEG", 480, 40, 64, 64);
      } catch (e) {
        
        console.warn("Failed to add avatar image to PDF:", e);
      }
    }

    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(
      `${isAr ? "الاسم:" : "Name:"} ${state.displayName || "Learner"}`,
      margin,
      90
    );

    
    line(110);
    doc.setFont("helvetica", "bold");
    doc.text(isAr ? "الملخص" : "Summary", margin, 130);

    doc.setFont("helvetica", "normal");
    const rows = [
      [isAr ? "نقاط الخبرة" : "XP", String(state.xp)],
      [isAr ? "عدد الوحدات المكتملة" : "Modules", `${completedModules}/${totalModules}`],
      [isAr ? "إجمالي الوقت (ساعات)" : "Total Time (hrs)", String(totalHours)],
      [isAr ? "متوسط نتيجة الاختبارات" : "Average Score (%)", String(avgScore)],
      [isAr ? "أيام متتالية" : "Day Streak", String(state.streak)],
    ];

    let y = 150;
    rows.forEach(([k, v]) => {
      doc.text(`${k}: ${v}`, margin, y);
      y += 20;
    });

   
    line(y + 10);
    doc.setFont("helvetica", "bold");
    doc.text(isAr ? "الدورات" : "Courses", margin, y + 30);
    doc.setFont("helvetica", "normal");

    y += 50;
    state.courses.forEach((c) => {
      const title = isAr ? c.titleAr : c.titleEn;
      doc.text(
        `${title} — ${isAr ? "الوحدات" : "Modules"}: ${c.completedModules}/${c.totalModules} — XP: ${c.xp}`,
        margin,
        y
      );
      y += 18;
    });

    
    doc.setFontSize(10);
    doc.text(
      isAr
        ? "تم إنشاء التقرير بواسطة منصة BridgeHer"
        : "Report generated by BridgeHer platform",
      margin,
      790
    );

    doc.save("bridgeher-learning-report.pdf");
  }

  return (
    <section
      className={`learner-dashboard ${isAr ? "rtl" : ""}`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="profile-block">
            <div className="avatar" onClick={handleChooseAvatar} role="button" tabIndex={0}>
              {state.avatarDataUrl ? (
                <img src={state.avatarDataUrl} alt="avatar" />
              ) : (
                <div className="avatar-fallback">{(state.displayName || "L").slice(0, 1)}</div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelected}
              hidden
            />
            <div className="profile-meta">
              <h2>
                {isAr ? txt.welcome.Arabic : txt.welcome.English},{" "}
                {state.displayName || "Learner"}
              </h2>
              <p>{isAr ? txt.subtitle.Arabic : txt.subtitle.English}</p>
              <div className="header-actions">
                <button className="btn outline" onClick={() => setEditing(true)}>
                  {isAr ? txt.editProfile.Arabic : txt.editProfile.English}
                </button>
                <button className="btn ghost" onClick={openAllCourses}>
                  {isAr ? txt.openAll.Arabic : txt.openAll.English}
                </button>
                <button className="btn primary" onClick={generatePDF}>
                  {isAr ? txt.generatePDF.Arabic : txt.generatePDF.English}
                </button>
              </div>
            </div>
          </div>

          <button
            className="streak-badge clickable"
            onClick={() => navigate("/courses")}
            aria-label="Open courses to maintain streak"
          >
            {state.streak} {isAr ? txt.streak.Arabic : txt.streak.English}
          </button>
        </header>

        {/* Skill Tree */}
        <div className="skill-tree">
          <h3>{isAr ? txt.skillTree.Arabic : txt.skillTree.English}</h3>
          <div className="skill-branches">
            <button
              className={`skill-node ${
                state.unlockedSkills.includes("digital") ? "active" : "locked"
              }`}
              onClick={() => toggleSkill("digital")}
            >
              {isAr ? txt.skillDigital.Arabic : txt.skillDigital.English}
            </button>
            <button
              className={`skill-node ${
                state.unlockedSkills.includes("finance") ? "active" : "locked"
              }`}
              onClick={() => toggleSkill("finance")}
            >
              {isAr ? txt.skillFinance.Arabic : txt.skillFinance.English}
            </button>
            <button
              className={`skill-node ${
                state.unlockedSkills.includes("comm") ? "active" : "locked"
              }`}
              onClick={() => toggleSkill("comm")}
            >
              {isAr ? txt.skillComm.Arabic : txt.skillComm.English}
            </button>
            <button
              className={`skill-node ${
                state.unlockedSkills.includes("entre") ? "active" : "locked"
              }`}
              onClick={() => toggleSkill("entre")}
            >
              {isAr ? txt.skillEntre.Arabic : txt.skillEntre.English}
            </button>
          </div>
        </div>

        {/* Courses */}
        <h3>{isAr ? txt.myCourses.Arabic : txt.myCourses.English}</h3>
        <div className="course-list">
          {state.courses.map((c) => {
            const pct = Math.round((c.completedModules / c.totalModules) * 100);
            return (
              <div className="course-card" key={c.id}>
                <h4 className="course-title">
                  <button className="linklike" onClick={() => openCourse(c.id)}>
                    {isAr ? c.titleAr : c.titleEn}
                  </button>
                </h4>

                <div
                  className="progress-bar clickable"
                  onClick={() => openCourse(c.id)}
                  aria-label={`${pct}%`}
                >
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>

                <p className="muted">
                  {isAr
                    ? `${txt.modulesCompleted.Arabic} ${c.completedModules}/${c.totalModules}`
                    : `${txt.modulesCompleted.English} ${c.completedModules}/${c.totalModules}`}
                </p>

                <div className="chip-row">
                  <span className="chip xp">{state.xp} {isAr ? txt.xp.Arabic : txt.xp.English}</span>
                  <span className="chip pct">{pct}%</span>
                </div>

                <div className="course-actions">
                  <button className="btn ghost" onClick={() => completeLesson(c.id)}>
                    {isAr ? txt.completeLesson.Arabic : txt.completeLesson.English}
                  </button>
                  <button className="btn outline" onClick={() => startQuiz(c.id)}>
                    {isAr ? txt.startQuiz.Arabic : txt.startQuiz.English}
                  </button>
                  <button className="btn primary" onClick={() => openCourse(c.id)}>
                    {isAr ? txt.viewCourse.Arabic : txt.viewCourse.English}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="helper">{isAr ? txt.note.Arabic : txt.note.English}</p>

        {/* Analytics */}
        <div className="analytics">
          <h3>{isAr ? txt.analytics.Arabic : txt.analytics.English}</h3>
          <div className="analytics-grid">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {chartData.map((d, idx) => (
                  <Bar key={idx} dataKey="value" fill={d.color} name={d.name} />
                ))}
              </BarChart>
            </ResponsiveContainer>

            <div className="analytics-right">
              <div className="mini-stat">
                <span className="mini-label">{isAr ? (txt.totalTime.Arabic) : (txt.totalTime.English)}</span>
                <span className="mini-value">{totalHours}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">{isAr ? (txt.avgScore.Arabic) : (txt.avgScore.English)}</span>
                <span className="mini-value">{avgScore}%</span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">{isAr ? (txt.modules.Arabic) : (txt.modules.English)}</span>
                <span className="mini-value">{completedModules}/{totalModules}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">{isAr ? (txt.xp.Arabic) : (txt.xp.English)}</span>
                <span className="mini-value">{state.xp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="feedback-section">
          <h3>{isAr ? txt.mentorFeedback.Arabic : txt.mentorFeedback.English}</h3>
          {feedback.map((f, i) => (
            <div className="feedback-card clickable" key={i} onClick={() => navigate("/community")}>
              <strong>{f.from}</strong>
              <p>{isAr ? f.textAr : f.textEn}</p>
              <span className="muted">{f.date}</span>
            </div>
          ))}
        </div>

        {/* Report */}
        <div className="report-section">
          <h3>{isAr ? txt.learningReport.Arabic : txt.learningReport.English}</h3>
          <ul>
            <li>
              {isAr
                ? `إجمالي الوحدات المكتملة: ${completedModules} من ${totalModules}`
                : `Total modules completed: ${completedModules} of ${totalModules}`}
            </li>
            <li>
              {isAr
                ? `إجمالي وقت التعلّم: ${totalHours} ${isAr ? "ساعات" : "hours"}`
                : `Total learning time: ${totalHours} hours`}
            </li>
            <li>
              {isAr
                ? `متوسط درجة الاختبارات: ${avgScore}%`
                : `Average quiz score: ${avgScore}%`}
            </li>
          </ul>
          <div className="report-actions">
            <Link to="/my-certificates" className="btn outline">
              {isAr ? txt.certificates.Arabic : txt.certificates.English}
            </Link>
            <button className="btn primary" onClick={generatePDF}>
              {isAr ? txt.generatePDF.Arabic : txt.generatePDF.English}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card" role="document">
            <h4>{isAr ? txt.editProfile.Arabic : txt.editProfile.English}</h4>

            <label className="field-label">{isAr ? txt.changeName.Arabic : txt.changeName.English}</label>
            <input
              className="field-input"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder={isAr ? "اكتبي اسمك" : "Enter your name"}
            />

            <div className="modal-actions">
              <button className="btn outline" onClick={() => setEditing(false)}>
                {isAr ? txt.cancel.Arabic : txt.cancel.English}
              </button>
              <button className="btn primary" onClick={saveProfile}>
                {isAr ? txt.save.Arabic : txt.save.English}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LearnerDashboard;
