import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useLanguage } from "../context/LanguageContext";
import "../styles/learnerDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const tMap = {
  en: {
    sidebar: {
      dashboard: "Dashboard",
      courses: "Courses",
      mentorship: "Mentorship",
      certificates: "Certificates",
      settings: "Settings",
    },
    header: {
      welcome: "Welcome back,",
      sub: "Keep learning and growing with purpose.",
      light: "Light",
      dark: "Dark",
      soundOn: "Sound On",
      soundOff: "Sound Off",
    },
    stats: { streak: "Day Streak", xp: "XP Points", level: "Current Level" },
    analytics: {
      title: "Learning Analytics",
      weekly: "Weekly Learning Hours",
      completion: "Course Completion",
      completed: "Completed",
      remaining: "Remaining",
    },
    reminders: {
      title: "Reminders",
      add: "Add Reminder",
      placeholder: "Enter a new reminder...",
      done: "Done",
      remove: "Remove",
      empty: "No reminders yet — add one below!",
    },
    calendar: {
      title: "Your Google Calendar",
      desc: "View your upcoming sessions and course events.",
      note: "You can sync this calendar with your Google Account for automatic updates.",
    },
    quotes: [
      "Small steps every day lead to big change.",
      "Learning is a journey, not a race.",
      "Consistency beats intensity.",
      "Your future is built by what you do today.",
    ],
  },
  ar: {
    sidebar: {
      dashboard: "لوحة التحكم",
      courses: "الدورات",
      mentorship: "الإرشاد",
      certificates: "الشهادات",
      settings: "الإعدادات",
    },
    header: {
      welcome: "مرحباً بعودتكِ،",
      sub: "واصلي التعلم والنمو بثقة وتميّز.",
      light: "فاتح",
      dark: "داكن",
      soundOn: "الصوت مفعل",
      soundOff: "الصوت متوقف",
    },
    stats: {
      streak: "السلسلة المتتالية",
      xp: "نقاط الخبرة",
      level: "المستوى الحالي",
    },
    analytics: {
      title: "تحليلات التعلم",
      weekly: "ساعات التعلم الأسبوعية",
      completion: "معدل الإكمال",
      completed: "مكتمل",
      remaining: "متبقي",
    },
    reminders: {
      title: "التذكيرات",
      add: "إضافة تذكير",
      placeholder: "أدخل تذكيراً جديداً...",
      done: "تم",
      remove: "حذف",
      empty: "لا توجد تذكيرات بعد — أضيفي واحدة أدناه!",
    },
    calendar: {
      title: "التقويم الخاص بكِ",
      desc: "شاهدي مواعيد جلساتك ودوراتك.",
      note: "يمكنك ربط هذا التقويم بحسابك في Google لمزامنة الجلسات تلقائيًا.",
    },
    quotes: [
      "خطوة صغيرة كل يوم تصنع فرقًا كبيرًا.",
      "التعلُّم رحلة وليست سباقًا.",
      "الثبات يتفوق على الحِدّة.",
      "مستقبلك يُبنى بما تفعلينه اليوم.",
    ],
  },
};


const playUiSound = (enabled: boolean, tone: "tap" | "success" = "tap") => {
  if (!enabled) return;
  try {
    type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextCtor = window.AudioContext || (window as WindowWithWebkit).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = tone === "success" ? 650 : 540;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (err) {
    // Log the error so the empty catch block is avoided and debugging is easier
    console.warn("playUiSound failed:", err);
  }
};

const LearnerDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === "Arabic";
  const t = isAr ? tMap.ar : tMap.en;

 
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("bh-theme") as "light" | "dark") || "light"
  );
  const [sound, setSound] = useState<boolean>(() => {
    const s = localStorage.getItem("bh-sound");
    return s ? JSON.parse(s) : true;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("bh-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("bh-sound", JSON.stringify(sound));
  }, [sound]);

  
  const XP_FOR_LEVEL = 1000;
  const [xp] = useState(430);
  const level = Math.floor(xp / XP_FOR_LEVEL) + 1;
  const user = { name: isAr ? "أبوك" : "Abuk", streak: 8 };

  
  const chartTextColor = theme === "dark" ? "#FFFFFF" : "#333333";
  const chartGridColor = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const weeklyData = useMemo(() => ({
    labels: isAr
      ? ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: t.analytics.weekly,
        data: [2, 3, 1.5, 2, 4, 2.5, 3],
        backgroundColor: "#6A1B9A",
      },
    ],
  }), [isAr, t.analytics.weekly]);

  const completionData = useMemo(() => ({
    labels: [t.analytics.completed, t.analytics.remaining],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ["#6A1B9A", "#FFD700"],
        cutout: "75%",
      },
    ],
  }), [t.analytics.completed, t.analytics.remaining]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { labels: { color: chartTextColor } },
      title: { color: chartTextColor },
    },
    scales: {
      x: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } },
      y: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } },
    },
  }), [chartTextColor, chartGridColor]);

 
  const [reminders, setReminders] = useState<{ id: number; text: string; done: boolean; isNew?: boolean }[]>(() => {
    const stored = localStorage.getItem("bh-reminders");
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("bh-reminders", JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = () => {
    if (!input.trim()) return;
    playUiSound(sound);
    setReminders((prev) => [...prev, { id: Date.now(), text: input, done: false, isNew: true }]);
    setInput("");
  };

  const toggleDone = (id: number) => {
    playUiSound(sound, "success");
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  };

  const remove = (id: number) => {
    playUiSound(sound);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  
  const calendarLang = isAr ? "ar" : "en";
  const calendarSrc = `https://calendar.google.com/calendar/embed?src=yourcalendarid%40gmail.com&ctz=Africa%2FJuba&hl=${calendarLang}`;

  return (
    <div className={`learner-dashboard ${isAr ? "rtl" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="user-section">
          <div className="user-avatar-placeholder" />
          <div>
            <h3>{user.name}</h3>
            <p>{isAr ? "متعلمة متميزة" : "Star Learner"}</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/learner-dashboard" className="nav-item active">{t.sidebar.dashboard}</Link>
          <Link to="/courses" className="nav-item">{t.sidebar.courses}</Link>
          <Link to="/mentorship" className="nav-item">{t.sidebar.mentorship}</Link>
          <Link to="/my-certificates" className="nav-item">{t.sidebar.certificates}</Link>
          <Link to="/settings" className="nav-item">{t.sidebar.settings}</Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>{t.header.welcome} <span className="highlight">{user.name}</span></h1>
            <p>{t.header.sub}</p>
          </div>
          <div className="theme-toggle">
            <button className={theme === "light" ? "active" : ""} onClick={() => { playUiSound(sound); setTheme("light"); }}>{t.header.light}</button>
            <button className={theme === "dark" ? "active" : ""} onClick={() => { playUiSound(sound); setTheme("dark"); }}>{t.header.dark}</button>
            <button onClick={() => { playUiSound(sound); setSound((s) => !s); }}>
              {sound ? "🔊 " + t.header.soundOn : "🔇 " + t.header.soundOff}
            </button>
          </div>
        </header>

        {/* Quote */}
        <section className="card">
          <strong>{t.quotes[new Date().getDate() % t.quotes.length]}</strong>
        </section>

        {/* Stats */}
        <section className="stats-section">
          <div className="stat-card"><h3>{user.streak}</h3><p>{t.stats.streak}</p></div>
          <div className="stat-card"><h3>{xp}</h3><p>{t.stats.xp}</p></div>
          <div className="stat-card"><h3>{`Lv ${level}`}</h3><p>{t.stats.level}</p></div>
        </section>

        {/* Charts */}
        <section className="analytics-section">
          <h2>{t.analytics.title}</h2>
          <div className="charts-grid">
            <div className="chart-card"><h4>{t.analytics.weekly}</h4><Bar data={weeklyData} options={chartOptions} /></div>
            <div className="chart-card"><h4>{t.analytics.completion}</h4><Doughnut data={completionData} options={chartOptions} /></div>
          </div>
        </section>

        {/* Reminders */}
        <section className="reminders-section">
          <h2>{t.reminders.title}</h2>
          {reminders.length === 0 ? (
            <p className="muted">{t.reminders.empty}</p>
          ) : (
            <ul className="reminder-list">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className={`reminder-item ${r.done ? "done" : ""} ${r.isNew ? "new" : ""}`}
                  onAnimationEnd={() =>
                    setReminders((prev) =>
                      prev.map((x) => (x.id === r.id ? { ...x, isNew: false } : x))
                    )
                  }
                >
                  <span>{r.text}</span>
                  <div className="reminder-actions">
                    <button className="btn-small" onClick={() => toggleDone(r.id)}>{t.reminders.done}</button>
                    <button className="btn-small danger" onClick={() => remove(r.id)}>{t.reminders.remove}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="add-reminder">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.reminders.placeholder}
            />
            <button className="btn-primary" onClick={addReminder}>{t.reminders.add}</button>
          </div>
        </section>

        {/* Calendar */}
        <section className="card calendar-embed-section">
          <h2>{t.calendar.title}</h2>
          <p className="muted">{t.calendar.desc}</p>
          <div className="calendar-iframe-container">
            <iframe
              src={calendarSrc}
              width="100%"
              height="600"
              style={{ border: 0 }}
              frameBorder="0"
              scrolling="no"
              title="Google Calendar"
            ></iframe>
          </div>
          <div className="calendar-sync-note">
            <p className="muted">{t.calendar.note}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LearnerDashboard;
